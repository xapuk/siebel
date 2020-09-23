var sExpr = 'TheApplication().ActiveBusObject().GetBusComp("' + SiebelApp.S_App.GetActiveView().GetActiveApplet().GetBusComp().GetName() + '").InvokeMethod("ClearLOVCache");';

var service = SiebelApp.S_App.GetService("FaCS Utilities Service");
var ps = SiebelApp.S_App.NewPropertySet();
ps.SetProperty("SYS_BS", "FWK Runtime");
ps.SetProperty("SYS_Method", "EvalScript");
ps.SetProperty("Expr", sExpr);
var outputSet = service.InvokeMethod("RunFromWF", ps);
if (outputSet.GetProperty("Status") == "Error") {
    alert(outputSet.GetChildByType("Errors").GetChild(0).GetProperty("ErrMsg"));
} else {
    alert("Done!");
}