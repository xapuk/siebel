function InspectWS(Inputs, Outputs) {
    var name = Inputs.GetProperty("Name");
    var bo = TheApplication().GetBusObject("Workspace");
    var bc = bo.GetBusComp("Repository Workspace");
    try {
        bc.SetSearchExpr('[Name] = "' + name + '"');
        bc.SetViewMode(AllView);
        bc.ExecuteQuery(ForwardBackward);
        if (bc.FirstRecord()) {
            bc.InvokeMethod("OpenWS");
            bc.InvokeMethod("PreviewWS");
        } else {
            throw "Workspace name not found: " + name;
        }
    } catch (e) {
        throw e;
    } finally {
        bc = null;
        bo = null;
    }
}