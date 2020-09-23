/* 
@desc UI allowing to evaluate expressions (EvalExpr) on active BCs
@author VB(xapuk.com)
@version 1.3 2018/07/23
@requires BS "FWK Runtime" to be published
*/

if ("undefined" == typeof SiebelApp) {
    alert("It works only in Siebel OUI session!");
} else {
    var func = "SiebelEvalExpr";
    $("#" + func).parent().remove();

    var a = LoadBCs();
    if (a.length === 0) {
        alert("No BusComps/Records available!");
    } else {

        var s = '<div title="Runtime calculations">' +
            '<label for="' + func + 'List">Business Component:</label>' +
            '<select id = "' + func + 'List" style="display:block"></select>' +
            '<label for="' + func + '">Expression:</label>' +
            '<textarea id = "' + func + '" rows="3"></textarea>' +
            '<label for="' + func + 'Out">Results:</label>' +
            '<textarea id = "' + func + 'Out" disabled rows="2"></textarea>' +
            '<style>select,textarea{width:100%!Important}</style>' +
            '</div>';

        var d = $(s).dialog({
            modal: true,
            width: 1024,
            heigth: 640,
            open: function () {
                $('#' + func).focus();

                // key bindings
                $("#" + func + "Out").parent().keydown(function (event) {
                    if (event.ctrlKey && event.keyCode === 13) { // ctrl + Enter
                        EvalExpr();
                    }
                });

                // list of BCs
                $("#" + func + "List").append("<option>" + a.join("</option><option>") + "</option>");
                $("#" + func + "List").val(SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().GetName());

                // recent expression
                $("#" + func).val(JSON.parse(window.localStorage[func]));

                //style
                $(this).append('<style type="text/css">textarea, select { height:auto; width:100% }</style>');
            },
            close: function () {
                $(this).dialog('destroy').remove();
            },
            buttons: [{
                    text: 'Run (Ctrl+Enter)',
                    click: EvalExpr
                },
                {
                    text: 'Close (Esc)',
                    click: function () {
                        $(this).dialog('destroy').remove();
                    }
                }
            ]
        });

        // bind and trigger auto-adjust
        $(d).find("#" + func).keyup(function () {
            TextAdjust(this, 3);
        }).keyup();
    }
}

function EvalExpr() {
    var sExpr = $('#' + func).val();
    var sRes = "";

    // save last query
    window.localStorage[func] = JSON.stringify(sExpr);

    // if there is a selection
    var ele = document.getElementById(func);
    if (ele.selectionStart !== undefined && ele.selectionStart != ele.selectionEnd) { // Normal browsers
        sExpr = ele.value.substring(ele.selectionStart, ele.selectionEnd);
    } else if (document.selection !== undefined) { // IE
        ele.focus();
        var sel = document.selection.createRange();
        sExpr = sel.text;
    }

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
    TextAdjust($('#' + func + "Out").show().text(sRes)[0]);
}

// auto-ajust textarea height
function TextAdjust(scope, minrows, maxrows) {

    maxrows = maxrows > 0 ? maxrows : 10;
    minrows = minrows > 0 ? minrows : 2;
    var txt = scope.value;
    var cols = scope.cols;

    var arraytxt = txt.split('\n');
    var rows = arraytxt.length;

    if (rows > maxrows) {
        scope.rows = maxrows;
    } else if (rows < minrows) {
        scope.rows = minrows;
    } else {
        scope.rows = rows;
    }
}

// gather the list of active BCs
function LoadBCs() {
    var a = [];
    for (var i in SiebelApp.S_App.GetActiveBusObj().GetBCMap()) {
        var bc = SiebelApp.S_App.GetActiveBusObj().GetBCMap()[i];
        if (a.indexOf(bc.GetName()) == -1 && bc.GetNumRows() > 0) {
            a.push(bc.GetName());
        }
    }
    return a;
}