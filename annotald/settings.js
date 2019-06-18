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
    NONTERMS: [
        "ADJP",
        "ADVP",
        "C",
        "CP",
        "DATEABS",
        "DATEREL",
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
            "ADVP-TIMESTAMP",
            "ADVP-TIMESTAMP-ABS",
            "ADVP-TIMESTAMP-REL",
            "ADVP-TMP-SET",
        ],
        CP: [
            "CP-ADV-ACK",
            "CP-ADV-CAUSE",
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
        "lo",
        "nhm",
        "no",
        "p",
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
        ".",
    ],
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
    DEFAULT_PARENT: {
        // nonterminals
        ADJP: "NP",
        ADVP: "ADVP",
        IP: "S",
        NP: "IP",
        P: "PP",
        PP: "NP",
        S: "S",
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
        lo: "ADJP",
        nhm: "INF",
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
    },
    SHORT_01: {
        NONTERM: [
            "ADJP",
            "ADVP",
            "C",
            "CP",
            "DATEABS",
            "DATEREL",
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
            "DATEABS",
            "DATEREL",
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
    //     "DATEABS",
    //     "DATEREL",
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

/* Nonterminals without flags
  S0
  ADJP
  DATEABS
  DATEREL
  INF
  PP
  */

// TODO: _op
// TODO: _subj

/*
 * Get selected elems, convert to rooted trees
 */
function get_selection () {
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
 */
function array_cycle_next_elem(arr, curr_elem, forward) {
    let curr_idx = arr.indexOf(curr_elem);
    let dir = forward ? 1 : -1;
    let next_idx = curr_idx >= 0 ? (curr_idx + dir) % arr.length : 0;
    next_idx = next_idx >= 0 ? next_idx : next_idx + arr.length;
    return arr[next_idx];
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
        class: ["snode", obj.nonterminal, nonterminal_cat].join(" "),
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
    if (!parent_elem.dataset.nonterminal && !parent_elem.dataset.terminal) {
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

    let rooted_node = {
        path: path_obj.path,
        root_elem: path_obj.root,
        root_node: root_node,
        node: sel_node,
        elem: sel_elem,
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
                                ENUM.CAT_TO_VAR[node.cat].includes(name));
    var_name = var_name ? var_name[0] : false;

    if (!var_name) {
        console.log("skipping ", var_names, "for", node.cat)
        return false;
    }

    let old = node.variants[var_name];
    let cycle = ENUM.VAR[var_name];
    let new_item = array_cycle_next_elem(
        cycle,
        old,
        forward
    );
    node.variants[var_name] = new_item

    node.terminal = terminal_to_flat_terminal(node);

    return old !== new_item ? node : false;
}

/*
 * Insert phrasal node as parent of selected node/nodes
 */
function insert_nonterminal(sel) {
    console.log("inserting terminal");
    let node = sel.start.node;
    let new_parent_name = undefined;

    if (node.terminal) {
        new_parent_name = ENUM.DEFAULT_PARENT[node.cat];
    } else {
        let nt_prefix = node.nonterminal.split("-")[0];
        new_parent_name = ENUM.DEFAULT_PARENT[nt_prefix];
    }

    let new_node = {
        nonterminal: new_parent_name,
        children: [],
    };
    let prev_parent = node.parent;

    if (prev_parent) {
        let child_idx = sel.start.path[sel.start.path.length - 1];
        let end_child_idx = sel.is_multi ? sel.end.path[sel.end.path.length - 1] : child_idx;
        console.log(child_idx, end_child_idx);
        for (let idx = end_child_idx; idx >= child_idx; idx--) {
            let child = prev_parent.children[idx];
            child.parent = new_node;
            new_node.children.unshift(child);
        }
        prev_parent.children[child_idx] = new_node;
    }

    return new_node;
}

// /*
//  * Insert phrasal node as parent of selected node
//  */
// function prune_nonterminal(sel) {
//     let node = sel.start.node;
//     if (!node.nonterminal || !node.parent) {
//         // cannot delete terminals or tree root
//         return false;
//     }
//     let parent = node.parent;
//     let child_idx = sel.start.path[sel.start.path.length - 1];
//     let left_children = parent.children.filter((val, idx) => idx < child_idx);
//     let right_children = parent.children.filter((val, idx) => idx > child_idx);
//     let children = left_children.concat()
//     // return new_node;
// }

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
 * Multiplex function by (singular) selection type
 */
function with_sel_singular(fn_map) {
    function new_fn () {
        let sel = get_selection();
        if (sel.is_multi || !sel.start) {
            return false;
        }
        let ret_fn = false;
        if (sel.start.node.terminal && fn_map.terminal) {
            ret_fn = fn_map.terminal;
        } else if (sel.start.node.nonterminal && fn_map.nonterminal) {
            ret_fn = fn_map.nonterminal;
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

/*
 * Transform changed node in selection object to dom tree and swap undoably in dom
 */
function undoable_dom_swap(sel) {
    let root_elem_in = sel.start.root_elem;
    let root_elem_out = tree_to_dom_elem(sel.start.root_node);
    root_elem_out.id = root_elem_in.id;
    root_elem_out.dataset["tree_id"] = sel.start.root_node.tree_id;
    // use legacy undo system defined in treedrawing.js
    undoBeginTransaction();
    $(touchTree($(root_elem_in)));
    $(root_elem_in).replaceWith($(root_elem_out));
    undoEndTransaction();

}

/*
 * Lift a function over abstract tree objects to undoable dom operations
 */
function mk_undoable (effectful_fn) {
    function new_fn (selection) {
        let DEBUG = 0;
        let new_args = [].concat([...arguments]);

        DEBUG && console.log("new_args", new_args);


        let is_changed = effectful_fn.apply(null, new_args);
        DEBUG && console.log("is_changed", is_changed);

        if (!is_changed) {
            // undoAbortTransaction();
            return false;
        }

        let root_elem_in = selection.start.root_elem;
        let root_elem_out = tree_to_dom_elem(selection.start.root_node);
        root_elem_out.id = root_elem_in.id;
        root_elem_out.dataset["tree_id"] = selection.start.root_node.tree_id;

        // use legacy undo system defined in treedrawing.js
        undoBeginTransaction();
        $(touchTree($(root_elem_in)));
        $(root_elem_in).replaceWith($(root_elem_out));
        undoEndTransaction();

        let effected_elem = traverse_elem_path(root_elem_out, selection.start.path);

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

let tree_example = {
    nonterminal: "NP-SUBJ",
    children: [leaf_example_no]
};

let root_example = {
    nonterminal: "S0",
    tree_id: "tree_example.psd,.1",
    children: [tree_example]
};

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
    let curr_flat_term = node.terminal;
    let names = [... ENUM.TERM];
    /*
      bin feature
      fetch bin candidates for terminal, BIN_CANDIDATES[tree_id][leaf_idx]
      sort_by_prefix_length(candidates, curr_flat_term)
      sort_by_lcs_length(candidates, curr_flat_term)
    */
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

    function handle_terminal_mouse_down(e) {
        let ev = e || window.event;
        let sug = ev.srcElement.dataset.suggestion || ev.srcElement.parentElement.dataset.suggestion;
        sel.start.node.cat = sug;
        sel.start.node.terminal = terminal_to_flat_terminal(sel.start.node);
        undoable_dom_swap(sel);
        clearSelection();
    }

    let conmenu = $("#conMenu").empty();

    let num_rows = 11;
    let num_cols = Math.ceil(names.length/num_rows);
    for (col_idx of _.range(num_cols)) {
        let cat_col = $("<div/>", {class: "conMenuColumn"});
        cat_col.append($("<div/>", {class: "conMenuHeading", text: "Categories"}));
        for (suggestion of names.slice(col_idx * num_rows, (col_idx + 1) * num_rows)) {
            cat_col.append(make_item(suggestion));
        }
        cat_col.mousedown(handle_terminal_mouse_down);
        conmenu.append(cat_col);
    }

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

function insert_style_rule(rule) {
    window.document.styleSheets[0].insertRule(rule);
}

// run on start up, dev purposes
(() => {
    window.setTimeout(() => {

        // var dom_mirko = $(".no_et_nf_hk").first().get(0);
        // var dom_np = $(".NP-SUBJ").first().get(0);
        // var dom_s_ref = $(".S-REF").first().get(0);

        let trees = get_all_trees();

        // cycle_subvariant_by_variant_index(dom_mirko, 1);
        // cycle_terminal_category(dom_mirko);

        /*
          actions on nonterminals
        */
        // cycle_nonterm_prefix(dom_s_ref);
        // cycle_nonterm_suffix(dom_s_ref);

    }, 500);
})();

// Keybindings
function customCommands() {
    // addCommand({ keycode: KEYS.A }, leafAfter );
    addCommand({ keycode: KEYS.X }, makeNode, "XP");
    // addCommand({ keycode: KEYS.C, shift: true }, toggleCollapsed);
    // addCommand({ keycode: KEYS["2"], shift: true }, splitWord);

    // addCommand({ keycode: KEYS["1"]}, with_sel_singular({
    //     // TODO: _op
    //     terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj1", FORWARD)),
    //     nonterminal: mk_undoable(cycle_nonterm_suffix.bind(null, FORWARD)),
    // }));
    // addCommand({ keycode: KEYS["1"], shift: true}, with_sel_singular({
    //     terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj1", BACKWARD)),
    //     nonterminal: mk_undoable(cycle_nonterm_suffix.bind(null, BACKWARD)),
    // }));
    // addCommand({ keycode: KEYS["2"]}, with_sel_singular({
    //     // TODO: _subj_fall ?
    //     terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj1", FORWARD)),
    //     nonterminal: mk_undoable(cycle_nonterm_suffix.bind(null, FORWARD)),
    // }));
    // addCommand({ keycode: KEYS["2"], shift: true}, with_sel_singular({
    //     terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj1", BACKWARD)),
    //     nonterminal: mk_undoable(cycle_nonterm_suffix.bind(null, BACKWARD)),
    // }));

    addCommand({ keycode: KEYS.Q}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj1", FORWARD)),
        nonterminal: mk_undoable(cycle_nonterm_suffix.bind(null, FORWARD)),
    }));
    addCommand({ keycode: KEYS.Q, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj1", BACKWARD)),
        nonterminal: mk_undoable(cycle_nonterm_suffix.bind(null, BACKWARD)),
    }));
    addCommand({ keycode: KEYS.W}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj2", FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.W, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "obj2", BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.E}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, ["person", "degree"], FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.E, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, ["person", "degree"], BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.R}, with_sel_singular({
        // TODO: sagnbot/lh_þt/lh_nt
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "mood", FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.R, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "mood", BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.T}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "voice", FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.T, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "voice", BACKWARD)),
        nonterminal: not_implemented_fn,
    }));

    addCommand({ keycode: KEYS.X}, with_sel(mk_undoable(insert_nonterminal)));

    // addCommand({ keycode: KEYS.A}, with_sel_singular({
    //     // TODO: bin_cycle
    //     terminal: not_implemented_fn,
    //     nonterminal: not_implemented_fn,
    // }));

    addCommand({ keycode: KEYS.A}, with_sel_singular({
        // TODO: bin_cycle
        terminal: not_implemented_fn,
        nonterminal: not_implemented_fn,
    }));

    addCommand({ keycode: KEYS.S}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "number", FORWARD)),
        // nonterminal: mk_undoable(make_nonterminal_cycle_fn(SHORT_NP_CYCLE_1, FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.S, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "number", BACKWARD)),
        // nonterminal: mk_undoable(make_nonterminal_cycle_fn(SHORT_NP_CYCLE_1, BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.D}, with_sel_singular({
        // TODO: subj_case
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "case", FORWARD)),
        nonterminal: mk_undoable(cycle_nonterm_short_02.bind(null, FORWARD)),
    }));
    addCommand({ keycode: KEYS.D, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "case", BACKWARD)),
        nonterminal: mk_undoable(cycle_nonterm_short_02.bind(null, BACKWARD)),
    }));
    addCommand({ keycode: KEYS.F}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, ["tense", "gender"], FORWARD)),
        nonterminal: mk_undoable(cycle_nonterm_short_01.bind(null, FORWARD)),
    }));
    addCommand({ keycode: KEYS.F, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, ["tense", "gender"], BACKWARD)),
        nonterminal: mk_undoable(cycle_nonterm_short_01.bind(null, BACKWARD)),
    }));

    addCommand({ keycode: KEYS.C}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "gr", FORWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.C, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "gr", BACKWARD)),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.V}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "strength", FORWARD)),
        nonterminal: with_sel_singular({nonterminal: pruneNode}),
    }));
    addCommand({ keycode: KEYS.V, shift: true}, with_sel_singular({
        terminal: mk_undoable(cycle_subvariant_by_variant_name.bind(null, "strength", BACKWARD)),
        nonterminal: with_sel_singular({nonterminal: pruneNode}),
    }));


    // addCommand({ keycode: KEYS.Z }, undo);
    addCommand({ keycode: KEYS.Z , ctrl: true}, undo);
    addCommand({ keycode: KEYS.Z, shift: true}, redo);
    addCommand({ keycode: KEYS.L }, editNode);
    addCommand({ keycode: KEYS.SPACE }, clearSelection);

    // addCommand({ keycode: KEYS.GRAVE }, toggleLemmata);
    // addCommand({ keycode: KEYS.L, ctrl: true }, displayRename);

    addCommand({ keycode: KEYS.SOLIDUS }, search);
}


