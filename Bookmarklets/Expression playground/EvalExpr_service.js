function Service_usPreInvokeMethod (MethodName, Inputs, Outputs) {
    if(MethodName == "EvalExpr"){
        var bc;
        try {
            bc = TheApplication().ActiveBusObject().GetBusComp(Inputs.GetProperty("BC"));
            Outputs.SetProperty("Result", bc.InvokeMethod("EvalExpr", Inputs.GetProperty("Expr")));
        } catch(e) {
            Outputs.SetProperty("Result", e.toString());
        } finally {
            bc = null;
        }
    }
    return CancelOperation;
}