/* 
@desc Keeps Siebel session alive for a certain amount of time
@author VB(xapuk.com)
@version 2.0 2018/07/20
*/


if ("undefined" == typeof SiebelApp){
    alert("It works only in Siebel OUI session!");
}else{
	if ("undefined" === typeof window.timerId){
		keepAlive(4); // number of hours you want Siebel to live
	}else{
        keepAlive_stop();
	}
}

function keepAlive(iHour, iNum)
{
	var iStep = 60; // frequency in secs
	iNum = iNum>0?iNum:0;
	if (console) console.log("keep alive / " + iNum + " / " + (new Date()));
	if (iHour*60*60 > iNum*iStep){
	    if($("#SiebelKeepAlive").length === 0){
	        $("body").append("<div id='SiebelKeepAlive' style='position:fixed;top:5px;left:5px;background-color:#ff5e00;border:solid 2px;border-radius:5px;padding:5px'><b>KA</b></div>");
	    }else{
	        $("#SiebelKeepAlive").fadeTo(100, 1);
	    }
	    $("#SiebelKeepAlive").fadeTo(iStep * 900, 0.2);
		window.timerId = setTimeout(function(){
			if (typeof(SiebelApp.S_App.GetProfileAttr("ActiveViewName")) != "undefined"){
				keepAlive(iHour, ++iNum);
			}
		}, iStep * 1000);
	}else{
		keepAlive_stop();
	}
}

function keepAlive_stop(){
    clearTimeout(window.timerId);
    delete window.timerId;
    $("#SiebelKeepAlive").remove();
    console.log("keep alive time stopped");
}
