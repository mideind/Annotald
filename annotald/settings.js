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

function not_implemented_fn () {
    console.log("Not implemented yet");
};

// Key codes for legibility
const KEYS = {
    TAB: 8,
    TAB: 9,
    RETURN: 13,
    SHIFT: 16,   // left
    CONTROL: 17,   // left
    ALT: 18,   // left
    ESCAPE: 27,
    SPACE: 32,
    ARROW_LEFT: 37,
    ARROW_UP: 38,
    ARROW_RIGHT: 39,
    ARROW_DOWN: 40,
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
        "TO",
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
            "CP-QUOTE",
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
        // TODO: _subj
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
        fs: "P",
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
        so: ["obj1", "obj2", "number", "tense", "mood",
             "voice", "person", "supine"], // what about _subj ?
        fs: ["obj1"],
        person: ["case", "gender"],
        raðnr: ["case", "gender"],
        sérnafn: ["number", "case", "gender", "article"],
        lén: ["case"],
    },
    SUBVAR_TO_VAR: {
        kk: "gender",
        kvk: "gender",
        hk: "gender",
        et: "number",
        ft: "number",
        nf: "case",
        þf: "case",
        þgf: "case",
        ef: "case",
        gr: "article",
        p1: "person",
        p2: "person",
        p3: "person",
        fh: "mood",
        vh: "mood",
        nh: "mood",
        bh: "mood",
        nt: "tense",
        þt: "tense",
        fst: "degree",
        mst: "degree",
        est: "degree",
        vb: "strength",
        sb: "strength",
        mm: "voice",
        gm: "voice",
        sagn: "supine",
        op: "impersonal",
        // TODO: _subj
    },
    VAR_REPR: {
        gender: "Gender",
        number: "Number",
        case: "Case",
        article: "Article",
        person: "Person",
        mood: "Mood",
        tense: "Tense",
        degree: "Degree",
        strength: "Strength",
        voice: "Voice",
        obj1: "Case control 1",
        obj2: "Case control 2",
        supine: "Supine",
        impersonal: "Impersonal",
        // TODO: _subj
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
};

function cycle_nonterm_prefix(forward, sel) {
    let node = sel.node;

    let old = node.nonterminal;
    let nt_prefix = node.nonterminal.split("-")[0];
    let new_item = array_cycle_next_elem(
        ENUM.NONTERMS,
        nt_prefix,
        forward
    );

    node.nonterminal = new_item;
    return old !== new_item ? sel : false;
}

function cycle_nonterm_suffix(forward, sel) {
    let node = sel.node;

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
    let node = sel.node;
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
    return old !== new_item ? sel : false;
}

function cycle_nonterm_short_01(forward, sel) {
    let node = sel.node;
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
    return old !== new_item ? sel : false;
}

