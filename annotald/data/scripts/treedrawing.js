// Copyright (c) 2011, 2012 Anton Karl Ingason, Aaron Ecay, Jana Beck

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

// Global TODOs:
// - (AWE) make the dash-tags modular, so that ctrl x -> set XXX, w ->
//   set NP-SBJ doesn't blow away the XXX
// - (AWE) what happens when you delete e.g. an NP node w metadata?
//   Does the metadata get blown away? pro/demoted? Does deletion fail, or
//   raise a prompt?
// - strict mode
// - modularize doc -- namespaces?
// - make key commands for case available

// TODO: for unsaved ch warning: use tolabeledbrax, not html...html is
// sensitive to search highlight, selection, etc

// Table of contents:
// * Initialization
// * User configuration
// ** CSS styles
// ** Key bindings
// * UI functions
// ** Event handlers
// ** Context Menu
// ** Messages
// ** Dialog boxes
// ** Selection
// ** Metadata editor
// ** Splitting words
// ** Editing parts of the tree
// ** Search
// *** HTML strings and other globals
// *** Event handlers
// *** Helper functions
// *** Search interpretation function
// *** The core search function
// * Tree manipulations
// ** Movement
// ** Creation
// ** Deletion
// ** Label manipulation
// ** Coindexation
// * Server-side operations
// ** Saving
// *** Save helper function
// ** Validating
// ** Advancing through the file
// ** Idle/resume
// ** Quitting
// * Undo/redo
// * Misc
// * Misc (candidates to move to utils)
// End TOC

// ===== Initialization

/**
 * This variable holds the selected node, or "start" node if multiple
 * selection is in effect.  Otherwise undefined.
 *
 * @type Node
 */
var startnode = null;
var last_startnode = null;
/**
 * This variable holds the "end" node if multiple selection is in effect.
 * Otherwise undefined.
 *
 * @type Node
 */

const MOUSE = {
    LEFT_BUTTON: 0,
    MIDDLE_BUTTON: 1,
    RIGHT_BUTTON: 2,
}

var tree_manager = null;
var context_menu = null;
let editor = {
    is_active: false,
};
var ctrlKeyMap = {};
var shiftKeyMap = {};
var regularKeyMap = {};

var startuphooks = [];

var last_event_was_mouse = false;
var lastsavedstate = "";

var globalStyle = $('<style type="text/css"></style>');

var lemmataStyleNode, lemmataHidden = true;
(function () {
    lemmataStyleNode = document.createElement("style");
    lemmataStyleNode.setAttribute("type", "text/css");
    document.getElementsByTagName("head")[0].appendChild(lemmataStyleNode);
    lemmataStyleNode.innerHTML = ".lemma { display: none; }";
})();

var currentIndex = 1; // TODO: move to where it goes

if (typeof String.prototype.startsWith !== 'function') {
    String.prototype.startsWith = function(str) {
        return (this.substr(0, str.length) === str);
    };
}

if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(str) {
        return (this.substr(this.length - str.length) === str);
    };
}

function navigationWarning() {
    if ($("#editpane").html() != lastsavedstate) {
        return "Unsaved changes exist, are you sure you want to leave the page?";
    }
    return undefined;
}

function logUnload() {
    logEvent("page-unload");
}

addStartupHook(function() {
    logEvent("page-load");
});

function assignEvents(mgr) {
    // load custom commands from user settings file
    customCommands(mgr);
    document.body.onkeydown = handleKeyDown;
    $("#sn0").mousedown(single_click_handler);
    $("#sn0").dblclick(handle_double_click);
    $("#butsave").mousedown(save);
    $("#butundo").mousedown(mgr.undo);
    $("#butredo").mousedown(mgr.redo);
    $("#butidle").mousedown(idle);
    $("#butexit").unbind("click").click(quitServer);
    $("#menu-button-comment").unbind("click").click(menu_button_comment_handler);
    // $("#butvalidate").unbind("click").click(validateTrees);
    // $("#butnexterr").unbind("click").click(nextValidationError);
    // $("#butnexttree").unbind("click").click(nextTree);
    // $("#butprevtree").unbind("click").click(prevTree);
    // $("#butgototree").unbind("click").click(goToTree);
    $("#editpane").mousedown(mgr.clear_selection);
    // $(document).mousewheel(handleMouseWheel);
    window.onbeforeunload = navigationWarning;
    window.onunload = logUnload;
}

function addStartupHook(fn) {
    startuphooks.push(fn);
}

function documentReadyHandler() {
    // TODO: something is very slow here; profile
    // TODO: move some of this into hooks
    tree_manager = new TreeManager();
    tree_manager.init();
    context_menu = new ContextMenu(tree_manager);
    assignEvents(tree_manager);
    setupCommentTypes();
    globalStyle.appendTo("head");

    _.each(startuphooks, function (hook) {
        hook();
    });

    lastsavedstate = $("#editpane").html();
}

$(document).ready(function () {
    documentReadyHandler();
});

function menu_button_comment_handler(ev) {
    if ($(this).data("command") === "show") {
        $(".comment-container").show();
        $(this).val("Hide comments");
        $(this).data("command", "hide");
        $(".local-button-comment").text("Hide comment").data("command", "hide");
    } else if ($(this).data("command") === "hide") {
        $(".comment-container").hide();
        $(this).val("Show comments");
        $(this).data("command", "show");
        $(".local-button-comment").text("Show comment").data("command", "show");
    }
}

// ===== User configuration

// ========== CSS styles


// ========== Key bindings

/**
 * Add a keybinding command.
 *
 * Calls to this function should be in the `settings.js` file, grouped in a
 * function called `customCommands`
 *
 * @param {Object} binding a mapping of properties of the keybinding.  Can
 * contain:
 *
 * - `keycode`: the numeric keycode for the binding (mandatory)
 * - `shift`: true if this is a binding with shift pressed (optional)
 * - `ctrl`: true if this is a binding with control pressed (optional)
 *
 * @param {Function} fn the function to associate with the keybinding.  Any
 * further arguments to the `addCommand` function are passed to `fn` on each
 * invocation.
 */
function addCommand(binding, fn) {
    var commandMap;
    if (binding.ctrl) {
        commandMap = ctrlKeyMap;
    } else if (binding.shift) {
        commandMap = shiftKeyMap;
    } else {
        commandMap = regularKeyMap;
    }
    commandMap[binding.keycode] = {
        func: fn,
        args: Array.prototype.slice.call(arguments, 2)
    };
}

// ===== UI functions

// ========== Event handlers

function killTextSelection() {
    if (dialogShowing) return;
    var sel = window.getSelection();
    sel.removeAllRanges();
}

var keyDownHooks = [];

function addKeyDownHook(fn) {
    keyDownHooks.push(fn);
}

function handleKeyDown(ev) {
    if (editor.is_active) {
        console.log("skipping handleKeyDown because of editor");
        return true;
    }
    if ((ev.ctrlKey && ev.shiftKey) || ev.metaKey || ev.altKey) {
        // unsupported modifier combinations
        return true;
    }
    if (ev.keyCode == KEYS.SHIFT || ev.keyCode == KEYS.CONTROL || ev.keyCode == KEYS.ALT) {
        // Don't handle shift, ctrl, and meta presses
        return true;
    }
    // Becasuse of bug #75, we don't want to count keys used for scrolling as
    // keypresses that interrupt a chain of mouse clicks.
    if (! _.contains([33, //page up
                      34, // page down
                      37,38,39,40 // arrow keys
                     ], ev.keyCode)) {
        last_event_was_mouse = false;
    }
    var commandMap;
    if (ev.ctrlKey) {
        commandMap = ctrlKeyMap;
    } else if (ev.shiftKey) {
        commandMap = shiftKeyMap;
    } else {
        commandMap = regularKeyMap;
    }
    if (!commandMap[ev.keyCode]) {
        return true;
    }
    ev.preventDefault();
    var theFn = commandMap[ev.keyCode].func;
    var theArgs = commandMap[ev.keyCode].args;
    _.each(keyDownHooks, function (fn) {
        fn({
            keyCode: ev.keyCode,
            shift: ev.shiftKey,
            ctrl: ev.ctrlKey
           },
          theFn,
          theArgs);
    });
    theFn()
    return false;
}

