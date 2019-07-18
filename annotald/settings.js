// Copyright (c) 2011, 2012 Anton Karl Ingason, Aaron Ecay

// This file is part of the Annotald program for annotating
// phrase-structure treebanks in the Penn Treebank style.

// This file is distributed under the terms of the GNU General
// Public License as published by the Free Software Foundation, either
// version 3 of the License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Lesser
// General Public License for more details.

// You should have received a copy of the GNU Lesser General Public
// License along with this program.  If not, see
// <http://www.gnu.org/licenses/>.


/*
 * Whether to include detailed information on key and mouse actions in the
 * event log
 */
// TODO: add to user manual
var logDetail = true;

/*
 * These two functions should return true if the string argument is a valid
 * label for a branching (-Phrase-) and non-branching (-Leaf-) label, and
 * false otherwise.  The utility function basesAndDashes is provided.  It
 * takes two arguments, a list of base tags and a list of dash tags.  It
 * returns a function suitable for assigning to one of these variables. The
 * recommended way to accomplish this, however, is to use the waxeye parser
 * generator.  Samples and documentation for this method have yet to be
 * written.
 */
var testValidPhraseLabel = undefined;
var testValidLeafLabel   = undefined;

function not_implemented_fn () {
    console.log("Not implemented yet");
};

// Key codes for legibility
const KEYS = {
    TAB: 8,
    TAB: 9,
    RETURN: 13,
    CONTROL: 17,
    ESCAPE: 27,
    SPACE: 32,
    0: 49,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    SOLIDUS: 192,
    GRAVE: 192
};

const FORWARD = true;
const BACKWARD = false;

