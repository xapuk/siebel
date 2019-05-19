/* 
@desc fancy UI wrapper for GetProfileAttr Siebel function
@author VB(xapuk.com)
@version 1.1 2018/06/08
*/
if ("undefined" == typeof SiebelApp) {
    alert("It works only in Siebel OUI session!");
}

// snippet id
var id = "SiebelProfileAttr";

// localStorage to store the history
var aHist = window.localStorage[id] ? JSON.parse(window.localStorage[id]) : [];

// just in case (experimental)
$("#" + id).parent().remove();

// constructing dialog content
var s = '<div title="Get Profile Attribute">';
s += '<input id = "' + id + '" type="text" list="' + id + 'List" style="width:100%" value="' + (aHist.length ? aHist[0] : "") + '">';
s += '<datalist id="' + id + 'List">';
for (var i = 0; i < aHist.length; i++){
    s += '<option>' + aHist[i] + '</option>';
}
s += '</datalist>';
s += '<input id="' + id + 'Out" type ="text" style="display:none">';
s += '<ul></ul></div>';

// open dialog
var $d = $(s).dialog({
    modal: true,
    width: 640,
    open: function() {
        $('#' + id).focus().select(); // autofocus
    },
    close: function() {
        $(this).dialog('destroy').remove();
    },
    buttons: [{
        text: 'Get (Enter)',
        click: go
    }, {
        text: 'Close (Esc)',
        click: function() {
            $(this).dialog('close');
        }
    }]
});

listHistory();

function go() {
    var name = $d.find('#' + id).val();
    if (name) {
        // moving recent query to the top
        if (aHist.indexOf(name) > -1) {
            aHist.splice(aHist.indexOf(name), 1);
        }
        aHist.unshift(name);
        window.localStorage[id] = JSON.stringify(aHist);

        //rerender history
        listHistory();
    }
    return name;
}

// print a list of recent queries
function listHistory() {
    var $ul = $d.find("ul").empty();
    for (var i = 0; i < aHist.length && i < 5; i++) {
        // five recent values
        $ul.append('<li><b>' + aHist[i] + '</b> = <a href="#">' + SiebelApp.S_App.GetProfileAttr(aHist[i]) + '</a></li>');
    }
    // copy value on click
    $d.find("a").click(function(event) {
        var val = $(this).html();
        $("#" + id + "Out").show().val(val).select();
        var r = document.execCommand("copy");
        $("#" + id + "Out").hide();
        if(r){
            $(this).hide().after('<span id="tmp" style="color:red">Copied!</span>');
            setTimeout(function(){
                $d.find("a").show();
                $d.find("#tmp").remove();
            }, 500);
        }
    });
}

// key bindings
$d.keyup(function(event) {
    // enter
    if (event.keyCode === 13) {
        go();
    }
});
