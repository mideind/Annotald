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
 * Displays a context menu for setting case extensions according to
 * the IcePaHC annotation scheme.
 *
 * caseTags indicates which tags bear case indicators; casePhrases indicates
 * which phrasal categories case pertains to (though they themselves are not
 * marked)
 */
var displayCaseMenu = true;
var caseTags = ["N","NS","NPR","NPRS",
                "PRO","D","NUM",
                "ADJ","ADJR","ADJS",
                "Q","QR","QS"];
var casePhrases = ["NP","QP","ADJP"];
var caseMarkers = ["N", "A", "D", "G"];
/*
 * Which labels are barriers to recursive case assignment.
 */
var caseBarriers = ["IP","CP","NP"];

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

/*
 * Extensions are treated as not part of the label for various purposes, they
 * are all binary, and they show up in the toggle extension menu.  There are 3
 * classes of extensions: those that apply to leaf nodes, those that apply to
 * clausal nodes (IP and CP), and those that apply to non-leaf, non-clause
 * nodes.
 */
var extensions        = ["SBJ","RSP","LFD","PRN","SPE","XXX"];
var clause_extensions = ["RSP","LFD","SBJ","PRN","SPE","XXX"];
var leaf_extensions   = [];

/*
 * Phrase labels in this list (including the same ones with indices and
 * extensions) get a different background color so that the annotator can
 * see the "floor" of the current clause
 */
var ipnodes = ["IP-SUB","IP-MAT","IP-IMP","IP-INF","IP-PPL","RRC"];

// Types of comments.
// Comments are nodes of the form (CODE {XXX:words_words_words})
// If "XXX" is in the following list, then when editing the contents of the
// comment with one of the editing functions (TODO: list), a dialog box will
// appear allowing the comment to be edited as text.
var commentTypes = ["COM", "TODO", "MAN"];

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

const NONTERMINAL_CYCLE = [
    "ADJP",
    "ADVP",
    "IP",
    "NP",
    "P",
    "PP",
    "S",
    "VP",
];

const NP_CYCLE = [
    "NP",
    "NP-SUBJ",
    "NP-OBJ",
    "NP-IOBJ",
    "NP-POSS",
    "NP-PRD",
    "NP-TITLE",
    "NP-AGE",
    "NP-DAT",
    "NP-ADDRESS"
];

const S_CYCLE = [
    "S",
    "S-ADV-ACK",
    "S-ADV-CAUSE",
    "S-ADV-COND",
    "S-ADV-CONS",
    "S-ADV-PURP",
    "S-ADV-TEMP",
    "S-EXPLAIN",
    "S-MAIN",
    "S-PREFIX",
    "S-QUE",
    "S-QUOTE",
    "S-REF",
    "S-THT"
];

const ADVP_CYCLE = [
    "ADVP",
    "ADVP-DATE",
    "ADVP-DUR"
];

const VP_CYCLE = [
    "VP",
    "VP-SEQ"
];

const TERMINAL_CYCLE = [
    "abfn",
    "ao",
    "ártal",
    "dags",
    "entity",
    "eo",
    "fn",
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
    "uh"
];

const TERMINAL_VARIANT_NAMES = [
    "number", "case", "gender",
    "person",
    "tense", "voice", "mood",
    "op", "subj", "supine",
    "degree",
    "strength",
    "obj1", "obj2"
];

const CATEGORY_TO_VARIANT_NAMES = {
    no: ["number", "case", "gender", "article"],
    abfn: ["number", "case", "gender"],
    fn: ["number", "case", "gender"],
    pfn: ["number", "case", "gender"],
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
};

const GENDER = ["kk", "kvk", "hk", ""];
const NUMBER = ["et", "ft", ""];
const CASE = ["nf", "þf", "þgf", "ef", ""];
const ARTICLE = ["gr", ""];
const PERSON = ["p1", "p2", "p3", ""];  // note: gender and person can be mutually exclusive
const MOOD = ["fh", "vh", "nh", "bh", ""];
const TENSE = ["nt", "þt", ""];
const DEGREE = ["fst", "mst", "est", ""];
const STRENGTH = ["vb", "sb", ""];
const VOICE = ["mm", "gm", ""];  // "þm"
const CONTROL = ["nf", "þf", "þgf", "ef", ""];
const SUPINE = ["sagnb", ""];