function cycle_nonterm_short_02(forward, sel) {
    let node = sel.node;

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
    return old !== new_item ? sel : false;
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

function cycle_terminal_category(forward, sel) {
    let node = sel.node;

    let old = node.cat;
    let new_item = array_cycle_next_elem(
        ENUM.TERM,
        old,
        forward
    );

    node.cat = new_item;
    let next_variants = ENUM.CAT_TO_VAR[node.cat];
    for (let var_name of Object.keys(ENUM.VAR)) {
        node.variants[name] = next_variants.indexOf(var_name) > 0 ? node.variants[name] : "";
    }
    node.terminal = terminal_to_flat_terminal(node);

    return old !== new_item ? sel : false;
}

function make_nonterminal_cycle_fn(arr, forward) {
    function new_fn (sel) {
        let node = sel.node;

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

/**
 * Create legal partial tree terminal object from flat terminal string.
 */
function split_flat_terminal(flat_terminal) {
    let parts = flat_terminal.split("_");
    if (parts.length <= 0) {
        return false;
    }

    let variants = {};
    if (!ENUM.TERM.includes(parts[0])) {
        console.error("Invalid grammatical category");
        return false;
    }
    let cat = parts.shift();
    let head = cat;

    let case_control = [];
    if (head === "so") {
        let first_variant = parts[0];
        if (["0", "1", "2"].includes(first_variant)) {
            parts.shift();
            let num_control = parseInt(first_variant);
            for (let idx=0; idx<num_control; idx++) {
                let item = parts.shift();
                if (!ENUM.VAR.case.includes(item)) {
                    console.error("Invalid subvariant: " + item);
                    return false;
                }
                case_control.push(item);
            }
        }
    } else if (head === "fs") {
        if (!ENUM.VAR.case.includes(parts[0])) {
            console.error("Invalid case variant: " + parts[0]);
            return false;
        }
        case_control = [parts[0]];
        parts.shift();
    }

    for (let item of parts) {
        if (!ENUM.SUBVAR_TO_VAR[item]) {
            console.error("Invalid subvariant: " + item);
            return false;
        }
    }

    let legal_vars = ENUM.CAT_TO_VAR[head];
    if (!legal_vars) {
        console.log("No variant for terminal");
        return {
            cat: head,
            variants: variants,
        };
    }

    parts.forEach((item, idx) => {
        let var_name = ENUM.SUBVAR_TO_VAR[item];
        if (legal_vars.includes(var_name)) {
            variants[var_name] = item;
        }
    });

    case_control.forEach((item, idx) => {
        let key = "obj" + (idx + 1);
        variants[key] = item;
    });

    return {
        cat: head,
        variants: variants,
    };
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
        for (let name of variant_names) {
            if (name === "obj1" || name === "obj2") {
                // already inserted case control
                continue;
            }
            variants[name] ? tail.push(variants[name]) : 0;
        }
    }
    tail = tail.join("_");
    let ret = [head];
    tail ? ret.push(tail) : 0;
    return ret.join("_");
}

/*
 * Create a DOM terminal object from a terminal object
 */
function terminal_obj_to_dom_elem(obj, path, tree_index) {
    let class_list = ["snode", "tree-node", "terminal", `terminal-${obj.cat}`];
    let attrs = {
        class: class_list.join(" "),
    };

    let variant_names = Object.keys(ENUM.VAR);

    if (path) {
        attrs["data-path"] = path_to_string(path);
    }
    if (tree_index !== undefined) {
        attrs["data-tree_index"] = "" + tree_index;
    }

    let elem = $("<div/>", attrs);
    let text_elem = $("<span/>", {
        class: "wnode",
        text: obj.text
    });

    let terminal_elem = $("<span/>", {
        class: "double-click tree-flat-terminal",
    });

    let term_cat = $("<span/>", {
        class: "terminal-cat",
        text: obj.cat,
    });
    terminal_elem.append(term_cat);

    let legal_vars = ENUM.CAT_TO_VAR[obj.cat];
    let ordered_vars = [];
    if (legal_vars) {
        legal_vars.forEach((item, idx) => {
            let subvariant = obj.variants[item];
            let attrs = {
                class: "terminal-subvariant",
                text: subvariant,
            };
            attrs["data-variant"] = item;
            if (!subvariant) {
                attrs.class = "terminal-subvariant terminal-default-subvariant";
                attrs.text = ENUM.VAR[item][0];
            }
            terminal_elem.append($("<span/>", attrs));
        });
    }

    $(elem).append(terminal_elem);
    $(elem).append(text_elem);

    // lemma
    if (obj.lemma) {
        let classes = ["wnode", "double-click", "lemma-node"];
        let lemma_elem = $("<span/>", {
            class: classes.join(" "),
            text: obj.lemma
        });
        $(elem).append(lemma_elem);
    }

    // expansion
    if (obj.seg || obj.abbrev) {
        let exp_class = obj.seg ? "exp-seg-node" : "exp-abbrev-node";
        let classes = ["wnode", "double-click", exp_class];
        let exp_elem = $("<span/>", {
            class: classes.join(" "),
            text: obj.seg || obj.abbrev
        });
        $(elem).append(exp_elem);
    }

    return $(elem).first().get(0);
}

/*
 * Convert augmented tree to dom form of tree
 */
function aug_tree_to_dom_elem(aug_tree, tree_index, dom_id) {
    function nonterminal_to_elem(tree, path) {
        if (tree.terminal) {
            return terminal_obj_to_dom_elem(tree, path, tree_index);
        }
        let cat = tree.nonterminal.split("-")[0].toLowerCase();
        let nonterminal_cat = `nonterminal-${cat}`;
        let class_list = ["snode", "tree-node", "nonterminal", nonterminal_cat];
        if (path.length === 0) {
            class_list.push("tree-root");
        }
        let attrs = {
            class: class_list.join(" "),
            text: tree.nonterminal,
        };
        attrs["data-path"] = path_to_string(path);
        attrs["data-tree_index"] = "" + tree_index;
        let elem = $("<div/>", attrs);

        tree.children.forEach((child, idx) => {
            let new_path = [... path].concat(idx);
            $(elem).append(nonterminal_to_elem(child, new_path));
        });

        return $(elem).first().get(0);
    }

    let elem = nonterminal_to_elem(aug_tree.tree, []);
    elem.id = dom_id;

    let id_elem = $("<span/>", {
        class: (["wnode", "tree-id-node"]).join(" "),
        text: aug_tree.meta.tree_id,
    });

    function truncate_append_dieresis(string, len) {
        if (string.length <= len) {
            return string;
        }
        let new_string = string.slice(0, len - 3) + "...";
        return new_string;
    }

    let url_elem = $("<a/>", {
        class: (["wnode", "sentence-source"]).join(" "),
        text: truncate_append_dieresis(aug_tree.meta.url, 40),
        href: aug_tree.meta.url,
        target: "_blank",
    });

    let comment_container = $("<div/>", {
        class: (["snode", "comment-container"]).join(" "),
    });

    let comment_elem = $("<p/>", {
        class: (["comment-text"]).join(" "),
    });
    let is_empty = aug_tree.meta.comment.length === 0;
    if (!is_empty) {
        let parts = [... aug_tree.meta.comment];
        let first = parts.shift();
        comment_elem.text(first);
        $(parts).each((idx, item) => {
            comment_elem.append($("<div/>", {text: item}));
        });
    }
    comment_elem.attr("data-placeholder", "Write a comment...");

    $(id_elem).insertBefore($(elem).children().first());
    url_elem.insertAfter(id_elem);

    let is_comment_visible = tree_manager.comment_visible[tree_index];
    let attrs = {
        class: (["wnode", "local-button-comment"]).join(" "),
        text: "Hide comment",
    };
    attrs["data-command"] = "hide";

    if (!is_empty && is_comment_visible) {
        attrs.text = "Hide comment";
        attrs["data-command"] = "hide";
        comment_container.show();
    } else if (!is_empty) {
        attrs.text = "Show comment";
        attrs["data-command"] = "show";
        comment_container.hide();
    } else {
        attrs.text = "Show comment";
        attrs["data-command"] = "show";
        comment_container.hide();
    }

    let comment_button = $("<button/>", attrs);

    function comment_button_handler(ev) {
        if (comment_button.data("command") === "show") {
            tree_manager.comment_visible[tree_index] = true;
            comment_container.show();
            comment_button.text("Hide comment");
            comment_button.data("command", "hide");
        } else if (comment_button.data("command") === "hide") {
            comment_container.hide();
            tree_manager.comment_visible[tree_index] = false;
            comment_button.text("Show comment");
            comment_button.data("command", "show");
        }
        ev.stopPropagation();
    }

    function activate_comment(ev) {
        editor.is_active = true;
        tree_manager.clear_selection();
        comment_elem.attr("contentEditable", true);
        editor.deactivate = deactivate_comment;
        comment_elem.on("focusout", deactivate_comment);

        ev.stopPropagation();
    }

    function deactivate_comment(ev) {
        ev.stopPropagation();
        editor.is_active = false;
        comment_elem.attr("contentEditable", false);
        comment_elem.off("focusout");
        let text = extract_comment_text(comment_elem);

        if (text.length === 0) {
            comment_button.val("add-comment");
            comment_button.text("Add comment");
        } else if (_.isEqual(text, aug_tree.meta.comment)) {
            return;
        }
        let cloned = clone_obj(aug_tree);

        comment_button.val("show-comment");
        cloned.meta.comment = text;

        tree_manager.update_tree_by_tree(cloned);
    }

    comment_container.on("mousedown", activate_comment);
    comment_button.mousedown(comment_button_handler);

    comment_container.append(comment_elem);
    comment_container.insertAfter(url_elem);
    comment_button.insertAfter(url_elem);

    return elem;
}

/*
  Extract text from content-editable <p> tag. Browser seamlessly adds <div> tags for line breaks.
 */
function extract_comment_text(elem) {
    if (!elem.text().trim()) {
        return [];
    }
    let top_text = elem.clone().children().remove().end().text();
    let parts = [top_text];
    let rest = elem.children().each((idx, item) => {
        parts.push($(item).text());
    });
    return parts;
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

function traverse_elem_path(elem, path) {
    let cursor = elem;
    for (let child_index of path) {
        let relevant_nodes = [... cursor.children].filter(
            (child) => {
                let res = arr_contains(child.classList, "tree-node")
                return res;
            }
        );
        if (child_index > relevant_nodes.length - 1) {
            console.error("Illegal path");
            return undefined;
        }
        cursor = relevant_nodes[child_index];
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
 * Generate list of paths of to all descendants (including self), in
 * depth-first left-to-right order.
 */
function in_order_paths(node) {
    function in_order(node, path) {
        let path_str = path_to_string(path);
        let paths = [path_str];
        if (node.nonterminal) {
            node.children.forEach((child, idx) => {
                let new_path = [... path].concat(idx);
                let desc_paths = in_order(child, new_path);
                paths = paths.concat(desc_paths);
            });
        }
        if (!node.terminal && !node.nonterminal) {
            console.error("Invalid node type");
        }
        return paths;
    }
    return in_order(node, []);
}

/*
 * Find next node in depth-first left-to-right order.
 */
function node_path_next(node, path) {
    let paths = in_order_paths(node);
    let path_str = path_to_string(path);
    let in_order_idx = paths.indexOf(path_str);
    if (in_order_idx + 1 < paths.length) {
        let next_path = paths[in_order_idx + 1];
        return string_to_path(next_path);
    }
    return "next";
}

/*
 * Find previous node in depth-first left-to-right order.
 */
function node_path_prev(node, path) {
    let paths = in_order_paths(node);
    let path_str = path_to_string(path);
    let in_order_idx = paths.indexOf(path_str);
    if (0 < in_order_idx) {
        let next_path = paths[in_order_idx - 1];
        return string_to_path(next_path);
    }
    return "prev";
}

/*
 * Find last node in depth-first left-to-right order.
 */
function node_path_last(node) {
    if (node.terminal) {
        return [];
    }
    let paths = in_order_paths(node);
    let next_path = paths[paths.length - 1];
    return string_to_path(next_path);
}

/*
 * Extract a terminal object from a DOM element
 */
function dom_terminal_elem_to_obj(dom_node) {
    let variants = {};
    let variant_names = Object.keys(ENUM.VAR);
    for (let name of variant_names) {
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

function delete_subvariant_by_name(var_name, sel) {
    let node = sel.node;
    if (!node || !node.terminal) {
        return false;
    }

    node.variants[var_name] = "";
    node.terminal = terminal_to_flat_terminal(node);

    return sel;
}

function delete_subvariant_by_index(var_idx, sel) {
    let node = sel.node;
    if (!node || !node.terminal) {
        return false;
    }
    if (var_idx < 0 || ENUM.CATEGORY_TO_VARIANT_NAMES[node.cat].length <= var_idx) {
        console.error(`Illegal index '${var_idx}' on ${ENUM.CATEGORY_TO_VARIANT_NAMES[node.cat]}`);
        return false;
    }
    let var_name = ENUM.CATEGORY_TO_VARIANT_NAMES[node.cat][var_idx];

    let old = node.variants[var_name];
    let new_item = "";
    node.variants[var_name] = "";
    node.terminal = terminal_to_flat_terminal(node);

    return old !== new_item ? sel : false;
}

function cycle_subvariant_by_variant_name(var_names, forward, sel) {
    let node = sel.node;

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

    return old !== new_item ? sel : false;
}

/*
 * Insert phrasal node as parent of selected node/nodes
 */
function insert_nonterminal(sel) {
    if (!sel.start) {
        console.error("Invalid selection");
        return false;
    }
    let tree = sel.aug_tree.tree;
    // TODO: special case when root is selected
    let node = sel.node;
    let path_to_parent = sel.start.slice(0, sel.start.length - 1);
    let parent = traverse_node_path(tree, path_to_parent);

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

    let child_idx = sel.start[sel.start.length - 1];
    let end_child_idx = sel.end ? sel.end[sel.end.length - 1] : child_idx;
    let sel_length = end_child_idx - child_idx + 1;
    let children = parent.children.splice(child_idx, sel_length, new_node);
    new_node.children = children;
    sel.end = null;

    return sel;
}


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
    let node = sel.node;
    if (!node.nonterminal || sel.start.length === 0) {
        // cannot delete terminals or tree root
        return false;
    }

    let parent = traverse_node_path(sel.aug_tree.tree, sel.start.slice(0, sel.start.length-1));
    let child_idx = sel.start[sel.start.length - 1];
    let left_siblings = parent.children.filter((val, idx) => idx < child_idx);
    let right_siblings = parent.children.filter((val, idx) => idx > child_idx);
    let children = left_siblings.concat(node.children).concat(right_siblings);
    parent.children = children;
    return sel;
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

let aug_tree_example = {
    tree: root_example,
    meta: {
        tree_id: "tree_example.psd,.1",
        corpus_id: "afb23-31213-1123-1123.7",
        url: "http://mbl.is/foo/",
        comment: "tree_example.psd,.1",
    },
};

function TreeManager() {
    this.aug_trees = annotrees;
    this.id_to_index = {};
    this.container = $("#sn0");
    this.undo_stack = [];
    this.redo_stack = [];
    this.selection = {
        index: null,
        start: null,
        end: null,
    };
    this.prev_selection = null;
    this.comment_visible = [];

    this.init = () => {
        this.aug_trees.forEach((aug_tree, idx) => {
            let tree_id = this.aug_trees[idx].meta.tree_id;
            this.id_to_index[tree_id] = idx;
            this.comment_visible[idx] = true;
        });
        this.render_all();
    };

    this.render_all = () => {
        $(this.container).empty();
        this.aug_trees.forEach((aug_tree, idx) => {
            let dom_id = this.index_to_dom_id(idx);
            let elem = aug_tree_to_dom_elem(aug_tree, idx, dom_id);
            this.container.append($(elem));
        });
        this.selection.index = null;
        this.selection.start = null;
        this.selection.end = null;
    };

    this.render_index = (idx) => {
        let aug_tree = this.get_tree_by_index(idx);
        let elem = this.container.children().get(idx);
        if (!elem) {
            console.err("Index out of bounds");
            return;
        }
        let tree = aug_tree.tree;
        tree.tree_id = aug_tree.meta.tree_id;
        let dom_id = this.index_to_dom_id(idx);
        let new_elem = aug_tree_to_dom_elem(aug_tree, idx, dom_id);
        $(elem).replaceWith($(new_elem));
    };

    this.render_selection = () => {
        $(".snodesel").removeClass("snodesel");
        this.get_selected_elements().forEach((el, idx) => {
            $(el).addClass("snodesel");
        });
    };

    this.get_selected_elements = () => {
        let arr = [];
        if (!this.selection.start) {
            return arr;
        }
        let dom_id = this.index_to_dom_id(this.selection.index);
        let runner = this.get_element(dom_id, this.selection.start);
        arr.push(runner);
        if (this.selection.end) {
            let end = this.get_element(dom_id, this.selection.end);
            while (runner != end) {
                runner = runner.nextElementSibling;
                arr.push(runner);
            }
        }
        return arr;
    };

    this.render_caption = () => {
        let text = this.get_selected_text();
        if (text) {
            $("#urtext").text(text).show();
        } else {
            $("#urtext").hide();
        }
    };

    this.update_tree = (selection, mod_sel) => {
        let aug_tree = mod_sel.aug_tree;
        if (this.get_tree_by_index(this.selection.index) === aug_tree) {
            // no change
            return;
        }
        this.record(this.selection);
        this.aug_trees[selection.index] = aug_tree;
        this.render_index(selection.index);

        this.selection.index = mod_sel.index;
        this.selection.start = mod_sel.start;
        this.selection.end = mod_sel.end;
        this.render_selection();

        this.render_caption();
    };

    this.update_tree_by_tree = (aug_tree) => {
        this.clear_selection();
        let idx = this.id_to_index[aug_tree.meta.tree_id];

        this.selection.index = idx;
        this.record(this.selection);
        this.selection.index = null;

        this.aug_trees[idx] = aug_tree;
        this.render_index(idx);

        this.render_selection();
        this.render_caption();
    };

    this.select = (dom_id, path) => {
        let tree_idx = this.dom_id_to_index(dom_id);
        if (tree_idx !== this.selection.index) {
            // different tree selected
            this.selection.start = path;
            this.selection.index = tree_idx;
        }
        else if (!this.selection.start) {
            // currently no selection
            this.selection.start = path;
            this.selection.index = tree_idx;
        }
        else if (!this.selection.end) {
            // currently single selection
            if (!are_siblings(this.selection.start, path) || _.isEqual(path, this.selection.start)) {
                // selected somewhere else in tree or the already selected node
                this.selection.index = null;
                this.selection.path = null;
                this.selection.start = null;
            } else {
                // selected node is a sibling, different from already selected
                // fix order of start and end
                let curr_idx = this.selection.start[path.length - 1];
                let new_idx = path[path.length - 1];
                let start = curr_idx < new_idx ? this.selection.start : path;
                let end = curr_idx < new_idx ? path : this.selection.start;
                this.selection.start = start;
                this.selection.end = end;
            }
        } else {
            // currently multi selection
            if (_.isEqual(path, this.selection.start)) {
                this.selection.start = this.selection.end;
                this.selection.end = null;
            } else if (_.isEqual(path, this.selection.end)) {
                this.selection.end = null;
            } else {
                this.selection.index = null;
                this.selection.start = null;
                this.selection.end = null;
            }
        }

        this.render_selection();
        this.render_caption();
    };

    this.undo = () => {
        if (this.undo_stack.length === 0) {
            return;
        }
        let saved = this.undo_stack.pop();
        let tree_id = saved.aug_tree.meta.tree_id;
        let idx = this.id_to_index[tree_id];
        let curr_state = {
            aug_tree: this.get_tree_by_index(idx),
            selection: clone_obj(this.selection),
        };
        this.redo_stack.push(curr_state);
        this.selection = saved.selection;
        this.aug_trees[idx] = saved.aug_tree;
        this.render_index(idx);
        this.render_selection();
        this.render_caption();
        // maybe scroll to selection?
    };

    this.redo = () => {
        if (this.redo_stack.length === 0) {
            return;
        }
        let saved = this.redo_stack.pop();
        let tree_id = saved.aug_tree.meta.tree_id;
        let idx = this.id_to_index[tree_id];
        let curr_state = {
            aug_tree: this.get_tree_by_index(idx),
            selection: clone_obj(this.selection),
        };
        this.undo_stack.push(curr_state);
        this.selection = saved.selection;
        this.aug_trees[idx] = saved.aug_tree;
        this.render_index(idx);
        this.render_selection();
        this.render_caption();
    };

    this.record = (selection) => {
        this.redo_stack = [];
        let curr_state = {
            aug_tree: this.get_tree_by_index(selection.index),
            selection: this.get_selection(),
        };
        this.undo_stack.push(curr_state);
    };

    this.clear_history = () => {
        this.undo_stack = [];
        this.redo_stack = [];
    };

    this.get_element = (dom_id, path) => {
        let root_elem = document.getElementById(dom_id);
        let elem = traverse_elem_path(root_elem, path);
        return elem;
    };

    this.get_selected_text = () => {
        if (!this.selection.start) {
            return false;
        }
        let tree = this.aug_trees[this.selection.index].tree;
        let text = tree_to_text(tree);
        return text;
    };

    this.get_tree_text = (dom_id) => {
        let idx = this.dom_id_to_index(dom_id);
        let tree = this.aug_trees[idx].tree;
        let text = tree_to_text(tree);
        return text;
    };

    this.dom_id_to_index = (dom_id) => {
        return parseInt(dom_id.slice(2)) - 1;
    };

    this.get_tree_by_tree_id = (tree_id) => {
        let idx = this.id_to_index[tree_id];
        return this.get_tree_by_index(idx);
    };

    this.index_to_dom_id = (idx) => {
        return `id${idx + 1}`;
    };

    this.get_tree_by_index = (idx) => {
        let aug_tree = this.aug_trees[idx];
        return clone_obj(aug_tree);
    };

    this.get_tree_by_dom_id = (dom_id) => {
        let idx = this.dom_id_to_index(dom_id);
        return this.get_tree_by_index(idx);
    };

    this.clear_selection = () => {
        this.selection.index = null;
        this.selection.start = null;
        this.selection.end = null;
        this.render_selection();
        this.render_caption();
    };

    this.get_selection = () => {
        let selection = clone_obj(this.selection);
        if (selection.index !== null) {
            selection.aug_tree = this.get_tree_by_index(this.selection.index);
            selection.node = selection.start ? traverse_node_path(selection.aug_tree.tree, selection.start) : null;
        } else {
            selection.aug_tree = null;
        }
        return selection;
    };

    this.get_tree_by_dom_id = (dom_id) => {
        let idx = this.dom_id_to_index(dom_id);
        return this.get_tree_by_index(idx);
    };

    /*
     * Bind command (fn) such that it will have this.selection as first argument in the state
     * corresponding to when the function is called
     */
    this.wrap_command = (fn) => {
        let mgr = this;
        function wrapped_fn() {
            if (!mgr.has_selection()) {
                return;
            }
            let sel = mgr.get_selection();

            let new_args = [sel].concat([...arguments]);
            let result = fn.apply(null, new_args);

            if (!result) {
                return;
            }

            mgr.update_tree(sel, result);
        }

        return wrapped_fn;
    };

    /*
     * Multiplex command by selection type, otherwise works like wrap_command
     */
    this.wrap_multiplex = (fn_map) => {
        let mgr = this;
        function wrapped_fn() {
            if (!mgr.has_selection()) {
                return false;
            }
            let sel = mgr.get_selection();

            if (sel.start && sel.end) {
                console.error("Invalid selection");
                return false;
            } else if (!sel.start) {
                console.error("Invalid selection");
                return false;
            }
            let fn = undefined;
            if (sel.node.terminal && fn_map.terminal) {
                fn = fn_map.terminal;
            } else if (sel.node.nonterminal && fn_map.nonterminal) {
                fn = fn_map.nonterminal;
            } else {
                console.error("Invalid selection");
                return false;
            }

            let new_args = [sel].concat([...arguments]);
            let result = fn.apply(null, new_args);

            if (!result) {
                return false;
            }

            mgr.update_tree(sel, result);
            return true;
        }

        return wrapped_fn;
    };

    this.has_selection = () => {
        return this.selection.index !== null;
    };

    /*
     * Advance selection such that it now points to the next node in depth-first left-to-right order.
     * Multiple selection is first converted to singular, null selection does nothing.
     */
    this.select_next = () => {
        if (!this.has_selection()) {
            return;
        }
        let sel = this.get_selection();
        let tree = sel.aug_tree.tree;
        let next = node_path_next(tree, sel.start);

        if (next !== "next") {
            this.selection.start = next;
            this.render_selection();
            this.render_caption();
            this.go_to_selection();
            return;
        }

        let tree_idx = sel.index + 1;
        if (this.aug_trees.length < tree_idx) {
            // no wrap
            this.selection.index = null;
            this.selection.start = null;
            this.selection.end = null;
        } else {
            this.selection.index = tree_idx;
            this.selection.start = [];
            this.selection.end = null;
        }

        this.render_selection();
        this.render_caption();
        this.go_to_selection();
    };

    /*
     * Advance selection such that it now points to the previous node, cf. select_next
     */
    this.select_prev = (forward) => {
        if (!this.has_selection()) {
            return;
        }
        let sel = this.get_selection();
        let prev = node_path_prev(sel.aug_tree.tree, sel.start);

        if (prev !== "prev") {
            this.selection.start = prev;
            this.render_selection();
            this.render_caption();
            this.go_to_selection();
            return;
        }

        let tree_idx = sel.index - 1;
        if (0 <= tree_idx) {
            let prev_tree = this.get_tree_by_index(tree_idx).tree;
            this.selection.index = tree_idx;
            this.selection.start = node_path_last(prev_tree);
            this.selection.end = null;
        } else {
            // no wrap
            this.selection.index = null;
            this.selection.start = null;
            this.selection.end = null;
        }

        this.render_selection();
        this.render_caption();
        this.go_to_selection();
    };

    this.go_to_selection = () => {
        if (this.has_selection()) {
            scrollToShowSel($(".snodesel").first());
        }
    };

    this.get_all_trees = () => {
        let clones = [];
        this.aug_trees.forEach((item, idx) => {
            let cloned = clone_obj(item);
            clones.push(cloned);
        });
        return clones;
    };
}

function common_prefix(path, other) {
    let max_len = Math.min(path.length, other.length);
    let common = [];
    while (common.length < max_len && path[common.length] === other[common.length]) {
        common.push(path[common.length]);
    }
    return common;
}

function are_siblings(path, other) {
    if (path.length !== other.length) {
        return false;
    }
    if (path.length === 0) {
        return true;
    }
    common = common_prefix(path, other);
    return (common.length + 1) === path.length;
}

function is_descendant(path, other) {
    let common = common_prefix(path, other);
    return common.length === other.length;
}

function selection_contains(sel, path) {
    if (!sel.start) {
        // no selection
        return false;
    }
    if (!sel.end) {
        // singular
        let common = common_prefix(sel.start, path);
        return common.length === path.length;
    }

    let parent = common_prefix(sel.start, sel.end);
    if (path.length <= parent.length) {
        return false;
    }
    let child_idx = path[parent.length];
    let start_idx = sel.start[sel.start.length - 1];
    let end_idx = sel.end[sel.end.length - 1];
    if (start_idx <= child_idx && child_idx <= end_idx) {
        return true;
    }
    return false;
}

/**
 * Clone object, omitting circular references via parent connections
 */
function clone_obj(root) {
    let should_skip = ["parent", "children"];

    function parentless_view(node) {
        let obj = {};
        for (let prop in node) {
            if (!node.hasOwnProperty(prop) || should_skip.includes(prop)) {
                continue;
            }
            obj[prop] = node[prop];
        }
        if (node.children) {
            obj.children = [];
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

function ContextMenu(tree_manager) {

    this.visible = false;

    const outside_click_listener = (ev) => {
        if (!$(ev.target).closest("#sn0").length && this.visible) {
            this.hide();
        }
    };

    this.show = (ev, sel) => {
        let element = (ev.target || ev.srcElement);
        if ([... element.classList].includes("terminal-subvariant")) {
            let variant_name = element.dataset.variant;
            this.populate_variants(sel, variant_name);
        } else if (sel.node.nonterminal) {
            this.populate_nonterminal(sel);
        } else {
            this.populate_terminal(sel);
        }

        var left = ev.pageX;
        var top = ev.pageY;
        left = left + "px";
        top = top + "px";

        var conl = $("#conLeft"),
            conr = $("#conRight"),
            conrr = $("#conRightest"),
            conm = $("#conMenu");

        $("#conMenu .conMenuColumn").each((idx, item) => { $(item).height("auto")});
        let max_height = _.max($("#conMenu .conMenuColumn"), () => $(window).height());
        $("#conMenu .conMenuColumn").each((idx, item) => $(item).height(max_height));

        conm.css("left",left);
        conm.css("top",top);
        conm.css("visibility","visible");
        this.visible = true;

        $(document).on("mousedown", outside_click_listener);
    };

    this.populate_nonterminal = (sel) => {
        let org_sel = clone_obj(sel);
        let node = sel.node;
        let cat = node.nonterminal.split("-")[0];
        let names = [... ENUM.NONTERMS];
        let extensions = ENUM.NONTERM_SUFFIX[cat] || [];
        let conmenu = $("#conMenu").empty();
        let context_mgr = this;

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

        function handle_nonterminal_mouse_down(ev) {
            ev = ev || window.event;
            let sug = ev.srcElement.dataset.suggestion || ev.srcElement.parentElement.dataset.suggestion;
            sel.node.nonterminal = sug;

            tree_manager.update_tree(org_sel, sel);
            context_mgr.hide();
            tree_manager.clear_selection();
        }

        let cat_col = $("<div/>", {class: "conMenuColumn"});
        let ext_col = $("<div/>", {class: "conMenuColumn"});
        ext_col.append($("<div/>", {class: "conMenuHeading", text: "Extensions"}));
        cat_col.append($("<div/>", {class: "conMenuHeading", text: "Categories"}));

        for (let suggestion of names) {
            cat_col.append(make_item(suggestion));
        }
        for (let suggestion of extensions) {
            ext_col.append(make_item(suggestion));
        }
        cat_col.mousedown(handle_nonterminal_mouse_down);
        ext_col.mousedown(handle_nonterminal_mouse_down);

        conmenu.append(cat_col);
        conmenu.append(ext_col);
    };

    this.populate_terminal = (sel) => {
        let org_sel = clone_obj(sel);
        let node = sel.node;
        let name = node.cat;
        let names = [... ENUM.TERM];
        let conmenu = $("#conMenu").empty();
        let context_mgr = this;

        function handle_terminal_mouse_down(ev) {
            ev = ev || window.event;
            let elem = ev.srcElement.dataset.action_key ? ev.srcElement : ev.srcElement.parentElement;

            let action_key = elem.dataset.action_key;
            let action_type = elem.dataset.action_type;
            let action_value = elem.dataset.action_value;
            let node = sel.node;

            if (action_type === "suggestion") {
                node[action_key] = action_value;
            } else if (action_type === "add") {
                node[action_key] = node.text;
            } else if (action_type === "remove") {
                node[action_key] = "";
            }
            node.terminal = terminal_to_flat_terminal(node);

            tree_manager.update_tree(org_sel, sel);
            context_mgr.hide();
            tree_manager.clear_selection();
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
    };

    this.populate_variants = (sel, variant_name) => {
        let org_sel = clone_obj(sel);
        let node = sel.node;
        let name = node.cat;
        let conmenu = $("#conMenu").empty();
        let context_mgr = this;

        function handle_variant_mouse_down(ev) {
            ev = ev || window.event;
            let elem = ev.srcElement.dataset.action_key ? ev.srcElement : ev.srcElement.parentElement;

            let action_key = elem.dataset.action_key;
            let action_type = elem.dataset.action_type;
            let action_value = elem.dataset.action_value;
            let node = sel.node;

            if (action_type === "suggestion") {
                node.variants[action_key] = action_value;
            } else if (action_type === "remove") {
                node.variants[action_key] = "";
            }
            node.terminal = terminal_to_flat_terminal(node);

            tree_manager.update_tree(org_sel, sel);
            context_mgr.hide();
            tree_manager.clear_selection();
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

        let subvars = ENUM.VAR[variant_name];
        let repr = ENUM.VAR_REPR[variant_name];
        for (let suggestion of subvars) {
            add_item({action: "suggestion", key: variant_name, value: suggestion}, repr);
        }
        if (sel.node.variants[variant_name]) {
            add_item({action: "remove", key: variant_name, value: "Remove"}, "Remove");
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

        conmenu.mousedown(handle_variant_mouse_down);
    };

    this.hide = () => {
        let conmenu = $("#conMenu").empty();
        $(conmenu).css("visibility","hidden");
        $(conmenu).off("mousedown");
        this.visible = false;
        document.removeEventListener("click", outside_click_listener);
    };
}

function path_to_string(path) {
    return path.join("-");
}

function string_to_path(path_str) {
    if (path_str === "") {
        return [];
    }
    return path_str.split("-").map(x => parseInt(x));
}

/**
 * Remove backpointer to parent nodes in tree
 */
function doubly_linked_tree_to_singly_linked(tree) {
    delete tree["parent"];
    tree.children && tree.children.map(doubly_linked_tree_to_singly_linked);
    return tree;
}

/**
 * Remove empty or undefined attributes in all nodes in tree
 */
function remove_undefined_or_empty_attr(tree) {
    let properties = [];
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

// Keybindings
function customCommands(mgr) {
    addCommand({ keycode: KEYS.Q}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "obj1", FORWARD),
        nonterminal: cycle_nonterm_suffix.bind(null, FORWARD),
    }));
    addCommand({ keycode: KEYS.Q, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "obj1", BACKWARD),
        nonterminal: cycle_nonterm_suffix.bind(null, BACKWARD),
    }));
    addCommand({ keycode: KEYS.W}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "obj2", FORWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.W, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "obj2", BACKWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.E}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, ["person", "degree"], FORWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.E, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, ["person", "degree"], BACKWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.R}, mgr.wrap_multiplex({
        // TODO: sagnbot/lh_þt/lh_nt
        terminal: cycle_subvariant_by_variant_name.bind(null, "mood", FORWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.R, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "mood", BACKWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.T}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "voice", FORWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.T, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "voice", BACKWARD),
        nonterminal: not_implemented_fn,
    }));

    // TODO: bin_cycle
    addCommand({ keycode: KEYS.A}, mgr.wrap_multiplex({
        terminal: not_implemented_fn,
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.S}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "number", FORWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.S, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "number", BACKWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.D}, mgr.wrap_multiplex({
        // TODO: subj_case
        terminal: cycle_subvariant_by_variant_name.bind(null, "case", FORWARD),
        nonterminal: cycle_nonterm_short_02.bind(null, FORWARD),
    }));
    addCommand({ keycode: KEYS.D, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "case", BACKWARD),
        nonterminal: cycle_nonterm_short_02.bind(null, BACKWARD),
    }));
    addCommand({ keycode: KEYS.F}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, ["tense", "gender"], FORWARD),
        nonterminal: cycle_nonterm_short_01.bind(null, FORWARD),
    }));
    addCommand({ keycode: KEYS.F, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, ["tense", "gender"], BACKWARD),
        nonterminal: cycle_nonterm_short_01.bind(null, BACKWARD),
    }));

    addCommand({ keycode: KEYS.C}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "article", FORWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.C, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "article", BACKWARD),
        nonterminal: not_implemented_fn,
    }));
    addCommand({ keycode: KEYS.V}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "strength", FORWARD),
        nonterminal: prune_nonterminal,
    }));
    addCommand({ keycode: KEYS.V, shift: true}, mgr.wrap_multiplex({
        terminal: cycle_subvariant_by_variant_name.bind(null, "strength", BACKWARD),
        nonterminal: prune_nonterminal,
    }));

    addCommand({ keycode: KEYS.X}, mgr.wrap_command(insert_nonterminal));

    addCommand({ keycode: KEYS.Z , ctrl: true}, mgr.undo);
    addCommand({ keycode: KEYS.Z, shift: true}, mgr.redo);
    addCommand({ keycode: KEYS.SPACE }, () => {
        context_menu.hide();
        mgr.clear_selection();
    });

    addCommand({ keycode: KEYS.ARROW_UP }, mgr.select_prev);
    addCommand({ keycode: KEYS.ARROW_DOWN }, mgr.select_next);
}
