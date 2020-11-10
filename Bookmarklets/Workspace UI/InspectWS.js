/* 
@desc Inspect Workspace UI
@author VB(xapuk.com)
@version 1.5 2020/11/08
@requires "FWK Runtime" business service to be published (Application ClientBusinessService usep property)
@features
    +elements: help text hidden by default, input field with the history, message bar, 3 buttons
    +don't accept value shorter then 3 chars excluding *
    +async call with busy overlay
    +highlight search pattern in all found results
    +shows a text if number of results = limit
    +cut history to 5 items and don't store empty requests
    +insect ws on click of <a>
    +close on right-click of whitespace
    +change a default ws filter to only filter out Delivered WSs
    +copy ws name on right-click of link
    +make a ws name in a sucess message a link
    +put a timestamp in the message
    +fix contextmenu on text input
    +before opening a dialog check if it exists, and if so run auto inspect
    +clicking a ws name inspects the first in the list
    +dialog should have a unique selector itself so we don't mess with other dialogs
    +print a message before server call, like inspecting ws blabla, or searching for workspace blabla
    +use a function to print the message, keep a history of 3 messages
    +close when click outside
    +make it work and test in IE/Edge/Firefox
    +ES6 => Babel => ES5 => Bookmarklet
@Fixed in 1.2:
    +print placeholder text on empty call
    +don't highlight search specs
    +clear results before next search
    +fix char limit error
    +fix hightlight
    +print user name instead of "my"
@Fixed in 1.3:
    +placeholder text color
    +<> in placeholder text
    +when searching for exact ws name, shouldn't highlight it
    +link click doesn't work if clicked on highlighted part (<b>)
    +don't close on whitespace click
@Fixed in 1.4
    +change to the layout
    +fixed empty call problem
    +instruction changes
@fixed in 1.5
    +remove "workspace" from messages so inspecting latest workspace wording make sence
    +search results shouldn't be empty - when inspecting should spool a ws name, while search/inspect in progress put ...
    +more instructions
*/

