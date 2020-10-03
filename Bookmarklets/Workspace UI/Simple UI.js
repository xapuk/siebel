(() => {
    if ("undefined" === typeof SiebelApp) {
        alert("It works only in Siebel OUI session!");
        return;
    }
    const func = "SiebelInspectWS";
    const html = `<div title="Inspect Workspace"><input type="text" id = "${func}" style="width:100%"></div>`;
    const $d = $(html).dialog({
        modal: true,
        width: 640,
        buttons: [{
            text: 'Inspect',
            click: () => {
                const service = SiebelApp.S_App.GetService("FWK Runtime");
                let ps = SiebelApp.S_App.NewPropertySet();
                ps.SetProperty("Name", $('#' + func).val());
                let config = {
                    async: false,
                    cb: function (methodName, inputSet, outputSet) {
                        if (outputSet.GetProperty("Status") == "Error") {
                            sRes = outputSet.GetChildByType("Errors").GetChild(0).GetProperty("ErrMsg");
                        }
                        alert(sRes || "Done!");
                    }
                };
                service.InvokeMethod("InspectWS", ps, config);
            }
        }, {
            text: 'Close (Esc)',
            click: () => $(this).dialog('close')
        }]
    });
})();