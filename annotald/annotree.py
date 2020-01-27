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
    CASE = {"nf", "þf", "þgf", "ef"}
    LO_OBJ = {"sþf", "sþgf", "sef"}
    FS_OBJ = {"nf", "þf", "þgf", "ef", "nh"}
    GENDER = {"kk", "kvk", "hk"}
    NUMBER = {"et", "ft"}
    PERSON = {"p1", "p2", "p3"}
    TENSE = {"þt", "nt"}
    DEGREE = {"fst", "mst", "est", "esb", "evb"}
    STRENGTH = {"sb", "vb"}
    VOICE = {"mm", "gm"}
    MOOD = {"fh", "vh", "nh", "bh", "lhnt", "lhþt", "sagnb"}
    CLITIC = {"sn"}
    IMPERSONAL = {"none", "es", "subj"}


CATEGORY_TO_VARIANT = {
    "ao": ["degree"],
    "eo": ["degree"],
    "no": ["number", "case", "gender", "article"],
    "person": ["number", "case", "gender", "article"],
    "entity": ["number", "case", "gender", "article"],
    "sérnafn": ["number", "case", "gender", "article"],
    "abfn": ["number", "case", "gender"],
    "fn": ["number", "case", "gender"],
    "pfn": ["number", "case", "gender", "person"],
    "gr": ["number", "case", "gender"],
    "tala": ["number", "case", "gender"],
    "töl": ["number", "case", "gender"],
    "to": ["number", "case", "gender"],
    "lo": ["number", "case", "gender", "degree", "strength", "lo_obj"],
    "so": ["obj1", "obj2", "impersonal", "subj", "person", "number",
            "mood", "tense", "voice", "clitic"],
    "fs": ["fs_obj"],
    "raðnr": ["case", "gender"],
    "lén": ["case"],
    "prósenta": ["number", "case", "gender"],
    "fyrirtæki": ["number", "case", "gender", "article"],
    "gata": ["number", "case", "gender", "article"],
}


def escaped_parens_to_html_parens(text):
    return text.replace("\\(", HTML_LPAREN).replace("\\)", HTML_RPAREN)


def html_parens_to_escaped_parens(text):
    return text.replace(HTML_LPAREN, "\\(").replace(HTML_RPAREN, "\\)")


def html_parens_to_parens(text):
    return text.replace(HTML_LPAREN, "(").replace(HTML_RPAREN, ")")


def escape_parens(text):
    return text.replace("(", "\\(").replace(")", "\\)")


def tree_spans_from_text(text):
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
        tree = super(AnnoTree, cls).fromstring(transliterated)
        return tree

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
        ret["comment"] = [c._print_comment_line() for c in meta.get("COMMENT", [])]
        ret["url"] = self.leaf_text(meta.get("URL", []))
        return ret

    @classmethod
    def read_from_file(cls, obj):
        if isinstance(obj, io.TextIOBase):
            text = obj.read()
        elif isinstance(obj, str) or isinstance(obj, Path):
            with open(obj, "r", encoding="utf-8") as handle:
                text = handle.read()
        else:
            raise ValueError("Illegal file or path object")

        return cls.fromstring_many(text)

    @classmethod
    def fromstring_many(cls, text):
        trees = []
        for (start, end) in tree_spans_from_text(text):
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
            with open(obj, "w", encoding="utf-8") as handle:
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

    def pretty(self, padding=0):
        """
        node     = lparen label space children rparen

        children = node nl padding children | node
        """
        left = "({0} ".format(self.label())
        def_child_padding = len(left) + padding
        extra_child_padding = def_child_padding
        parts = [left]
        num = len(self)

        first_is_str = None
        if 0 < num:
            first_is_str = isinstance(self[0], str)
        if first_is_str:
            # for placing lemma on same line as token text
            extra_child_padding = def_child_padding + len(self[0]) + 1

        for (idx, child) in enumerate(self):
            if idx == 1 and first_is_str:
                parts.append(" ")
            elif 0 < idx:
                parts.append(" " * extra_child_padding)

            if isinstance(child, AnnoTree):
                if self.label() != "COMMENT":
                    parts.append(child.pretty(padding=def_child_padding))
                else:
                    # flatten comment line
                    parts.extend(["(", child._print_comment_line(), ")"])
            else:
                # str
                parts.append(child)

            if idx == 0 and first_is_str and 1 < num:
                # place lemma on same line as token text
                pass
            elif idx < (num - 1):
                parts.append("\n")

        parts.append(")")
        return "".join(parts)

    def _print_comment_line(self):
        parts = [self.label()]
        parts.extend([str(c) for c in self])
        comment = " ".join(parts)
        transliterated = html_parens_to_parens(comment)
        return transliterated

    @classmethod
    def aug_tree_from_json(cls, aug_dict):
        def convert_tree(tree_dict):
            if "nonterminal" in tree_dict:
                node = AnnoTree(
                    tree_dict["nonterminal"],
                    [convert_tree(child) for child in tree_dict["children"]],
                )
            elif "terminal" in tree_dict:
                flat_terminal = tree_dict["terminal"]
                text = escape_parens(tree_dict["text"])
                children = [text]

                if "lemma" in tree_dict and tree_dict["lemma"]:
                    escaped_lemma = escape_parens(tree_dict["lemma"])
                    children.append(AnnoTree("lemma", [escaped_lemma]))
                if "exp_seg" in tree_dict and tree_dict["exp_seg"]:
                    escaped_seg = escape_parens(tree_dict["exp_seg"])
                    children.append(AnnoTree("exp_seg", [escaped_seg]))
                elif "exp_abbrev" in tree_dict and tree_dict["exp_abbrev"]:
                    escaped_abbrev = escape_parens(tree_dict["exp_abbrev"])
                    children.append(AnnoTree("exp_abbrev", [escaped_abbrev]))

                node = AnnoTree(flat_terminal, children)
                return node
            else:
                raise ValueError("Illegal tree")
            return node

        meta_dict = aug_dict["meta"]
        meta_node = AnnoTree(
            "META",
            [
                AnnoTree("ID-CORPUS", [meta_dict["corpus_id"]]),
                AnnoTree("ID-LOCAL", [meta_dict["tree_id"]]),
                AnnoTree("URL", [meta_dict.get("url", "")]),
                AnnoTree(
                    "COMMENT",
                    [
                        AnnoTree.fromstring("(" + escape_parens(c) + ")")
                        for c in meta_dict.get("comment", [])
                    ],
                ),
            ],
        )
        tree_node = convert_tree(aug_dict["tree"])
        anno_aug = AnnoTree("", [meta_node, tree_node])
        return anno_aug


