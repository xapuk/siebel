// dialog html
var s = '<div title="eScript">'
+ '<textarea id = "SiebelEvalScript" style="height:150px"></textarea>'
+ '<textarea id = "SiebelEvalScriptOut" rows="4" disabled></textarea>'
+ '<style>textarea{width:100%!Important}</style>'
+ '</div>';

// display dialog
$(s).dialog({
    modal: true,
    width: 1024,
    buttons: [{text:'Run', click: Eval}]
});

// run Business Service
function Eval(){
    var sRes = "";
    var ps = SiebelApp.S_App.NewPropertySet();
    ps.SetProperty("Expr", $('#SiebelEvalScript').val());
    var outputSet = SiebelApp.S_App.GetService("VB Runtime").InvokeMethod("EvalScript", ps);
    if (outputSet.GetProperty("Status") == "Error"){
        sRes = outputSet.GetChildByType("Errors").GetChild(0).GetProperty("ErrMsg");
    }else{
        sRes = outputSet.GetChildByType("ResultSet").GetProperty("Result");
    }
    $('#SiebelEvalScriptOut').text(sRes);
}