const ENUM = {
    // All nonterminal prefixes
    NONTERMS: [
        "ADJP",
        "ADVP",
        "C",
        "CP",
        "FOREIGN",
        "INF",
        "IP",
        "NP",
        "P",
        "PP",
        "S",
        "S0",
        "VP",
    ],
    // All sufixes for a given particular nonterminal prefix
    NONTERM_SUFFIX: {
        ADVP: [
            "ADVP",
            "ADVP-DATE",
            "ADVP-DATE-ABS",
            "ADVP-DATE-REL",
            "ADVP-DIR",
            "ADVP-DUR",
            "ADVP-DUR-ABS",
            "ADVP-DUR-REL",
            "ADVP-DUR-TIME",
            "ADVP-PCL",
            "ADVP-TIMESTAMP",
            "ADVP-TIMESTAMP-ABS",
            "ADVP-TIMESTAMP-REL",
            "ADVP-TMP-SET",
        ],
        CP: [
            "CP-ADV-ACK",
            "CP-ADV-CAUSE",
            "CP-ADV-CMP",
            "CP-ADV-COND",
            "CP-ADV-CONS",
            "CP-ADV-PURP",
            "CP-ADV-TEMP",
            "CP-EXPLAIN",
            "CP-QUE",
            "CP-REL",
            "CP-THT",
        ],
        IP: [
            "IP",
            "IP-INF",
        ],
        NP: [
            "NP",
            "NP-ADDR",
            "NP-AGE",
            "NP-ADP",
            "NP-DAT",
            "NP-IOBJ",
            "NP-MEASURE",
            "NP-OBJ",
            "NP-PERSON",
            "NP-POSS",
            "NP-PRD",
            "NP-SUBJ",
            "NP-TITLE",
        ],
        S0: [
            "S0",
            "S0-X"
        ],
        S: [
            "S",
            "S-COND",
            "S-CONS",
            "S-EXPLAIN",
            "S-HEADING",
            "S-MAIN",
            "S-PREFIX",
            "S-QUE",
            "S-QUOTE",
        ],
        VP: [
            "VP",
            "VP-AUX"
        ],
    },
    // All allowed terminal categories
    TERM: [
        "abfn",
        "ao",
        "ártal",
        "dags",
        "entity",
        "eo",
        "fn",
        "foreign",
        "fs",
        "fyrirtæki",
        "gata",
        "gr",
        "grm",
        "lén",
        "lo",
        "nhm",
        "no",
        "person",
        "pfn",
        "prósenta",
        "raðnr",
        "sérnafn",
        "so",
        "spao",
        "st",
        "stt",
        "tala",
        "tímapunktur",
        "tími",
        "to",
        "töl",
        "uh",
        "x",
    ],
    // Variant name to subvariants
    VAR: {
        gender: ["kk", "kvk", "hk"],
        number: ["et", "ft"],
        case: ["nf", "þf", "þgf", "ef"],
        article: ["gr"],
        person: ["p1", "p2", "p3"],  // note: iirc gender and person can be mutually exclusive
        mood: ["fh", "vh", "nh", "bh"],
        tense: ["nt", "þt"],
        degree: ["fst", "mst", "est"],
        strength: ["vb", "sb"],
        voice: ["mm", "gm"],  // "þm"
        obj1: ["nf", "þf", "þgf", "ef"],
        obj2: ["nf", "þf", "þgf", "ef"],
        supine: ["sagnb"],
        impersonal: ["op"],
    },
    // Variants which can an empty subvariant
    VAR_ALLOW_EMPTY_SUBVAR: [
        "article",
        "case",
        "gender",
        "mood",
        "obj1",
        "obj2",
        "strength",
        "supine",
        "voice",
    ],
    // Default parent of terminal tags and nonterminal prefixes
    DEFAULT_PARENT: {
        // nonterminals
        ADJP: "NP",
        ADVP: "ADVP",
        IP: "S",
        NP: "IP",
        P: "PP",
        PP: "NP",
        S: "S",
        TO: "IP",
        VP: "IP",
        // terminals
        abfn: "NP",
        ao: "ADVP",
        ártal: "ADVP",
        dags: "ADVP",
        entity: "NP",
        eo: "ADJP",
        fn: "NP",
        fs: "PP",
        fyrirtæki: "NP",
        gata: "NP-ADDR",
        gr: "NP",
        grm: "NP",
        lo: "ADJP",
        nhm: "TO",
        no: "NP",
        p: "S",
        person: "NP",
        pfn: "NP",
        prósenta: "ADJP",
        raðnr: "ADJP",
        sérnafn: "NP",
        so: "VP",
        spao: "ADVP",
        st: "CP",
        stt: "CP-REL",
        tala: "NP",
        tímapunktur: "ADVP",
        tími: "ADVP",
        to: "ADJP",
        töl: "NP",
        uh: "ADVP",
        ".": "S",
    },
    // The variants which a particular terminal category can have
    CAT_TO_VAR: {
        ao: ["degree"],
        no: ["number", "case", "gender", "article"],
        abfn: ["number", "case", "gender"],
        fn: ["number", "case", "gender"],
        pfn: ["number", "case", "gender", "person"],
        gr: ["number", "case", "gender"],
        tala: ["number", "case", "gender"],
        töl: ["number", "case", "gender"],
        to: ["number", "case", "gender"],
        lo: ["number", "case", "gender", "degree", "strength"],
        so: ["number", "tense", "supine", "mood",
             "voice", "person", "obj1", "obj2"], // what about _subj ?
        fs: ["obj1"],
        person: ["case", "gender"],
        raðnr: ["case", "gender"],
        sérnafn: ["case"],
        lén: ["case"],
    },
    // Cycle groups for which keyboard mappings can be assigned to cycle through
    SHORT_01: {
        NONTERM: [
            "ADJP",
            "ADVP",
            "C",
            "CP",
            "FOREIGN",
            "INF",
            "IP",
            "NP",
            "P",
            "PP",
            "S",
            "S0",
            "VP",
        ],
        ADVP: [
            "ADVP",
            "ADVP-DIR",
            "ADVP-TMP-SET",
        ],
        CP: [
            "CP-EXPLAIN",
            "CP-QUE",
            "CP-REL",
            "CP-THT",
        ],
        IP: [
            "IP",
            "IP-INF",
        ],
        NP: [
            "NP",
            "NP-SUBJ",
            "NP-OBJ",
            "NP-IOBJ",

        ],
        S0: [
            "S0",
            "S0-X",
        ],
        S: [
            "S",
            "S-MAIN",
            "S-EXPLAIN",
            "S-QUOTE",
        ],
        VP: [
            "VP",
            "VP-AUX"
        ],
    },
    SHORT_02: {
        NONTERM: [
            "ADJP",
            "ADVP",
            "C",
            "CP",
            "FOREIGN",
            "INF",
            "IP",
            "NP",
            "P",
            "PP",
            "S",
            "S0",
            "VP",
        ],
        ADVP: [
            "ADVP-DATE",
            "ADVP-DATE-ABS",
            "ADVP-DATE-REL",
        ],
        CP: [
            "CP-ADV-ACK",
            "CP-ADV-CAUSE",
            "CP-ADV-COND",
            "CP-ADV-CONS",
            "CP-ADV-PURP",
            "CP-ADV-TEMP",
            "ADVP-ADV-CMP",
        ],
        NP: [
            "NP-POSS",
            "NP-PRD",
            "NP-ADDR"
        ],
        S: [
            "S-COND",
            "S-CONS",
            "S-HEADING",
            "S-PREFIX",
            "S-QUE",
        ],
    },
    // SHORT_03: {
    // NONTERM: [
    //     "ADJP",
    //     "ADVP",
    //     "C",
    //     "CP",
    //     "INF",
    //     "IP",
    //     "NP",
    //     "P",
    //     "PP",
    //     "S",
    //     "S0",
    //     "VP",
    // ],
    //     NP: [
    //         "NP-AGE",
    //         "NP-DAT",
    //         "NP-MEASURE",
    //         "NP-PERSON",
    //         "NP-TITLE",
    //     ],
    //     ADVP: [
    //         "ADVP-DUR",
    //         "ADVP-DUR-ABS",
    //         "ADVP-DUR-REL",
    //         "ADVP-DUR-TIME",
    //     ],
    // },
    // SHORT_04: {
    //     NP: [
    //     ],
    //     ADVP: [
    //         "ADVP-TIMESTAMP",
    //         "ADVP-TIMESTAMP-ABS",
    //         "ADVP-TIMESTAMP-REL",
    //     ],
    // }
}

// TODO: _op
// TODO: _subj

/*
 * Get selected elems, convert to rooted trees
 */
function get_selection () {
    return get_selection_inner(startnode, endnode);
}

function get_selection_inner(startnode, endnode) {
    if (!startnode) {
        return false;
    }
    let start_sel = get_rooted_node_by_elem(startnode);
    let multi_sel = {
        start: start_sel,
        is_multi: false
    };
    if (endnode) {
        multi_sel.end = get_rooted_node_by_elem(endnode);
        multi_sel.is_multi = true;
    }
    return multi_sel;
}

function cycle_nonterm_prefix (forward, sel) {
    let node = sel.start.node;

    let old = node.nonterminal;
    let nt_prefix = node.nonterminal.split("-")[0];
    let new_item = array_cycle_next_elem(
        ENUM.NONTERMS,
        nt_prefix,
        forward
    );

    node.nonterminal = new_item;
    return old !== new_item ? node : false;
}