def split_flat_terminal(term_tok):
    parts = term_tok.split("_")
    if len(parts) <= 1:
        pass

    cat = parts[0]

    # Extract valence
    variants_start = 1
    data = dict(cat=cat)
    if cat == "so":
        first_variant = parts[1]
        num_control = 0
        if first_variant in "012":
            num_control = int(first_variant)
            variants_start += 1
            # so_0_þt_vh_p1           færi
            # so_1_þf_þt_vh_p1        tæki mat
            # so_2_þgf_þf_þt_vh_p1    gæfi honum mat
            for idx in range(num_control):
                var = parts[2 + idx]
                if var in VARIANT.CASE:
                    variants_start += 1
                    data["obj" + str(idx + 1)] = var

        if "subj" in parts:
            # so_1_þgf_op_subj_nf_þt_fh_p1_mm | mér gafst ekki tækifæri
            parts.pop(parts.index("subj"))
            data["impersonal"] = "subj"
            subj = [var for var in parts[variants_start:] if var in VARIANT.CASE]
            if subj:
                subj = subj.pop()
                data["subj"] = subj
                parts.pop(parts.index(subj))
            if "op" in parts:
                parts.pop(parts.index("op"))
        elif "op" in parts and "es" in parts:
            # so_0_op_es_nt_fh_p3 | það rignir
            data["impersonal"] = "es"
            parts.pop(parts.index("op"))
            parts.pop(parts.index("es"))
            pass
        elif "op" in parts:
            data["impersonal"] = "none"
            parts.pop(parts.index("op"))
            pass

        if "lh" in parts and "þt" in parts:
            parts.pop(parts.index("lh"))
            parts.pop(parts.index("þt"))
            parts.append("lhþt")
            pass
        elif "lh" in parts and "nt" in parts:
            parts.pop(parts.index("lh"))
            parts.pop(parts.index("nt"))
            parts.append("lhnt")

    variants = set(parts[variants_start:])

    try:
        from icecream import ic
        ic.configureOutput(includeContext=True)
    except ImportError:  # Graceful fallback if IceCream isn't installed.
        ic = lambda *a: None if not a else (a[0] if len(a) == 1 else a)  # noqa

    variant_names = (
        "article",
        "case",
        "gender",
        "number",
        "person",
        "tense",
        "degree",
        "strength",
        "voice",
        "mood",
        "clitic",
        "lo_obj",
        "fs_obj"
    )
    data_rest = dict()
    for variant_name in variant_names:
        if cat in CATEGORY_TO_VARIANT and variant_name in CATEGORY_TO_VARIANT[cat]:
            all_subvariants = getattr(VARIANT, variant_name.upper())
            data_rest[variant_name] = all_subvariants & variants

    for (k, v) in list(data_rest.items()):
        data_rest[k] = v.pop() if v else None

    data.update(data_rest)
    for k in list(data.keys()):
        if not data[k]:
            del data[k]

    return data
