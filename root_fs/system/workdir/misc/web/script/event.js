function EventObject(name){
	this.name = name;
}

function EventListener(src, handle){
	this.src = src;
	this.handle = handle;
}

var EventObjectSupport = {
	NetworkInfoFetched: new EventObject("NetworkInfoFetched"), 
	SystemInfoFetched: new EventObject("SystemInfoFetched"), 
	VideoInfoFetched: new EventObject("VideoInfoFetched"), 
	AudioInfoFetched: new EventObject("AudioInfoFetched"),
	VirtualAPFetched: new EventObject("VirtualAPFetched"),
	WlanConnInfoFetched: new EventObject("WlanConnInfoFetched"),
	LanguageChanged: new  EventObject("LanguageChanged"),
	FirmVersionInfoFetched: new EventObject("FirmVersionInfoFetched")
};

var EventMgr = {
	eventMap: new Object,
	addListener: function (eventObj, listener){
		if(this.eventMap[eventObj.name] == null){
			this.eventMap[eventObj.name] = new Array;
		}
		this.eventMap[eventObj.name].push(listener);
	},
	removeListener: function(eventObj, listener){
		if(this.eventMap[eventObj.name] != null){
			var index = -1;
			for(var i=0; i<this.eventMap[eventObj.name].length; i++){
				if(this.eventMap[eventObj.name][i] == listener){
					index = i;
					break;
				}
			}
			if(index != -1){
				this.eventMap[eventObj.name].splice(index, 1);
			}
		}
	},
	fireEvent: function(src, eventObj, extra){
		//alert(this.eventMap[eventObj]);
		if(this.eventMap[eventObj.name] != null){
			for(var i=0; i<this.eventMap[eventObj.name].length; i++){
				//alert(this.eventMap[eventObj.name][i].src == src);
				if(this.eventMap[eventObj.name][i].src == src){
					this.eventMap[eventObj.name][i].handle(src, eventObj, extra);
				}
			}
		}
	}
};

function EventSelector(){
	
}

EventSelector.prototype.waitAll = function(eventSrc, events, callback){
	var eventsState = new Object;
	for(var i=0; i<events.length; i++){
		eventsState[events[i]] = 0;
	}
	var listeners = new Array;
	for(var i=0; i<events.length; i++){
		var listener = new EventListener(eventSrc, function(src, eventObj, extra){
			eventsState[eventObj] = 1;
		});
		EventMgr.addListener(events[i], listener);
		listeners[i] = listener;
	};
	var poll = function() {
		var allInvoked = true;
		for ( var i = 0; i < events.length; i++) {
			if (eventsState[events[i]] == 0) {
				allInvoked = false;
				break;
			}
		}
		if (allInvoked) {
			callback();
			for(var i=0; i<events.length; i++){
				EventMgr.removeListener(events[i], listeners[i]);
			};
			return;
		} else {
			setTimeout(poll, 250);
		}
	};
	setTimeout(poll, 250);
};