function cycle_nonterm_suffix(forward, sel) {
    let node = sel.start.node;

    let nt_prefix = node.nonterminal.split("-")[0];
    let old = node.nonterminal;
    let new_item = array_cycle_next_elem(
        ENUM.NONTERM_SUFFIX[nt_prefix],
        old,
        forward
    );

    node.nonterminal = new_item;
    return old !== new_item ? node : false;
}

function cycle_nonterm_short_01(forward, sel) {
    let node = sel.start.node;
    console.log(sel);

    let nt_prefix = node.nonterminal.split("-")[0];
    let cycle = ENUM.SHORT_01[nt_prefix];
    if (cycle === undefined || cycle === "") {
        console.log("Skipping short_01 for", node.nonterminal);
        return false;
    }
    let old = node.nonterminal;
    let new_item = array_cycle_next_elem(
        cycle,
        old,
        forward
    );

    node.nonterminal = new_item;
    return old !== new_item ? node : false;
}

function cycle_nonterm_short_02(forward, sel) {
    let node = sel.start.node;

    let nt_prefix = node.nonterminal.split("-")[0];
    let cycle = ENUM.SHORT_02[nt_prefix];
    if (cycle === undefined || cycle === "") {
        console.log("Skipping short_02 for", node.nonterminal);
        return false;
    }

    let old = node.nonterminal;
    let new_item = array_cycle_next_elem(
        cycle,
        old,
        forward
    );

    node.nonterminal = new_item;
    return old !== new_item ? node : false;
}

/*
 * Get next element in array after or before given element
 * optionally, if wrap_elem is truthy, it becomes an intermediate element when wrapping
 */
function array_cycle_next_elem(arr, curr_elem, forward, wrap_elem) {
    let curr_idx = arr.indexOf(curr_elem);
    let dir = forward ? 1 : -1;
    let wrap_arr = [... arr];
    // wrap_elem might be falsy even if we should use it, such as ""
    if (wrap_elem !== undefined && wrap_elem !== false) {
        wrap_arr.push(wrap_elem);
    }
    let next_idx = curr_idx >= 0 ? (curr_idx + dir) % wrap_arr.length : 0;
    next_idx = next_idx >= 0 ? next_idx : next_idx + wrap_arr.length;
    return wrap_arr[next_idx];
}

function cycle_terminal_category (forward, sel) {
    let node = sel.start.node;

    let old = node.cat;
    let new_item = array_cycle_next_elem(
        ENUM.TERM,
        old,
        forward
    );

    node.cat = new_item;
    let next_variants = ENUM.CAT_TO_VAR[node.cat];
    for (var_name of Object.keys(ENUM.VAR)) {
        node.variants[name] = next_variants.indexOf(var_name) > 0 ? node.variants[name] : "";
    }
    node.terminal = terminal_to_flat_terminal(node);

    return old !== new_item ? node : false;
}

function make_nonterminal_cycle_fn(arr, forward) {
    function new_fn (sel) {
        let node = sel.start.node;

        let old = node.nonterminal;
        let new_item = old;
        if (arr.include(old)) {
            new_item = array_cycle_next_elem(
                arr,
                old,
                forward
            );
        } else {
            new_item = arr[0];
        }

        node.nonterminal = new_item;

        return old !== new_item ? node : false;
    }

    return new_fn
}

/*
 * Flatten variants of a terminal object into canonical flat terminal form
 */
function terminal_to_flat_terminal(terminal) {
    let variants = terminal.variants;
    let head = [];
    if (terminal.cat === "so") {
        let governs = [];
        variants.obj1 ? governs.push(variants.obj1) : 0;
        governs && variants.obj2 ? governs.push(variants.obj2) : 0;
        head = [terminal.cat, String(governs.length)];
        let governs_str = governs.join("_");
        governs_str ? head.push(governs_str) : 0;
        head = head.join("_");
    } else if (terminal.cat === "fs") {
        let suffix = variants.obj1 ? ("_" + variants.obj1) : "";
        head = "" + terminal.cat + suffix;
    } else {
        head = terminal.cat;
    }
    let tail = [];
    let variant_names = ENUM.CAT_TO_VAR[terminal.cat];
    if (variant_names) {
        for (name of variant_names) {
            if (name === "obj1" || name === "obj2") {
                // already inserted case control
                continue;
            }
            variants[name] ? tail.push(variants[name]) : 0;
        }
    }
    tail = tail.join("_");
    ret = [head];
    tail ? ret.push(tail) : 0;
    return ret.join("_");
}

/*
 * Create a DOM terminal object from a terminal object
 */
function terminal_obj_to_dom_elem(obj) {
    let attrs = {
        class: ["snode", obj.terminal, `terminal-${obj.cat}`].join(" "),
        text: obj.terminal
    };

    let variant_names = Object.keys(ENUM.VAR);
    for (name of variant_names) {
        attrs["data-" + name] = obj.variants[name];
    }
    attrs["data-cat"] = obj.cat;
    attrs["data-lemma"] = obj.lemma || "";
    attrs["data-text"] = obj.text;
    attrs["data-terminal"] = obj.terminal;
    attrs["data-seg"] = obj.seg || "";
    attrs["data-abbrev"] = obj.abbrev || "";
    let elem = $("<div/>", attrs);
    let text_elem = $("<span/>", {
        class: "wnode",
        text: obj.text
    });
    $(elem).append(text_elem);

    // lemma
    if (obj.lemma) {
        let lemma_elem = $("<span/>", {
            class: ["wnode", "lemma-node"].join(" "),
            text: obj.lemma
        });
        $(elem).append(lemma_elem);
    }

    // expansion
    if (obj.seg || obj.abbrev) {
        exp_class = obj.seg ? "exp-seg-node" : "exp-abbrev-node"
        let exp_elem = $("<span/>", {
            class: ["wnode", exp_class].join(" "),
            text: obj.seg || obj.abbrev
        });
        $(elem).append(exp_elem);
    }

    return $(elem).first().get(0);
}