/*
 * Default phrase label suggestions in context menu
 */
var defaultConMenuGroup = ["VBPI","VBPS","VBDI","VBDS","VBI","VAN","VBN","VB"];

/*
 * Phrase labels that are suggested in context menu when one of the other ones
 * is set
 */
function customConMenuGroups() {
    addConMenuGroup( ["IP-SUB","IP-MAT","IP-INF","IP-IMP","CP-QUE","QTP","FRAG"] );
    addConMenuGroup( ["ADJP","ADJX","NP-MSR","QP","NP","ADVP","IP-PPL"] );
    addConMenuGroup( ["NP-SBJ","NP-OB1","NP-OB2","NP-PRD","NP-POS","NP-PRN",
                      "NP","NX","NP-MSR","NP-TMP","NP-ADV","NP-COM","NP-CMP",
                      "NP-DIR","NP-ADT","NP-VOC","QP"] );
    addConMenuGroup( ["PP","ADVP","ADVP-TMP","ADVP-LOC","ADVP-DIR","NP-MSR","NP-ADV"] );
    addConMenuGroup( ["VBPI","VBPS","VBDI","VBDS","VBI","VAN","VBN","VB","HV"] );
    addConMenuGroup( ["HVPI","HVPS","HVDI","HVDS","HVI","HV"] );
    addConMenuGroup( ["RP","P","ADV","ADVR","ADVS","ADJ","ADJR","ADJS","C","CONJ","ALSO"] );
    addConMenuGroup( ["WADVP","WNP","WPP","WQP","WADJP"] );
    addConMenuGroup( ["CP-THT","CP-QUE","CP-REL","CP-DEG","CP-ADV","CP-CMP"] );
}