const VARIANT_NAME_TO_SUBVARIANTS = {
    gender: GENDER,
    number: NUMBER,
    case: CASE,
    article: ARTICLE,
    person: PERSON,
    mood: MOOD,
    degree: DEGREE,
    strength: STRENGTH,
    voice: VOICE,
    tense: TENSE,
    supine: SUPINE,
    obj1: CONTROL,
    obj2: CONTROL,
};

const NONTERMINAL_NAME_TO_CYCLE = {
    NP: NP_CYCLE,
    S: S_CYCLE,
    ADVP: ADVP_CYCLE,
    VP: VP_CYCLE
};

function cycle_nonterminal_category (dom_node) {
    if (!dom_node.dataset.nonterminal) {
        return
    }

    let cycle = NONTERMINAL_CYCLE;
    let item = dom_node.dataset.nonterminal;

    let curr_idx = cycle.indexOf(item);
    let next_idx = curr_idx >= 0 ? (curr_idx + 1) % cycle.length : 0;
    let next_item = cycle[next_idx];

    let node = dom_node_to_tree(dom_node);
    node.nonterminal = next_item;
    let new_dom_node = tree_to_dom_elem(node);
    $(dom_node).replaceWith($(new_dom_node));
}

function cycle_nonterminal_variant(dom_node) {
    if (!dom_node.dataset.nonterminal) {
        return
    }

    let node = dom_node_to_tree(dom_node);
    let nt_name = node.nonterminal.split("-")[0];

    let cycle = NONTERMINAL_NAME_TO_CYCLE[nt_name];
    let item = node.nonterminal;
    let curr_idx = cycle.indexOf(item);
    let next_idx = curr_idx >= 0 ? (curr_idx + 1) % cycle.length : 0;
    let next_item = cycle[next_idx];

    node.nonterminal = next_item;
    let new_dom_node = tree_to_dom_elem(node);
    $(dom_node).replaceWith($(new_dom_node));
}

function cycle_terminal_category (node) {
    if (!node || !node.terminal) {
        return false;
    }

    let cycle = TERMINAL_CYCLE;
    let item = node.terminal;
    let curr_idx = cycle.indexOf(item);
    let next_idx = curr_idx >= 0 ? (curr_idx + 1) % cycle.length : 0;
    let next_item = cycle[next_idx];

    node.cat = next_item;
    let next_variants = CATEGORY_TO_VARIANT_NAMES[next_item];
    for (var_name of TERMINAL_VARIANT_NAMES) {
        node.variants[name] = next_variants.indexOf(var_name) > 0 ? node.variants[name] : "";
    }
    node.terminal = terminal_to_flat_terminal(node);

    return node;
}

function cycle_terminal_category2 (dom_node) {
    if (!dom_node.dataset.terminal) {
        return
    }

    let node = dom_terminal_elem_to_obj(dom_node);

    let cycle = TERMINAL_CYCLE;
    let item = node.terminal;
    let curr_idx = cycle.indexOf(item);
    let next_idx = curr_idx >= 0 ? (curr_idx + 1) % cycle.length : 0;
    let next_item = cycle[next_idx];

    node.cat = next_item;
    let next_variants = CATEGORY_TO_VARIANT_NAMES[next_item];
    for (var_name of TERMINAL_VARIANT_NAMES) {
        node.variants[name] = next_variants.indexOf(var_name) > 0 ? node.variants[name] : "";
    }
    node.terminal = terminal_to_flat_terminal(node);

    let new_dom_node = terminal_obj_to_dom_elem(node);
    $(dom_node).replaceWith($(new_dom_node));
}

/*
 * Flatten variants of a terminal object into canonical flat terminal form
 */