(() => {
    if ("undefined" === typeof SiebelApp) {
        alert("It works only in Siebel OUI session!");
        return;
    }
    // snippet id
    const func = "SiebelInspectWS";
    // selector preffix
    const id = "#" + func;
    const cls = "." + func;
    // max number of output records
    const iLimit = 10;
    // history of recent calls
    let aHistory = JSON.parse(window.localStorage[func] || "[]");
    // messages
    let aMsg = [];
    // double click of bookmarklet
    if ($("." + func).length) {
        $("." + func).find(id + "IBtn").click();
        return;
    }

    const placeholder = `${SiebelApp.S_App.GetUserName()||"my"} recent undelivered workspace`;

    const help = `<i><p>Welcome to Inspect Workspace UI</p>
    Text field accepts several formats:<br>
    <ul><li> - an exact workspace name: vbabkin_20200924_d419_1</li>
    <li> - a search pattern of workspace name: *d419*</li>
    <li> - an exact search spec for Repository Workspace BC: [Parent Name] = "Release 21" AND [Created By] = LoginId()</li>
    <li> - leave it empty to search / inspect most recent undelivered workspaces created by active user</li></ul>
    <p>Hit Enter to search for 10 most recent workspaces matching the provided name/pattern/spec and then click one of the workspaces in the list to inspect it.</p>
    <p>Hit Ctrl+Enter to inspect the most recent workspaces matching the provided name/pattern/spec.</p>
    <p>If you want to inspect/re-inspect your recent undelivered workspace, just hit Ctrl+Enter upon opening a dialog or double click a bookmark link.</p>
    <p>Right click on workspace name to copy it.</p>
    <p>Click anywhere outside of the dialog to close it.</p>
    <p>Check out <a href="http://xapuk.com/index.php?topic=125" target="_blank">http://xapuk.com/</a> for details.</p></i>`;

    const html = `<div title="Inspect workspace">
            <span id = "${func}Help" style = "display:none">${help}</span>
            <input placeholder = "<${placeholder}>" type="text" id = "${func}" list="${func}History" autocomplete="off">
            <ul id="${func}List">Provide a search criteria above and run [Search] to see a list of available workspaces<br>and/or run [Inspect] directly to inspect first most recent workspace matching the criteria</ul>
            <p id = "${func}Msg"></p>
            <datalist id = "${func}History"></datalist>
            <style>
                .${func} input {
                    width: 100%!Important;
                    margin-bottom: 10px;
                }
                #${func}::placeholder {
                    color: lightslategrey;
                }
                #${func}List {
                    margin-left: 15px;
                }
                #${func}Help i {
                    font-size: 0.9rem;
                }
                .${func} li {
                    list-style-type: disc;
                    margin-left: 30px;
                }
                #${func}Msg {
                    border-top: 1px solid lightslategrey;
                    padding-top: 5px;
                }
            </style>
        </div>`;

    const $d = $(html).dialog({
        modal: true,
        width: 640,
        classes: {
            "ui-dialog": func
        },
        buttons: [{
            text: 'Search (Enter)',
            click: () => Run(false)
        }, {
            id: func + "IBtn",
            text: 'Inspect (Ctrl+Enter)',
            click: () => Run(true)
        }, {
            text: 'Help',
            click: () => $d.find(id + "Help").toggle()
        }, {
            text: 'Close (Esc)',
            click: () => $d.dialog('close')
        }],
        open: function () {
            const $this = $(this);
            // autofocus
            $this.find('#' + func).focus();
            // key bindings
            $this.parent(".ui-dialog").contextmenu(function (e) {
                const scope = e.target;
                if (scope.nodeName === "A") {
                    // copy value on right-click of link
                    e.stopPropagation();
                    e.preventDefault();
                    // replace link with an input
                    $(scope).hide().after(`<input id='${func}Copy'>`);
                    $d.find(id + "Copy").val($(scope).text()).select();
                    // attempt to copy value
                    if (document.execCommand("copy", false, null)) {
                        // if copied, display a message for a second
                        $d.find(id + "Copy").attr("disabled", "disabled").css("color", "red").val("Copied!");
                        setTimeout(() => {
                            $d.find(id + "Copy").remove();
                            $(scope).show();
                        }, 700);
                    } else {
                        // if failed to copy, keep input element until blur, so it can be copied manually
                        $d.find(id + "Copy").blur(() => {
                            $(this).remove();
                            $d.find("a").show();
                        });
                    }
                }
            }).click((e) => {
                var a = $(e.target).closest("a");
                if (a.length && a.closest(id + "List").length) {
                    Run(true, a.text());
                }
            }).find(id).keydown((event) => {
                if (event.keyCode === 13) {
                    Run(event.ctrlKey);
                }
            });
            // close dialog when click outside
            $('.ui-widget-overlay').click(() => $d.dialog("close"));
            // render history
            aHistory.forEach((i) => $this.find(id + "History").append(`<option>${i}</option>`));
        },
        close: () => {
            $d.dialog('destroy').remove();
        }
    });

    function Run(bInspect, inpname) {
        const name = inpname ? inpname : $('#' + func).val();
        // don't accept specs shorter then 3 chars
        if (name && name.replace(/\*/gm, "").length < 3) {
            printMsg(`Value should be longer then 3 characters! ${name}`);
            return;
        }
        //clean up results before search
        if (!bInspect) {
            $d.find(id + "List").empty();
        }
        // save last query
        if (name) {
            if (aHistory.indexOf(name) > -1) {
                aHistory.splice(name, 1);
            }
            aHistory.unshift(name);
            // limit history stack volume to 5
            if (aHistory.length > 5) {
                aHistory.pop();
            }
            window.localStorage[func] = JSON.stringify(aHistory);
        }
        // invoke BS
        const service = SiebelApp.S_App.GetService("FWK Runtime");
        let ps = SiebelApp.S_App.NewPropertySet();
        ps.SetProperty("Name", name);
        ps.SetProperty("Inspect", bInspect ? "Y" : "N");
        ps.SetProperty("Limit", iLimit);
        let config = {
            async: true,
            scope: this,
            mask: true,
            cb: function (methodName, inputSet, outputSet) {
                if (outputSet.GetProperty("Status") == "Error") {
                    sRes = outputSet.GetChildByType("Errors").GetChild(0).GetProperty("ErrMsg");
                } else {
                    let psRS = outputSet.GetChildByType("ResultSet");
                    if (psRS) {
                        sRes = psRS.GetProperty("Result");
                        sWorkspaces = psRS.GetProperty("Workspaces");
                        if (!sRes) {
                            if (bInspect) {
                                sRes = `Workspace <b><a href='#'>${sWorkspaces||"?"}</a></b> inspected successfully!`;
                            } else {
                                if (sWorkspaces) {
                                    // print a list of workspaces
                                    $d.find(id + "List").empty();
                                    let aWorkspaces = sWorkspaces.split(",");
                                    aWorkspaces.forEach((w) => $d.find(id + "List").append(`<li><a href='#'>${highlightText(name, w)}</a></li>`));
                                    if (aWorkspaces.length == iLimit) {
                                        $d.find(id + "List").append(`<p><i>${iLimit} most recent workspaces are shown.</i></p>`);
                                    }
                                }
                            }
                        } else if (sRes.indexOf("No workspace found") > -1) {
                            $d.find(id + "List").html(`Workspace not found, please provide a valid search criteria and run [Search] again...`);
                        }
                    }
                }
                if (sRes) {
                    printMsg(sRes);
                }
            }
        };
        printMsg(`${bInspect?'Inspecting':'Searching for'} ${name||placeholder}`);
        service.InvokeMethod("InspectWS", ps, config);
    }

    function highlightText(pattern, value) {
        if (pattern && value && !pattern.match(/\[.*\]/gm) && pattern.replace(/\*/gm, "").length < value.length) {
            const patterns = pattern.split("*");
            let i, lastIndex = -1;
            value = patterns.reduce((res, p) => {
                let i = res.indexOf(p, lastIndex);
                if (p && i > -1) {
                    res = `${res.substr(0, i)}<b>${p}</b>${res.substr(i + p.length)}`;
                    lastIndex = i;
                }
                return res;
            }, value);
        }
        return value;
    }

    function printMsg(txt) {
        txt = (new Date).toLocaleTimeString() + ' >> ' + txt;
        // limit a message stack to 3 items
        aMsg.push(txt);
        if (aMsg.length > 3) {
            aMsg.shift();
        }
        $d.find(id + "Msg").html(aMsg.join("<br>"));
    }
})();