/*
 * Convert tree to dom form of tree
 */
function tree_to_dom_elem (obj) {
    if (!obj.nonterminal && !obj.terminal) {
        console.log("Unexpected obj in tree_to_dom_elem");
        return;
    }
    if (obj.terminal) {
        return terminal_obj_to_dom_elem(obj);
    }

    let cat = obj.nonterminal.split("-")[0].toLowerCase();
    let nonterminal_cat = `nonterminal-${cat}`;
    let attrs = {
        class: ["snode", nonterminal_cat].join(" "),
        text: obj.nonterminal
    };
    attrs["data-nonterminal"] = obj.nonterminal;
    let elem = $("<div/>", attrs);

    if (obj.hasOwnProperty("tree_id")) {
        let tree_id_elem = $("<span/>", {
            class: (["wnode", "tree-id-node"]).join(" "),
            text: obj.tree_id,
        });
        $(elem).append(tree_id_elem);
    }
    for (child of obj.children) {
        $(elem).append(tree_to_dom_elem(child));
    }
    return $(elem).first().get(0);
}

/*
   Extract whole dom syntax tree and convert it to a doubly linked plain tree object,
   return the current selected node
*/
function get_path_to_root_elem(elem) {
    let parent_elem = elem.parentElement;
    if (!parent_elem || !parent_elem.dataset.nonterminal && !parent_elem.dataset.terminal) {
        return {
            root: elem,
            path: []
        };
    }
    let result = get_path_to_root_elem(parent_elem);
    result.path.push(get_child_index_of_elem(elem));
    return result;
}

function arr_contains(arr_like, item) {
    return [... arr_like].includes(item);
}

function get_child_index_of_elem(elem) {
    return [... elem.parentNode.children].filter(
        (child) => !arr_contains(child.classList, "tree-id-node")
    ).indexOf(elem);
}


function traverse_elem_path(node, path) {
    let cursor = node;
    for (let child_index of path) {
        let non_id_nodes = [... cursor.children].filter(
            (child) => !arr_contains(child.classList, "tree-id-node")
        );
        cursor = non_id_nodes[child_index];
    }
    return cursor;
}

function traverse_node_path(node, path) {
    let cursor = node;
    for (let child_index of path) {
        cursor = cursor.children[child_index];
    }
    return cursor;
}

/*
 * Extract whole tree that contains sel_elem and convert it to a doubly linked plain tree object,
 * return the current selected node
 */
function get_rooted_node_by_elem (sel_elem) {
    if (!sel_elem.dataset.nonterminal && !sel_elem.dataset.terminal) {
        console.log("Unexpected dom object in selected");
        return false;
    }

    let path_obj = get_path_to_root_elem(sel_elem);
    let root_node = dom_node_to_tree(path_obj.root);
    let path = path_obj.path;
    let sel_node = traverse_node_path(root_node, path);
    let cloned_root = clone_tree(root_node);

    let rooted_node = {
        path: path_obj.path,
        root_elem: path_obj.root,
        root_node: root_node,
        node: sel_node,
        elem: sel_elem,
        cloned_root: cloned_root,
    };

    return rooted_node;
}

/*
   Extracts dom element (syntax tree) node and converts it to a plain tree object
 */
function dom_node_to_tree (elem) {
    if (!elem.dataset.nonterminal && !elem.dataset.terminal) {
        console.log("Unexpected dom object in dom_node_to_tree");
        return;
    }

    function dom_nonterminal_elem_to_obj(elem) {
        let nt = {
            nonterminal: elem.dataset.nonterminal,
            children: []
        };
        if (elem.dataset.tree_id) {
            nt.tree_id = elem.dataset.tree_id;
            nt.corpus_id = elem.dataset.corpus_id;
            nt.url = elem.dataset.url;
            nt.comment = elem.dataset.comment;
        }
        return nt
    }

    if (elem.dataset.terminal) {
        return dom_terminal_elem_to_obj(elem);
    }

    let nt_node = dom_nonterminal_elem_to_obj(elem);
    for (let child_elem of elem.children) {
        if ([...child_elem.classList].includes("tree-id-node")) {
            continue;
        }
        let child_node = dom_node_to_tree(child_elem)
        child_node.parent = nt_node;
        nt_node.children.push(child_node);
    }
    return nt_node;
}

/*
 * Extract a terminal object from a DOM element
 */
function dom_terminal_elem_to_obj(dom_node) {
    let variants = {};
    let variant_names = Object.keys(ENUM.VAR);
    for (name of variant_names) {
        variants[name] = dom_node.dataset[name];
    }
    let term_obj = {
        text: dom_node.dataset.text,
        lemma: dom_node.dataset.lemma,
        cat: dom_node.dataset.cat,
        terminal: dom_node.dataset.terminal,
        abbrev: dom_node.dataset.abbrev,
        seg: dom_node.dataset.seg,
        variants: variants
    };
    return term_obj;
}

