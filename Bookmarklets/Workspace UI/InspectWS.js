/* 
@desc Inspect Workspace UI
@author VB(xapuk.com)
@version 1.0 2020/09/23
@requires BS "FWK Runtime" to be published
@features
    don't accept value shorter then 3 chars excluding *
    async call with busy overlay
    highlight search pattern in all found results
    shows a text if number of results = limit
    after successful inspect close dialog on border hover
    cut history to 5 items and don't store empty requests
    elements: help text hidden by default, input field with the history, message bar, 3 buttons
@todo
    mesure the time differens between normal UX and my UI
    in the help text put a refference to my website
*/

if ("undefined" == typeof SiebelApp) {
    alert("It works only in Siebel OUI session!");
} else {
    var func = "SiebelInspectWS";
    $("#" + func).parent().remove();

    var s = '<div title="Inspect Workspace">' +
        '<span id = "' + func + 'Help" style="display:none"></span>' +
        '<input id = "' + func + '" datalist="' + func + 'History"></input>' +
        '<span id="' + func + 'Msg"></span>' +
        '<datalist id = "' + func + 'History"></datalist>' +
        '<style>input{width:100%!Important}</style>' +
        '</div>';

    var d = $(s).dialog({
        modal: true,
        width: 640,
        open: function () {
            // autofocus
            $('#' + func).focus();
            // key bindings
            $("#" + func).keydown(function (event) {
                if (event.keyCode === 13) {
                    EvalExpr(event.ctrlKey);
                }
            });
            // recent expression
            $("#" + func).val(JSON.parse(window.localStorage[func]));
        },
        close: function () {
            $(this).dialog('destroy').remove();
        },
        buttons: [{
            text: 'Search (Ctrl)',
            click: Run
        }, {
            text: 'Inspect (Ctrl+Enter)',
            click: function () {
                Run(true);
            }
        }, {
            text: 'Help',
            click: function () {
                $(this).find("#" + func + "Help").toggle();
            }
        }, {
            text: 'Close (Esc)',
            click: function () {
                $(this).dialog('close');
            }
        }]
    });
}

function Run(bInspect, name) {
    var name = name ? name : $('#' + func).val();

    // save last query
    window.localStorage[func] = JSON.stringify(sExpr);

    // invoke BS
    var service = SiebelApp.S_App.GetService("FWK Runtime");
    var ps = SiebelApp.S_App.NewPropertySet();
    ps.SetProperty("Expr", sExpr);
    ps.SetProperty("BC", $("#" + func + "List").val());
    var outputSet = service.InvokeMethod("EvalExpr", ps);
    if (outputSet.GetProperty("Status") == "Error") {
        sRes = outputSet.GetChildByType("Errors").GetChild(0).GetProperty("ErrMsg");
    } else {
        sRes = outputSet.GetChildByType("ResultSet").GetProperty("Result");
        console.log(outputSet);
    }
}

function highlightText(pattern, value) {
    if (pattern) {
        var patterns = pattern.split("*");
        var i, lastIndex = -1;
        value = patterns.reduce(function (p, res) {
            res = res || value;
            if (p) {
                if (i = res.indexOf(p, lastIndex)) {
                    res = res.substr(0, i) + '<b>' + p + '</b>' + res.substr(i + p.length);
                }
            }
        });
    }
    return value;
}