var clickHooks = [];

function addClickHook(fn) {
    clickHooks.push(fn);
}

let prev_startnode = null;

/* If last clicked element was a wnode node, this points to it, otherwise null */
let last_wnode = null;
let last_dclickable = null;
let last_sel = null;
/* Guard against double single clicks, jQuery or the browser does not natively suppress
   the second single click when the dblclick event fires */
let clicks = 0;
const CLICK_INTERVAL_MILLISECS = 300;

function move_node(sel, tgt_path) {
    function traverse_prune(node, path) {
        if (path.length == 0) {
            return {
                sel_node: node,
                should_prune: true,
            };
        }
        let new_path = path.slice(1);
        let child_idx = path[0];
        let result = traverse_prune(node.children[child_idx], new_path);

        let did_prune = false;
        if (result.should_prune) {
            node.children.splice(child_idx, 1);
            did_prune = true;
        }

        return {
            should_prune: node.children.length === 0,
            sel_node: result.sel_node,
            did_prune: did_prune,
        };
    }

    // insert new_node at path and return new path to inserted node
    function insert_node(node, path, new_node, insert_left) {
        if (path.length > 0) {
            let child_idx = path[0];
            let new_path = path.slice(1);
            let ret = insert_node(node.children[child_idx], new_path, new_node, insert_left);
            return [child_idx].concat(ret);
        }
        if (insert_left) {
            node.children.unshift(new_node);
        } else {
            node.children.push(new_node);
        }
        return [insert_left ? 0 : node.children.length - 1];
    }

    // true if there are no right siblings of any node while traversing path else false
    function hugs_right(node, path, ignore_first) {
        if (path.length === 0)
            return true;
        let child_idx = path[0];
        if (ignore_first) {
            return hugs_right(node.children[child_idx], path.slice(1), false);
        }
        if (child_idx === (node.children.length - 1)) {
            return hugs_right(node.children[child_idx], path.slice(1), false);
        }
        return false;
    }

    // true if there are no left siblings of any node while traversing path else false
    function hugs_left(node, path, ignore_first) {
        if (path.length === 0)
            return true;
        let child_idx = path[0];
        if (ignore_first) {
            return hugs_left(node.children[child_idx], path.slice(1), false);
        }
        if (child_idx === 0) {
            return hugs_left(node.children[child_idx], path.slice(1), false);
        }
        return false;
    }

    let curr_sel = sel;

    let tree = sel.aug_tree.tree;
    let tgt_node = traverse_node_path(tree, tgt_path);
    let before_text = tree_to_text(tree);
    let cloned = clone_obj(tree);

    let sel_path = sel.start;

    if (tgt_node.terminal) {
        // terminal element cannot be a parent
        tgt_path.pop();
    }

    let common_path = common_prefix(sel_path, tgt_path);
    let common_anc = traverse_node_path(tree, common_path);

    // paths relative to youngest common ancestor
    let prune_path = [... sel_path].slice(common_path.length);
    let insert_path = [... tgt_path].slice(common_path.length);

    if (prune_path.length === 0) {
        // something strange
        return false;
    }

    let num_selected = 1;
    if (sel.start && sel.end) {
        // inserting temporary parent
        insert_nonterminal(curr_sel);
        let start_idx = curr_sel.start[curr_sel.start.length - 1];
        let end_idx = curr_sel.end[curr_sel.end.length - 1];
        num_selected =  end_idx - start_idx + 1;
    }
    let prune_right = hugs_right(common_anc, prune_path, true);
    let prune_left = hugs_left(common_anc, prune_path, true);
    let insert_right = insert_path.length > 0 && hugs_right(common_anc, insert_path, true);
    let insert_left = insert_path.length > 0 && hugs_left(common_anc, insert_path, true);

    if (insert_path.length > 0 && !insert_right && !insert_left) {
        // something strange, path hugs neither, cannot insert in between unless moving to parent
        return false;
    } else if (insert_path.length === 0 && prune_path.length < 2) {
        // moving to immediate parent, but node is already there
        return false;
    } else if (insert_path.length > 0 && Math.abs(prune_path[0] - insert_path[0]) !== 1) {
        // moving between distant siblings
        return false;
    }

    let result = traverse_prune(common_anc, prune_path);

    // path to inserted node, after it has been inserted, relative to youngest common ancestor
    let post_insert_path = [... insert_path];
    if (insert_path.length === 0) {
        // moving to common ancestor
        if (result.did_prune) {
            // insert in the same place as top level of prune path
            // we do not delete in splice, since it was already pruned
            common_anc.children.splice(prune_path[0], 0, result.sel_node);
            post_insert_path = [prune_path[0]];
        } else {
            // insert on same side as prune hug
            let delta = prune_left ? 0 : 1;
            common_anc.children.splice(prune_path[0] + delta, 0, result.sel_node);
            post_insert_path = [prune_path[0] + delta];
        }
    } else {
        // top level of prune_path and insert_path must be immediate siblings
        // is_right_move must match prune hug
        let is_right_move = prune_path[0] < insert_path[0];
        if (!(is_right_move && prune_right) && !(!is_right_move && prune_left)) {
            return true;
        }
        let translated_insert_path = [... insert_path];
        if (result.did_prune && is_right_move) {
            translated_insert_path[0] = translated_insert_path[0] - num_selected;
        }
        post_insert_path = insert_node(common_anc, translated_insert_path, result.sel_node, is_right_move);
    }
        if (sel.start && sel.end) {
        // pruning temporary parent
        prune_at_path(common_anc, post_insert_path);
    }

    let after_text = tree_to_text(tree);
    if (before_text !== after_text) {
        return false;
    }

    sel.start = [... common_path].concat(post_insert_path);
    sel.end = null;
    if (num_selected > 1) {
        let end = [... sel.start];
        end[end.length - 1] = end[end.length - 1] + num_selected - 1;
        sel.end = end;
    }
    return sel;
}

function single_click_handler (ev) {
    if (clicks > 0) {
        ev.preventDefault();
        return true;
    }
    clicks++;
    setTimeout(function () { clicks = 0;}, CLICK_INTERVAL_MILLISECS);

    ev = ev || window.event;
    let element = (ev.target || ev.srcElement);
    if ([... element.classList].includes("double-click")) {
        last_dclickable = element;
    } else {
        last_dclickable = null;
    }

    let tree_node = $(element).parents().andSelf().filter(".tree-node").last().get(0);
    if (!tree_node) {
        return false;
    }

    let tgt_path = string_to_path(tree_node.dataset.path);
    let tgt_idx = parseInt(tree_node.dataset.tree_index);
    let tgt_dom_id = tree_manager.index_to_dom_id(tgt_idx);

    if (ev.button == MOUSE.LEFT_BUTTON) {
        context_menu.hide();
        tree_manager.select(tgt_dom_id, tgt_path);
    } else if (ev.button == MOUSE.MIDDLE_BUTTON) {
        context_menu.hide();
        tree_manager.clear_selection();
        tree_manager.select(tgt_dom_id, tgt_path);
        tree_manager.wrap_command(insert_nonterminal)();
    } else if (ev.button == MOUSE.RIGHT_BUTTON) {
        if (!tree_manager.has_selection()) {
            tree_manager.select(tgt_dom_id, tgt_path);
        }
        let curr_sel = tree_manager.get_selection();
        is_different_tree = curr_sel.index !== tgt_idx;
        if (is_different_tree || selection_contains(curr_sel, tgt_path)) {
            tree_manager.clear_selection();
            tree_manager.select(tgt_dom_id, tgt_path);
            context_menu.show(ev, curr_sel);
        } else {
            tree_manager.wrap_command(move_node)(tgt_path);
            ev.stopPropagation();
        }
    }

    if (tree_manager.has_selection()) {
        last_sel = tree_manager.get_selection();
    }
    _.each(clickHooks, function (fn) {
        fn(ev.button);
    });
    ev.stopPropagation();
    last_event_was_mouse = true;
}