function delete_subvariant_by_name (var_name, sel) {
    let node = sel.start.node;
    if (!node || !node.terminal) {
        return false;
    }

    node.variants[var_name] = "";
    node.terminal = terminal_to_flat_terminal(node);

    return node
}

function delete_subvariant_by_index (var_idx, sel) {
    let node = sel.start.node;
    if (!node || !node.terminal) {
        return false;
    }
    if (var_idx < 0 || CATEGORY_TO_VARIANT_NAMES[node.cat].length <= var_idx) {
        console.log(`Illegal index '${var_idx}' on ${CATEGORY_TO_VARIANT_NAMES[node.cat]}`);
        return false;
    }
    let var_name = CATEGORY_TO_VARIANT_NAMES[node.cat][var_idx];

    let old = node.variants[var_name];
    let new_item = "";
    node.variants[var_name] = "";
    node.terminal = terminal_to_flat_terminal(node);

    return old !== new_item ? node : false;
}

function cycle_subvariant_by_variant_name (var_names, forward, sel) {
    let node = sel.start.node;

    var_names = Array.isArray(var_names) ? var_names : [var_names];
    let var_name = var_names.filter((name) =>
                                (ENUM.CAT_TO_VAR[node.cat] || []).includes(name));
    var_name = var_name ? var_name[0] : false;

    if (!var_name) {
        console.log("skipping ", var_names, "for", node.cat)
        return false;
    }

    let old = node.variants[var_name];
    let cycle = ENUM.VAR[var_name];
    let empty_elem = false;
    if (ENUM.VAR_ALLOW_EMPTY_SUBVAR.includes(var_name)) {
        empty_elem = "";
    }
    let new_item = array_cycle_next_elem(
        cycle,
        old,
        forward,
        empty_elem
    );
    node.variants[var_name] = new_item

    node.terminal = terminal_to_flat_terminal(node);

    return old !== new_item ? node : false;
}

/*
 * Insert phrasal node as parent of selected node/nodes
 */
function insert_nonterminal(sel) {
    if (!sel || !sel.start || !sel.start.node || sel.start.node.tree_id || !sel.start.node.parent) {
        return false;
    }

    let node = sel.start.node;
    let new_parent_name = undefined;

    if (node.terminal) {
        new_parent_name = ENUM.DEFAULT_PARENT[node.cat];
        if (!new_parent_name) {
            console.log("No default parent:", node.cat);
        }
        new_parent_name = "NP";
    } else {
        let nt_prefix = node.nonterminal.split("-")[0];
        new_parent_name = ENUM.DEFAULT_PARENT[nt_prefix];
        if (!new_parent_name) {
            console.log("No default parent:", nt_prefix);
            new_parent_name = "NP";
        }
    }

    let new_node = {
        nonterminal: new_parent_name,
        children: [],
    };

    let child_idx = sel.start.path[sel.start.path.length - 1];
    let end_child_idx = sel.is_multi ? sel.end.path[sel.end.path.length - 1] : child_idx;
    let sel_length = end_child_idx - child_idx + 1;
    let extracted_children = node.parent.children.splice(child_idx, sel_length, new_node);
    new_node.children = extracted_children;

    return new_node;
}

let wrapped_insert_nonterminal = mk_undoable(insert_nonterminal);

/*
 * Remove phrasal node at path
 */
function prune_at_path(anc_node, path) {
    if (path.length === 0) {
        console.err("cannot remove node at empty path");
        return;
    }
    let child_idx = path[path.length - 1];
    let parent_node = anc_node;
    if (path.length !== 1) {
        parent_node = traverse_node_path(anc_node, path.slice(0, path.length - 1));
    }
    let node_to_prune = parent_node.children[child_idx];
    let left_siblings = parent_node.children.filter((val, idx) => idx < child_idx);
    let right_siblings = parent_node.children.filter((val, idx) => idx > child_idx);
    let children = left_siblings.concat(node_to_prune.children).concat(right_siblings);
    for (let child of children) {
        if (child.parent) {
            child.parent = parent_node;
        }
    }
    parent_node.children = children;
    return true;
}

/*
 * Remove phrasal node at selection, attaching children to parent of removed node
 */
function prune_nonterminal(sel) {
    let node = sel.start.node;
    if (!node.nonterminal || !node.parent) {
        // cannot delete terminals or tree root
        return false;
    }
    let parent = node.parent;
    let child_idx = sel.start.path[sel.start.path.length - 1];
    let left_siblings = parent.children.filter((val, idx) => idx < child_idx);
    let right_siblings = parent.children.filter((val, idx) => idx > child_idx);
    let children = left_siblings.concat(node.children).concat(right_siblings);
    for (let child of children) {
        child.parent = parent;
    }
    parent.children = children;
    return true;
}

/*
 * Bind current selection to function
 */
function with_sel(fn) {
    function new_fn () {
        let sel = get_selection();
        let new_args = [sel].concat([...arguments]);
        return fn.apply(null, new_args);
    }
    return new_fn;
}

/*
 * Multiplex function by selection type
 */
function multiplexed_with_sel(mplex_map) {
    function new_fn () {
        let sel = get_selection();
        if (sel.is_multi || !sel.start) {
            return false;
        }
        let ret_fn = false;
        if (sel.start.node.terminal && mplex_map.terminal) {
            ret_fn = mplex_map.terminal;
        } else if (sel.start.node.nonterminal && mplex_map.nonterminal) {
            ret_fn = mplex_map.nonterminal;
        }
        if (!ret_fn) {
            return false;
        }
        let new_args = [sel].concat([...arguments]);
        return ret_fn.apply(null, new_args);
    }
    return new_fn;
}