function terminal_to_flat_terminal(terminal) {
    let variants = terminal.variants;
    let head = [];
    if (terminal.cat === "so" || terminal.cat === "fs") {
        let governs = [];
        variants.obj1 ? governs.push(variants.obj1) : 0;
        governs && variants.obj2 ? governs.push(variants.obj2) : 0;
        head = [terminal.cat, String(governs.length)];
        let governs_str = governs.join("_");
        governs_str ? head.push(governs_str) : 0;
        head = head.join("_");
    } else {
        head = terminal.cat;
    }
    let tail = [];
    for (name of CATEGORY_TO_VARIANT_NAMES[terminal.cat]) {
        if (name === "obj1" || name === "obj2") {
            // already inserted case control
            continue;
        }
        variants[name] ? tail.push(variants[name]) : 0;
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

    for (name of TERMINAL_VARIANT_NAMES) {
        attrs["data-" + name] = obj.variants[name];
    }
    attrs["data-cat"] = obj.cat;
    attrs["data-lemma"] = obj.lemma;
    attrs["data-text"] = obj.text;
    attrs["data-terminal"] = obj.terminal;
    let elem = $("<div/>", attrs);
    let text_elem = $("<span/>", {
        class: "wnode",
        text: obj.text
    });
    $(elem).append(text_elem);
    // TODO: make separate text right-adjusted box for lemma
    if (obj.lemma) {
        let lemma_elem = $("<span/>", {
            class: "wnode",
            text: obj.lemma
        });
        $(elem).append(lemma_elem);
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

    for (child of obj.children) {
        $(elem).append(tree_to_dom_elem(child));
    }
    return $(elem).first().get(0);
}

function dom_node_to_tree (dom_node) {
    if (!dom_node.dataset.nonterminal && !dom_node.dataset.terminal) {
        console.log("Unexpected dom object in dom_node_to_tree");
        return;
    }

    function dom_nonterminal_elem_to_obj(dom_node) {
        return {
            nonterminal: dom_node.dataset.nonterminal,
            children: []
        };
    }

    if (dom_node.dataset.terminal) {
        return dom_terminal_elem_to_obj(dom_node);
    }

    let nt = dom_nonterminal_elem_to_obj(dom_node);
    for (child of dom_node.children) {
        nt.children.push(dom_node_to_tree(child));
    }
    return nt
}

/*
 * Extract a terminal object from a DOM element
 */
function dom_terminal_elem_to_obj(dom_node) {
    let variants = {};
    for (name of TERMINAL_VARIANT_NAMES) {
        variants[name] = dom_node.dataset[name];
    }
    return {
        text: dom_node.dataset.text,
        lemma: dom_node.dataset.lemma,
        cat: dom_node.dataset.cat,
        terminal: dom_node.dataset.terminal,
        variants: variants
    };
}

function delete_subvariant_by_name (node, var_name) {
    if (!node || !node.terminal) {
        return false;
    }

    node.variants[var_name] = "";
    node.terminal = terminal_to_flat_terminal(node);

    return node
}

function delete_subvariant_by_index (node, var_idx) {
    if (!node || !node.terminal) {
        return false;
    }
    if (var_idx < 0 || CATEGORY_TO_VARIANT_NAMES[node.cat].length <= var_idx) {
        console.log(`Illegal index '${var_idx}' on ${CATEGORY_TO_VARIANT_NAMES[node.cat]}`);
        return false;
    }
    let var_name = CATEGORY_TO_VARIANT_NAMES[node.cat][var_idx];

    node.variants[var_name] = "";
    node.terminal = terminal_to_flat_terminal(node);

    return node
}

function cycle_subvariant_by_variant_name (node, var_name) {
    // debugger;
    if (!VARIANT_NAME_TO_SUBVARIANTS[var_name]) {
        console.log(`Unknown variant name '${var_name}'`);
        return;
    }

    let num_subvars = VARIANT_NAME_TO_SUBVARIANTS[var_name].length;

    let subvar_idx = VARIANT_NAME_TO_SUBVARIANTS[var_name].indexOf(node.variants[var_name]);
    let next_idx = subvar_idx >= 0 ? (subvar_idx + 1) % num_subvars : 0;

    node.variants[var_name] =  VARIANT_NAME_TO_SUBVARIANTS[var_name][next_idx];
    node.terminal = terminal_to_flat_terminal(node);

    return node
}

function cycle_subvariant_by_variant_index (node, var_idx) {
    // let node = dom_terminal_elem_to_obj(dom_node);
    if (!node || !node.terminal) {
        return false;
    }
    // debugger;
    if (var_idx < 0 || !CATEGORY_TO_VARIANT_NAMES[node.cat] || CATEGORY_TO_VARIANT_NAMES[node.cat].length <= var_idx) {
        console.log(`Illegal index '${var_idx}' on ${CATEGORY_TO_VARIANT_NAMES[node.cat]}`);
        return false;
    }

    let variant_name = CATEGORY_TO_VARIANT_NAMES[node.cat][var_idx];
    let num_subvars = VARIANT_NAME_TO_SUBVARIANTS[variant_name].length;

    let subvar_idx = VARIANT_NAME_TO_SUBVARIANTS[variant_name].indexOf(node.variants[variant_name]);
    let next_idx = subvar_idx >= 0 ? (subvar_idx + 1) % num_subvars : 0;

    node.variants[variant_name] =  VARIANT_NAME_TO_SUBVARIANTS[variant_name][next_idx];
    node.terminal = terminal_to_flat_terminal(node);

    return node
    // let new_dom_node = terminal_obj_to_dom_elem(node);
    // $(dom_node).replaceWith(new_dom_node);
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
 * Lift a function over abstract tree objects to undoable dom operations
 */
function mk_undoable_do_and_replace_with_fn(fn) {
    function new_fn () {
        // debugger;
        let dom_node_in = get_selected_dom_terminal();
        if (!dom_node_in) {
            return false;
        }
        let DEBUG = 0;
        let node_in = dom_node_to_tree(dom_node_in);
        DEBUG && console.log(node_in);
        let new_args = [node_in].concat([...arguments]);
        let node_out = fn.apply(null, new_args);
        DEBUG && console.log(node_in);

        if (!node_out) {
            // no changes
            return;
        }

        // use legacy undo system defined in treedrawing.js
        undoBeginTransaction();
        $(touchTree($(getTokenRoot($(dom_node_in)))));

        DEBUG && console.log(dom_node_in);
        let dom_node_out = tree_to_dom_elem(node_out);
        DEBUG && console.log(dom_node_out);
        // swap with dom
        $(dom_node_in).replaceWith($(dom_node_out));
        // set result as selected
        $(dom_node_out).addClass("snodesel");

        startnode = $(dom_node_out).first().get(0);

        undoEndTransaction();
    }
    return new_fn;
}

/*
 * Get selected terminal if selected region consists of a single terminal node
 */
function get_selected_dom_terminal() {
    if (!startnode) {
        // No node selected
        return false;
    }
    if (endnode) {
        // Multiple nodes selected
        return false;
    }
    if (startnode.dataset.nonterminal) {
        return false;
    }
    return startnode;
}

function get_selection() {
    console.log("get_selection: begin");
    if (!startnode) {
        console.log("get_selection:", "none");
        console.log("\n");
        return "none";
    }
    let start = dom_node_to_tree(startnode);
    console.log("get_selection: start:", start.terminal ? "terminal" : "nonterminal");
    if (endnode) {
        console.log("get_selection:", "multi");
        let end = dom_node_to_tree(endnode);
        console.log("get_selection: end:", end.terminal ? "terminal" : "nonterminal");
    }
    console.log("\n");
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

let tree_example = {
    nonterminal: "NP-SUBJ",
    children: [leaf_example_no]
};


function insert_style_rule(rule) {
    window.document.styleSheets[0].insertRule(rule);
}
// function addStyle(string) {
//     var style = globalStyle.text() + "\n" + string;
//     globalStyle.text(style);
// }

// run on start up, dev purposes
(() => {
    window.setTimeout(() => {

        var dom_mirko = $(".no_et_nf_hk").first().get(0);
        var dom_np = $(".NP-SUBJ").first().get(0);
        var dom_s_ref = $(".S-REF").first().get(0);

        // let rule =  `
        // div.nonterminal-s {
        //     background: #aa00aa;
        //     border-left: 4px solid #aa0000;
        // }`;
        // insert_style_rule(rule);

        /*
          actions on terminals
        */

        // cycle_subvariant_by_variant_index(dom_mirko, 1);
        // cycle_terminal_category(dom_mirko);

        /*
          actions on nonterminals
        */
        // cycle_nonterminal_category(dom_s_ref);
        // cycle_nonterminal_variant(dom_s_ref);
    }, 500);
})();

function customCommands() {
    // addCommand({ keycode: KEYS.A }, leafAfter );
    // addCommand({ keycode: KEYS.B }, leafBefore);
    // addCommand({ keycode: KEYS.E }, setLabel, ["CP-ADV","CP-CMP"]);
    addCommand({ keycode: KEYS.X }, makeNode, "XP");
    // addCommand({ keycode: KEYS.X, shift: true }, setLabel, ["XP"]);
    // addCommand({ keycode: KEYS.C }, coIndex);
    // addCommand({ keycode: KEYS.C, shift: true }, toggleCollapsed);
    // addCommand({ keycode: KEYS.R }, setLabel, ["CP-REL","C$-FRL","CP-CAR",
    //                                        "CP-CLF"]);
    // addCommand({ keycode: KEYS.S }, setLabel, ["IP-SUB","IP-MAT","IP-IMP"]);
    // addCommand({ keycode: KEYS.V }, setLabel, ["IP-SMC","IP-INF",
    //                                        "IP-INF-PRP"]);
    // addCommand({ keycode: KEYS.T }, setLabel, ["CP-THT","CP-THT-PRN","CP-DEG",
    //                                        "CP-QUE"]);
    // addCommand({ keycode: KEYS.G }, setLabel, ["ADJP","ADJP-SPR","NP-MSR",
    //                                        "QP"]);
    // addCommand({ keycode: KEYS.F }, setLabel, ["PP","ADVP","ADVP-TMP","ADVP-LOC",
    //                                        "ADVP-DIR"]);

    addCommand({ keycode: KEYS["1"] }, mk_undoable_do_and_replace_with_fn(cycle_subvariant_by_variant_name), "obj1");
    addCommand({ keycode: KEYS["2"] }, mk_undoable_do_and_replace_with_fn(cycle_subvariant_by_variant_name), "obj2");
    addCommand({ keycode: KEYS["1"], shift: true }, mk_undoable_do_and_replace_with_fn(delete_subvariant_by_name), "obj1");
    addCommand({ keycode: KEYS["2"], shift: true }, mk_undoable_do_and_replace_with_fn(delete_subvariant_by_name), "obj2");
    // addCommand({ keycode: KEYS["2"], shift: true }, splitWord);
    // addCommand({ keycode: KEYS["4"] }, toggleExtension, "PRN");
    // addCommand({ keycode: KEYS["5"] }, toggleExtension, "SPE");
    // addCommand({ keycode: KEYS.Q }, cycle_subvariant_by_variant_index, 1);
    // addCommand({ keycode: KEYS.Q }, apply_selection(cycle_subvariant_by_variant_index), 1);
    addCommand({ keycode: KEYS.Q, shift: true }, mk_undoable_do_and_replace_with_fn(delete_subvariant_by_index), 0);
    addCommand({ keycode: KEYS.W, shift: true }, mk_undoable_do_and_replace_with_fn(delete_subvariant_by_index), 1);
    addCommand({ keycode: KEYS.E, shift: true }, mk_undoable_do_and_replace_with_fn(delete_subvariant_by_index), 2);
    addCommand({ keycode: KEYS.R, shift: true }, mk_undoable_do_and_replace_with_fn(delete_subvariant_by_index), 3);
    addCommand({ keycode: KEYS.A, shift: true }, mk_undoable_do_and_replace_with_fn(delete_subvariant_by_index), 4);
    addCommand({ keycode: KEYS.S, shift: true }, mk_undoable_do_and_replace_with_fn(delete_subvariant_by_index), 5);

    addCommand({ keycode: KEYS.Q }, mk_undoable_do_and_replace_with_fn(cycle_subvariant_by_variant_index), 0);
    addCommand({ keycode: KEYS.W }, mk_undoable_do_and_replace_with_fn(cycle_subvariant_by_variant_index), 1);
    addCommand({ keycode: KEYS.E }, mk_undoable_do_and_replace_with_fn(cycle_subvariant_by_variant_index), 2);
    addCommand({ keycode: KEYS.R }, mk_undoable_do_and_replace_with_fn(cycle_subvariant_by_variant_index), 3);
    addCommand({ keycode: KEYS.A }, mk_undoable_do_and_replace_with_fn(cycle_subvariant_by_variant_index), 4);
    addCommand({ keycode: KEYS.S }, mk_undoable_do_and_replace_with_fn(cycle_subvariant_by_variant_index), 5);

    addCommand({ keycode: KEYS.V }, mk_undoable_do_and_replace_with_fn(cycle_terminal_category));

    addCommand({ keycode: KEYS.D }, pruneNode);
    addCommand({ keycode: KEYS.Z }, undo);
    addCommand({ keycode: KEYS.Z, shift: true}, redo);
    addCommand({ keycode: KEYS.L }, editNode);
    addCommand({ keycode: KEYS.SPACE }, clearSelection);
    // addCommand({ keycode: KEYS.GRAVE }, toggleLemmata);
    // addCommand({ keycode: KEYS.L, ctrl: true }, displayRename);

    addCommand({ keycode: KEYS.SOLIDUS }, search);


    // TODO: remove this
    // An example of a context-sensitive label switching command.  If
    // neither NP or PP is the POS, the NP value (first in the dictionary)
    // is chosen by default.
    // addCommand({ keycode: 123 } , setLabel, { NP: ["NP-SBJ", "NP-OB1", "NP-OB2"],
    //                                           PP: ["PP-SBJ", "PP-OB1", "PP-OB2"]});
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

styleDashTag("FLAG", "color: red");
