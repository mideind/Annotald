# This Python file uses the following encoding: utf-8
# This file copyright © 2012-2013 by Aaron Ecay

# This file is part of Annotald.
#
# Annotald is free software: you can redistribute it and/or modify it under
# the terms of the GNU General Public License as published by the Free
# Software Foundation, either version 3 of the License, or (at your option)
# any later version.
#
# Annotald is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
# FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
# details.
#
# You should have received a copy of the GNU General Public License along with
# Annotald.  If not, see <http://www.gnu.org/licenses/>.

# TODO(AWE): many of these functions should be moved into Lovett, once it is
# public.

# TODO: docstrings, organize code

# TODO: subclass nltk.tree to allow dictionary-like subscripting???

# TODO: add a file-saving test that really exercises the unicode fns

# Standard library
import codecs
from collections import defaultdict
from functools import reduce
import hashlib
import json
import os
import pkg_resources
import re
import subprocess
import sys
import tempfile
from pprint import pprint
from xml.etree import ElementTree as ET

# External libraries
import nltk.tree as NLTKTree

CASES = {"nf", "þf", "þgf", "ef"}
GENDERS = {"kk", "kvk", "hk"}
NUMBERS = {"et", "ft"}
PERSONS = {"p1", "p2", "p3"}
TENSE = {"þt", "nt"}
DEGREE = {"mst", "esb", "evb"}  # fst
VOICE = {"mm", "gm"}
MOOD = {"fh", "lh", "lh", "vh", "bh"}
MISC = {"sagnb", "subj", "abbrev", "op", "none"}


class AnnotaldException(Exception):
    pass