function GetXmlHttpObject() {
	var xmlHttp = null;
	try {
		// Firefox, Opera 8.0+, Safari
		xmlHttp = new XMLHttpRequest();
	} catch (e) {
		// Internet Explorer
		try {
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
	}
	var proxy = new Object;
	proxy.xmlHttp = xmlHttp;
	proxy.open = function(method, url, async) {
		xmlHttp.open(method, url, async);
	};
	proxy.setRequestHeader = function(key, val) {
		xmlHttp.setRequestHeader(key, val);
	};
	proxy.send = function(params) {
		xmlHttp.onreadystatechange = function() {
			proxy.readyState = proxy.xmlHttp.readyState;
			//alert(proxy.readyState);
			try {
				proxy.status = proxy.xmlHttp.status;
			} catch (e) {

			}
			try {
				proxy.responseText = proxy.xmlHttp.responseText;
			} catch (e) {

			}
			proxy.onreadystatechange();
		};
		xmlHttp.setRequestHeader("If-Modified-Since", "0");
		xmlHttp.send(params);
	};
	return proxy;
}

var CommandSupport = {
	commandResultKey : "CommandResultKey",
	defaultPreFilter : new Filter(function(src, command, request, context) {
		
	}),
	defaultPostFilter : new Filter(function(src, command, request, context) {
		var lastMsg = context.getAttribute(CommandSupport.commandResultKey);
		//alert(command);
		var resolver = CommandResultResolverMap[command];
		//alert(resolver);
		if(resolver != null){
			var msgObj = resolver.resolve(src, command, lastMsg);
			context.setAttribute(CommandSupport.commandResultKey, msgObj);
		}
		else{
			//alert("no result resolver");
		}
	}),
	sendCommand : function(src, command, preFilters, postFilters) {
		if (preFilters == null) {
			preFilters = new Array;
		}
		if (postFilters == null) {
			postFilters = new Array;
		}
		preFilters.push(this.defaultPreFilter);
		postFilters.push(this.defaultPostFilter);
		this._sendCommand(src, command, preFilters, postFilters);
	},
	_sendCommand : function(src, command, preFilters, postFilters) {
		var request = GetXmlHttpObject();
		//var cmd = command.replace(/\+/g, "%2B");
		//var url = "ajax.do?command=" + cmd;
		var url="httpapi.asp?command=" + command;
		//var url="/cgi-bin/web.cgi?command=" + command;
		//alert(url);
		request.open("GET", url, true);
		request.setRequestHeader("If-Modified-Since", "0");
		request.setRequestHeader("Cache-Control", "no-cache");
		var context = new FilterContext;
		request.onreadystatechange = function() {
			if (request.readyState == 4) {
				if (request.status == 200) {
					CommandSupport.handleCommand(src, command, request, postFilters,
							context);
				}
			}
		};
		if (preFilters != null) {
			for ( var i = 0; i < preFilters.length; i++) {
				preFilters[i].doFilter(src, command, request, context);
			}
		}
		setTimeout(function(){
			request.send(null);
		}, 500);
		//request.send(null);
	},
	handleCommand : function(src, command, request, postFilters, context) {
		if (postFilters != null) {
			context.setAttribute(CommandSupport.commandResultKey, request.responseText);
			for ( var i = 0; i <postFilters.length; i++) {
				postFilters[i].doFilter(src, command, request, context);
				//alert(request.responseText);
			}
		}
	}
};

var CommandStrings = {
	GetAudioControl : "GetAudioControl",
	GetVideoControl : "GetVideoControl",
	GetSystemControl : "GetSystemControl",
	GetNetWorkControl : "GetNetWorkControl",
	GetVirtualAPControl : "GetVirtualAPControl",
	GetWlanConnectInfo : "wlanGetConnectInfo",
	GetFirmVersionInfo : "SystemCommand+getfwinfo",
	SetVirtualAPSetup : "NetWorkCommand+SetVirtualAPSetup+$",
	SetVirtualAPBridge : "NetWorkCommand+SetVirtualAPBridge+$",
	SetVideoRatio : "VideoCommand+SetVideoRatio+$",
	SetTVSystem : "VideoCommand+SetTVSystem+$",
	SetScaleVideoOutput : "VideoCommand+SetScaleVideoOutput+$",
	SetVideoFullScreent : "VideoCommand+SetVideoFullScreent+$",
	Set1080P24HZ : "VideoCommand+Set1080P24HZ+$",
	SetVGAOutput : "VideoCommand+SetVGAOutput+$",
	SetAudioDRC : "AudioCommand+SetAudioDRC+$",
	SetHDMIOutput : "AudioCommand+SetHDMIOutput+$",
	SetHDMILipSync : "AudioCommand+SetHDMILipSync+$",
	ChangeLanguage : "SystemCommand+changeLanguage+$",
	SetDeviceFriendlyName : "SetDeviceFriendlyName+",
	OnlineUpgrade : "SystemCommand+onlineupgrade",
	UsbUpgrade : "SystemCommand+usbupgrade",
	RestoreFactory : "SystemCommand+restoreToDefault",
	ReBootDevice : "SystemCommand+rebootdevice",
	OnlineupdateCheck : "SystemCommand+onlineupgrade_check",
	OnlineupdateConfirm : "SystemCommand+onlineupgrade_confirm"
};


function Filter(doFilter) {
	this.doFilter = doFilter;
}

function FilterContext(){
	this.map = new Object;
}

FilterContext.prototype = {
	setAttribute: function(key, val){
		this.map[key] = val;
	},
	getAttribute: function(key){
		return this.map[key];
	},
	removeAttribute: function(key){
		this.setAttribute(key, null);
	}
};

var MessageResolver = {
	_msgEventMap : {
		"NetWork" : EventObjectSupport.NetworkInfoFetched,
		"System" : EventObjectSupport.SystemInfoFetched,
		"Video" : EventObjectSupport.VideoInfoFetched,
		"Audio" : EventObjectSupport.AudioInfoFetched,
		"VirtualAP" : EventObjectSupport.VirtualAPFetched,
		"Wireless" : EventObjectSupport.WlanConnInfoFetched,
		"FirmVersion" : EventObjectSupport.FirmVersionInfoFetched
	},
	resolve : function(src, command, message){
		if(message == null)
			return;
		var pos = message.indexOf(":");
		var key = message.substring(0, pos);
		//alert(key);
		var info = message.substring(pos+1);
		var arr = info.split("&&");
		var result = new Array;
		for(var i=0; i<arr.length; i++){
			this._resolveProperty(result, arr[i]);
		}
		
		//alert(result);
		
		var eventObj = this._msgEventMap[key];
		
		if(eventObj != null){
			EventMgr.fireEvent(src, eventObj, result);
		}
	},
	_resolveProperty : function(result, prop){
		if(prop.indexOf(":") != -1){
			var pos = prop.indexOf(":"); 
			var value = prop.substring(pos+1);
			if(value.indexOf("##") == 0){
				var arr = new Array;
				this._resolveMultiValue(value, arr);
				var pair = new Object;
				pair.prop = prop.substring(0,pos);
				pair.value = arr;
				result[result.length] = pair;
			}
			else{
				var pair = new Object;
				pair.prop = prop.substring(0,pos);
				pair.value = value;
				result[result.length] = pair;
			}
		}
	},
	_resolveMultiValue : function(val, arr){
		val = val.substring(2, val.length-2);
		var subArr = val.split("$$");
		for(var j=0; j<subArr.length; j++){
			var pos1 = subArr[j].indexOf("<-$");
			var pos2 = subArr[j].indexOf("->");
			var item = new Object;
			item.text = subArr[j].substring(0, pos1);
			item.value = subArr[j].substring(pos1+"<-$".length, pos2);
			arr.push(item);
		}
	}
};

var CommandResultResolverMap = new Object;
CommandResultResolverMap[CommandStrings.GetAudioControl] = MessageResolver;
CommandResultResolverMap[CommandStrings.GetVideoControl] = MessageResolver;
CommandResultResolverMap[CommandStrings.GetSystemControl] = MessageResolver;
CommandResultResolverMap[CommandStrings.GetNetWorkControl] = MessageResolver;
CommandResultResolverMap[CommandStrings.GetVirtualAPControl] = MessageResolver;
CommandResultResolverMap[CommandStrings.GetWlanConnectInfo] = MessageResolver;
CommandResultResolverMap[CommandStrings.GetFirmVersionInfo] = MessageResolver;
