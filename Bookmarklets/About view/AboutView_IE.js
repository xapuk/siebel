/* 
@desc advanced AboutView plugin
@author VB(xapuk.com)
@version 1 2018/07/10 short version to fit into IE boormarklet size limit
*/

var id="SiebelAboutView";

// template
var $d;
var tmp=''+
'<div title="About View" id="<%=id%>">'+
  '<%var v=SiebelApp.S_App.GetActiveView(),am=v.GetAppletMap()%>'+
  '<b>Application:</b> <a><%=SiebelApp.S_App.GetName()%></a><br>'+
  '<b>View:</b> <a><%=v.GetName()%></a><br>'+
  '<b>BusObject:</b> <a><%=SiebelApp.S_App.GetActiveBusObj().GetName()%></a><br>'+
  '<%if(v.GetActiveTask()){%>'+
    '<b>Task:</b> <a><%=v.GetActiveTask()%></a><br>'+
  '<%}%>'+
  '<b>Applets(<%=Object.keys(am).length%>) / BusComps(<%=Object.keys(SiebelApp.S_App.GetActiveBusObj().GetBCMap()).length%>):</b><br>'+
  '<ul style="padding-left:20px">'+
    '<%for(sa in am){var a=am[sa];var bc=a.GetBusComp();var r=bc.GetCurRowNum()<=bc.GetRecordSet().length?bc.GetRecordSet()[bc.GetCurRowNum()-1]:{};var os="SiebelApp.S_App.GetActiveView().GetAppletMap()[\'"+sa+"\']";var $ds=$("#"+a.GetFullId());%>'+
      '<li>'+
        '<a data-target="controls"><b style="<%if($ds.is(":hidden")){%>font-style:italic;<%}if(a===v.GetActiveApplet()){%>text-decoration:underline<%}%>"><%=sa%></b></a> / '+ 
        '<a data-target="fields"><b><%=bc.GetName()%></b></a>'+
        '<ul id="controls" style="display:none">'+
          '<hr>'+
          '<b>Applet:</b> <a><%=a.GetName()%></a><br/>'+
          '<b>BusComp:</b> <a><%=bc.GetName()%></a><br/>'+
          '<b>Mode:</b> <a><%=a.GetMode()%></a><br/>'+
          '<b>Title:</b> <a><%=a.GetAppletLabel()%></a><br/>'+
          '<%var at=a.GetToggleApplet();if(at){%>'+
            '<b>Toggle:</b> <a><%=at%></a><br/>'+
          '<%}%>'+
          '<b>Object Selector:</b> <a><%=os%></a><br>'+
          '<b>DOM Selector:</b> <a>$(\"<%=$ds.selector%>\")</a><br>'+
          '<b>Controls (<%=Object.keys(a.GetControls()).length%>): </b>'+
          '<ul>'+
          '<%for(control in a.GetControls()){var c=a.GetControls()[control];var $cds=$ds.find("[name=\'"+c.GetInputName()+"\']")%>'+
            '<li>'+
              '<a data-target="control"><b style="<%if($cds.is(":hidden")){%>font-style:italic;<%}if(c===a.GetActiveControl()){%>text-decoration:underline<%}%>"><%=c.GetDisplayName()||control%></b></a>'+
              '<ul id="control">'+
                '<hr>'+
                '<%if($cds.is(":visible")&&$cds.is(":focusable")){%>'+
                  '<button data-eval="$(\'<%=$cds.selector%>\').focus()">Focus</button><br>'+
                '<%}%>'+
                '<b>Control:</b> <a><%=control%></a><br>'+
                '<%if(c.GetFieldName()){%>'+
                  '<b>Field:</b> <a><%=c.GetFieldName()%></a><br>'+
                  '<%if(r){%>'+
                    '<b>Value:</b> <a><%=r[c.GetFieldName()]%></a><br>'+
                  '<%}%>'+
                  '<b>Immediate post changes:</b> <a><%=c.IsPostChanges()%></a><br>'+
                '<%}%>'+
                '<b>Type:</b> <a><%=c.GetUIType()%></a> <br>'+ // to decode value trhough SiebelJS.Dependency("SiebelApp.Constants");
                '<b>Input:</b> <a><%=c.GetInputName()%></a><br>'+
                '<b>Object Selector:</b> <a><%=os+".GetControls()[\'"+control+"\']"%></a><br>'+
                '<b>DOM Selector:</b> <a>$(\"<%=$cds.selector%>\")</a><br>'+
                '<%if(c.GetMethodName()){%>'+
                  '<b>Method:</b> <a><%=c.GetMethodName()%></a><br>'+
                '<%}%>'+
                '<%if(c.GetPMPropSet()&&c.GetPMPropSet().propArrayLen > 0){%>'+
                  '<b>User Props (<%=Object.keys(c.GetPMPropSet().propArray).length%>):</b><br>'+
                  '<ul>'+
                    '<%for(p in c.GetPMPropSet().propArray){%>'+
                      '<%if("string"===typeof c.GetPMPropSet().propArray[p]){%>'+
                        '<li><a><%=p%></a>=<a><%=c.GetPMPropSet().propArray[p]%> </a></li>'+
                      '<%}%>'+
                    '<%}%>'+
                  '</ul>'+
                '<%}%>'+
                '<%if(c.GetMethodPropSet()&&c.GetMethodPropSet().propArrayLen > 0){%>'+
                  '<b>Method PS (<%=Object.keys(c.GetMethodPropSet().propArray).length%>):</b>'+
                    '<ul>'+
                      '<%for(p in c.GetMethodPropSet().propArray){%>'+
                        '<%if("string"===typeof c.GetMethodPropSet().propArray[p]){%>'+
                          '<li><a><%=p%></a>=<a><%=c.GetMethodPropSet().propArray[p]%> </a></li>'+
                        '<%}%>'+
                      '<%}%>'+
                    '</ul>'+
                  '<%}%>'+
                '<hr>'+
              '</ul>'+
            '</li>'+
          '<%}%>'+
          '</ul>'+
          '<hr>'+
        '</ul>'+
        '<ul id="fields" style="display:none">'+
          '<hr>'+
          '<b>BusComp:</b> <%=bc.GetName()%><br/>'+
          '<b>Commit pending:</b> <%=bc.commitPending%><br/>'+
          '<b>Fields:</b> <%=Object.keys(bc.GetFieldList()).length%><br/>'+
          '<b>Row:</b> <%=bc.GetCurRowNum()==-1?0:bc.GetCurRowNum()%> of <%=bc.GetNumRows()%><%=bc.IsNumRowsKnown()?"":"+"%><br/>'+
          '<ul>'+
            '<%for(var f in r){%>'+
              '<li><a><%=f%></a>=<a><%=r[f]%></a></li>'+
            '<%}%>'+
          '</ul>'+
          '<hr>'+
        '</ul>'+
      '</li>'+
    '<%}%>'+