function handle_double_click(ev) {
    let event = ev || window.event;
    let element = (event.target || event.srcElement);

    if (last_dclickable !== element) {
        return true;
    }

    let sel = clone_obj(last_sel);
    dom_id = tree_manager.index_to_dom_id(last_sel.index);
    tree_manager.clear_selection();
    tree_manager.select(dom_id, last_sel.start);
    // clone is by value, referential integrity is not maintained
    let node = traverse_node_path(sel.aug_tree.tree, sel.start);

    if (!element.classList) {
        console.error("double click handle on unexpected object", sel);
    }

    let changed = false;
    if ([... element.classList].includes("lemma-node")) {
        let res = window.prompt("Lemma", node.lemma);
        if (res  && res !== "" && res !== node.lemma) {
            node.lemma = res;
            changed = true;
        }
    } else if ([... element.classList].includes("exp-abbrev-node")) {
        let res = window.prompt("Expanded abbreviation", node.abbrev);
        if (res  && res !== "" && res !== node.abbrev) {
            node.abbrev = res;
            changed = true;
        }
        console.log("handleNodeDoubleClick: edit abbrev");
    } else if ([... element.classList].includes("exp-seg-node")) {
        let res = window.prompt("Expanded word segmentation", node.seg);
        if (res  && res !== "" && res !== node.seg) {
            node.lemma = res;
            changed = true;
        }
    } else if ([... element.classList].includes("tree-flat-terminal")) {
        let res = window.prompt("Terminal", node.terminal);
        if (res  && res !== "" && res !== node.terminal) {
            let split = split_flat_terminal(res);
            if (!split) {
                return true;
            }
            node.terminal = res;
            node.cat = split.cat;
            node.variants = split.variants;
            changed = true;
        }
    }

    if (changed) {
        tree_manager.update_tree(last_sel, sel);
    }
    return true;
}

// ========== Context Menu

function show_context_menu(sel) {
    if (sel.node.nonterminal) {
        populate_context_menu_nonterminal(sel);
    } else {
        populate_context_menu_terminal(sel);
    }

    var left = ev.pageX;
    var top = ev.pageY;
    left = left + "px";
    top = top + "px";

    var conl = $("#conLeft"),
        conr = $("#conRight"),
        conrr = $("#conRightest"),
        conm = $("#conMenu");

    $("#conMenu .conMenuColumn").each((idx) => { $(this).height("auto")});
    let max_height = _.max($("#conMenu .conMenuColumn"), () => $(this).height());
    $("#conMenu .conMenuColumn").each(() => $(this).height(max_height));

    conm.css("left",left);
    conm.css("top",top);
    conm.css("visibility","visible");
}

function showContextMenu(ev) {
    var element = ev.target || ev.srcElement;
    if (element == document.getElementById("sn0")) {
        clearSelection();
        return;
    }

    let sel = get_selection();
    if (sel.node.nonterminal) {
        populate_context_menu_nonterminal(sel);
    } else {
        populate_context_menu_terminal(sel);
    }

    var left = ev.pageX;
    var top = ev.pageY;
    left = left + "px";
    top = top + "px";

    var conl = $("#conLeft"),
        conr = $("#conRight"),
        conrr = $("#conRightest"),
        conm = $("#conMenu");

    $("#conMenu .conMenuColumn").each((idx) => { $(this).height("auto")});
    let max_height = _.max($("#conMenu .conMenuColumn"), () => $(this).height());
    $("#conMenu .conMenuColumn").each(() => $(this).height(max_height));

    conm.css("left",left);
    conm.css("top",top);
    conm.css("visibility","visible");
}

// ========== Messages

/**
 * Show the message history.
 */
function showMessageHistory() {
    showDialogBox("Messages", "<textarea readonly='readonly' " +
                  "style='width:100%;height:100%;'>" +
                  messageHistory + "</textarea>");
}
addStartupHook(function () {
    $("#messagesTitle").click(showMessageHistory);
});

// ========== Dialog boxes

var dialogShowing = false;

/**
 * Show a dialog box.
 *
 * This function creates keybindings for the escape (to close dialog box) and
 * return (caller-specified behavior) keys.
 *
 * @param {String} title the title of the dialog box
 * @param {String} html the html to display in the dialog box
 * @param {Function} returnFn a function to call when return is pressed
 * @param {Function} hideHook a function to run when hiding the dialog box
 */
function showDialogBox(title, html, returnFn, hideHook) {
    document.body.onkeydown = function (e) {
        if (e.keyCode == 27) { // escape
            if (hideHook) {
                hideHook();
            }
            hideDialogBox();
        } else if (e.keyCode == 13 && returnFn) {
            returnFn();
        }
    };
    html = '<div class="menuTitle">' + title + '</div>' +
        '<div id="dialogContent">' + html + '</div>';
    $("#dialogBox").html(html).get(0).style.visibility = "visible";
    $("#dialogBackground").get(0).style.visibility = "visible";
    dialogShowing = true;
}

/**
 * Hide the displayed dialog box.
 */
function hideDialogBox() {
    $("#dialogBox").get(0).style.visibility = "hidden";
    $("#dialogBackground").get(0).style.visibility = "hidden";
    document.body.onkeydown = handleKeyDown;
    dialogShowing = false;
}

/**
 * Set a handler for the enter key in a text box.
 * @private
 */
function setInputFieldEnter(field, fn) {
    field.keydown(function (e) {
        if (e.keyCode == 13) {
            fn();
            return false;
        } else {
            return true;
        }
    });
}

// ========== Selection


addStartupHook(function () {
    $("#urtext").hide();
});

/**
 * Scroll the page so that the first selected node is visible.
 */
function scrollToShowSel(elem) {
    function isTopVisible(elem) {
        var docViewTop = $(window).scrollTop();
        var docViewBottom = docViewTop + $(window).height();
        var elemTop = $(elem).offset().top;

        return ((elemTop <= docViewBottom) && (elemTop >= docViewTop));
    }
    if (!isTopVisible(elem)) {
        window.scroll(0, $(elem).offset().top - $(window).height() * 0.25);
    }
}

// ========== Metadata editor

function saveMetadata() {
    if ($("#metadata").html() !== "") {
        $(startnode).attr("data-metadata",
                          JSON.stringify(formToDictionary($("#metadata"))));
    }
}

function updateMetadataEditor() {
    if (!startnode || endnode) {
        $("#metadata").html("");
        return;
    }
    var addButtonHtml = '<input type="button" id="addMetadataButton" ' +
            'value="Add" />';
    $("#metadata").html(dictionaryToForm(getMetadata($(startnode))) +
                        addButtonHtml);
    $("#metadata").find(".metadataField").change(saveMetadata).
        focusout(saveMetadata).keydown(function (e) {
            if (e.keyCode == 13) {
                $(e.target).blur();
            }
            e.stopPropagation();
            return true;
        });
    $("#metadata").find(".key").click(metadataKeyClick);
    $("#addMetadataButton").click(addMetadataDialog);
}



function metadataKeyClick(e) {
    var keyNode = e.target;
    var html = 'Name: <input type="text" ' +
            'id="metadataNewName" value="' + $(keyNode).text() +
            '" /><div id="dialogButtons"><input type="button" value="Save" ' +
        'id="metadataKeySave" /><input type="button" value="Delete" ' +
        'id="metadataKeyDelete" /></div>';
    showDialogBox("Edit Metadata", html);
    // TODO: make focus go to end, or select whole thing?
    $("#metadataNewName").focus();
    function saveMetadataInner() {
        $(keyNode).text($("#metadataNewName").val());
        hideDialogBox();
        saveMetadata();
    }
    function deleteMetadata() {
        $(keyNode).parent().remove();
        hideDialogBox();
        saveMetadata();
    }
    $("#metadataKeySave").click(saveMetadataInner);
    setInputFieldEnter($("#metadataNewName"), saveMetadataInner);
    $("#metadataKeyDelete").click(deleteMetadata);
}