/*
 * Partially apply UI node selection to function
 */
function apply_selection (fn) {
    function new_fn () {
        let new_args = [startnode].concat([...arguments]);
        return fn.apply(null, new_args);
    }
    return new_fn;
}

let undo_system = (function () {
    let undo_stack = [];
    let redo_stack = [];

    function undo () {
        // console.log("undoing");
        if (undo_stack.length <= 0) {
            // console.log("undo_stack empty")
            return;
        }

        // note: singly linked tree pointing at root
        let tree_before = undo_stack.pop();
        let elem_before = tree_to_dom_elem(tree_before);
        let curr_elem = $(`div.snode[data-tree_id='${tree_before.tree_id}']`).first().get(0);
        elem_before.id = curr_elem.id;
        elem_before.dataset.tree_id = curr_elem.dataset.tree_id;
        elem_before.dataset.corpus_id = curr_elem.dataset.corpus_id;
        elem_before.dataset.url = curr_elem.dataset.url;
        elem_before.dataset.comment = curr_elem.dataset.comment;

        let curr_tree = clone_tree(get_rooted_node_by_elem(curr_elem).root_node);

        redo_stack.push(curr_tree);
        $(curr_elem).replaceWith($(elem_before));
    }

    function redo() {
        // console.log("redoing")
        if (redo_stack.length <= 0) {
            // console.log("redo_stack empty")
            return;
        }

        let tree_after = redo_stack.pop();
        let elem_after = tree_to_dom_elem(tree_after);
        let curr_elem = $(`div.snode[data-tree_id='${tree_after.tree_id}']`).first().get(0);
        elem_after.id = curr_elem.id;
        elem_after.dataset.tree_id = curr_elem.dataset.tree_id;
        elem_after.dataset.corpus_id = curr_elem.dataset.corpus_id;
        elem_after.dataset.url = curr_elem.dataset.url;
        elem_after.dataset.comment = curr_elem.dataset.comment;
        let curr_tree = clone_tree(get_rooted_node_by_elem(curr_elem).root_node);

        undo_stack.push(curr_tree);
        $(curr_elem).replaceWith($(elem_after));
    }

    function record(tree_root) {
        // console.log("Recorded")
        if (!tree_root || !(tree_root.terminal || tree_root.nonterminal)) {
            console.err("Invalid undo item:", tree_root);
            return;
        }
        redo_stack = [];
        undo_stack.push(tree_root);
    }

    function record(tree_root) {
        redo_stack = [];
        undo_stack.push(tree_root);
    }

    function clean(tree_root) {
        redo_stack = [];
        undo_stack = [];
    }

    return {
        undo_stack: undo_stack,
        redo_stack: redo_stack,
        undo: undo,
        redo: redo,
        record: record,
        clean: clean,
    }
})();

/*
 * Transform changed node in selection object to dom tree and swap undoably in dom
 */
function undoable_dom_swap(sel) {
    let root_elem_in = sel.start.root_elem;
    let root_elem_out = tree_to_dom_elem(sel.start.root_node);
    root_elem_out.id = root_elem_in.id;
    root_elem_out.dataset["tree_id"] = sel.start.root_node.tree_id;
    root_elem_out.dataset["corpus_id"] = sel.start.root_node.corpus_id;
    root_elem_out.dataset["url"] = sel.start.root_node.url;
    root_elem_out.dataset["comment"] = sel.start.root_node.comment;
    undo_system.record(sel.start.cloned_root);
    // use legacy undo system defined in treedrawing.js
    undoBeginTransaction();
    $(touchTree($(root_elem_in)));
    $(root_elem_in).replaceWith($(root_elem_out));
    undoEndTransaction();
}

/*
 * Lift a function that mutates abstract tree objects to undoable dom operations
 */
function mk_undoable (effectful_fn) {
    function new_fn (sel) {
        let DEBUG = 0;
        let new_args = [].concat([...arguments]);

        DEBUG && console.log("new_args", new_args);

        let is_changed = effectful_fn.apply(null, new_args);
        DEBUG && console.log("is_changed", is_changed);

        if (!is_changed) {
            // undoAbortTransaction();
            return false;
        }

        let root_elem_in = sel.start.root_elem;
        undo_system.record(sel.start.cloned_root);
        let root_elem_out = tree_to_dom_elem(sel.start.root_node);
        root_elem_out.id = root_elem_in.id;
        root_elem_out.dataset["tree_id"] = sel.start.root_node.tree_id;
        root_elem_out.dataset["corpus_id"] = sel.start.root_node.corpus_id;
        root_elem_out.dataset["url"] = sel.start.root_node.url;
        root_elem_out.dataset["comment"] = sel.start.root_node.comment;

        // use legacy undo system defined in treedrawing.js
        undoBeginTransaction();
        $(touchTree($(root_elem_in)));
        $(root_elem_in).replaceWith($(root_elem_out));
        undoEndTransaction();

        let effected_elem = traverse_elem_path(root_elem_out, sel.start.path);

        $(effected_elem).addClass("snodesel");
        startnode = effected_elem;

        return true;
    }
    return new_fn;
}

let leaf_example_no = {
    text: "bílnum",
    cat: "no",
    lemma: "bíll",
    variants: {
        gender: "kk",
        number: "et",
        article: "gr",
        case: "nf"
    },
    terminal: "no_kk_nf_gr"
};