'</ul>'+
'</div>';

// to support single session
$("#"+id).parent().remove();

// show the dialog
function AV(){

    var html=new EJS({text: tmp}).render(SiebelApp.S_App);

    $d=$(html).dialog({
        modal: true,
        width: 1024,
        open:function(){
            // hide all expandable ULs by default
            $(this).find("li").find("ul[id]").hide();
            // attempt to copy span content (click)
            $(this).find("a").click(function(){
                copy(this);
            });
            // expand (right click)
            $(this).find("a").contextmenu(function(){
                $(this).siblings("#"+$(this).attr("data-target")).toggle();
                $(this).siblings("ul[id]:not([id='"+$(this).attr("data-target")+"'])").hide();
                return false;
            });
            // focus on control
			$(this).find("button").click(function(){
				var s=$(this).attr("data-eval");
				$d.dialog('close');
				eval(s);
			});
        },
        close: function(){
            $(this).dialog('destroy').remove();
        },
        buttons: [
            {
               text:'Help',
               click: function(){
                   window.open("http://xapuk.com/index.php?topic=80", "_blank");
               }
            },
            {
               text:'Close (esc)',
               click: function() {
		$(this).dialog('close');
               }
            }
        ]
    });
	
	// styling
	$d.css("padding-left","20px").find("ul").css("padding-left","20px");
	$d.find("hr").css("margin","5px");
	$d.find("a").hover(function(e){
		$(this).css({"text-decoration":e.type=="mouseenter"?"underline":"none"});
	});
}

// copy value
function copy(s){
	// replacing link with intput and select the value
	var v=$(s).text();
    $(s).hide().after("<input id='"+id+"i'>");
    $d.find("#"+id+"i").val(v).select();
    // attempt to copy value
    if (document.execCommand("copy")){
    	// if copied, display a message for a second
        $d.find("#"+id+"i").attr("disabled","disabled").css("color","red").val("Copied!");
        setTimeout(function(){
        	$d.find("#"+id+"i").remove();
        	$(s).show();
        }, 700);
    }else{
    	// if failed to copy, leave input until blur, so it can be copied manually
		$d.find("#"+id+"i").blur(function(){
			$(this).remove();
			$d.find("a").show();
		});    	
    }
}

if ("undefined"===typeof SiebelApp){
	alert("It works only in Siebel OUI session!");
}else if ("undefined"===typeof EJS){
	requirejs(["3rdParty/ejs/ejs_production"], AV, function(){alert("Failed to load EJS");});
}else{
    AV();
}