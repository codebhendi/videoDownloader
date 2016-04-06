
setTimeout(function(){  sendAllLinks()  }, 300);
setInterval(function(){  sendAllLinks()  }, 500);

var lastUrl = false;
var allUrlsList = [];
function sendAllLinks()
{
	var url = document.location.href;
	var title = document.title;
	
	if (lastUrl != url) 
	{
		lastUrl = url;
		chrome.extension.sendMessage({msg: "msgSetUrl"}, function(response) 
		{
		    if ( response) {
		    	//console.log(response);
                scanPage( response.tabId);
		    }
		} );
    }								
}

function scanPage( tabId ) 
{
    setTimeout(function () { scanForChromeCastVideos(); }, 600);
    
	var url = document.location.href;
	
	allUrlsList = [];
	for (var i = 0; i < document.links.length; i++) 
	{
	    var link =  document.links[i];
	    var u = isSupportedUrl(link.href);
		if ( u) 
		{
			var title = '';
			if (link.hasAttribute('title')) 
				title = myTrim(link.getAttribute('title'));
			if (!title && link.hasAttribute('alt')) 
				title = myTrim(link.getAttribute('alt'));
			if (!title) 
				title = myTrim(link.innerText);
				
	        if (!title) 
	            title=document.title;
			var cl = "";
			if (link.hasAttribute('class')) 
				cl = myTrim(link.getAttribute('class'));
			allUrlsList.push({'url': u,'title': title,'class': cl,'id': (link.id ? link.id : ""),'value': '','type': 'extern'});
		}			
    }
			
    type="video";
    a = document.getElementsByTagName('video');
    for (var i = 0; i < a.length; i++) 
    {
        var link = a[i];
        var u = false;
	    if (link.src) 
	        u = link.src;
	    if (!u && link.hasAttribute('data-thumb'))
	    {
		    u = myTrim(link.getAttribute('data-thumb'));
		    if (u.indexOf("http") == -1) 
		        u = "http:" + u;
	    }	
	    var u = isSupportedUrl(u);
	    if ( u) 
	    {
		    var title = '';
		    if (link.hasAttribute('alt')) 
			    title = myTrim(link.getAttribute('alt'));
		    else if (link.hasAttribute('title')) 
			    title = myTrim(link.getAttribute('title'));
			if (!title) 
	            title=document.title;
		    var cl = "";
		    if (link.hasAttribute('class')) 
			    cl = myTrim(link.getAttribute('class'));
			    
		    allUrlsList.push({'url': u,'title': title, 'type': type});
	    }			
	}
	  
	chrome.extension.sendMessage({"msg": "msgAddLinks", "tabId": tabId, "url": url, "link": allUrlsList}, function(response) {});
}			
   
function myTrim(txt) 
{
	if ( !txt) 
	    return '';
	return txt.replace(/^[\s_]+|[\s_]+$/gi, '').replace(/(_){2,}/g, "_");
}
		
function isSupportedUrl( url) 
{
    if ( !url || !url.toLowerCase)
        return false;
	if ( (url.toLowerCase().indexOf('javascript:') != -1) || (url.toLowerCase().indexOf('javascript :') != -1) )
	    return false;
	if ( (url.toLowerCase().indexOf('mailto:') != -1) || (url.toLowerCase().indexOf('mailto :') != -1) )
	    return false;
	if (url.indexOf("data:image") != -1)  
	    return false;
    if ( (url.indexOf(".mp4") == -1) && (url.indexOf(".flv") == -1) && (url.indexOf(".mov") == -1))
        return false;
	return url;
}

function scanForChromeCastVideos() {
    if (!document.location.href){
        return; 
    }
    if (!document.location.href.match(new RegExp("(https?://)?(www\\.)?(yotu\\.be/|youtube\\.com/)?((.+/)?(watch(\\?v=|.+&v=))?(v=)?)([\\w_-]{11})(&.+)?"))) {
        return;
    }
    var s = document.createElement('script');
    s.src = chrome.extension.getURL("video/chromecastcheck.js");
    (document.head || document.documentElement).appendChild(s);
    s.parentNode.removeChild(s);
    return; 
}