let leaf_example_so_1 = {
    // þó ég taki matinn á eftir
    text: "taki",
    cat: "so",
    lemma: "taka",
    variants: {
        person: "p1",
        number: "et",
        tense: "nt",
        mood: "vh",
        voice: "gm",
        supine: "",
        obj1: "þf",
        obj2: "",
    },
    terminal: "so_1_þf_gm_vh_nt_et_p1"
};

let leaf_example_so_2 = {
    // við gæfum hundinum matinn
    text: "gæfum",
    cat: "so",
    lemma: "gefa",
    variants: {
        person: "p1",
        number: "ft",
        tense: "þt",
        mood: "vh",
        voice: "gm",
        supine: "",
        obj1: "þgf",
        obj2: "þf",
    },
    terminal: "so_2_þgf_þf_gm_vh_þt_ft_p1"
};

let nonterminal_example = {
    nonterminal: "NP-SUBJ",
    children: [leaf_example_no]
};

let root_example = {
    nonterminal: "S0",
    tree_id: "tree_example.psd,.1",
    corpus_id: "afb23-31213-1123-1123.7",
    url: "http://mbl.is/foo/",
    comment: "tree_example.psd,.1",
    children: [nonterminal_example]
};

/*
 * Clone (rooted) tree, omitting parent connections
 */
function clone_tree(root) {
    let should_skip = ["parent", "children"];

    function parentless_view(node) {
        let obj = {};
        for (let prop in node) {
            if (!node.hasOwnProperty(prop) || should_skip.includes(prop)) {
                continue;
            }
            obj[prop] = node[prop];
        }
        obj.children = [];
        if (node.children) {
            for (let child of node.children) {
                obj.children.push(parentless_view(child));
            }
        }
        return obj;
    }

    let root_no_parents = parentless_view(root);
    let res = JSON.parse(JSON.stringify(root_no_parents));
    return res;
}

/**
 * Retrieve text of leaves in tree by inorder traversal
 */
function tree_to_text(tree) {
    function _tree_to_text_inner(tree) {
        if (tree.terminal) {
            return [tree.text];
        }
        if (tree.nonterminal) {
            let buffer = [];
            for (let child of tree.children) {
                buffer.push(... _tree_to_text_inner(child));
            }
            return buffer;
        }
        console.error("Unreachable");
        return [];
    }

    return _tree_to_text_inner(tree).join(" ");
}

function populate_context_menu_nonterminal(sel) {
    let node = sel.start.node;
    let cat = node.nonterminal.split("-")[0];
    let names = [... ENUM.NONTERMS];
    let extensions = ENUM.NONTERM_SUFFIX[cat] || [];

    function make_item(suggestion) {
        let attrs = {
            class: "conMenuItem",
            "data-suggestion": suggestion,
        };
        let item = $("<div/>", attrs);
        let text_elem = $("<a/>", {text: suggestion, href:"#"});
        item.append(text_elem);
        return item;
    }

    function handle_nonterminal_mouse_down(e) {
        let ev = e || window.event;
        let sug = ev.srcElement.dataset.suggestion || ev.srcElement.parentElement.dataset.suggestion;
        sel.start.node.nonterminal = sug;
        undoable_dom_swap(sel);
        clearSelection();
    }

    let conmenu = $("#conMenu").empty();
    let cat_col = $("<div/>", {class: "conMenuColumn"});
    let ext_col = $("<div/>", {class: "conMenuColumn"});
    ext_col.append($("<div/>", {class: "conMenuHeading", text: "Extensions"}));
    cat_col.append($("<div/>", {class: "conMenuHeading", text: "Categories"}));

    for (suggestion of names) {
        cat_col.append(make_item(suggestion));
    }
    for (suggestion of extensions) {
        ext_col.append(make_item(suggestion));
    }
    cat_col.mousedown(handle_nonterminal_mouse_down);
    ext_col.mousedown(handle_nonterminal_mouse_down);

    conmenu.append(cat_col);
    conmenu.append(ext_col);
}

function populate_context_menu_terminal(sel) {
    let node = sel.start.node;
    let name = node.cat;
    let names = [... ENUM.TERM];
    let conmenu = $("#conMenu").empty();

    function handle_terminal_mouse_down(e) {
        let ev = e || window.event;
        let elem = ev.srcElement.dataset.action_key ? ev.srcElement : ev.srcElement.parentElement;

        let action_key = elem.dataset.action_key;
        let action_type = elem.dataset.action_type;
        let action_value = elem.dataset.action_value;
        let node = sel.start.node;

        if (action_type === "suggestion") {
            node[action_key] = action_value;
        } else if (action_type === "add") {
            node[action_key] = node.text;
        } else if (action_type === "remove") {
            node[action_key] = "";
        }
        node.terminal = terminal_to_flat_terminal(node);

        undoable_dom_swap(sel);
        clearSelection();
        $(conmenu).off("mousedown", handle_terminal_mouse_down);
    }

    let pages = [[]];
    let row_size = 12;
    let last_heading = null;

    function add_item(item, heading) {
        if (pages[pages.length - 1].length >= row_size) {
            pages.push([{is_heading: true, value: last_heading}]);
        }
        let last_page = pages[pages.length - 1];
        if (last_heading !== heading) {
            last_page.push({is_heading: true, value: heading});
            last_heading = heading;
        }
        last_page.push({is_heading: false, value: item});
    }

    let has_abbrev = node.abbrev && node.abbrev !== "";
    let has_seg = node.seg && node.seg !== "";
    let has_lemma = node.lemma && node.lemma !== "";

    if (!has_lemma) {
        add_item({action: "add", key: "lemma", value: "Lemma"}, "Add");
    }
    if (!has_seg && !has_abbrev) {
        add_item({action: "add", key: "seg", value: "Segmentation"}, "Add");
        add_item({action: "add", key: "abbrev", value: "Abbreviation"}, "Add");
    } else if (has_abbrev) {
        add_item({action: "remove", key: "abbrev", value: "Abbreviation"}, "Remove");
    } else if (has_seg) {
        add_item({action: "remove", key: "seg", value: "Segmentation"}, "Remove");
    }
    if (has_lemma) {
        add_item({action: "remove", key: "lemma", value: "Lemma"}, "Remove");
    }


    for (let suggestion of names) {
        add_item({action: "suggestion", key: "cat", value: suggestion}, "Categories");
    }

    for (let page of pages) {
        let cat_col = $("<div/>", {class: "conMenuColumn"});
        for (let page_item of page) {
            if (page_item.is_heading) {
                cat_col.append($("<div/>", {class: "conMenuHeading", text: page_item.value}));
            } else {
                let item = page_item.value;
                let attrs = {class: "conMenuItem"};
                attrs["data-action_type"] = item.action;
                attrs["data-action_key"] = item.key;
                attrs["data-action_value"] = item.value;
                let item_elem = $("<div/>", attrs);
                let text_elem = $("<a/>", {text: item.value, href:"#"});
                item_elem.append(text_elem);
                cat_col.append(item_elem);
            }
        }
        conmenu.append(cat_col);
    }

    conmenu.mousedown(handle_terminal_mouse_down);
}

