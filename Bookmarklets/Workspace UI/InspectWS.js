/* 
@desc Inspect Workspace UI
@author VB(xapuk.com)
@version 1.1 2020/09/25
@requires BS "FWK Runtime" to be published
@features
    +elements: help text hidden by default, input field with the history, message bar, 3 buttons
    +don't accept value shorter then 3 chars excluding *
    +async call with busy overlay
    +highlight search pattern in all found results
    +shows a text if number of results = limit
    +after successful inspect close dialog on border hover
    +cut history to 5 items and don't store empty requests
    +insect ws on click of <a>
    close on right-click of whitespace
    +before opening a dialog check if it exists, and if so run auto inspect
    change a default ws filter to only filter out Delivered WSs
    +copy ws name on right-click of link
    +make a ws name in a sucess message a link
    +put a timestamp in the message
    +fix contextmenu on text input
    ~ES6

@ideas
    mesure the time differens between normal UI and the snippet
    add an option - [auto inspect], which doesn't even open the popup; to disable option, run plugin twice 
    check for an online code transpeller from ES6+ to ES5 (https://babeljs.io/repl)

*/
(() => {
    if ("undefined" === typeof SiebelApp) {
        alert("It works only in Siebel OUI session!");
        return;
    }

    const func = "SiebelInspectWS"; // snippet id
    const id = "#" + func; // selector preffix
    const iLimit = 10; // max number of output records
    let aHistory = JSON.parse(window.localStorage[func] || "[]"); // history of recent calls

    // double click of bookmarklet
    if ($(id).length) {
        $(id).parent().parent().find(id + "IBtn").click(); // replace double parent selector with parent(".class")
        return;
    }

    const html = `
        <div title="Inspect Workspace">
            <span id = "${func}Help" style = "display:none"></span>
            <span id = "${func}Msg"></span>
            <input placeholder = "<my recent in-progress workspace>" type="text" id = "${func}" list="${func}History" autocomplete="off">
            <ul id="${func}List"></ul>
            <datalist id = "${func}History"></datalist>
            <style>
                input {
                    width:100%!Important
                }
            </style>
        </div>`;

    const $d = $(html).dialog({
        modal: true,
        width: 640,
        open: function () {
            const $this = $(this);
            // autofocus
            $this.find('#' + func).focus();
            // key bindings
            $this.find(id).keydown((event) => {
                if (event.keyCode === 13) {
                    Run(event.ctrlKey);
                }
            }).contextmenu(e => {
                const scope = e.target;
                if (scope.nodeName === "A") { // copy value on right-click of link
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
                        // if failed to copy, leave input until blur, so it can be copied manually
                        $d.find(id + "Copy").blur(() => {
                            $(this).remove();
                            $d.find("a").show();
                        });
                    }
                } else if (scope.nodeName === "DIV") { // close the applet on right-click of whitespace
                    $this.dialog("close");
                    event.preventDefault();
                    event.stopPropagation();
                }
            })
            // recent expression
            aHistory.forEach((i) => $this.find(id + "History").append(`<option>${i}</option>`));
        },
        close: () => $(this).dialog('destroy').remove(),
        buttons: [{
            text: 'Search (Enter)',
            click: () => Run(false)
        }, {
            id: func + "IBtn",
            text: 'Inspect (Ctrl+Enter)',
            click: () => Run(true)
        }, {
            text: 'Help',
            click: () => $(this).find(id + "Help").toggle()
        }, {
            text: 'Close (Esc)',
            click: () => $(this).dialog('close')
        }]
    });


    function Run(bInspect, name) {

        $d.find(id + "Msg").empty();
        name = name ? name : $('#' + func).val();

        // don't accept empty filters
        if (name && name.replace(/\*/gm, "").length < 3) {
            $d.find(id + "Msg").html("Value can't be shorter then 3 characters!");
            return;
        }

        // save last query
        if (name) {
            if (aHistory.indexOf(name)) {
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
                            if (inputSet.GetProperty("Inspect") == "Y") {
                                sRes = `Workspace <b><a href='#'>${sWorkspaces}</a></b> inspected sucessfuly!<br><i>Just hover the edge of a popup or hit Esc to close it</i>`;
                                // close dialog when hover over it's border 
                                setTimeout(() => $d.parent().on("mouseleave mouseenter", () => $d.dialog("close")), 500);
                            } else {
                                // print a list of workspaces
                                $d.find(id + "List").empty();
                                let aWorkspaces = sWorkspaces.split(",");
                                aWorkspaces.forEach((w) => $d.find(id + "List").append(`<li><a href='#'>${highlightText(name, w)}</a></li>`));
                                if (aWorkspaces.length == iLimit) {
                                    $d.find(id + "List").append(`<li><i>${iLimit} most recent workspaces are shown.</i></li>`);
                                }
                                $d.find(id + "List a").click(() => Run(true, $(this).val()));
                            }
                        }
                    }
                }
                $d.find(id + "Msg").html((new Date).toLocaleTimeString() + " " + sRes);
            }
        };
        service.InvokeMethod("InspectWS", ps, config);
    }

    function highlightText(pattern, value) {
        if (pattern && value) {
            const patterns = pattern.split("*");
            let i, lastIndex = -1;
            value = patterns.reduce((res, p) => {
                if (p && (i = res.indexOf(p, lastIndex))) {
                    res = `${res.substr(0, i)}<b>${p}</b>${res.substr(i + p.length)}`;
                    lastIndex = i;
                }
                return res;
            }, value);
        }
        return value;
    }
})();