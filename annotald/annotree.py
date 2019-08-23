import nltk.tree
from pprint import pprint
from xml.etree import ElementTree as ET
from annotald import util
import io
from pathlib import Path


HTML_LPAREN = "&#40;"
HTML_RPAREN = "&#41;"


class VARIANT:
    ARTICLE = {"gr"}
    CASES = {"nf", "þf", "þgf", "ef"}
    GENDERS = {"kk", "kvk", "hk"}
    NUMBERS = {"et", "ft"}
    PERSONS = {"p1", "p2", "p3"}
    TENSE = {"þt", "nt"}
    DEGREE = {"mst", "esb", "evb"}  # fst
    VOICE = {"mm", "gm"}
    MOOD = {"fh", "lh", "lh", "vh", "bh"}
    MISC = {"sagnb", "subj", "abbrev", "op", "none"}


def escaped_parens_to_html_parens(text):
    return text.replace("\\(", HTML_LPAREN).replace("\\)", HTML_RPAREN)


def html_parens_to_escaped_parens(text):
    return text.replace(HTML_LPAREN, "\\(").replace(HTML_RPAREN, "\\)")


def html_parens_to_parens(text):
    return text.replace(HTML_LPAREN, "(").replace(HTML_RPAREN, ")")


def escape_parens(text):
    return text.replace("(", "\\(").replace(")", "\\)")


def tree_offsets(text):
    lparen, rparen = "(", ")"

    def iter_parens(text):
        parens = (lparen, rparen)
        is_escaped = False
        for (offset, char) in enumerate(text):
            if char == "\\":
                is_escaped = not is_escaped
                continue
            elif char in parens and not is_escaped:
                yield (offset, char)
            is_escaped = False

    start = 0
    balance = 0
    for (idx, par) in iter_parens(text):
        if balance == 0 and par == lparen:
            start = idx
        balance += 1 if par == lparen else -1
        if balance < 0:
            raise ValueError("Illegal parentheses")
        elif balance == 0:
            yield start, idx + 1


