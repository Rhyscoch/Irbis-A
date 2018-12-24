var firstOnload = false;
var first_getConnect = false;
var connect_status=0;

var m_obj_statusData;
var m_editingNewSSID=false;
var page_redect= "index.html#statusPage";

var m_UartConfigString="19200,8,N,1";
var m_firmware_update_hide=false;

function    HTMLEnCode(str)
{
     var    s    =    "";
     if    (str.length    ==    0)    return    "";
     s    =    str.replace(/&/g,    "&gt;");
     s    =    s.replace(/</g,        "&lt;");
     s    =    s.replace(/>/g,        "&gt;");
     s    =    s.replace(/    /g,        "&nbsp;");
     s    =    s.replace(/\'/g,      "'");
     s    =    s.replace(/\"/g,      "&quot;");
     s    =    s.replace(/\n/g,      "<br>");
     return    s;
}

window.onload = function(){
	window.islogin = false;
	window.init18n = false;
	window.langindex = "en_us";
	var elem=document.getElementById("uartPage");
	if(elem)
	{
		page_redect = "mobile-index.html#statusPage";
	}
	initI18N(window.langindex);
//	onUartLoad();
	onStatusLoad();
	onSystemLoad();
	onNetworkLoad1();
};
var userUri = "/cgi-bin/user.cgi";

var orignalvalue_save = {
	"network_Security":"none",
	"network_password":"none",
	"network_apbridge":"none"
};
var wifiLoaded = false;
var sliderloader =false;
var versioncheck = false;


var Toast = function(config){
    this.context = config.context==null?$('body'):config.context;//上下撿
    this.message = config.message;//显示内容
    this.time = config.time==null?3000:config.time;//持续时间
    this.left = config.left;//距容器左边的距离
    this.top = config.top;//距容器上方的距离
    this.init();
}
var msgEntity;
Toast.prototype = {
    //初始化显示的位置内容穿
    init : function(){
        $("#toastMessage").remove();
        //设置消息乿
        var msgDIV = new Array();
        msgDIV.push('<div id="toastMessage">');
        msgDIV.push('<span>'+this.message+'</span>');
        msgDIV.push('</div>');
        msgEntity = $(msgDIV.join('')).appendTo(this.context);
        //设置消息样式
        var left = this.left == null ? this.context.width()/2-msgEntity.find('span').width()/2-10 : this.left;
//        var top = this.top == null ? '20px' : this.top;
        var top = this.top == null ? this.context.height()/2-msgEntity.find('span').height()/2-10 : this.top;
        msgEntity.css({position:'absolute','border-radius':'15px',top:top,'z-index':'99',left:left,'background-color':'black',color:'white','font-family':'Helvetica,Arial,sans-serif','font-size':'26px','padding':'10px','margin':'10px'});
        left = this.left == null ? this.context.width()/2-msgEntity.find('span').width()/2 : this.left;
        top = this.top == null ? this.context.height()/2-msgEntity.find('span').height()/2 : this.top;
        msgEntity.css({position:'absolute','border-radius':'15px',top:top,'z-index':'99',left:left,'background-color':'black',color:'white','font-family':'Helvetica,Arial,sans-serif','font-size':'26px','padding':'10px','margin':'10px'});
        msgEntity.hide();
    },
    //显示动画
    show :function(){
        msgEntity.fadeIn(this.time/2);
        msgEntity.fadeOut(this.time/2);
    }

}

function  trim(str){
    for(var  i  =  0  ;  i<str.length  &&  str.charAt(i)=="  "  ;  i++  )  ;
    for(var  j  =str.length;  j>0  &&  str.charAt(j-1)=="  "  ;  j--)  ;
    if(i>j)  return  "";
    return  str.substring(i,j);
}

function onSetUartConfig()
{
	var str;
	str = $("#baudrateSelect").val();
	str += ",";
	str += $("#databitsSelect").val();
	str += ",";
	str += $("#paritySelect").val();
	str += ",";
	str += $("#stopbitsSelect").val();

	m_UartConfigString = str;

	sendCommand("setUartCmd:"+str, null);

	new Toast({context:$('body'),message:i18n_alert[window.langindex]["uart.please_wait"]}).show();

}


function onGetUartConfig(req)
{
	if(req == "")
	{
	}
	else
	{
		m_UartConfigString = req.responseText;
		arr = m_UartConfigString.split(",");
 		// $("#baudrateSelect").empty();
		// $("#baudrateSelect").append("<option value='300'>300</option>");
		// $("#baudrateSelect").append("<option value='600'>600</option>");
		// $("#baudrateSelect").append("<option value='1200'>1200</option>");
		// $("#baudrateSelect").append("<option value='1800'>1800</option>");
		// $("#baudrateSelect").append("<option value='2400'>2400</option>");
		// $("#baudrateSelect").append("<option value='4800'>4800</option>");
		// $("#baudrateSelect").append("<option value='9600'>9600</option>");
		// $("#baudrateSelect").append("<option value='19200'>19200</option>");
		// $("#baudrateSelect").append("<option value='38400'>38400</option>");
		$("#baudrateSelect").val(trim(arr[0]));
		$( "#baudrateSelect" ).selectmenu().selectmenu( "refresh" );
		$("#databitsSelect").val(trim(arr[1]));
		$( "#databitsSelect" ).selectmenu().selectmenu( "refresh" );
		$("#paritySelect").val(trim(arr[2]));
		$( "#paritySelect" ).selectmenu().selectmenu( "refresh" );
		$("#stopbitsSelect").val(trim(arr[3]));
		$( "#stopbitsSelect" ).selectmenu().selectmenu( "refresh" );
	}

}

function onUartLoad()
{
	sendCommand("getUartCmd", onGetUartConfig);
}

function CheckString(str)
{
    for(var  i=0  ;  i<str.length;  i++  )
   	{
   		 if( (str.charCodeAt(i)== 34) || (str.charCodeAt(i) == 39) || (str.charCodeAt(i) == 44)
   		 	|| (str.charCodeAt(i)== 60) || (str.charCodeAt(i)== 62) || (str.charCodeAt(i)== 92) )
   		 {
   		 	//alert("Input error, unsupport character");
		 	alert(i18n_alert[window.langindex]["system.char_unsupport"]);
   		 	return "false";
   		 }
    }
    return "true";
}

function OnWifiLoad(){

	var func = function(){
	//document.getElementById("networkState_ssid").innerHTML=i18n_alert[window.langindex]["network.dlg.connect.getting"];
	//	getWifiConnectAP();
	  $.mobile.loading('show'); 
		sendCommand("wlanGetApListEx", showWiFiList);
	window.location.href = "#wifipage";
	};
	func();

	wifiLoaded = true;
}

function OnWifiLoad1(){

	var func = function(){
	//document.getElementById("networkState_ssid").innerHTML=i18n_alert[window.langindex]["network.dlg.connect.getting"];
	//	getWifiConnectAP();
	 // $.mobile.loading('show'); 
		sendCommand("wlanGetApListEx", showWiFiList);
	};
	func();

	wifiLoaded = true;
}


function onSetNewSSID()
{
	var ssid=$("#textNewSSID").val();
	if(ssid == null || ssid == "")
	{
		 	alert(i18n_alert[window.langindex]["NewSSID.notify.null"]);
	}
	else if(ssid.length > 31)
  	{
  		alert(i18n_alert[window.langindex]["NewSSID.notify.more"]);
  	}
	else if(CheckString(ssid) == "false")
  	{
  	}
  	else
  	{
		setTimeout(onShowChangedSSID, 500);
		sendCommand("setSSID:"+ssid, null);
  	}
}

function onShowChangedSSID()
{
	var elem=document.getElementById("alert_network");
    elem.innerHTML=i18n_alert[window.langindex]["wifi_ssid.notify"];
	var OpenPopup=function(){
		$('#popupDialog_network').popup('open');
	}
	OpenPopup();
}

function onChangeLanguage()
{
	var language=$("#languageSelect").val();
	if(language=="en_us")
	{
		window.langindex = "en_us";
		//initI18N(window.langindex);
	}
	else if(language=="zh_cn")
	{
		window.langindex = "zh_cn";
		//initI18N(window.langindex);
	}else if(language=="Ger_de")
	{
		window.langindex = "Deuts_ch";
		//initI18N(window.langindex);
	}else if(language=="spanish")
	{
		window.langindex = "spanish";
		//initI18N(window.langindex);
	}else if(language=="french")
	{
		window.langindex = "french";
		//initI18N(window.langindex);
	}else if(language=="italian")
	{
		window.langindex = "italian";
		//initI18N(window.langindex);
	}
}

function a2hex(str) {
  var arr = [];
  for (var i = 0, l = str.length; i < l; i ++) {
    var hex = Number(str.charCodeAt(i)).toString(16);
    arr.push(hex);
  }
  return arr.join('');
}
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function onStatusLoad () {
	var func = function(){
		$.ajaxSetup({ cache: false });
		$.getJSON("httpapi.asp?command=getStatusEx", function(json){
			//isTimeout = 0;
			//isRefreshing=0;
			//alert(json);
			//document.getElementById("languageProperty").innerHTML = extra[document.getElementById("languageProperty").getAttribute("index")]
			//	.prop;
			m_obj_statusData = json;
			var language = json.language;
			if(json.language == "zh_cn")
					language = "中文";
			else if(json.language == "Ger_de")
				  language = "Deutsch";
		  else if(json.language == "spanish")
				  language = "Español";
		  else if(json.language == "french")
				  language = "Français";
		  else if(json.language == "italian")
				  language = "Italiano";

			if(json.web_firmware_update_hide == "1")
			{
				m_firmware_update_hide = true;
					document.getElementById("firmware.update.div").style.display="none";
			}

			document.getElementById("languageValue").innerHTML = language;
			document.getElementById("SSIDValue").innerHTML = json.ssid;
			document.getElementById("deviceNameValue").innerHTML = HTMLEnCode(json.DeviceName);
			document.getElementById("firmVersionValue").innerHTML = json.build + " " + json.firmware + "." + json.mcu_ver;
			document.getElementById("ReleaseDateValue").innerHTML = json.Release;
			document.getElementById("UUIDValue").innerHTML = json.uuid.toUpperCase();
			document.getElementById("Apcli0Value").innerHTML = json.apcli0;
			document.getElementById("Eth2Value").innerHTML = json.eth2;
			document.getElementById("ASRDSPVersionValue").innerHTML = json.dsp_ver;
			document.getElementById("ConfigMD5Value").innerHTML = json.conmd5;
			//if(window.location.href.indexOf("statusPage")>=0)
			//{
			//	$("#textNewSSID").val(json.ssid);
			//}


			if(json.language == "zh_cn"){
				window.langindex = "zh_cn";
			}
			else if(json.language == "en_us"){
				window.langindex = "en_us";
			}	else if(json.language == "Ger_de")
			{
				window.langindex = "Deuts_ch";
			}	else if(json.language == "spanish")
			{
				window.langindex = "spanish";
			}else if(json.language == "french")
			{
				window.langindex = "french";
			}else if(json.language == "italian")
			{
				window.langindex = "italian";
			}
			else{
				window.langindex = "en_us";
			}
			$("#languageSelect").val(json.language);
			if(window.init18n == false){
				initI18N(window.langindex);
				window.init18n = true;
			}

			if(json.VersionUpdate == "1")
			{
				 	 var elem=document.getElementById("firmware_update_status");
		 			elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.confirm.a"] + " " + json.NewVer + "." + json.mcu_ver_new;
			}

			var myselect_old = $("#languageSelect");
			myselect_old.selectmenu().selectmenu('refresh');
		 // document.getElementById("Refreshwifi").title=i18n[window.langindex]["network.refresh"];
			if(!firstOnload)
			{
				firstOnload = true;
				getWifiConnectAP();
				var tmp = function(){
					if(first_getConnect == false){
						setTimeout(tmp, 250);
					}else{
						if(!connect_status)
						{
							OnWifiLoad()
						}else
						{
							window.location.href = page_redect;
						//	onSystemPageActive();
    				       setTimeout(function(){
								OnWifiLoad1();
							}, 1000);
						}
					}
				};
				tmp();
			}
		});

	};

	//$(".statusLink").bind("click", function(){
	//	func();
	//});
	document.getElementById("Refreshwifi").onclick = function(){
	  $.mobile.loading('show');
	  sendCommand("wlanGetApListEx", showWiFiList);
	};

	func();

}

function onSystemLoad(){

	document.getElementById("RestoreDefaultSetting").onclick = function(){
				var OpenPopup=function(){
					 $('#popupDialog_restore').popup('open');
				}
			OpenPopup();
	};

	document.getElementById("status_restore").onclick = function(){
		sendCommand("restoreToDefault", funRestoreToDefaultReturn);


	};

	//document.getElementById("check_online_update").onclick = function(){
	//	funStartCheckRemoteUpdate();
	//};

	document.getElementById("online_update").onclick = function(){

		funStartRemoteUpdate();
	};
  if(m_firmware_update_hide)
  {
  		document.getElementById("firmware.update.div").style.display="none";
  }
	//$("#div_online_update").hide();
	//$("#div_check_online_update").show();
	//initI18N(window.langindex);

	document.getElementById("system_save").onclick = function(){
		sendCommand("setLanguage:"+document.getElementById("languageSelect").value, null);

		setTimeout(function(){
			window.location.href = "#wifipage";
			window.location.reload();
		}, 1000);
	};

}

function deviceFriendlyNameFetchedListener(src, eventObj, extra){
	var input = document.getElementById("deviceNameInput");
	input.value = extra[parseInt(input.getAttribute("index"))].value;
	//device_save_last["deivce_name"]=input.value;
	var span = document.getElementById("deviceNameSpan");
	span.innerHTML = extra[parseInt(input.getAttribute("index"))].prop;
}


function onChangeSecuritySelect()
{
	if($("#wirelessSecuritySelect").val() == "open")
	{
		$( "#wirelessPasswordInputInput" ).textinput( "disable" );
	}
	else
	{
		$( "#wirelessPasswordInputInput" ).textinput( "enable" );
	}
}


function onNetworkLoad1()
{
		document.getElementById("wirelessPasswordInputInput").disabled = true;

		document.getElementById("change_ssid").onclick = function()
		{
					var OpenPopup=function(){
					    $('#popupDialog_changessid').popup('open');
					}
					OpenPopup();
		};

		$.getJSON("httpapi.asp?command=getNetwork", function(json){


			if(json.securemode == "0")
			{
				document.getElementById("wirelessSecuritySelect").value = "open";
				//$("#divwirelessPasswordInput").hide();
				document.getElementById("wirelessPasswordInputInput").disabled = true;
			}
			else
			{
				document.getElementById("wirelessSecuritySelect").value = "wpapsk";
				//$("#divwirelessPasswordInput").show();
				document.getElementById("wirelessPasswordInputInput").disabled = false;
			}

			document.getElementById("wirelessPasswordInputInput").value = json.psk;
		});

	document.getElementById("network_save").onclick = function(){
		if(document.getElementById("wirelessSecuritySelect").value == "open"){

			var cmd = "setNetworkEx:0: ";
			sendCommand(cmd, null);
			var elem=document.getElementById("alert_network");
		    elem.innerHTML=i18n_alert[window.langindex]["wifi_encrypt.notify"];
			//alert(i18n_alert[window.langindex]["wifi_encrypt.notify"]);
			var OpenPopup=function(){
				$('#popupDialog_network').popup('open');
			}
			OpenPopup();
		}
		else{

			var password = document.getElementById("wirelessPasswordInputInput").value;

				if(password.length > 16 || password.length < 8 ){
					var elem=document.getElementById("alert_network");
				   elem.innerHTML=i18n_alert[window.langindex]["wifi_encrypt.password_length"];
					var OpenPopup=function(){
						$('#popupDialog_network').popup('open');
					}
					 OpenPopup();
					 return;
				}
			//	else if( CheckString(password) == "false")
			//	{
			//	}
				else
				{
					var cmd = "setNetworkEx:1:"+a2hex(password);
					sendCommand(cmd, null);
					var elem=document.getElementById("alert_network");
				    elem.innerHTML=i18n_alert[window.langindex]["wifi_encrypt.notify"];
					var OpenPopup=function(){
						$('#popupDialog_network').popup('open');
					}
					OpenPopup();
				}
			}



	};

}

function onNetworkLoad(){
	$(".networkLink").bind("click", function(){
		CommandSupport.sendCommand(eventSrc, CommandStrings.GetVirtualAPControl);
		CommandSupport.sendCommand(eventSrc, CommandStrings.GetNetWorkControl);
	});

	document.getElementById("network_save").onclick = function(){
		if(document.getElementById("wirelessSecuritySelect").value == "[NETWL_SEC_OPEN]"){
			if(orignalvalue_save["network_Security"] != "[NETWL_SEC_OPEN]")
			{
				CommandSupport.sendCommand(eventSrc, CommandStrings.SetVirtualAPSetup + document.getElementById("wirelessSecuritySelect").value);
				orignalvalue_save["network_Security"] = "[NETWL_SEC_OPEN]";
				var elem=document.getElementById("alert_network");
			    elem.innerHTML=i18n_alert[window.langindex]["wifi_encrypt.notify"];
				//alert(i18n_alert[window.langindex]["wifi_encrypt.notify"]);
				var OpenPopup=function(){
					$('#popupDialog_network').popup('open');
				}
				OpenPopup();
			}
		}
		else{

			if(orignalvalue_save["network_password"] == "true")
			{
				orignalvalue_save["network_password"] = "false";
				var password = document.getElementById("wirelessPasswordInput").value;
				if(password == ""){
				//	alert(i18n_alert[window.langindex]["wifi_encrypt.password_no"]);
					var elem=document.getElementById("alert_network");
				    elem.innerHTML=i18n_alert[window.langindex]["wifi_encrypt.password_no"];
					var OpenPopup=function(){
						$('#popupDialog_network').popup('open');
					}
					OpenPopup();
					return;
				}
				else if(password.length < 8 && password.length > 32){
				//	alert(i18n_alert[window.langindex]["wifi_encrypt.password_length"]);
					var elem=document.getElementById("alert_network");
				    elem.innerHTML=i18n_alert[window.langindex]["wifi_encrypt.password_length"];
					var OpenPopup=function(){
						$('#popupDialog_network').popup('open');
					}
					OpenPopup();
					return;
				}else
				{
					CommandSupport.sendCommand(eventSrc, CommandStrings.SetVirtualAPSetup + document.getElementById("wirelessSecuritySelect").value + "+" + password);
					//alert(i18n_alert[window.langindex]["wifi_encrypt.notify"]);
					var elem=document.getElementById("alert_network");
				    elem.innerHTML=i18n_alert[window.langindex]["wifi_encrypt.notify"];
					var OpenPopup=function(){
						$('#popupDialog_network').popup('open');
					}
					OpenPopup();
				}
			}
		}

		if(orignalvalue_save["network_apbridge"] != document.getElementById("virtualApBridgeSelect").value)
		{
			CommandSupport.sendCommand(eventSrc, CommandStrings.SetVirtualAPBridge + document.getElementById("virtualApBridgeSelect").value);
			orignalvalue_save["network_apbridge"] = document.getElementById("virtualApBridgeSelect").value;
			var elem=document.getElementById("alert_network");
			 elem.innerHTML=i18n_alert[window.langindex]["wifi_apbridge.notify"];
			var OpenPopup=function(){
				$('#popupDialog_network').popup('open');
			}
					OpenPopup();
			//alert(i18n_alert[window.langindex]["wifi_apbridge.notify"]);
		}
	};

	document.getElementById("network_reset").onclick = function(){
		CommandSupport.sendCommand(eventSrc, CommandStrings.GetVirtualAPControl);
		CommandSupport.sendCommand(eventSrc, CommandStrings.GetNetWorkControl);

	};

}


var m_SavedWifiConnCounter1=0;

function getWifiConnectStatus(a,wifistate)
{
	if(wifistate == "FAIL"){

	  m_SavedWifiConnCounter1++;

	  if(m_SavedWifiConnCounter1>=10)
	  {
		  sendCommand("wlanStopConnect", function(req){
			 // alert("connecting wlan failed");
			 a.style.backgroundImage="";
			 document.getElementById("networkState_change").innerHTML=i18n_alert[window.langindex]["wifi_connect.password_empty"];
			 getWifiConnectAP();
		  });
	  }
	  else
	  {
       setTimeout(function(){
			getWifiConnectStatus(a,wifistate);
		}, 1000);
	  }

	  return;
	}
	else if(wifistate == "PAIRFAIL")
	{
		a.style.backgroundImage="";
		document.getElementById("wirelessPasswordInputInput").value = "";
		document.getElementById("networkState_change").innerHTML=i18n_alert[window.langindex]["network.dlg.disconnect"];
		var elem=document.getElementById("alert_wifi");
		elem.innerHTML=i18n_alert[window.langindex]["wifi_connect.password_wrong"];
		var OpenPopup=function(){
			$('#popupDialog_wifi_alert').popup('open');
		}
		OpenPopup();
		return;
	}

	m_SavedWifiConnCounter1=0;

	if(wifistate != "OK") {
		if(wifistate == "START")
		{
			document.getElementById("networkState_change").innerHTML=i18n_alert[window.langindex]["network.dlg.start"];
		}else if(wifistate == "PROCESS")
		{
			document.getElementById("networkState_change").innerHTML=i18n_alert[window.langindex]["network.dlg.process"];
		}

       	  sendCommand('wlanGetConnectState', function(req){
    	   wifistate = req.responseText;//req.responseText.split(":")[2].substring(0, req.responseText.split(":")[2].length-2);
       });
       setTimeout(function(){
			getWifiConnectStatus(a,wifistate);
		}, 1000);
       return;
	}


	if(wifistate == "OK"){
		  //  sendCommand('wlanGetConnectInfo', function(req){
		//	alert("wlan connected");
		//	document.getElementById("networkState_change").innerHTML="wlan connected";
		//});
		a.style.backgroundImage="";
			getWifiConnectAP();
		return;
	}
}
function onAPConnected(req){
	//alert("start connecting ...");
	document.getElementById("networkState_ssid").innerHTML="";
	document.getElementById("networkState_change").innerHTML=i18n_alert[window.langindex]["network.dlg.disconnect"];
	var elem=document.getElementById("alert_wifi");
	elem.innerHTML=i18n_alert[window.langindex]["wifi_connect.notify"];
	//alert(i18n_alert[window.langindex]["wifi_encrypt.notify"]);
	var OpenPopup=function(){
		$('#popupDialog_wifi_alert').popup('open');
	}
	OpenPopup();
}

function connectToAP(a){

	 var myElement = document.getElementById("wifilist_passwordSpan");
	if(myElement)
	  	myElement.parentNode.removeChild(myElement);

					//alert(a.wifi.level + " : " + a.wifi.secur);

//	if(a.wifi.bssid.substring(0,8)=="00:22:6c")
//	{
//		var elem=document.getElementById("alert_wifi");
//		elem.innerHTML=i18n_alert[window.langindex]["wifi_connect.no_cascade"];
//		var OpenPopup=function(){
//			$('#popupDialog_wifi_alert').popup('open');
//		}
//		OpenPopup();
//	}
//	else
//	{
		if(!(a.wifi.level == "OPEN")){
		/*
			var span = document.createElement("span");
			var Str="";
			//Str+= "<span id=wifilist_passwordSpan style=display:none>";
			Str+= "<input id=wiFiPwd type=password size=width:50px style=width:30%;height:24px;font-size:16px>";
			Str+= "<input id=wiFiBtn type=button style=height:24px;font-size:16px value=";
			Str+= i18n[window.langindex]["network.connect"]
			Str+= ">";
			//Str+= "</span>";
			span.innerHTML=Str;
			span.style.display = "inline";
			span.setAttribute("id","wifilist_passwordSpan");
			a.parentNode.appendChild(span);
		*/
			var OpenPopup=function(){
				$('#popupDialog_wifi').popup('open');
			}
			OpenPopup();
			document.getElementById("wiFiBtn").onclick = function(){
				var pwd = document.getElementById("wiFiPwd").value;
				if(pwd == null || pwd == ""){
					alert(i18n_alert[window.langindex]["wifi_connect.password_empty"]);
				}
				else{
					a.style.backgroundImage="url(style/image/jindu.gif)";
					a.style.backgroundRepeat="no-repeat";
					a.style.backgroundPosition="center";

					var hex_pwd = a2hex(pwd);

					//var cmd = "wlanConnectAp:" + a.wifi.ssid + ":" + a.wifi.channel + ":" + a.wifi.auth + ":" + a.wifi.encry+":"+pwd+":"+a.wifi.extch;
					var cmd = "wlanConnectApEx:ssid=" + a.wifi.ssid + ":ch=" + a.wifi.channel + ":auth=" + a.wifi.auth + ":encry=" + a.wifi.encry+":pwd="+hex_pwd+":chext="+a.wifi.extch;
					sendCommand(cmd, onAPConnected);
					var wifistate = "NONE";
					getWifiConnectStatus(a,wifistate);
					document.getElementById("wiFiPwd").value = "";
					document.getElementById("wiFiBtn").onclick = null;
				}
			};

		}
		else{
			a.style.backgroundImage="url(style/image/jindu.gif)";
			a.style.backgroundRepeat="no-repeat";
			a.style.backgroundPosition="center";
			//var cmd = "wlanConnectAp:" + a.wifi.ssid + ":" + a.wifi.channel + ":" + a.wifi.auth + ":" + a.wifi.encry+":"+"NONE"+":"+a.wifi.extch;
			var cmd = "wlanConnectApEx:ssid=" + a.wifi.ssid + ":ch=" + a.wifi.channel + ":auth=" + a.wifi.auth + ":encry=" + a.wifi.encry+":pwd="+""+":chext="+a.wifi.extch;
			sendCommand(cmd, onAPConnected);
			var wifistate = "NONE";
			getWifiConnectStatus(a,wifistate);
		}

//	}

}
function showWiFiList(req){
	//document.getElementById("networkContentDiv").innerHTML = "";
  $.mobile.loading('hide'); 
	var resp = req.responseText;
	if(resp == "")
		return;
	var dataObj=eval("("+resp+")");
	var i;
	var index=1;
	for(i=1;i<=32;i++)
	{
		document.getElementById("wifi_pa"+i.toString()).style.display="none";
	}
	
	for(i=0;i<dataObj.aplist.length;i++)
	{
				var a = document.getElementById("wifi"+index.toString());
				if(a != null)
				{
					var wifi = new Object;
					wifi.ssid = dataObj.aplist[i].ssid;
					wifi.level = dataObj.aplist[i].auth;
					wifi.secur = dataObj.aplist[i].encry;
					wifi.value = dataObj.aplist[i].rssi;
					wifi.auth =  dataObj.aplist[i].auth;
					wifi.encry = dataObj.aplist[i].encry;
					wifi.channel = dataObj.aplist[i].channel;
					wifi.bssid = dataObj.aplist[i].bssid;
					wifi.extch = dataObj.aplist[i].extch;
					a.wifi = wifi;
					a.onclick = function(){
						connectToAP(this);
					};
					document.getElementById("wifi_pa"+index.toString()).style.display="block";

					var id = document.getElementById("wifi_ssid"+index.toString());

					id.innerHTML= HTMLEnCode(hex2a(dataObj.aplist[i].ssid));
					var s = document.getElementById("wifi_sign"+index.toString());

					var pox=0;
					//alert(wifi.level + " : " + wifi.secur);
					if(wifi.level == "OPEN")
						;
					else
						pox=pox+225;

					var level=parseInt(wifi.value);
				   if(level<30)
				       pox+=45;
				   else if(level<50)
				        pox+=45*2;
				   else if(level<70)
				        pox+=45*3;
				   else if(level<90)
				       pox+=45*4;
				   else
				   		pox+=45*4;

					s.style.backgroundPosition="-"+pox.toString()+"px 0px";
					index++;
				}
	}

}
function my_sleep(numberMillis) {
	var now = new Date();
	var exitTime = now.getTime() + numberMillis;
	while (true) {
		now = new Date();
	if (now.getTime() > exitTime)
		return;
}}
function getWifiConnectAP()
{
	sendCommand("GetCurrentWirelessConnectEx", function(req){
		first_getConnect = true;
		 var ssid=req.responseText.split(":")[1];
		 if(ssid != "NULL")
		 {
			document.getElementById("networkState_ssid").innerHTML=HTMLEnCode(hex2a(ssid));
			var connect=req.responseText.split(":")[2];
			if(connect == 1)
			{
				connect_status=1;
				document.getElementById("networkState_change").innerHTML=i18n_alert[window.langindex]["network.dlg.connect"];
			}else
			{
				connect_status=0;
				document.getElementById("networkState_change").innerHTML=i18n_alert[window.langindex]["network.dlg.disconnect"];
			}
			//document.getElementById("networkState_change").innerHTML=connect;
		 }else
		 {
		 	connect_status = 0;
			document.getElementById("networkState_ssid").innerHTML="";
			document.getElementById("networkState_change").innerHTML=i18n_alert[window.langindex]["network.dlg.disconnect"];
		 }

	});

	return connect_status;
}

function handleCommand(command_xmlhttp, callback)
{
  if(command_xmlhttp.readyState==4)
    {
      if(command_xmlhttp.status == 200){
    	//showDiscription(command_xmlhttp.responseText);
    	//alert(command_xmlhttp.responseText);
    	if(callback == null)
    		return;
		callback(command_xmlhttp);
     }
  }
}

function sendCommand(command, callback)
{

	//alert(command);
    var command_xmlhttp = GetXmlHttpObject();
    command_xmlhttp.onreadystatechange = function(){
    	handleCommand(command_xmlhttp, callback);
    };
    //command = command.replace(/\+/g, "%2B");
    //var url="ajax.do?command=" + command;
//    var url="/cgi-bin/web.cgi?command=" + command;
    var url="httpapi.asp?command=" + command;

   // var url="httpapi.asp";

    command_xmlhttp.open("GET", url ,true);
 //   command_xmlhttp.open("POST", url ,true);
    command_xmlhttp.setRequestHeader("If-Modified-Since","0");
    command_xmlhttp.setRequestHeader("Cache-Control","no-cache");
    command_xmlhttp.setRequestHeader("CONTENT-TYPE","application/x-www-form-urlencoded");

    command_xmlhttp.send(null);
 //   command_xmlhttp.send("command="+command);
}


function sendCommandRemoveControl(command)
{

	//alert(command);
    var command_xmlhttp = GetXmlHttpObject();
    command_xmlhttp.onreadystatechange = function(){
    	handleCommand(command_xmlhttp, null);
    };
    //command = command.replace(/\+/g, "%2B");
    //var url="ajax.do?command=" + command;
    var url="/cgi-bin/IpodCGI.cgi?id=0&command=" + command;
    command_xmlhttp.open("GET", url ,true);
    command_xmlhttp.setRequestHeader("If-Modified-Since","0");
    command_xmlhttp.setRequestHeader("Cache-Control","no-cache");
    command_xmlhttp.send(null);
}

var firmware_upload_timer;
function initUploadFrame(){
	var iframe = document.getElementById("uploadFrame");
	if (iframe.attachEvent) {
		iframe.attachEvent("onload", function() {
			onFirmFileUploaded(iframe);
		});
	} else {
		iframe.onload = function() {
			onFirmFileUploaded(iframe);
		};
	}
}

function onFirmFileUploaded(iframe){
	clearTimeout(firmware_upload_timer);
	var elem=document.getElementById("firmware_upload_percent");
	elem.innerHTML = "100%";
	document.getElementById("firm_update_show_bar").style.width="100%";

	var OpenPopup=function(){
			$('#popupDialog_finish').popup('open');
	}
	OpenPopup();
	CommandSupport.sendCommand("System", CommandStrings.OnlineUpgrade);
}

function ShowFirmwareUploadPercent(downloadPercent)
{
	if(downloadPercent == 0)
	{
		var elem=document.getElementById("firmware_upload_percent");
		elem.innerHTML = i18n[window.langindex]["firmware.update"];
		document.getElementById("firm_update_show_bar").style.width="0%";
		$.getJSON("httpapi.asp?command=getMvRomBurnPrecent", function(json){
			if(json.status != 0)
			{
			  var msg = i18n_alert[window.langindex]["online.upgrade.corrupted"] + "(code:" +json.status.toString() +")";
			  if ( json.status < 1000 )
			  {

			  }
			  else if ( json.status <= 1002 )  // magic or os_type error
			  	 msg = i18n_alert[window.langindex]["online.upgrade.mismatch"] + "(code:" +json.status.toString() +")";
			  else if ( json.status <= 1007 ) // crc fail
			  	 msg = i18n_alert[window.langindex]["online.upgrade.corrupted"] + "(code:" +json.status.toString() +")";
			  else if ( json.status == 1008 ) // image size too large
			     msg = i18n_alert[window.langindex]["online.upgrade.too_large"] + "(code:" +json.status.toString() +")";
			  else if ( json.status == 1012 ) // image size too large
			     msg = i18n_alert[window.langindex]["online.upgrade.mtd_error"] + "(code:" +json.status.toString() +")";
			  else if ( json.status == 1013 ) // image size too large
			     msg = i18n_alert[window.langindex]["online.upgrade.downloaderror"] + "(code:" +json.status.toString() +")";
			  $('#popupDialog_burningFirmware').popup('open');
			  $("#popupDialog_burningFirmware_text").text(msg);
			}
			else
			{
				downloadPercent = json.progress;
			}
		});
		firmware_upload_timer=setTimeout(function(){
			ShowFirmwareUploadPercent(downloadPercent);
		}, 1000);
	}
	else if(downloadPercent < 100)
	{
		//var bwidth = swidth * downloadPercent/100;
		var elem=document.getElementById("firmware_upload_percent");
		elem.innerHTML = i18n[window.langindex]["firmware.writing"] + downloadPercent.toString()+"%";
		document.getElementById("firm_update_show_bar").style.width=downloadPercent.toString()+"%";
		$.getJSON("httpapi.asp?command=getMvRomBurnPrecent", function(json){
			if(json.status != 0)
			{
			  $('#popupDialog_burningFirmware').popup('open');
			  $("#popupDialog_burningFirmware_text").text(i18n_alert[window.langindex]["online.upgrade.corrupted"]);
			}
			else
			{
				downloadPercent = json.progress;
			}
		});
		firmware_upload_timer=setTimeout(function(){
			ShowFirmwareUploadPercent(downloadPercent);
			}, 2000);
	}
	else
	{
		var elem=document.getElementById("firmware_upload_percent");
		elem.innerHTML = "100%";
		document.getElementById("firm_update_show_bar").style.width="100%";

		  $('#popupDialog_burningFirmware').popup('open');
		  $("#popupDialog_burningFirmware_text").text(i18n_alert[window.langindex]["system.complete_reboot"]);
	}
}

function ShowCxdishUploadPercent(downloadPercent)
{
	if(downloadPercent == 0)
	{
		var elem=document.getElementById("firmware_upload_percent");
		elem.innerHTML = i18n[window.langindex]["firmware.update"];
		document.getElementById("firm_update_show_bar").style.width="0%";
		$.getJSON("httpapi.asp?command=getCxdishPrecent", function(json){
			if(json.status != 0)
			{
			  var msg = i18n_alert[window.langindex]["online.upgrade.corrupted"] + "(code:" +json.status.toString() +")";
			  if ( json.status < 1000 )
			  {

			  }
			  else if ( json.status <= 1002 )  // magic or os_type error
			  	 msg = i18n_alert[window.langindex]["online.upgrade.mismatch"] + "(code:" +json.status.toString() +")";
			  else if ( json.status <= 1007 ) // crc fail
			  	 msg = i18n_alert[window.langindex]["online.upgrade.corrupted"] + "(code:" +json.status.toString() +")";
			  else if ( json.status == 1008 ) // image size too large
			     msg = i18n_alert[window.langindex]["online.upgrade.too_large"] + "(code:" +json.status.toString() +")";
			  else if ( json.status == 1012 ) // image size too large
			     msg = i18n_alert[window.langindex]["online.upgrade.mtd_error"] + "(code:" +json.status.toString() +")";
			  else if ( json.status == 1013 ) // image size too large
			     msg = i18n_alert[window.langindex]["online.upgrade.downloaderror"] + "(code:" +json.status.toString() +")";
			  $('#popupDialog_burningFirmware').popup('open');
			  $("#popupDialog_burningFirmware_text").text(msg);
			}
			else
			{
				downloadPercent = json.progress;
			}
		});
		firmware_upload_timer=setTimeout(function(){
			ShowCxdishUploadPercent(downloadPercent);
		}, 1000);
	}
	else if(downloadPercent < 100)
	{
		//var bwidth = swidth * downloadPercent/100;
		var elem=document.getElementById("firmware_upload_percent");
		elem.innerHTML = i18n[window.langindex]["firmware.writing"] + downloadPercent.toString()+"%";
		document.getElementById("firm_update_show_bar").style.width=downloadPercent.toString()+"%";
		$.getJSON("httpapi.asp?command=getCxdishPrecent", function(json){
			if(json.status != 0)
			{
			  $('#popupDialog_burningFirmware').popup('open');
			  $("#popupDialog_burningFirmware_text").text(i18n_alert[window.langindex]["online.upgrade.corrupted"]);
			}
			else
			{
				downloadPercent = json.progress;
			}
		});
		firmware_upload_timer=setTimeout(function(){
			ShowCxdishUploadPercent(downloadPercent);
			}, 2000);
	}
	else
	{
		var elem=document.getElementById("firmware_upload_percent");
		elem.innerHTML = "100%";
		document.getElementById("firm_update_show_bar").style.width="100%";

		  $('#popupDialog_burningFirmware').popup('open');
		  $("#popupDialog_burningFirmware_text").text(i18n_alert[window.langindex]["system.complete_reboot"]);
	}
}

var m_Timer1;
var m_Timer2;
var m_Timer3;
var m_Timer4;


function funStartRemoteUpdate()
{
//var elem=document.getElementById("online_update");
//elem.disabled="disabled";
	$.ajaxSetup({ cache: false });
	sendCommand("getMvRemoteUpdateStart", null);
  	var elem=document.getElementById("firmware_update_status");
	$("#div_online_update").hide();
	m_Timer1=setInterval(ajaxGetMvRemoteUpdateStatus, "1000");
}
function ajaxGetMvRemoteUpdateStatus()
{
	$.ajaxSetup({ cache: false });
	sendCommand("getMvRemoteUpdateStatus", funRemoteUpdateCallBack);
}

function funRemoteUpdateCallBack(req)
{
	var m_RemoteUpdateStatus = parseInt(req.responseText);
	switch(m_RemoteUpdateStatus)
	{
	case 10:
	  	var elem=document.getElementById("firmware_update_status");
		elem.innerHTML=i18n_alert[window.langindex]["onlineup.please_wait"];
		break;
	case 25:
	  	var elem=document.getElementById("firmware_update_status");
		elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.downloading"];
		break;
	case 20:
	  	var elem=document.getElementById("firmware_update_status");
		elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.check.noupdate"];
$("#div_online_update").show();

		clearInterval(m_Timer1);
		break;
	case 22:
	  	var elem=document.getElementById("firmware_update_status");
		elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.downloaderror"];
$("#div_online_update").show();
		clearInterval(m_Timer1);
		break;
	case 40:
	  	var elem=document.getElementById("firmware_update_status");
		elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.downloadcomplete"];
		break;
	case 32:
	  	var elem=document.getElementById("firmware_update_status");
		elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.downloadcomplete"];
		ShowRemoteBurnPercent(0);
		clearInterval(m_Timer1);
		break;
	case 31:
	  	var elem=document.getElementById("firmware_update_status");
		elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.corrupted"];
		clearInterval(m_Timer1);
		$("#div_online_update").show();
		break;
	}
}


function ShowRemoteBurnPercent(Percent)
{
	if(Percent < 100)
	{
		$("#firmware_update_status").text(i18n[window.langindex]["firmware.writing"] + Percent.toString()+"%");
		$.getJSON("httpapi.asp?command=getMvRomBurnPrecent", function(json){
				Percent = json.progress;
		});
		firmware_upload_timer=setTimeout(function(){
			ShowRemoteBurnPercent(Percent);
		}, 1000);
	}
	else
	{
		$('#popupDialog_burningFirmware').popup('open');
		$("#popupDialog_burningFirmware_text").text(i18n_alert[window.langindex]["system.complete_reboot"]);
	}
}

function funRestoreToDefaultReturn(req)
{
	var elem=document.getElementById("popupDialog_restoreFactoryResult_text");
	elem.innerHTML=i18n_alert[window.langindex]["system.restore_complete"];
	$('#popupDialog_restoreFactoryResult').popup('open');
}

function GetOnlineUpdateStatus(onlinestatus)
{
	if(onlinestatus == "CHECKING"){
	  	 var elem=document.getElementById("firmware_update_status");
		 elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.checking"];
	}


	if(onlinestatus == "ERROR") {
	   var elem=document.getElementById("firmware_update_status");
	   elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.check.error"];
       return;
	}

	if(onlinestatus == "NONEWVER") {
	   var elem=document.getElementById("firmware_update_status");
	   elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.check.noupdate"];
       return;
	}

	if(onlinestatus.split("#")[0] == "VERSION")
	{
		if(!versioncheck)
		{
			if(confirm(i18n_alert[window.langindex]["online.upgrade.confirm.a"] + " " + onlinestatus.split("#")[1] + "," + i18n_alert[window.langindex]["online.upgrade.confirm.b"])){
				CommandSupport.sendCommand("System", CommandStrings.OnlineupdateConfirm);

			}else
			{
				var elem=document.getElementById("firmware_update_status");
			    elem.innerHTML="";
				return;
			}
			versioncheck = true;
		}
	}

	if(onlinestatus == "DOWNLOADING")
	{
		 var elem=document.getElementById("firmware_update_status");
		 elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.downloading"];
	}

	if(onlinestatus == "FWDOWNLOADCOMPLETED")
	{
		 var elem=document.getElementById("firmware_update_status");
		 elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.downloadcomplete"];
	}

	if(onlinestatus == "DOWNLOADERROR")
	{
		 var elem=document.getElementById("firmware_update_status");
		 elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.downloaderror"];
		 return;
	}

	if(onlinestatus == "READYTOUPDATE")
	{
		 var elem=document.getElementById("firmware_update_status");
		 elem.innerHTML=i18n_alert[window.langindex]["online.upgrade.downloadcomplete"];
		 sendCommand('SystemCommand+firmwareConfirm', function(req){;});
		 return;
	}

	 sendCommand('SystemCommand+getOnlineState', function(req){
    	   onlinestatus = req.responseText.split(":")[2].substring(0, req.responseText.split(":")[2].length-2);
       });

	setTimeout(function(){
			GetOnlineUpdateStatus(onlinestatus);
		}, 1000);

}


////////////////////// mono ///////////////////////////////////////////////////////////////////////////////////
var _singleton = 0;
function wiimu_uploadFirmwareCheck()
{
	if(_singleton)
		return false;

	if(document.UploadFirmware.filename.value == ""){
		 var OpenPopup=function(){
		    $('#popupDialog_nofile').popup('open');
		}
		OpenPopup();
		return false;
	}
	else{
	//    $('#popupDialog_burningFirmware').popup('open');
		sendCommand("NotifyUpgradeType:" + document.UploadFirmware.filename.value, killprocess);
		//setTimeout(function(){
		//		killprocess();
		//	}, 100);

		//parent.menu.setLockMenu(1);
		_singleton = 1;
		return true;
	}
}

function killprocess()
{
	$.ajaxSetup({ cache: false });
	//alert(htmlobj.responseText);
	//wiimuStartBurnLocalFirmware();

	//initUploadFrame();
	document.getElementById("firmware_update_process").style.visibility = "visible";
$("#div_check_online_update").hide();
$("#div_online_update").hide();
	document.getElementById("onlineup_upform").submit();

	if(document.UploadFirmware.filename.value.indexOf("all_burning.img", 0) != -1)
	{
		htmlobj=$.ajax({url:"/goform/getMvKillProcess",async:false});
	}	
	if(document.UploadFirmware.filename.value.indexOf("cxdish_pack", 0) != -1)
	{
		ShowCxdishUploadPercent(0);
	}else
	{
    ShowFirmwareUploadPercent(0);
  }
	//m_Timer4=setInterval(wiimuchecklocalburnfirmware, "1000");
}

function wiimuchecklocalburnfirmware()
{
	var txt=document.getElementById('uploadFrame').contentWindow.document.body.innerHTML;
	if(txt.indexOf("Done...rebooting") >= 0)
	{
		$("#popupDialog_burningFirmware_text").text(i18n_alert[window.langindex]["system.complete_reboot"]);
	}
	else
	{
		$("#popupDialog_burningFirmware_text").text(txt);
	}

}

