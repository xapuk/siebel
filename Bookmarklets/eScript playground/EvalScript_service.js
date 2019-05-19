function Service_PreInvokeMethod (MethodName, Inputs, Outputs) {
	if (MethodName == “EvalScript”){
		try {
			Outputs.SetProperty(“Result”, eval(Inputs.GetProperty(“Expr”)));
		} catch(e) {
			Outputs.SetProperty(“Result”, e.toString());
		}
	}
	return (CancelOperation);
}