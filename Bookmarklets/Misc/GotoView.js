/* 
@desc fancy wrapper for GotoView Siebel function
@author VB(xapuk.com)
@version 1.0 12/06/2018
*/
if ("undefined" == typeof SiebelApp){
    alert("It works only in Siebel OUI session!");
}

// snippet id
var id = "SiebelGotoView";

// localStorage to store the history
var aHist = window.localStorage[id]?JSON.parse(window.localStorage[id]):[];

// just in case (experimental)
$("#" + id).parent().remove();

// constructing dialog content
var s = '<div title="Goto View">';
s += '<input id = "' + id + '" type="text" list="' + id + 'List" style="width:100%" value="' + (aHist.length?aHist[0]:"") + '">'; // most recent
s += '<datalist id="' + id + 'List">';
for (var i =0; i < aHist.length; i++){ // full history into unbounded picklist
    s += '<option>' + aHist[i] + '</option>';
}
s += '</datalist><ul>';
for (var i =0; i < aHist.length && i < 5; i++){ // five recent values as links
    s += '<li><a href="#">' + aHist[i] + '</a></li>';
}
s += '</ul></div>';

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
        text: 'Go (Enter)',
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

// GotoView
function go(name) {
    if (name){
        // moving recent view to the top
        if (aHist.indexOf(name) > -1){
           aHist.splice(aHist.indexOf(name),1);
        }
        aHist.unshift(name);
        window.localStorage[id] = JSON.stringify(aHist); 
        $d.dialog('close');
        SiebelApp.S_App.GotoView(name); //running GotoView command
    }
}

// running GotoView on Enter
$d.keyup(function(event) {
    // enter
    if (event.keyCode === 13) { 
        go($d.find('#' + id).val());
    }
});

// running GotoView on link click
$d.find("a").click(function(event) {
    go($(this).html());
});