class AnnoTree(NLTKTree.Tree):
    def __init__(self, *args, **kwargs):
        super(AnnoTree, self).__init__(*args, **kwargs)

    @classmethod
    def to_html(cls, tree, version, extra_data=None):
        sisters = []
        real_root = None
        for daughter in tree:
            if daughter.label() == "ID" or daughter.label() == "METADATA":
                # TODO(AWE): conditional is non-portable
                sisters.append(daughter)
            else:
                if real_root:
                    print(real_root)
                    raise AnnotaldException(
                        "root tree has too many/unknown daughters!: %s" % str(tree)
                    )
                else:
                    real_root = daughter
        xtra_data = sisters
        snode = cls.to_html_inner(real_root, version, extra_data=xtra_data)
        return ET.tostring(snode, encoding="utf8", method="html").decode("utf8")

    @classmethod
    def to_html_inner(cls, tree, version, extra_data=None):
        if isinstance(tree[0], str):
            # Leaf node
            return cls.terminal_to_html(tree, version, extra_data=extra_data)

        # Regular nonterminal node
        cssClass = re.sub("[-=][0-9]+$", "", tree.label())
        classList = " ".join(["snode", cssClass])

        nonterminal = tree.label()

        parts = nonterminal.split("-")
        nonterminal_class = "nonterminal-{0}".format(parts[0]).lower()

        attrib = {
            "class": " ".join(["snode", cssClass, nonterminal_class]),
            "data-nonterminal": nonterminal,
        }

        # if extra_data:
            # E.g. [AnnoTree('ID', ['setningar.txt,.1'])]
        #     attrib["data-metadata"] = safe_json(nodeListToDict(extra_data))

        snode = ET.Element(
            "div",
            attrib=attrib
        )
        snode.text = nonterminal
        snode.extend(list(cls.to_html_inner(x, version) for x in tree))

        return snode

    @classmethod
    def terminal_to_html(cls, tree, version, extra_data=None):
        if len(tree) > 1:
            raise AnnotaldException(
                "Leaf node with more than one " + "daughter!: %s" % str(tree)
            )
        cssClass = re.sub("[-=][0-9]+$", "", tree.label())

        flat_terminal = tree.label()
        text_token = tree[0]
        lemma = text_token

        parts = split_flat_terminal(flat_terminal)
        terminal_class = "terminal-{0}".format(parts["cat"]).lower()

        attrib = {("data-" + key): value for (key, value) in parts.items()}
        attrib.update({
            "class": " ".join(["snode", cssClass, terminal_class]),
            "data-text": text_token,
            "data-lemma": lemma,
            "data-terminal": flat_terminal,
        })

        snode = ET.Element(
            "div",
            attrib=attrib
        )
        snode.text = flat_terminal

        wnode = ET.SubElement(snode, "span", attrib={"class": "wnode"})
        wnode.text = text_token

        # lemma_node = ET.SubElement(snode, "span", attrib={"class": "wnode"})
        # lemma_node.text = lemma

        return snode


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
                case_control[idx] = ({parts[2 + idx]} & CASES).pop()
    variants = set(parts[variants_start:])
    if head == "fs":
        case = CASES & variants
        if case:
            case_control[0] = case.pop()
    obj1, obj2 = case_control

    case = CASES & variants
    gender = GENDERS & variants
    number = NUMBERS & variants
    person = PERSONS & variants
    tense = TENSE & variants
    degree = DEGREE & variants
    voice = VOICE & variants
    mood = MOOD & variants
    misc = MISC & variants
    data = {
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


def intersperse(iterable, delimiter):
    it = iter(iterable)
    yield (next(it))
    for item in it:
        yield delimiter
        yield item


def safe_json(dict):
    j = json.dumps(dict)
    return j.replace('"', "&#34;")


def queryVersionCookie(treestr, key):
    if treestr == "" or not treestr:
        return None
    t = AnnoTree.Tree.fromstring(treestr)[0]
    if t.label() != "VERSION":
        return
    return _queryVersionCookieInner(t, key)


def _queryVersionCookieInner(tree, key):
    # TODO: maybe we should just convert the version cookie into a dict
    # and use that
    keys = key.split(".")
    f = [n for n in tree if n.label() == keys[0]]
    if len(f) == 1:
        if len(keys) == 1:
            return f[0][0]
        else:
            return _queryVersionCookieInner(f[0], ".".join(keys[1:]))
    else:
        return None


def updateVersionCookie(treestr, key, val):
    if treestr == "" or not treestr:
        return None
    tree = AnnoTree.Tree.fromstring(treestr)
    tree = tree[0]
    if tree.label() != "VERSION":
        return
    dd = metadataToDict(tree)
    d = dd
    k = key.split(".")
    while True:
        if len(k) == 1:
            d[k[0]] = val
            break
        if isinstance(d[k[0]], str):
            f = lambda: defaultdict(f)
            d[k[0]] = defaultdict(f)
        d = d[k[0]]
        k = k[1:]

    ret = dictToMetadata(dd)
    ret.set_label("VERSION")
    return str(AnnoTree.Tree("", [ret]))


def labelFromLabelAndMetadata(label, metadata):
    # TODO: Remove indices, allow customizable "dash tags" (phantom), indices,
    # etc.
    return label


def cssClassFromLabel(label):
    # TODO
    return label


def orthoFromTree(tree):
    orthoNodes = [t for t in tree if t.label() == "ORTHO"]
    if len(orthoNodes) == 1:
        return orthoNodes[0][0]
    metadata = [t for t in tree if t.label() == "META"]
    if len(metadata) == 1:
        metadata = metadata[0]
        altOrthoNode = [t for t in metadata if t.label() == "ALT-ORTHO"]
        if len(altOrthoNode) == 1:
            return altOrthoNode[0][0]
    return "XXX-ORTHO-UNKNOWN"


def nodeListToDict(nodes):
    return metadataToDict(AnnoTree.Tree("FOO", nodes))


def metadataToDict(metadata):
    f = lambda: defaultdict(f)  # A devious way of getting a recursive
    # defaultdict
    d = defaultdict(f)
    for datum in metadata:
        if isinstance(datum[0], AnnoTree.Tree):
            d[datum.label()] = metadataToDict(datum)
        else:
            d[datum.label()] = datum[0]
    return d


def dictToMetadata(d, label=""):
    if isinstance(d, str):
        return [d]
    keys = list(d.keys())
    l = []
    for k in keys:
        l.append(AnnoTree.Tree(k, dictToMetadata(d[k])))
    l.sort()  # Not technically needed, except to make
    # the output predctable for unit tests
    return AnnoTree.Tree(label, l)


# TODO: unify the calling convention of these fns, so we don't need *args
def deepTreeToHtml(tree, *args):
    if tree.label() == "META":
        # Metadata nodes have an empty string as html representation.
        return ""
    isLeaf = True
    metadata = None
    isSimpleLeaf = False
    if isinstance(tree[0], str):
        isSimpleLeaf = True
    else:
        for t in tree:
            if t.label() == "META":
                # Find this tree's metadata; we will need it later
                metadata = t
            elif isinstance(t[0], AnnoTree.Tree):
                # if this tree has branching daughters, other than META,
                # then it is not a leaf.
                isLeaf = False

    # Find out what to call this node
    theLabel = labelFromLabelAndMetadata(tree.label(), metadata)
    # Start building the result
    res = '<div class="snode ' + cssClassFromLabel(theLabel) + '"'
    if metadata:
        res += ' data-metadata="' + safe_json(metadataToDict(metadata)) + '"'
    res += ">" + theLabel + " "
    if isSimpleLeaf:
        res += '<span class="wnode">' + tree[0] + "</span>"
    elif isLeaf:
        res += '<span class="wnode">' + orthoFromTree(tree) + "</span>"
    else:
        leafHtml = "".join([deepTreeToHtml(x) for x in tree])
        res += leafHtml
    res += "</div>"
    return res


def writeTreesToFile(meta, trees, filename, reformat=False, fix_indices=False):
    if not isinstance(trees, str):
        raise AnnotaldException("writeTreesToFile got a non-string!")

    trees = trees.split("\n\n")
    trees = [x for x in trees if x != ""]

    if reformat or fix_indices:
        trees = [AnnoTree.Tree.fromstring(s) for s in trees]
        if fix_indices:
            trees = list(map(rewriteIndices, trees))
        trees = list(map(_formatTree, trees))
        try:
            meta = _formatTree(AnnoTree.Tree(meta))
        except:
            # the metadata tree did not parse
            pass

    fn = filename
    if os.name != "nt":
        fn = filename + ".tmp"
    with codecs.open(fn, "w", "utf-8") as f:
        if meta and meta != "":
            f.write(meta + "\n\n")
        f.write("\n\n".join(trees))

    if os.name != "nt":
        os.rename(fn, filename)


def is_leaf(tree):
    # return len(tree) == 1 and isinstance(tree[0], str)
    return isinstance(tree[0], str)


def _formatTree(tree, indent=0):
    # Should come from lovett
    if is_leaf(tree):
        # This is a leaf node
        import pdb; pdb.set_trace()
        return "(%s %s)" % (str(tree.label()), str(tree[0]))
    else:
        s = "(%s " % (str(tree.label()))
        l = len(s)
        leaves = ("\n" + " " * (indent + l)).join(
            [_formatTree(x, indent + l) for x in tree]
        )
        return "%s%s%s" % (s, leaves, ")")


def corpusSearchValidate(queryFile):  # pragma: no cover
    # TODO: how to test?
    # TODO: test the unicode part
    def corpusSearchValidateInner(version, trees):
        # Should use writetreestofile for unicode thing
        tf = tempfile.NamedTemporaryFile(delete=False)
        name = tf.name
        writer = codecs.getwriter("utf-8")
        write_handle = writer(tf)
        write_handle.write(trees)
        tf.close()
        # TODO: this will break when merging anton's branch
        cmdline = (
            "java -classpath "
            + pkg_resources.resource_filename("annotald", "CS_Tony_oct19.jar")
            + " csearch.CorpusSearch "
            + queryFile
            + " "
            + name
            + " -out "
            + name
            + ".out"
        )
        subprocess.check_call(cmdline.split(" "))

        with open(name + ".out") as f:
            newtrees = f.read()
        newtrees = scrubText(newtrees)
        os.unlink(name)
        os.unlink(name + ".out")

        return newtrees

    return corpusSearchValidateInner


def scrubText(text):
    # Should come from lovett
    output = ""
    comment = False
    for line in text.split("\n"):
        if line.startswith("/*") or line.startswith("/~*"):
            comment = True
        elif line.startswith("<+"):
            # Ignore parser-mode comments
            pass
        elif not comment:
            output = output + line + "\n"
        elif line.startswith("*/") or line.startswith("*~/"):
            comment = False
        else:  # pragma: no cover
            # Should never happen!
            pass

    if comment:
        raise AnnotaldException("Unterminated comment in input file!")

    return output


# TODO: is this needed?
def get_main_dir():  # pragma: no cover
    if main_is_frozen():
        return os.path.dirname(sys.executable)
    return os.path.dirname(__file__)


class Blackhole(object):  # pragma: no cover
    softspace = 0

    def write(self, text):
        pass


# This should all come from lovett
def _squashAt(a, b):
    if a == "":
        return b
    if b == "":
        return a
    if a[-1] == "@" and b[0] == "@":
        a = a[:-1]
        b = b[1:]
        return a + b
    else:
        return a + " " + b


def _isEmpty(tuple):
    if tuple[1] == "CODE":
        return True
    elif tuple[0][0] == "*" or (tuple[0] == "0" and tuple[1] != "NUM"):
        return True
    return False


def _stripLemma(s):
    if "-" in s:
        return "-".join(s.split("-")[:-1])
    else:
        return s


def _getText(tree_text, strip_lemmata=False):
    tree = AnnoTree.Tree(tree_text)
    to_delete = []
    for i, t in enumerate(tree):
        if t.label() in ["ID", "METADATA"]:
            to_delete.append(i)
    for td in reversed(sorted(to_delete)):
        del tree[td]
    l = tree.pos()
    l = [t for t in l if not _isEmpty(t)]
    l = [t[0] for t in l]
    if strip_lemmata:
        l = list(map(_stripLemma, l))
    l = reduce(_squashAt, l, "")
    return l


def hashTrees(trees_text, version):
    trees = trees_text.strip().split("\n\n")
    if queryVersionCookie(version, "FORMAT") == "dash":
        fn = lambda t: _getText(t, True)
    else:
        fn = _getText
    text = " ".join(map(fn, trees))
    h = hashlib.md5()
    h.update(text.encode("utf-8"))
    return h.hexdigest()


_idxRe = "([-=])([0-9]+)$"


def _getIndexInner(tree, grp):
    if _shouldIndexLeaf(tree):
        s = tree[0]
    else:
        s = tree.label()
    res = re.search(_idxRe, s)
    if res:
        return res.group(grp)
    else:
        return None


def _getIndexType(tree):
    return _getIndexInner(tree, 1)


def _getIndex(tree):
    i = _getIndexInner(tree, 2)
    if i is None:
        return i
    return int(i)


def _hasIndex(tree):
    return bool(_getIndex(tree))


def _setIndex(tree, idx):
    it = _getIndexType(tree)
    if it is None:
        it = "-"
    if _hasIndex(tree):
        tree = _stripIndex(tree)
    if _shouldIndexLeaf(tree):
        tree[0] = tree[0] + it + str(idx)
    else:
        tree.set_label(tree.label() + it + str(idx))
    return tree


def _stripIndex(tree):
    if not _hasIndex(tree):
        return tree
    if _shouldIndexLeaf(tree):
        tree[0] = re.sub(_idxRe, "", tree[0])
    else:
        tree.set_label(re.sub(_idxRe, "", tree.label()))
    return tree


def _shouldIndexLeaf(tree):
    try:
        if not isinstance(tree[0], str):
            return False
        s = tree[0]
        return re.split("[-=]", s)[0] in ["*AnnoTree*", "*ICH*", "*CL*", "*"]
    except IndexError as e:
        # Github issue #45
        print("shouldIndexLeaf error, tree is: ")
        print(tree.pprint())
        print("Whole tree (from root): ")
        r = tree.root
        if not isinstance(r, AnnoTree.Tree):
            r = r()
        print(r.pprint())
        raise e


def rewriteIndices(tree):
    indexMap = {}
    maxIndex = 1
    subtrees = [t for t in tree.subtrees()]
    subtrees.insert(0, tree)
    for t in subtrees:
        if _hasIndex(t):
            i = _getIndex(t)
            try:
                _setIndex(t, indexMap[i])
            except KeyError:
                indexMap[i] = maxIndex
                _setIndex(t, maxIndex)
                maxIndex += 1
    return tree