function addMetadataDialog() {
    // TODO: allow specifying value too in initial dialog?
    var html = 'New Name: <input type="text" id="metadataNewName" value="NEW" />' +
            '<div id="dialogButtons"><input type="button" id="addMetadata" ' +
            'value="Add" /></div>';
    showDialogBox("Add Metatata", html);
    function addMetadata() {
        var oldMetadata = formToDictionary($("#metadata"));
        oldMetadata[$("#metadataNewName").val()] = "NEW";
        $(startnode).attr("data-metadata", JSON.stringify(oldMetadata));
        updateMetadataEditor();
        hideDialogBox();
    }
    $("#addMetadata").click(addMetadata);
    setInputFieldEnter($("#metadataNewName"), addMetadata);
}

// ========== Splitting words

function splitWord() {
    if (!startnode || endnode) return;
    if (!isLeafNode($(startnode)) || isEmpty(wnodeString($(startnode)))) return;
    undoBeginTransaction();
    touchTree($(startnode));
    var wordSplit = wnodeString($(startnode)).split("-");
    var origWord = wordSplit[0];
    var startsWithAt = false, endsWithAt = false;
    if (origWord[0] == "@") {
        startsWithAt = true;
        origWord = origWord.substr(1);
    }
    if (origWord.substr(origWord.length - 1, 1) == "@") {
        endsWithAt = true;
        origWord = origWord.substr(0, origWord.length - 1);
    }
    var origLemma = "XXX";
    if (wordSplit.length == 2) {
        origLemma = "@" + wordSplit[1] + "@";
    }
    var origLabel = getLabel($(startnode));
    function doSplit() {
        var words = $("#splitWordInput").val().split("@");
        if (words.join("") != origWord) {
            displayWarning("The two new words don't match the original.  Aborting");
            undoAbortTransaction();
            return;
        }
        if (words.length < 0) {
            displayWarning("You have not specified where to split the word.");
            undoAbortTransaction();
            return;
        }
        if (words.length > 2) {
            displayWarning("You can only split in one place at a time.");
            undoAbortTransaction();
            return;
        }
        var labelSplit = origLabel.split("+");
        var secondLabel = "X";
        if (labelSplit.length == 2) {
            setLeafLabel($(startnode), labelSplit[0]);
            secondLabel = labelSplit[1];
        }
        setLeafLabel($(startnode), (startsWithAt ? "@" : "") + words[0] + "@");
        var hasLemma = $(startnode).find(".lemma").size() > 0;
        makeLeaf(false, secondLabel, "@" + words[1] + (endsWithAt ? "@" : ""));
        if (hasLemma) {
            // TODO: move to something like foo@1 and foo@2 for the two pieces
            // of the lemmata
            addLemma(origLemma);
        }
        hideDialogBox();
        undoEndTransaction();
        undoBarrier();
    }
    var html = "Enter an at-sign at the place to split the word: \
<input type='text' id='splitWordInput' value='" + origWord +
"' /><div id='dialogButtons'><input type='button' id='splitWordButton'\
 value='Split' /></div>";
    showDialogBox("Split word", html, doSplit);
    $("#splitWordButton").click(doSplit);
    $("#splitWordInput").focus();
}
splitWord.async = true;

// ========== Editing parts of the tree

// TODO: document entry points better
// DONE(?): split these fns up...they are monsters.  (or split to sep. file?)

/**
 * Perform an appropriate editing operation on the selected node.
 */
function editNode() {
    if (getLabel($(startnode)) == "CODE" &&
        _.contains(commentTypes,
                   // strip leading { and the : and everything after
                   wnodeString($(startnode)).substr(1).split(":")[0])
        ) {
        editComment();
    } else {
        displayRename();
    }
}

var commentTypeCheckboxes = "Type of comment: ";

function setupCommentTypes() {
    if (typeof commentTypes !== "undefined") {
        for (var i = 0; i < commentTypes.length; i++) {
            commentTypeCheckboxes +=
                '<input type="radio" name="commentType" value="' +
                commentTypes[i] + '" id="commentType' + commentTypes[i] +
                '" /> ' + commentTypes[i];
        }
    }
}

function editComment() {
    if (!startnode || endnode) return;
    touchTree($(startnode));
    var commentRaw = $.trim(wnodeString($(startnode)));
    var commentType = commentRaw.split(":")[0];
    // remove the {
    commentType = commentType.substring(1);
    var commentText = commentRaw.split(":")[1];
    commentText = commentText.substring(0, commentText.length - 1);
    // regex because string does not give global search.
    commentText = commentText.replace(/_/g, " ");
    showDialogBox("Edit Comment",
                  '<textarea id="commentEditBox">' +
                  commentText + '</textarea><div id="commentTypes">' +
                  commentTypeCheckboxes + '</div><div id="dialogButtons">' +
                  '<input type="button"' +
                  'id="commentEditButton" value="Save" /></div>');
    $("input:radio[name=commentType]").val([commentType]);
    $("#commentEditBox").focus().get(0).setSelectionRange(commentText.length,
                                                          commentText.length);
    function editCommentDone (change) {
        if (change) {
            var newText = $.trim($("#commentEditBox").val());
            if (/_|\n|:|\}|\{|\(|\)/.test(newText)) {
                // TODO(AWE): slicker way of indicating errors...
                alert("illegal characters in comment: illegal characters are" +
                      " _, :, {}, (), and newline");
                // hideDialogBox();
                $("#commentEditBox").val(newText);
                return;
            }
            newText = newText.replace(/ /g, "_");
            commentType = $("input:radio[name=commentType]:checked").val();
            setLabelLL($(startnode).children(".wnode"),
                       "{" + commentType + ":" + newText + "}");
        }
        hideDialogBox();
    }
    $("#commentEditButton").click(editCommentDone);
    $("#commentEditBox").keydown(function (e) {
        if (e.keyCode == 13) {
            // return
            editCommentDone(true);
            return false;
        } else if (e.keyCode == 27) {
            editCommentDone(false);
            return false;
        } else {
            return true;
        }
    });
}

/**
 * Return the JQuery object with the editor for a leaf node.
 * @private
 */