class AnnoTree(nltk.tree.Tree):
    def __init__(self, *args, **kwargs):
        super(AnnoTree, self).__init__(*args, **kwargs)

    @classmethod
    def fromstring(cls, tree_str):
        transliterated = escaped_parens_to_html_parens(tree_str)
        return super(AnnoTree, cls).fromstring(transliterated)

    @classmethod
    def is_terminal(cls, tree):
        return isinstance(tree, AnnoTree) and tree.label().islower()

    @classmethod
    def leaf_text(cls, tree):
        token_text = " ".join([child for child in tree if isinstance(child, str)])
        return token_text

    def to_json(self):
        metadata = self.get_metadata()
        top_level_nodes = {child.label(): child for child in self}
        _ = top_level_nodes.pop("META", None)
        real_root = next(iter(top_level_nodes.values()))
        return {"tree": self._to_json_inner(real_root), "meta": metadata}

    def get_metadata(self):
        top_level_nodes = {child.label(): child for child in self}
        meta_node = top_level_nodes.get("META", dict())
        if not meta_node:
            return meta_node
        meta = {child.label(): child for child in meta_node}
        ret = {}
        ret["tree_id"] = self.leaf_text(meta.get("ID-LOCAL", []))
        ret["corpus_id"] = self.leaf_text(meta.get("ID-CORPUS", []))
        ret["comment"] = self.leaf_text(meta.get("COMMENT", []))
        ret["url"] = self.leaf_text(meta.get("URL", []))
        return ret

    @classmethod
    def read_from_file(cls, obj):
        if isinstance(obj, io.TextIOBase):
            text = obj.read()
        elif isinstance(obj, str) or isinstance(obj, Path):
            with open(obj, "r") as handle:
                text = handle.read()
        else:
            raise ValueError("Illegal file or path object")

        return cls.fromstring_many(text)

    @classmethod
    def fromstring_many(cls, text):
        trees = []
        for (start, end) in tree_offsets(text):
            tree_str = text[start:end]
            tree = cls.fromstring(tree_str)
            trees.append(tree)
        return trees

    @classmethod
    def write_to_file(cls, obj, trees):

        def write_to_io(handle):
            for (idx, tree) in enumerate(trees):
                if idx != 0:
                    handle.write("\n\n")
                handle.write(tree.pretty())

        if isinstance(obj, io.TextIOBase):
            write_to_io(obj)
        elif isinstance(obj, str) or isinstance(obj, Path):
            with open(obj, "w") as handle:
                write_to_io(handle)
        else:
            raise ValueError("Illegal file or path object")

    @classmethod
    def _to_json_inner(cls, tree):
        if cls.is_terminal(tree):
            return cls._terminal_to_json(tree)

        obj = {
            "nonterminal": tree.label(),
            "children": list(cls._to_json_inner(child) for child in tree),
        }

        return obj

    @classmethod
    def _terminal_to_json(cls, tree):
        flat_terminal = tree.label()
        terminal_extra = {
            child.label(): child for child in tree if isinstance(child, AnnoTree)
        }

        variants = split_flat_terminal(flat_terminal)
        obj = {}
        obj["text"] = html_parens_to_parens(cls.leaf_text(tree))
        obj["cat"] = variants["cat"]
        del variants["cat"]
        obj["variants"] = variants
        obj["lemma"] = html_parens_to_parens(
            cls.leaf_text(terminal_extra.get("lemma", []))
        )
        obj["exp_seg"] = cls.leaf_text(terminal_extra.get("exp_seg", []))
        obj["exp_abbrev"] = cls.leaf_text(terminal_extra.get("exp_abbrev", []))
        obj["terminal"] = flat_terminal

        return obj

    @classmethod
    def to_html(cls, tree, version, extra_data=None):
        top_level_nodes = {child.label(): child for child in tree}

        meta_node = top_level_nodes.pop("META", None)

        real_root = next(iter(top_level_nodes.values()))
        snode = cls.to_html_inner(real_root)

        if meta_node:
            meta_children = {child.label(): child for child in meta_node}
            id_node = ET.Element(
                "span", attrib={"class": " ".join(["wnode", "tree-id-node"])}
            )
            id_str = cls.leaf_text(meta_children["ID-LOCAL"])
            id_node.text = id_str
            snode.insert(0, id_node)

            snode.attrib["data-tree_id"] = id_str
            snode.attrib["data-corpus_id"] = cls.leaf_text(meta_children["ID-CORPUS"])
            snode.attrib["data-comment"] = cls.leaf_text(meta_children["COMMENT"]) or ""
            snode.attrib["data-url"] = cls.leaf_text(meta_children["URL"])

        result = ET.tostring(snode, encoding="utf8", method="html").decode("utf8")

        return result

    @classmethod
    def to_html_inner(cls, tree):
        if cls.is_terminal(tree):
            return cls.terminal_to_html(tree)

        nonterminal = tree.label()

        parts = nonterminal.split("-")
        nonterminal_class = "nonterminal-{0}".format(parts[0]).lower()

        attrib = {
            "class": " ".join(["snode", nonterminal_class]),
            "data-nonterminal": nonterminal,
        }

        snode = ET.Element("div", attrib=attrib)
        snode.text = nonterminal
        snode.extend(list(cls.to_html_inner(x) for x in tree))

        return snode

    @classmethod
    def terminal_to_html(cls, tree):
        flat_terminal = tree.label()
        token_text = cls.leaf_text(tree)
        lemma = None
        seg = None
        exp_attrib = None
        terminal_extra = {
            child.label(): child for child in tree if isinstance(child, AnnoTree)
        }

        if "lemma" in terminal_extra:
            lemma = cls.leaf_text(terminal_extra["lemma"])
        if "exp_abbrev" in terminal_extra:
            seg = {
                "type": "exp_abbrev",
                "text": cls.leaf_text(terminal_extra["exp_abbrev"]),
            }
            exp_attrib = {"data-abbrev": seg["text"]}
        elif "exp_seg" in terminal_extra:
            seg = {"type": "exp_seg", "text": cls.leaf_text(terminal_extra["exp_seg"])}
            exp_attrib = {"data-seg": seg["text"]}

        parts = split_flat_terminal(flat_terminal)
        terminal_class = "terminal-{0}".format(parts["cat"]).lower()

        lemma = html_parens_to_parens(lemma) if lemma else lemma
        token_text = html_parens_to_parens(token_text)

        attrib = {("data-" + key): value for (key, value) in parts.items()}
        attrib.update(
            {
                "class": " ".join(["snode", terminal_class]),
                "data-text": token_text,
                "data-lemma": lemma if lemma else "",
                "data-seg": "",
                "data-abbrev": "",
                "data-terminal": flat_terminal,
            }
        )
        if exp_attrib is not None:
            attrib.update(exp_attrib)

        snode = ET.Element("div", attrib=attrib)
        snode.text = flat_terminal

        wnode = ET.SubElement(snode, "span", attrib={"class": "wnode"})
        wnode.text = token_text

        if lemma:
            lemma_node = ET.SubElement(
                snode, "span", attrib={"class": "wnode lemma-node"}
            )
            lemma_node.text = lemma

        if seg:
            seg_class = (
                "exp-seg-node" if seg["type"] == "exp_seg" else "exp-abbrev-node"
            )
            seg_node = ET.SubElement(
                snode, "span", attrib={"class": " ".join(["wnode", seg_class])}
            )
            seg_node.text = seg["text"]

        return snode

    def pretty(self, offset=0):
        if self.is_terminal(self):
            return str(self)
            pass
        else:
            pass
            base = "({label}".format(label=self.label())
            width = len(base)
            offset += width
            string_parts = [base]
            for child in self:
                if isinstance(child, AnnoTree):
                    string_parts.append(child.pretty(offset=offset))
                elif isinstance(child, str):
                    string_parts.append(child)
                else:
                    import pdb; pdb.set_trace()
                    _ = 1 + 1
            string_parts.append(")\n")
        return "".join(string_parts)


