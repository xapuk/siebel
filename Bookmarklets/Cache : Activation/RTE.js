/* 
@desc Reloads Runtime Events
@author VB(xapuk.com)
@version 1 2019/04/20
*/
if("undefined" === typeof SiebelApp){
    alert("Please, log into Siebel application first!");
}else{
    var v = SiebelApp.S_App.GetActiveView();
    var ap = v.GetActiveApplet();
    if ("undefined" === typeof ap) {
        ap = v.GetAppletMap()[Object.keys(v.GetAppletMap())[0]];
    }
    if ("undefined" === typeof ap) {
        alert("No applet found!");
    } else {
        ap.InvokeMethod("ClearCTEventCache", null, {
            "cb": function(e) {
                alert("Runtime Events were reloaded!");
            },
            "errcb": function(e) {
                console.log("Err", e);
                alert(e.toString());
            }
        });
    }
}