function leafEditorHtml(label, word, lemma) {
    // Single quotes mess up the HTML code.
    if (lemma) lemma = lemma.replace(/'/g, "&#39;");
    word = word.replace(/'/g, "&#39;");
    label = label.replace(/'/g, "&#39;");

    var editorHtml = "<div id='leafeditor' class='snode'>" +
            "<input id='leafphrasebox' class='labeledit' type='text' value='" +
            label +
            "' /><input id='leaftextbox' class='labeledit' type='text' value='" +
            word +
            "' " + (!isEmpty(word) ? "disabled='disabled'" : "") + " />";
    if (lemma) {
        editorHtml += "<input id='leaflemmabox' class='labeledit' " +
            "type='text' value='" + lemma + "' />";
    }
    editorHtml += "</div>";

    return $(editorHtml);
}

/**
 * Return the JQuery object with the replacement after editing a leaf node.
 * @private
 */
function leafEditorReplacement(label, word, lemma) {
    if (lemma) {
        lemma = lemma.replace(/</g,"&lt;");
        lemma = lemma.replace(/>/g,"&gt;");
        lemma = lemma.replace(/'/g,"&#39;");
    }

    word = word.replace(/</g,"&lt;");
    word = word.replace(/>/g,"&gt;");
    word = word.replace(/'/g,"&#39;");

    // TODO: test for illegal chars in label
    label = label.toUpperCase();

    var replText = "<div class='snode'>" + label +
            " <span class='wnode'>" + word;
    if (lemma) {
        replText += "<span class='lemma'>-" +
            lemma + "</span>";
    }
    replText += "</span></div>";
    return $(replText);
}

// /**
//  * Edit the selected node
//  *
//  * If the selected node is a terminal, edit its label, and lemma.  The text is
//  * available for editing if it is an empty node (trace, comment, etc.).  If a
//  * non-terminal, edit the node label.
//  */
// function displayRename() {
//     // Inner functions
//     function space(event) {
//         var element = (event.target || event.srcElement);
//         $(element).val($(element).val());
//         event.preventDefault();
//     }
//     function postChange(newNode) {
//         if (newNode) {
//             updateCssClass(newNode, oldClass);
//             startnode = endnode = null;
//             updateSelection();
//             document.body.onkeydown = handleKeyDown;
//             $("#sn0").mousedown(handleNodeClick);
//             $("#editpane").mousedown(clearSelection);
//             $("#butundo").prop("disabled", false);
//             $("#butredo").prop("disabled", false);
//             $("#butsave").prop("disabled", false);
//         }
//     }

//     // Begin code
//     if (!startnode || endnode) {
//         return;
//     }
//     undoBeginTransaction();
//     touchTree($(startnode));
//     document.body.onkeydown = null;
//     $("#sn0").unbind('mousedown');
//     $("#editpane").unbind('mousedown');
//     $("#butundo").prop("disabled", true);
//     $("#butredo").prop("disabled", true);
//     $("#butsave").prop("disabled", true);
//     var label = getLabel($(startnode));
//     var oldClass = parseLabel(label);

//     if ($(startnode).children(".wnode").size() > 0) {
//         // this is a terminal
//         var word, lemma;
//         // is this right? we still want to allow editing of index, maybe?
//         var isLeaf = isLeafNode($(startnode));
//         if ($(startnode).children(".wnode").children(".lemma").size() > 0) {
//             var preword = $.trim($(startnode).children().first().text());
//             preword = preword.split("-");
//             lemma = preword.pop();
//             word = preword.join("-");
//         } else {
//             word = $.trim($(startnode).children().first().text());
//         }

//         $(startnode).replaceWith(leafEditorHtml(label, word, lemma));

//         $("#leafphrasebox,#leaftextbox,#leaflemmabox").keydown(
//             function(event) {
//                 var replText, replNode;
//                 if (event.keyCode == 32) {
//                     space(event);
//                 }
//                 if (event.keyCode == 27) {
//                     replNode = leafEditorReplacement(label, word, lemma);
//                     $("#leafeditor").replaceWith(replNode);
//                     postChange(replNode);
//                     undoAbortTransaction();
//                 }
//                 if (event.keyCode == 13) {
//                     var newlabel = $("#leafphrasebox").val().toUpperCase();
//                     var newword = $("#leaftextbox").val();
//                     var newlemma;
//                     if (lemma) {
//                         newlemma = $('#leaflemmabox').val();
//                     }

//                     if (isLeafNode) {
//                         if (typeof testValidLeafLabel !== "undefined") {
//                             if (!testValidLeafLabel(newlabel)) {
//                                 displayWarning("Not a valid leaf label: '" +
//                                                newlabel + "'.");
//                                 return;
//                             }
//                         }
//                     } else {
//                         if (typeof testValidPhraseLabel !== "undefined") {
//                             if (!testValidPhraseLabel(newlabel)) {
//                                 displayWarning("Not a valid phrase label: '" +
//                                                newlabel + "'.");
//                                 return;
//                             }
//                         }
//                     }
//                     if (newword + newlemma === "") {
//                         displayWarning("Cannot create an empty leaf.");
//                         return;
//                     }
//                     replNode = leafEditorReplacement(newlabel, newword,
//                                                      newlemma);
//                     $("#leafeditor").replaceWith(replNode);
//                     postChange(replNode);
//                     undoEndTransaction();
//                     undoBarrier();
//                 }
//                 if (event.keyCode == 9) {
//                     var element = (event.target || event.srcElement);
//                     if ($("#leafphrasebox").is(element)) {
//                         if (!$("#leaftextbox").attr("disabled")) {
//                             $("#leaftextbox").focus();
//                         } else if ($("#leaflemmabox").length == 1) {
//                             $("#leaflemmabox").focus();
//                         }
//                     } else if ($("#leaftextbox").is(element)) {
//                         if ($("#leaflemmabox").length == 1) {
//                             $("#leaflemmabox").focus();
//                         } else {
//                             $("#leafphrasebox").focus();
//                         }
//                     } else if ($("#leaflemmabox").is(element)) {
//                         $("#leafphrasebox").focus();
//                     }
//                     event.preventDefault();
//                 }
//             }).mouseup(function editLeafClick(e) {
//                 e.stopPropagation();
//             });
//         setTimeout(function(){ $("#leafphrasebox").focus(); }, 10);
//     } else {
//         // this is not a terminal
//         var editor = $("<input id='labelbox' class='labeledit' " +
//                        "type='text' value='" + label + "' />");
//         var origNode = $(startnode);
//         var isWordLevelConj =
//                 origNode.children(".snode").children(".snode").size() === 0 &&
//                 // TODO: make configurable
//                 origNode.children(".CONJ") .size() > 0;
//         textNode(origNode).replaceWith(editor);
//         $("#labelbox").keydown(
//             function(event) {
//                 if (event.keyCode == 9) {
//                     event.preventDefault();
//                 }
//                 if (event.keyCode == 32) {
//                     space(event);
//                 }
//                 if (event.keyCode == 27) {
//                     $("#labelbox").replaceWith(label + " ");
//                     postChange(origNode);
//                     undoAbortTransaction();
//                 }
//                 if (event.keyCode == 13) {
//                     var newphrase = $("#labelbox").val().toUpperCase();
//                     if (typeof testValidPhraseLabel !== "undefined") {
//                         if (!(testValidPhraseLabel(newphrase) ||
//                               (typeof testValidLeafLabel !== "undefined" &&
//                                isWordLevelConj &&
//                                testValidLeafLabel(newphrase)))) {
//                             displayWarning("Not a valid phrase label: '" +
//                                            newphrase + "'.");
//                             return;
//                         }
//                     }
//                     $("#labelbox").replaceWith(newphrase + " ");
//                     postChange(origNode);
//                     undoEndTransaction();
//                     undoBarrier();
//                 }
//             }).mouseup(function editNonLeafClick(e) {
//                 e.stopPropagation();
//             });
//         setTimeout(function(){ $("#labelbox").focus(); }, 10);
//     }
// }
// displayRename.async = true;

// /**
//  * Edit the lemma of a terminal node.
//  */
// function editLemma() {
//     // Inner functions
//     function space(event) {
//         var element = (event.target || event.srcElement);
//         $(element).val($(element).val());
//         event.preventDefault();
//     }
//     function postChange() {
//         startnode = null; endnode = null;
//         updateSelection();
//         document.body.onkeydown = handleKeyDown;
//         $("#sn0").mousedown(handleNodeClick);
//         $("#undo").attr("disabled", false);
//         $("#redo").attr("disabled", false);
//         $("#save").attr("disabled", false);
//         undoBarrier();
//     }

//     // Begin code
//     var childLemmata = $(startnode).children(".wnode").children(".lemma");
//     if (!startnode || endnode || childLemmata.size() != 1) {
//         return;
//     }
//     document.body.onkeydown = null;
//     $("#sn0").unbind('mousedown');
//     undoBeginTransaction();
//     touchTree($(startnode));
//     $("#undo").attr("disabled", true);
//     $("#redo").attr("disabled", true);
//     $("#save").attr("disabled", true);

//     var lemma = $(startnode).children(".wnode").children(".lemma").text();
//     lemma = lemma.substring(1);
//     var editor=$("<span id='leafeditor' class='wnode'><input " +
//                  "id='leaflemmabox' class='labeledit' type='text' value='" +
//                  lemma + "' /></span>");
//     $(startnode).children(".wnode").children(".lemma").replaceWith(editor);
//     $("#leaflemmabox").keydown(
//         function(event) {
//             if (event.keyCode == 9) {
//                 event.preventDefault();
//             }
//             if (event.keyCode == 32) {
//                 space(event);
//             }
//             if (event.keyCode == 13) {
//                 var newlemma = $('#leaflemmabox').val();
//                 newlemma = newlemma.replace("<","&lt;");
//                 newlemma = newlemma.replace(">","&gt;");
//                 newlemma = newlemma.replace(/'/g,"&#39;");

//                 $("#leafeditor").replaceWith("<span class='lemma'>-" +
//                                              newlemma + "</span>");
//                 postChange();
//             }
//             // TODO: escape
//         });
//     setTimeout(function(){ $("#leaflemmabox").focus(); }, 10);
// }
// editLemma.async = true;

// ========== Search

// TODO: anchor right end of string, so that NP does not match NPR, only NP or NP-X (???)

// TODO: profile this and optimize like crazy.

// =============== HTML strings and other globals

/**
 * The HTML code for a regular search node
 * @private
 * @constant
 */
// TODO: make the presence of a lemma search option contingent on the presence
// of lemmata in the corpus
var searchnodehtml = "<div class='searchnode'>" +
        "<div class='searchadddelbuttons'>" +
        "<input type='button' class='searchornodebut' " +
        "value='|' />" +
        "<input type='button' class='searchdeepnodebut' " +
        "value='D' />" +
        "<input type='button' class='searchprecnodebut' " +
        "value='>' />" +
        "<input type='button' class='searchdelnodebut' " +
        "value='-' />" +
        "<input type='button' class='searchnewnodebut' " +
        "value='+' />" +
        "</div>" +
        "<select class='searchtype'><option>Label</option>" +
        "<option>Text</option><option>Lemma</option></select>: " +
        "<input type='text' class='searchtext' />" +
        "</div>";

/**
 * The HTML code for an "or" search node
 * @private
 * @constant
 */
var searchornodehtml = "<div class='searchnode searchornode'>" +
        "<div class='searchadddelbuttons'>" +
        "<input type='button' class='searchdelnodebut' value='-' />" +
        "</div>" +
        "<input type='hidden' class='searchtype' value='Or' />OR<br />" +
        searchnodehtml + "</div>";

/**
 * The HTML code for a "deep" search node
 * @private
 * @constant
 */
var searchdeepnodehtml = "<div class='searchnode searchdeepnode'>" +
        "<div class='searchadddelbuttons'>" +
        "<input type='button' class='searchdelnodebut' value='-' />" +
        "</div>" +
        "<input type='hidden' class='searchtype' value='Deep' />...<br />" +
        searchnodehtml + "</div>";

/**
 * The HTML code for a "precedes" search node
 * @private
 * @constant
 */
var searchprecnodehtml = "<div class='searchnode searchprecnode'>" +
        "<div class='searchadddelbuttons'>" +
        "<input type='button' class='searchdelnodebut' value='-' />" +
        "</div>" +
        "<input type='hidden' class='searchtype' value='Prec' />&gt;<br />" +
        searchnodehtml + "</div>";

/**
 * The HTML code for a node to add new search nodes
 * @private
 * @constant
 */
var addsearchnodehtml = "<div class='newsearchnode'>" +
        "<input type='hidden' class='searchtype' value='NewNode' />+" +
        "</div>";

/**
 * The HTML code for the default starting search node
 * @private
 * @constant
 */
var searchhtml = "<div id='searchnodes' class='searchnode'><input type='hidden' " +
        "class='searchtype' value='Root' />" + searchnodehtml + "</div>";

/**
 * The last search
 *
 * So that it can be restored next time the dialog is opened.
 * @private
 */
var savedsearch = $(searchhtml);

addStartupHook(function () {
    $("#butsearch").click(search);
    $("#butnextmatch").click(nextSearchMatch);
    $("#butclearmatch").click(clearSearchMatches);
    $("#matchcommands").hide();
});

// =============== Event handlers

/**
 * Clear the highlighting from search matches.
 */
function clearSearchMatches() {
    $(".searchmatch").removeClass("searchmatch");
    $("#matchcommands").hide();
}

/**
 * Scroll down to the next node that matched a search.
 */
function nextSearchMatch(e, fromSearch) {
    if (!fromSearch) {
        if ($("#searchInc").prop('checked')) {
            doSearch();
        }
    }
    scrollToNext(".searchmatch");
}

/**
 * Add a sibling search node
 * @private
 */
function addSearchDaughter(e) {
    var node = $(e.target).parents(".searchnode").first();
    var newnode = $(searchnodehtml);
    node.append(newnode);
    searchNodePostAdd(newnode);
}

/**
 * Add a sibling search node
 * @private
 */
function addSearchSibling(e) {
    var node = $(e.target);
    var newnode = $(searchnodehtml);
    node.before(newnode);
    searchNodePostAdd(newnode);
}

/**
 * Delete a search node
 * @private
 */
function searchDelNode(e) {
    var node = $(e.target).parents(".searchnode").first();
    var tmp = $("#searchnodes").children(".searchnode:not(.newsearchnode)");
    if (tmp.length == 1 && tmp.is(node) &&
        node.children(".searchnode").length === 0) {
        displayWarning("Cannot remove only search term!");
        return;
    }
    var child = node.children(".searchnode").first();
    if (child.length == 1) {
        node.contents(":not(.searchnode)").remove();
        child.unwrap();
    } else {
        node.remove();
    }
    rejiggerSearchSiblingAdd();
}

/**
 * Add an "or" search node
 * @private
 */
function searchOrNode(e) {
    var node = $(e.target).parents(".searchnode").first();
    var newnode = $(searchornodehtml);
    node.replaceWith(newnode);
    newnode.children(".searchnode").replaceWith(node);
    searchNodePostAdd(newnode);
}

/**
 * Add a "deep" search node
 * @private
 */
function searchDeepNode(e) {
    var node = $(e.target).parents(".searchnode").first();
    var newnode = $(searchdeepnodehtml);
    node.append(newnode);
    searchNodePostAdd(newnode);
}

/**
 * Add a "precedes" search node
 * @private
 */
function searchPrecNode(e) {
    var node = $(e.target).parents(".searchnode").first();
    var newnode = $(searchprecnodehtml);
    node.after(newnode);
    searchNodePostAdd(newnode);
}

// =============== Helper functions

/**
 * Indicate that a node matches a search
 *
 * @param {Node} node the node to flag
 */
function flagSearchMatch(node) {
    $(node).addClass("searchmatch");
    $("#matchcommands").show();
}

/**
 * Hook up event handlers after adding a node to the search dialog
 */
function searchNodePostAdd(node) {
    $(".searchnewnodebut").unbind("click").click(addSearchDaughter);
    $(".searchdelnodebut").unbind("click").click(searchDelNode);
    $(".searchdeepnodebut").unbind("click").click(searchDeepNode);
    $(".searchornodebut").unbind("click").click(searchOrNode);
    $(".searchprecnodebut").unbind("click").click(searchPrecNode);
    rejiggerSearchSiblingAdd();
    var nodeToFocus = (node && node.find(".searchtext")) ||
            $(".searchtext").first();
    nodeToFocus.focus();
}

/**
 * Recalculate the position of nodes that add siblings in the search dialog.
 * @private
 */
function rejiggerSearchSiblingAdd() {
    $(".newsearchnode").remove();
    $(".searchnode").map(function() {
        $(this).children(".searchnode").last().after(addsearchnodehtml);
    });
    $(".newsearchnode").click(addSearchSibling);
}

/**
 * Remember the currently-entered search, in order to restore it subsequently.
 * @private
 */
function saveSearch() {
    savedsearch = $("#searchnodes").clone();
    var savedselects = savedsearch.find("select");
    var origselects = $("#searchnodes").find("select");
    savedselects.map(function (i) {
        $(this).val(origselects.eq(i).val());
    });
}

/**
 * Perform the search as entered in the dialog
 * @private
 */
function doSearch () {
    // TODO: need to save val of incremental across searches
    var searchnodes = $("#searchnodes");
    saveSearch();
    hideDialogBox();
    var searchCtx = $(".snode"); // TODO: remove sn0
    var incremental = $("#searchInc").prop('checked');

    if (incremental && $(".searchmatch").length > 0) {
        var lastMatchTop = $(".searchmatch").last().offset().top;
        searchCtx = searchCtx.filter(function () {
            // TODO: do this with faster document position dom call
            return $(this).offset().top > lastMatchTop;
        });
    }

    clearSearchMatches();

    for (var i = 0; i < searchCtx.length; i++) {
        var res = interpretSearchNode(searchnodes, searchCtx[i]);
        if (res) {
            flagSearchMatch(res);
            if (incremental) {
                break;
            }
        }
    }
    nextSearchMatch(null, true);
    // TODO: when reaching the end of the document in incremental search,
    // don't dehighlight the last match, but print a nice message

    // TODO: need a way to go back in incremental search
}

/**
 * Clear any previous search, reverting the dialog back to its default state.
 * @private
 */
function clearSearch() {
    savedsearch = $(searchhtml);
    $("#searchnodes").replaceWith(savedsearch);
    searchNodePostAdd();
}

// =============== Search interpretation function

/**
 * Interpret the DOM nodes comprising the search dialog.
 *
 * This function is treponsible for transforming the representation of a
 * search query as HTML into an executable query, and matching it against a
 * node.
 * @private
 *
 * @param {Node} node the search node to interpret
 * @param {Node} target the tree node to match it against
 * @param {Object} options search options
 * @returns {Node} `target` if it matched the query, otherwise `undefined`
 */

function interpretSearchNode(node, target, options) {
    // TODO: optimize to remove jquery calls, only use regex matching if needed
    // TODO: make case sensitivity an option?
    options = options || {};
    var searchtype = $(node).children(".searchtype").val();
    var rx, hasMatch, i, j;
    var newTarget = $(target).children();
    var childSearches = $(node).children(".searchnode");

    if ($(node).parent().is("#searchnodes") &&
        !$("#searchnodes").children(".searchnode").first().is(node) &&
        !options.norecurse) {
        // special case siblings at root level
        // What an ugly hack, can it be improved?
        newTarget = $(target).siblings();
        for (j = 0; j < newTarget.length; j++) {
            if (interpretSearchNode(node, newTarget[j], { norecurse: true })) {
                return target;
            }
        }
    }

    if (searchtype == "Label") {
        rx = RegExp("^" + $(node).children(".searchtext").val(), "i");
        hasMatch = $(target).hasClass("snode") && rx.test(getLabel($(target)));
        if (!hasMatch) {
            return undefined;
        }
    } else if (searchtype == "Text") {
        rx = RegExp("^" + $(node).children(".searchtext").val(), "i");
        hasMatch = $(target).children(".wnode").length == 1 &&
            rx.test(wnodeString($(target)));
        if (!hasMatch) {
            return undefined;
        }
    } else if (searchtype == "Lemma") {
        rx = RegExp("^" + $(node).children(".searchtext").val(), "i");
        hasMatch = hasLemma($(target)) &&
            rx.test(getLemma($(target)));
        if (!hasMatch) {
            return undefined;
        }
    } else if (searchtype == "Root") {
        newTarget = $(target);
    } else if (searchtype == "Or") {
        for (i = 0; i < childSearches.length; i++) {
            if (interpretSearchNode(childSearches[i], target)) {
                return target;
            }
        }
        return undefined;
    } else if (searchtype == "Deep") {
        newTarget = $(target).find(".snode,.wnode");
    } else if (searchtype == "Prec") {
        newTarget = $(target).nextAll();
    }

    for (i = 0; i < childSearches.length; i++) {
        var succ = false;
        for (j = 0; j < newTarget.length; j++) {
            if (interpretSearchNode(childSearches[i], newTarget[j])) {
                succ = true;
                break;
            }
        }
        if (!succ) {
            return undefined;
        }
    }

    return target;
}

// =============== The core search function

/**
 * Display a search dialog.
 */
function search() {
    var html = "<div id='searchnodes' />" +
            "<div id='dialogButtons'><label for='searchInc'>Incremental: " +
            "</label><input id='searchInc' name='searchInc' type='checkbox' />" +
            // TODO: it seems that any plausible implementation of search is
            // going to use rx, so it doesn't make sense to turn it off
            // "<label for='searchRE'>Regex: </label>" +
            // "<input id='searchRE' name='searchRE' type='checkbox' />" +
            "<input id='clearSearch' type='button' value='Clear' />" +
            "<input id='doSearch' type='button' value='Search' /></div>";
    showDialogBox("Search", html, doSearch, saveSearch);
    $("#searchnodes").replaceWith(savedsearch);
    $("#doSearch").click(doSearch);
    $("#clearSearch").click(clearSearch);
    searchNodePostAdd();
}

// ===== Collapsing nodes

/**
 * Toggle collapsing of a node.
 *
 * When a node is collapsed, its contents are displayed as continuous text,
 * without labels.  The node itself still functions normally with respect to
 * movement operations etc., but its contents are inaccessible.
 */
function toggleCollapsed() {
    if (!startnode || endnode) {
        return false;
    }
    $(startnode).toggleClass("collapsed");
    return true;
}

// ===== Tree manipulations

// ========== Movement

// ========== Creation

// ========== Deletion

// ========== Label manipulation

/**
 * Toggle a dash tag on a node
 *
 * If the node bears the given dash tag, remove it.  If not, add it.  This
 * function attempts to put multiple dash tags in the proper order, according
 * to the configuration in the `leaf_extensions`, `extensions`, and
 * `clause_extensions` variables in the `settings.js` file.
 *
 * @param {String} extension the dash tag to toggle
 * @param {Array<String>} [extensionList] override the guess as to the
 * appropriate ordered list of possible extensions.
 */
function toggleExtension(extension, extensionList) {
    if (!startnode || endnode) return false;

    if (!extensionList) {
        if (guessLeafNode(startnode)) {
            extensionList = leaf_extensions;
        } else if (getLabel($(startnode)).split("-")[0] == "IP" ||
                   getLabel($(startnode)).split("-")[0] == "CP") {
            // TODO: should FRAG be a clause?
            // TODO: make configurable
            extensionList = clause_extensions;
        } else {
            extensionList = extensions;
        }
    }

    // Tried to toggle an extension on an inapplicable node.
    if (extensionList.indexOf(extension) < 0) {
        return false;
    }

    touchTree($(startnode));
    var textnode = textNode($(startnode));
    var oldlabel = $.trim(textnode.text());
    // Extension is not de-dashed here.  toggleStringExtension handles it.
    // The new config format however requires a dash-less extension.
    var newlabel = toggleStringExtension(oldlabel, extension, extensionList);
    textnode.replaceWith(newlabel + " ");
    updateCssClass($(startnode), oldlabel);

    return true;
}

/**
 * Set the label of a node intelligently
 *
 * Given a list of labels, this function will attempt to find the node's
 * current label in the list.  If it is successful, it sets the node's label
 * to the next label in the list (or the first, if the node's current label is
 * the last in the list).  If not, it sets the label to the first label in the
 * list.
 *
 * @param labels a list of labels.  This can also be an object -- if so, the
 * base label (without any dash tags) of the target node is looked up as a
 * key, and its corresponding value is used as the list.  If there is no value
 * for that key, the first value specified in the object is the default.
 */
function setLabel(labels) {
    if (!startnode || endnode) {
        return false;
    }

    var textnode = textNode($(startnode));
    var oldlabel = $.trim(textnode.text());
    var newlabel = lookupNextLabel(oldlabel, labels);

    if (guessLeafNode($(startnode))) {
        if (typeof testValidLeafLabel !== "undefined") {
            if (!testValidLeafLabel(newlabel)) {
                return false;
            }
        }
    } else {
        if (typeof testValidPhraseLabel !== "undefined") {
            if (!testValidPhraseLabel(newlabel)) {
                return false;
            }
        }
    }

    touchTree($(startnode));

    textnode.replaceWith(newlabel + " ");
    updateCssClass($(startnode), oldlabel);

    return true;
}

// ========== Coindexation

/**
 * Coindex nodes.
 *
 * Coindex the two selected nodes.  If they are already coindexed, toggle
 * types of coindexation (normal -> gapping -> backwards gapping -> double
 * gapping -> no indices).  If only one node is selected, remove its index.
 */
function coIndex() {
    if (startnode && !endnode) {
        if (getIndex($(startnode)) > 0) {
            touchTree($(startnode));
            removeIndex(startnode);
        }
    } else if (startnode && endnode) {
        // don't do anything if different token roots
        var startRoot = getTokenRoot($(startnode));
        var endRoot = getTokenRoot($(endnode));
        if (startRoot != endRoot) {
            return;
        }

        touchTree($(startnode));
        // if both nodes already have an index
        if (getIndex($(startnode)) > 0 && getIndex($(endnode)) > 0) {
            // and if it is the same index
            if (getIndex($(startnode)) == getIndex($(endnode))) {
                var theIndex = getIndex($(startnode));
                var types = "" + getIndexType($(startnode)) +
                    "" + getIndexType($(endnode));
                // remove it

                if (types == "=-") {
                    removeIndex(startnode);
                    removeIndex(endnode);
                    appendExtension($(startnode), theIndex, "=");
                    appendExtension($(endnode), theIndex, "=");
                } else if( types == "--" ){
                    removeIndex(endnode);
                    appendExtension($(endnode), getIndex($(startnode)),"=");
                } else if (types == "-=") {
                    removeIndex(startnode);
                    removeIndex(endnode);
                    appendExtension($(startnode), theIndex,"=");
                    appendExtension($(endnode), theIndex,"-");
                } else if (types == "==") {
                    removeIndex(startnode);
                    removeIndex(endnode);
                }
            }
        } else if (getIndex($(startnode)) > 0 && getIndex($(endnode)) == -1) {
            appendExtension($(endnode), getIndex($(startnode)));
        } else if (getIndex($(startnode)) == -1 && getIndex($(endnode)) > 0) {
            appendExtension($(startnode), getIndex($(endnode)));
        } else { // no indices here, so make them
            var index = maxIndex(startRoot) + 1;
            appendExtension($(startnode), index);
            appendExtension($(endnode), index);
        }
    }
}

// ===== Server-side operations

// ========== Saving

// =============== Save helper function

var is_save_in_progress = false;

function save(e) {
    let trees = tree_manager.get_all_trees();

    let data = {trees: trees};
    console.log("saved", trees);
    if (!is_save_in_progress) {
        displayInfo("Saving...");
        is_save_in_progress = true;
        setTimeout(function () {
            $.ajax({
                type: "POST",
                contentType : "application/json",
                dataType: "json",
                url: "/doSave",
                async: true,
                traditional: true,
                data: JSON.stringify(data),
                success: function (args) {
                    console.log("sucess", args);
                    displayInfo("Save complete");
                },
                error: function (args) {
                    displayInfo("Error occurred during saving");
                    console.error(args);
                },
                complete: function (args) {
                    is_save_in_progress = false;
                }
            });
        }, 0);
    }
}

// ========== Validating

var validatingCurrently = false;

// ========== Advancing through the file

// ========== Event logging and idle

// =============== Event logging function

function logEvent(type, data) {
    data = data || {};
    data.type = type;
    payload = { eventData: data };
    $.ajax({
               url: "/doLogEvent",
               async: true,
               dataType: "json",
               type: "POST",
               data: JSON.stringify(payload),
               contentType : "application/json",
               traditional: true
           });
}

// =============== Idle timeout

var idleTimeout = false;
var isIdle = false;

function resetIdleTimeout() {
    if (idleTimeout) {
        clearTimeout(idleTimeout);
    }
    idleTimeout = setTimeout(autoIdle, 30 * 1000);
}

function autoIdle() {
    logEvent("auto-idle");
    becomeIdle();
}

addStartupHook(resetIdleTimeout);

addKeyDownHook(function() {
    unAutoIdle();
    resetIdleTimeout();
});

addClickHook(function() {
    unAutoIdle();
    resetIdleTimeout();
});

function unAutoIdle() {
    if (isIdle) {
        logEvent("auto-resume");
        becomeEditing();
    }
}

// =============== User interface

function becomeIdle() {
    isIdle = true;
    $("#idlestatus").html("<div style='color:#C75C5C'>IDLE.</div>");
    $("#butidle").unbind("mousedown").mousedown(resume);
}

function becomeEditing() {
    isIdle = false;
    $("#idlestatus").html("<div style='color:#64C465'>Editing.</div>");
    $("#butidle").unbind("mousedown").mousedown(idle);
}

function idle() {
    logEvent("user-idle");
    becomeIdle();
}

function resume() {
    logEvent("user-resume");
    becomeEditing();
}

// =============== Key/click logging

addStartupHook(function () {
    // This must be delayed, because this file is loaded before settings.js is
    if (typeof logDetail !== "undefined" && logDetail) {
        addKeyDownHook(function (keydata, fn, args) {
            var key = (keydata.ctrl ? "C-" : "") +
                    (keydata.shift ? "S-" : "") +
                    String.fromCharCode(keydata.keyCode),
                theFn = fn.name + "(" +
                    args.map(function (x) { return JSON.stringify(x); }).join(", ") +
                    ")";
            logEvent("keypress",
                     { key: key,
                       fn: theFn
                     });
        });

        addClickHook(function (button) {
            logEvent("mouse-click",
                     { button: button
                     });
        });

        // TODO: what about mouse movement?
    }
});

// ========== Quitting

function quitServer(e, force) {
    unAutoIdle();
    if (!force && $("#editpane").html() != lastsavedstate) {
        displayError("Cannot exit, unsaved changes exist.  <a href='#' " +
                    "onclick='quitServer(null, true);return false;'>Force</a>");
    } else {
        $.post("/doExit");
        window.onbeforeunload = undefined;
        setTimeout(function(res) {
                       // I have no idea why this works, but it does
                       window.open('', '_self', '');
                       window.close();
               }, 100);
    }
}

// ===== Undo/redo

// TODO: organize this code

// addStartupHook(prepareUndoIds);

/**
 * Inform the undo system of the addition of a new tree at the root level.
 *
 * @param {jQuery} tree the tree being added
 */
// function registerNewRootTree(tree) {
//     var newid = "id" + idNumber;
//     idNumber++;
//     undoNewTrees.push(newid);
//     tree.attr("id", newid);
// }

/**
 * Inform the undo system of a tree's removal at the root level
 *
 * @param {jQuery} tree the tree being removed
 */
// function registerDeletedRootTree(tree) {
//     var prev = tree.prev();
//     if (prev.length === 0) {
//         prev = null;
//     }
//     undoDeletedTrees.push({
//         tree: tree.clone(),
//         before: prev && prev.attr("id")
//     });
// }

// ===== Misc

/**
 * Toggle display of lemmata.
 */
// function toggleLemmata() {
//     if (lemmataHidden) {
//         lemmataStyleNode.innerHTML = "";
//     } else {
//         lemmataStyleNode.innerHTML = ".lemma { display: none; }";
//     }
//     lemmataHidden = !lemmataHidden;
// }

// ===== Misc (candidates to move to utils)

//================================================== Obsolete/other
