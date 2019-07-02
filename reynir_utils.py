"""
This Python file uses the following encoding: utf-8
This file copyright © 2018 by Haukur Barri Símonarson

This file is part of Annotald.

Annotald is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option)
any later version.

Annotald is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more
details.

You should have received a copy of the GNU General Public License along with
Annotald.  If not, see <http://www.gnu.org/licenses/>.


This module implements an interface to the Reynir parser for Icelandic that
converts the result into a mostly IcePaHC conformant schema. This feature is primarily
intended to be used as a preprocessing step before parsing by hand.

In order to use it, you must first install the ReynirPackage,
   pip install reynir
"""

import os
from pathlib import Path
import sys

from nltk import Tree
from annotald.util import AnnoTree

try:
    from reynir import Reynir
except ImportError as e:
    print(
        (
            "You must first install ReynirPackage before using reynir_utils.py"
            "(pip install reynir)"
        )
    )
    sys.exit(1)

import annotald.util as util


_CASE_MAP = {"nf": "N", "þf": "A", "þgf": "D", "ef": "G"}
_DEGREE_MAP = {"ms": "R", "evb": "S", "esb": "S", "est": "S"}
_NUMBER_MAP = {"et": "", "ft": "S"}
_SPECIAL_VERB_MAP = {"vera": "BE", "gera": "DO", "hafa": "HV", "verða": "RD,"}

_NP_TAG_MAP = {
    "pfn": "PRO",
    "abfn": "PRO",
    "no": "N",
    "fn": "Q",
    "no": "N",
    "person": "NPR",
    "entities": "NPR",
    "sérnafn": "NPR",
}

_MOOD_MAP = {"fh": "I", "bh": "I", "vh": "S"}

_TENSE_MAP = {"nt": "P", "þt": "D"}

CASES = frozenset(_CASE_MAP.keys())
NUMBERS = frozenset(_NUMBER_MAP.keys())
DEGREES = frozenset(_DEGREE_MAP.keys())
MOODS = frozenset(_MOOD_MAP.keys())
TENSES = frozenset(_TENSE_MAP.keys())

MODALS = frozenset(["mega", "munu", "skulu", "vilja", "geta", "fá"])
SPECIAL_VERBS = frozenset(_SPECIAL_VERB_MAP.keys())


def escape_parens(text):
    return text.replace("(", r"\(").replace(")", r"\)")


def simpleTree2NLTK(tt):
    """ Convert Reynir SimpleTree to NLTK Tree
        without changing labels """
    if tt._len > 1 or tt._children:
        # Children present: Array or nonterminal
        # return (tt.tag, [simpleTree2NLTK(child) for child in tt.children])
        return AnnoTree(tt.tag, [simpleTree2NLTK(child) for child in tt.children])
    escaped_text = escape_parens(tt.text)
    escaped_lemma = escape_parens(tt.lemma)
    # No children
    if tt._head.get("k") == "PUNCTUATION":
        # Punctuation
        return AnnoTree("grm", [escaped_text])
    # Terminal
    seg_node, lemma_node = None, None

    terminal_children = [escaped_text]

    is_abbrev = "." in tt.text and "." not in tt.lemma
    is_segmented = "-" in tt.lemma and not "-" in tt.text
    lemma_node = AnnoTree("lemma", [escaped_lemma])
    seg_node = None
    if is_abbrev:
        lemma_node = AnnoTree("lemma", [escaped_text])
        seg_node = AnnoTree("exp_abbrev", [escaped_lemma])
    elif is_segmented:
        lemma_node = AnnoTree("lemma", ["".join(escaped_lemma.split("-"))])
        seg_node = AnnoTree("exp_seg", [escaped_lemma])

    terminal_children.append(lemma_node)
    if seg_node:
        terminal_children.append(seg_node)

    terminal = AnnoTree(tt.terminal_with_all_variants, terminal_children)
    return terminal


def tok_stream_to_null_reynir(tok_stream):
    """ Constuct bare minimal NLTK.Tree from a token stream """
    toks = [escape_parens(str(tok)) for tok in tok_stream]
    toks = [AnnoTree("x", [tok, AnnoTree("lemma", [tok])]) for tok in toks]
    tree = AnnoTree("S0", [AnnoTree("S-MAIN", toks)])
    return tree


def insert_id(tree, prefix, index):
    """ Insert ID element into NLTK.Tree object as child of first node,
        (... ...
             (ID {prefix},.{index}))
    """
    id_str = "{prefix},.{index}".format(prefix=prefix, index=index)
    tree.insert(0, AnnoTree("ID", [id_str]))


def reynir_sentence_to_reynir(sent):
    if sent.tree is not None:
        nltk_tree = simpleTree2NLTK(sent.tree)
    else:
        nltk_tree = tok_stream_to_null_reynir([tok.txt for tok in sent._s if tok])
    return AnnoTree("", [nltk_tree])


def parse_single(
    text, affix_lemma=1, id_prefix=None, start_index=1):
    """ Parse a single sentence into mostly IcePaHC conformant parse trees
        using a transformation of reynir's parse trees """
    r = Reynir()
    sent = r.parse_single(text)
    nltk_tree = reynir_sentence_to_reynir(sent.tree)
    if id_prefix is not None:
        insert_id(nltk_tree, id_prefix, start_index)
    return nltk_tree


def parse_text(text, affix_lemma=1, id_prefix=None, start_index=1):
    """ Parse contiguous text into mostly IcePaHC conformant parse trees
        using a transformation of reynir's parse trees """
    r = Reynir()
    dd = r.parse(text)
    for idx, sent in enumerate(dd["sentences"]):
        nltk_tree = reynir_sentence_to_reynir(sent)
        if id_prefix is not None:
            insert_id(nltk_tree, id_prefix, start_index + idx)
        yield nltk_tree


def annotate_file(in_path, out_path):
    print("Parsing input file: {0}".format(in_path))
    print("Writing output to file: {0}".format(out_path))
    with in_path.open(mode="r") as in_handle:
        text = in_handle.read()
        with Path(out_path).open(mode="w") as out_handle:
            for tree in parse_text(text, id_prefix=in_path.name):
                formatted_tree = tree.pretty()
                out_handle.write(formatted_tree)
                out_handle.write("\n")
                out_handle.write("\n")

def main():
    import argparse

    parser = argparse.ArgumentParser(
        "Parse a text file of contiguous text into Reynir parse trees"
    )

    def file_type_guard(path):
        path = Path(path)
        if path.is_file():
            return path
        raise argparse.ArgumentError(
            "Expected path to a file but got '{0}'".format(path)
        )

    parser.add_argument(
        "-i",
        "--in_path",
        dest="in_path",
        type=file_type_guard,
        required=True,
        default="default",
        help="Path to input file with contiguous text",
    )
    parser.add_argument(
        "-o",
        "--out_path",
        dest="out_path",
        required=False,
        help="Path to output file",
    )

    args = parser.parse_args()
    out_path = args.out_path
    if out_path is None:
        out_path = args.in_path.with_suffix(".psd")
    annotate_file(args.in_path, out_path)


if __name__ == "__main__":
    main()

