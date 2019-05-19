/* 
@desc bookmarklet UI to deploy Workflows
@author VB(xapuk.com)
@version 1
*/
if ("undefined" == typeof SiebelApp){
    alert("It works only in Siebel OUI session!");
}

// snippet id
var id = "SiebelWFDeploy";

// localStorage to store the history
var aHist = window.localStorage[id]?JSON.parse(window.localStorage[id]):[];

// just in case (experimental)
$("#" + id).parent().remove();

// constructing dialog content
var s = '<div title="Deploy workflow">';
s += '<input id = "' + id + '" type="text" list="' + id + 'List" style="width:100%" value="' + (aHist.length?aHist[0]:"") + '">'; // most recent
s += '<label>Recent tasks:</label><ul>';
for (var i =0; i < aHist.length && i < 5; i++){ // five recent values as links
    s += '<li><a href="#">' + aHist[i] + '</a></li>';
}
s += '</ul></div>';

// open dialog
var $d = $(s).dialog({
    modal: true,
    width: 640,
    open: function() {
        $('#' + id).autocomplete({source: aHist});
        $('#' + id).focus().select(); // autofocus
    },
    close: function() {
        $(this).dialog('destroy').remove();
    },
    buttons: [{
        text: 'Deploy (Enter)',
        click: function(){
            go($d.find('#' + id).val());
        }
    }, {
        text: 'Close (Esc)',
        click: function() {
            $(this).dialog('close');
        }
    }]
});

// Deploy
function go(name) {
    if (name){
        // moving recent view to the top
        if (aHist.indexOf(name) > -1){
           aHist.splice(aHist.indexOf(name),1);
        }
        aHist.unshift(name);
        window.localStorage[id] = JSON.stringify(aHist); 
        $d.dialog('close');

        // invoke BS
        var service = SiebelApp.S_App.GetService("FaCS Utilities Service");
        var ps = SiebelApp.S_App.NewPropertySet();
        ps.SetProperty("SYS_BS", "Workflow Admin Service");
        ps.SetProperty("SYS_Method", "Activate");
        ps.SetProperty("FlowSearchSpec", "[Process Name] = '" + name + "'");
        var outputSet = service.InvokeMethod("RunFromWF", ps);
        if (console){
            console.log(outputSet);
        }
        if (outputSet.GetProperty("Status") == "Error"){
            alert(outputSet.GetChildByType("Errors").GetChild(0).GetProperty("ErrMsg"));    
        }else{
            if (outputSet.GetChildByType("ResultSet").GetProperty("NumFlowActivated") === "0"){
                alert("Process definition [" + name + "] not found");
            }else{
                alert("Done!");
            }
        }
    }
}

// key bindings
$d.keyup(function(event) {
    // enter
    if (event.keyCode === 13) { 
        go($d.find('#' + id).val());
    }
});

// running function on anchor link click
$d.find("a").click(function(event) {
    go($(this).html());
});