def split_flat_terminal(term_tok):
    parts = term_tok.split("_")
    if len(parts) <= 1:
        pass

    head = parts[0]

    # Extract case control
    variants_start = 1
    case_control = ["", ""]
    if head == "so":
        first_variant = parts[1]
        # case control
        if first_variant in "012":
            num_control = int(first_variant)
            variants_start += num_control + 1
            # so_0_þt_vh_p1           færi
            # so_1_þf_þt_vh_p1        tæki mat
            # so_2_þgf_þf_þt_vh_p1    gæfi honum mat
            for idx in range(num_control):
                case_control[idx] = ({parts[2 + idx]} & VARIANT.CASES).pop()
    variants = set(parts[variants_start:])
    if head == "fs":
        case = VARIANT.CASES & variants
        if case:
            case_control[0] = case.pop()
    obj1, obj2 = case_control

    article = VARIANT.ARTICLE & variants
    case = VARIANT.CASES & variants
    gender = VARIANT.GENDERS & variants
    number = VARIANT.NUMBERS & variants
    person = VARIANT.PERSONS & variants
    tense = VARIANT.TENSE & variants
    degree = VARIANT.DEGREE & variants
    voice = VARIANT.VOICE & variants
    mood = VARIANT.MOOD & variants
    misc = VARIANT.MISC & variants
    data = {
        "article": article,
        "case": case,
        "gender": gender,
        "number": number,
        "person": person,
        "tense": tense,
        "degree": degree,
        "voice": voice,
        "mood": mood,
        "misc": misc,
        "cat": {head},
        "obj1": {obj1},
        "obj2": {obj2},
    }

    for (k, v) in list(data.items()):
        data[k] = "_".join(v)

    return data