/*
 * Context menu items for "leaf before" shortcuts
 */
function customConLeafBefore() {
    addConLeafBefore("WNP" , "0"     );
    addConLeafBefore("WADVP" , "0"     );
    addConLeafBefore("WADJP" , "0"     );
    addConLeafBefore("NP-SBJ" , "*"     );
    addConLeafBefore("NP-SBJ" , "*exp*"     );
    addConLeafBefore("NP-SBJ" , "*con*"     );
    addConLeafBefore("NP-SBJ" , "*pro*"     );
    addConLeafBefore("C"      , "0"         );
    addConLeafBefore("CODE"   , "{COM:XXX}" );
    addConLeafAfter("CODE"   , "{COM:XXX}" );
}

// An example of a CSS rule for coloring a syntactic tag.  The styleTag
// function takes care of setting up a (somewhat complex) CSS rule that
// applies the given style to any node that has the given label.  Dash tags
// are accounted for, i.e. NP also matches NP-FOO (but not NPR).  The
// lower-level addStyle() function adds its argument as CSS code to the
// document.
// styleTag("NP", "color: red");

// An example of a CSS rule for coloring a dash tag.  Similarly to the
// styleTag function, styleDashTag takes as an argument the name of a dash tag
// and CSS rule(s) to apply to it.

// styleDashTag("FLAG", "color: red");