/*
 * Remove backpointer to parent nodes in tree
 */
function doubly_linked_tree_to_singly_linked(tree) {
    delete tree["parent"];
    tree.children && tree.children.map(doubly_linked_tree_to_singly_linked);
    return tree;
}

/*
 * Remove empty or undefined attributes in all nodes in tree
 */
function remove_undefined_or_empty_attr(tree) {
    let properties = []
    for (let property in tree) {
        if (tree.hasOwnProperty(property)) {
            properties.push(property);
        }
    }
    for (let prop of properties) {
        if (tree[prop] === undefined || tree[prop] === "") {
            delete tree[prop];
        }
    }
    if (tree.variants) {
        remove_undefined_or_empty_attr(tree.variants);
    }
    tree.children && tree.children.map(remove_undefined_or_empty_attr);
    return tree;
}

function get_all_trees() {
    let trees = [];
    for (child of document.getElementById("sn0").children) {
        trees.push(dom_node_to_tree(child));
    }
    return trees.map(doubly_linked_tree_to_singly_linked).map(remove_undefined_or_empty_attr);
}

// Keybindings
function customCommands() {
    addCommand({ keycode: KEYS.Q}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj1", FORWARD)),
        nonterminal: mk_undoable(cycle_nonterm_suffix.bind(null, FORWARD)),
    }));
    addCommand({ keycode: KEYS.Q, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj1", BACKWARD)),
        nonterminal: mk_undoable(cycle_nonterm_suffix.bind(null, BACKWARD)),
    }));
    addCommand({ keycode: KEYS.W}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj2", FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.W, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj2", BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.E}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, ["person", "degree"], FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.E, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, ["person", "degree"], BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.R}, multiplexed_with_sel({
        // TODO: sagnbot/lh_þt/lh_nt
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "mood", FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.R, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "mood", BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.T}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "voice", FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.T, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "voice", BACKWARD)),
        nonterminal: not_implemented_fn,
    }));

    // addCommand({ keycode: KEYS.A}, multiplexed_with_sel({
    //     // TODO: bin_cycle
    //     terminal: not_implemented_fn,
    //     nonterminal: not_implemented_fn,
    // }));

    addCommand({ keycode: KEYS.A}, multiplexed_with_sel({
        // TODO: bin_cycle
        terminal: not_implemented_fn,
        nonterminal: not_implemented_fn,
    }));

    addCommand({ keycode: KEYS.S}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "number", FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.S, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "number", BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.D}, multiplexed_with_sel({
        // TODO: subj_case
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "case", FORWARD)),
        nonterminal: mk_undoable(cycle_nonterm_short_02.bind(null, FORWARD)),
    }));
    addCommand({ keycode: KEYS.D, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "case", BACKWARD)),
        nonterminal: mk_undoable(cycle_nonterm_short_02.bind(null, BACKWARD)),
    }));
    addCommand({ keycode: KEYS.F}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, ["tense", "gender"], FORWARD)),
        nonterminal: mk_undoable(cycle_nonterm_short_01.bind(null, FORWARD)),
    }));
    addCommand({ keycode: KEYS.F, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, ["tense", "gender"], BACKWARD)),
        nonterminal: mk_undoable(cycle_nonterm_short_01.bind(null, BACKWARD)),
    }));

    addCommand({ keycode: KEYS.C}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "article", FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.C, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "article", BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.V}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "strength", FORWARD)),
        nonterminal: mk_undoable(prune_nonterminal),
    }));
    addCommand({ keycode: KEYS.V, shift: true}, multiplexed_with_sel({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "strength", BACKWARD)),
        nonterminal: mk_undoable(prune_nonterminal),
    }));

    addCommand({ keycode: KEYS.X}, with_sel(mk_undoable(insert_nonterminal)));

    addCommand({ keycode: KEYS.Z , ctrl: true}, undo_system.undo);
    addCommand({ keycode: KEYS.Z, shift: true}, undo_system.redo);
    addCommand({ keycode: KEYS.SPACE }, clearSelection);

    addCommand({ keycode: KEYS.SOLIDUS }, search);
}
