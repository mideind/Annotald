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
from collections import namedtuple

from nltk import Tree
from annotald.util import AnnoTree

try:
    from reynir import Reynir
    from reynir import correct_spaces
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

CorpusTree = namedtuple("CorpusTree", "id_corpus, tree, url")
CorpusEntry = namedtuple("CorpusEntry", "flags, uuid, index, text, url")


def bucketize(iterable, bucket_size):
    iterator = iter(iterable)
    bucket = []
    for item in iterator:
        if len(bucket) >= bucket_size:
            yield bucket
            bucket = []
        bucket.append(item)
    if bucket:
        yield bucket


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


def reynir_sentence_to_annotree(sent):
    if sent.tree is not None:
        nltk_tree = simpleTree2NLTK(sent.tree)
    else:
        nltk_tree = tok_stream_to_null_reynir([tok.txt for tok in sent._s if tok])
    return nltk_tree


def parse_single(text, affix_lemma=1, id_prefix=None, start_index=1):
    """ Parse a single sentence into reynir simple trees in bracket format """
    r = Reynir()
    sent = r.parse_single(text)
    nltk_tree = reynir_sentence_to_annotree(sent.tree)
    if id_prefix is not None:
        insert_id(nltk_tree, id_prefix, start_index)
    return nltk_tree


def parse_text_file(file_handle, affix_lemma=1, id_prefix=None, start_index=1):
    """ Parse contiguous text into reynir simple trees in bracket format """
    text = file_handle.read()
    r = Reynir()
    dd = r.parse(text)
    for idx, sent in enumerate(dd["sentences"]):
        nltk_tree = reynir_sentence_to_annotree(sent)
        if id_prefix is not None:
            insert_id(nltk_tree, id_prefix, start_index + idx)
        yield nltk_tree


def parse_tsv_file(file_handle, reorder=True):
    """ Parse .tsv file of the format:
            flag, uuid, sentence_index, text, url [, datetime]
        if the number of sentences in text is not 1 (according to the tokenizer/parser)
        then they will be merged naively.
        """
    parser = Reynir()
    filtered = []
    for (line_idx, line) in enumerate(file_handle):
        flags, uuid, idx, text, url, *_ = line.strip().split("\t")[:6]
        should_export = False if not flags else "1" in flags
        if not should_export:
            continue
        filtered.append(
            CorpusEntry(flags=flags, uuid=uuid, text=text, index=idx, url=url)
        )
    if reorder:
        filtered = sorted(filtered, key=lambda e: len(e.text.split(" ")))
    for entry in filtered:
        res = parser.parse(correct_spaces(entry.text))
        annotrees = []
        for idx, sent in enumerate(res["sentences"]):
            tree = reynir_sentence_to_annotree(sent)
            annotrees.append(tree)
        first, *rest = annotrees
        for tree in rest:
            first.insert(len(first), tree)
        id_corpus = "{0}.{1}".format(entry.uuid, entry.index)
        yield CorpusTree(id_corpus=id_corpus, tree=first, url=entry.url)


def annotate_file(in_path, out_path, force_mode=None, reorder=True, bucket_size=10):
    out_path = Path(out_path)
    print("Parsing input file: {0}".format(in_path))
    print("Writing output to: {0}".format(out_path))
    with in_path.open(mode="r") as in_handle:
        if force_mode == "txt" or (in_path.suffixes and ".txt" == in_path.suffixes[-1]):
            with Path(out_path).open(mode="w") as out_handle:
                for tree in parse_text_file(in_handle, id_prefix=in_path.name):
                    formatted_tree = tree.pretty()
                    out_handle.write(formatted_tree)
                    out_handle.write("\n\n")
        elif force_mode == "tsv" or in_path.suffixes and ".tsv" in in_path.suffixes[-1]:
            corpus_iter = parse_tsv_file(
                in_handle, reorder=reorder
            )
            for (bucket_idx, tree_bucket) in enumerate(
                bucketize(corpus_iter, bucket_size)
            ):
                bucket_idx += 1
                bucket_name = "{0}_{1:05d}".format(out_path.stem, bucket_idx)
                bucket_out_path = (out_path.parent / bucket_name).with_suffix(".psd")
                with bucket_out_path.open(mode="w") as out_handle:
                    for (tree_idx, corpus_tree) in enumerate(tree_bucket):
                        tree_idx += 1
                        id_local = "{0},.{1}".format(bucket_out_path.name, tree_idx)
                        meta_node = AnnoTree(
                            "META",
                            [
                                AnnoTree("ID-CORPUS", [corpus_tree.id_corpus]),
                                AnnoTree("ID-LOCAL", [id_local]),
                                AnnoTree("URL", [corpus_tree.url]),
                                AnnoTree("COMMENT", [""]),
                            ],
                        )
                        output_tree = AnnoTree("", [meta_node, corpus_tree.tree])
                        formatted_tree = output_tree.pretty()
                        out_handle.write(formatted_tree)
                        out_handle.write("\n\n")
        else:
            raise ValueError("Invalid output filename or pattern")


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
        "-o", "--out_path", dest="out_path", required=False, help="Path to output file"
    )
    parser.add_argument(
        "-b",
        "--bucket_size",
        type=int,
        dest="bucket_size",
        required=False,
        default=10,
        help="Bucket size when splitting output into multiple files",
    )
    parser.add_argument(
        "--no_reorder",
        action="store_true",
        dest="no_reorder",
        default=False,
        required=False,
        help="Reorder trees in ascending number of leaves",
    )

    args = parser.parse_args()
    out_path = args.out_path
    if out_path is None:
        out_path = args.in_path.with_suffix(".psd")
    annotate_file(
        args.in_path, out_path, bucket_size=args.bucket_size, reorder=not args.no_reorder
    )


if __name__ == "__main__":
    main()
