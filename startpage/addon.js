$.extend({strstr: function(b,c,a){var d=0;b+="";d=b.indexOf(c);if(d==-1){return false}else{if(a){return b.substr(0,d)}else{return b.slice(d)}}}})

var nVersion=1; // will be replaced
var fFirefox=false;
var feBayVersion=false;
var fVideoVersion=false;
var fVideo=true;
var defaults=defaults2;
var addOnShops = defaults.addOnShops;
var Frames = defaults.Frames;
var SearchURLs = defaults.SearchURLs;
var VideoSites = defaults.VideoSites;
var addOnThumbs3 = defaults.addOnThumbs3;
var addOnThumbs = defaults.addOnThumbs;

var fr = {
slastInner:"",
fEditMode:false,
nPages:0,
nCurPage:0,
lpToplinkBottomFolder:0,
lpCurFolder:0,
nToplinks:0,
nToplinksPerPage:0,
nCurFolderLevel:0,
lpFolderStack:[{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""}],
n1x1Count:0,
nShoppingMode:0,
FilterList:new Array(),
FilterListCount:0,
curFilter:"",
fReadCookies:1,
nCurSearchProvider:0,
nToRender:0,
nRenderd:0,
lpOverlayPos:new Array(),
lpDragTargets:0,
curTimer:0,
curSlide:0,
curVideo:-1,


doNI2:function() 
{
    alert( "Not implemented!");
},

doNI:function() 
{
    alert( "Not implemented!");
},

FilterToplinks:function ( tl)
{
    var count = tl.length;
    var lwr = this.curFilter.toLowerCase();
    for (var j=0; j<count; j++)
    {
        if ( tl[j].type == "f")
            this.FilterToplinks( tl[j].Toplinks);
        else
        {
            if( tl[j].name.toLowerCase().indexOf( lwr) >= 0 || 
                (tl[j].url && tl[j].url.toLowerCase().indexOf( lwr) >= 0))
            {
                this.FilterList[this.FilterListCount] = tl[j];
                this.FilterListCount++;
            }
        }
    } 
},
        
        
SetVideoFilter:function ( txt)
{
    this.curFilter = txt;
    fr.checkAddButtons();
    this.FilterList = new Array();
    this.FilterListCount = 0;
    
    
    var videofolder = fr.FindToplinkType( 0, "v");
    if ( txt=="")
    {
        fr.doSetFolder( videofolder.id);
    }
    else
    {
        var tl = videofolder.Toplinks;
        var count = tl.length;
        var lwr = this.curFilter.toLowerCase();
        for (var j=0; j<count; j++)
        {
            if( tl[j].name.toLowerCase().indexOf( lwr) >= 0 || 
                (tl[j].url && tl[j].url.toLowerCase().indexOf( lwr) >= 0))
            {
                this.FilterList[this.FilterListCount] = tl[j];
                this.FilterListCount++;
            }
        } 
        this.lpCurFolder = new Object();
        this.lpCurFolder.id=0;
        this.lpCurFolder.type="v";
        this.lpCurFolder.Toplinks = this.FilterList;
        this.nCurPage=0;
    }
    this.doResize();
},

SetFilter:function ( txt)
{
    if ( fVideoVersion)
    {
        fr.SetVideoFilter(txt);
        return;
    }
    this.curFilter = txt;
    fr.checkAddButtons();
    this.FilterList = new Array();
    this.FilterListCount = 0;
    if ( 1)
    {
        if ( txt=="")
        {
            this.nCurPage = 0;
            this.lpCurFolder = 0;
            this.nCurFolderLevel = 0;
        }
        else
        {
            this.FilterToplinks( fr.lpToplinkBottomFolder);
            var i1;
            if (typeof(addOnShops) == 'undefined')
                var shops = new Array();
            else if ( addOnShops[fr.settings.country])
                var shops = addOnShops[fr.settings.country].Shops;
            else
                var shops = addOnShops["de"].Shops;
            for ( i1 = 0; i1 < shops.length; i1++)
            {
                if ( !shops[i1].url)
                    shops[i1].url = "http://"+shops[i1].name;
                if ( !shops[i1].thumb)
                    shops[i1].thumb = this.GetThumb(shops[i1].url, shops[i1].name);
            }
            this.FilterToplinks( shops);
            
            this.lpCurFolder = new Object();
            this.lpCurFolder.id=0;
            this.lpCurFolder.Toplinks = this.FilterList;
            
            this.nCurPage=0;
        }
    }
    
    this.doResize();
},

doSetFolder:function ( id)
{
    if ( this.lpCurFolder && id == this.lpCurFolder.id)
        return;
    
    fr.curTimer++;
    if ( id<0) // one level up
    {
        if ( this.lpCurFolder) 
            if ( this.lpCurFolder.type=="e" || this.lpCurFolder.type=="a" || this.lpCurFolder.type=="m")  
                this.lpCurFolder.Toplinks = new Array(); // Delete content, but not for videos, because in editor mode the order is needed
        
        if ( this.nCurFolderLevel>0)
            this.nCurFolderLevel--;
        this.nCurPage = this.lpFolderStack[this.nCurFolderLevel].page;
        var tl = fr.FindToplink( 0, this.lpFolderStack[this.nCurFolderLevel].id);
        if ( tl)
            this.lpCurFolder = tl;
        else
            this.lpCurFolder = 0;
        this.doResizeHome();   
        
        fr.doShowHelp();
        fr.checkAddButtons();
        return;
    }
    
    var tl = fr.FindToplink( 0, id);
    /*if ( this.lpCurFolder)
    {
        if ( !this.lpCurFolder.Toplinks)
            this.lpCurFolder.Toplinks = new Array();
        var bottom = this.lpCurFolder.Toplinks;
    }
    else
        var bottom = fr.lpToplinkBottomFolder;
    
    if ( bottom && i<bottom.length)*/
    
    this.ReloadFolder( tl);
    fr.checkAddButtons();
    fr.doShowHelp();
},

checkAddButtons:function()
{
    if ( !fr.curFilter && fr.settings.fShowToplinks && ( !fr.lpCurFolder || fr.lpCurFolder.type=="f"))
    {
        $("#idAddFolder").show();
        $("#idAddUrl").show();
    }
    else
    {
        $("#idAddFolder").hide();
        $("#idAddUrl").hide();
    }
    if ( fr.lpCurFolder && fr.lpCurFolder.type == "v")
    {
        fr.CreateVideoBar();
        $("#idVideobar").show();
        $("#idBestofbar").hide();
    }
    else
    {
        $("#idVideobar").hide();
        $("#idBestofbar").show();
    }
},
ReloadFolder:function( folder)
{        
    if ( folder.type == "f")
    {
        fr.lpFolderStack[fr.nCurFolderLevel].page = fr.nCurPage;
        fr.lpFolderStack[fr.nCurFolderLevel].id = fr.lpCurFolder ? fr.lpCurFolder.id : -1;
        fr.nCurFolderLevel++;
        fr.lpCurFolder = folder;
        fr.nCurPage=0;
        fr.doResizeHome();
    }
    else if ( folder.type == "m")
    {
        fr.lpFolderStack[fr.nCurFolderLevel].page = fr.nCurPage;
        fr.lpFolderStack[fr.nCurFolderLevel].id = fr.lpCurFolder ? fr.lpCurFolder.id : -1;
        fr.nCurFolderLevel++;
        fr.lpCurFolder = folder;
        fr.lpCurFolder.Toplinks = new Array();
        
        L64P.browser.getMostVisited({},function(data)
        {
            for (var i=0; i<data.mostVisited.length; i++) 
            {
                var o = new Object();
                o.searchurl="";
                o.type="l"
                o.url = data.mostVisited[i].url;
                //o.thumb=data.mostVisited[i].iconUrl;
                o.name = data.mostVisited[i].title;
                o.p1x1="";
                o.id=fr.nextfreeid++;
                
                if ( fr.settings.mostVisitedFilter)
                {
                    var m = md5( o.url);
                    if ( fr.settings.mostVisitedFilter.indexOf( ","+m+",")>=0)
                        continue;
                }

                fr.lpCurFolder.Toplinks.push(o);
                /*var a = new Array();
                
                a.push( o);
                fr.lpCurFolder.Toplinks = a.concat( fr.lpCurFolder.Toplinks);	
                */
            }
            fr.doResizeHome();
        }); 
        fr.nCurPage=0;
        fr.doResizeHome();
    }
    else if ( folder.type == "a")
    {
        fr.lpFolderStack[fr.nCurFolderLevel].page = fr.nCurPage;
        fr.lpFolderStack[fr.nCurFolderLevel].id = fr.lpCurFolder ? fr.lpCurFolder.id : -1;
        fr.nCurFolderLevel++;
        fr.lpCurFolder = folder;
        fr.lpCurFolder.Toplinks = new Array();
        
        L64P.browser.getApps({},function(data)
        {
            for (var i=0; i<data.apps.length; i++) 
            {
                var o = new Object();
                o.searchurl="";
                o.type="app"
                o.url = data.apps[i].url;
                o.thumb=data.apps[i].iconUrl;
                o.name = data.apps[i].title;
                o.p1x1="";
                o.id=fr.nextfreeid++;
                var a = new Array();
                a.push( o);
                fr.lpCurFolder.Toplinks = a.concat( fr.lpCurFolder.Toplinks);	
            }
            fr.doResizeHome();
        }); 
        fr.nCurPage=0;
        fr.doResizeHome();
    }
    else if ( folder.type == "e")
    {
        fr.lpFolderStack[fr.nCurFolderLevel].page = fr.nCurPage;
        fr.lpFolderStack[fr.nCurFolderLevel].id = fr.lpCurFolder ? fr.lpCurFolder.id : -1;
        fr.nCurFolderLevel++;
        fr.lpCurFolder = folder;
        fr.lpCurFolder.Toplinks = new Array();
        
        var dataitems = L64P.ebay.getWatchedItems({site:fr.settings.country},function(data)
        {
            fr.ConvertEBayData( data.items);
            fr.doResizeHome();
            //$("#idHelpEBay").hide();
        }); 
        
        if (typeof(dataitems) != 'undefined')
            if ( dataitems)
                fr.ConvertEBayData( dataitems);
        fr.nCurPage=0;
        fr.doResizeHome();        
    }
    else if ( fVideo && folder.type == "v")
    {
        fr.lpFolderStack[fr.nCurFolderLevel].page = fr.nCurPage;
        fr.lpFolderStack[fr.nCurFolderLevel].id = fr.lpCurFolder ? fr.lpCurFolder.id : -1;
        fr.nCurFolderLevel++;
        fr.lpCurFolder = folder;
        fr.lpCurFolder.Toplinks = new Array();
        
        var dataitems = L64P.video.getWatchedItems({},function(data)
        {
            fr.ConvertVideoData( data.items);
            fr.doResizeHome();
            //$("#idHelpEBay").hide();
            
            if ( fr.startvideoid)
            {
                var tl = fr.FindToplinkType( 0, "v");
                if(tl)
                for ( var i = 0; i < tl.Toplinks.length; i++)
                {
                    var o = tl.Toplinks[i];
                    if ( o.video_id == fr.startvideoid)
                    {
                        fr.PlayVideo(o);
                        fr.startvideoid = false;
                        break;
                    }
                }
            }
        }); 
        
        if (typeof(dataitems) != 'undefined')
            if ( dataitems)
                fr.ConvertVideoData( dataitems);
        fr.nCurPage=0;
        fr.doResizeHome();        
    }
},

ConvertEBayData:function( dataitems)
{
    fr.lpCurFolder.Toplinks = new Array();
    for (var i=0; i<dataitems.length; i++) 
    {
        var item = dataitems[i];
        var o = new Object();
        o.searchurl="";
        o.type="ebayitem"
        o.url =  item.ViewItemURLForNaturalSearch;
        o.thumb=item.GalleryURL;
        o.name = item.Title;
        o.text = item.Title;
        o.ebayid = item.ItemID; 
        
        
        if ( item.ShippingServiceCost && item.ShippingServiceCost.Value)
            o.shipping = fr.formatPrice( item.ShippingServiceCost.Value,item.ShippingServiceCost.CurrencyID);
        else if ( item.ShippingCostSummary && item.ShippingCostSummary.ShippingServiceCost&&  item.ShippingCostSummary.ShippingServiceCost.Value)
            o.shipping = fr.formatPrice( item.ShippingCostSummary.ShippingServiceCost.Value,item.ShippingCostSummary.ShippingServiceCost.CurrencyID);
        else
            o.shipping=""; 
            
        if ( item.ConvertedBuyItNowPrice)
        {
            o.price = fr.formatPrice( item.ConvertedBuyItNowPrice.Value, item.ConvertedBuyItNowPrice.CurrencyID);
            o.sofort = true;
        }
        else
        {
            o.price = fr.formatPrice( item.ConvertedCurrentPrice.Value,item.ConvertedCurrentPrice.CurrencyID);
            o.sofort = item.ListingType.indexOf( "Fixed")>=0;
        }
        o.end = item.EndTime;
        o.p1x1="";
        o.id=fr.nextfreeid++;
        if ( fr.lpCurFolder && fr.lpCurFolder.Toplinks && fr.lpCurFolder.type=="e")
            fr.lpCurFolder.Toplinks.push(o);
    }
},

ConvertVideoData:function( dataitems)
{
    fr.lpCurFolder.Toplinks = new Array();
    for (var i=0; i<dataitems.length; i++) 
    {
        var item = dataitems[i];
    
        var o = new Object();
        o.playhtml = item.html;
        o.searchurl="";
        o.type="video"
        o.url = item.video_url;
        //alert( i+": "+print_r(item));
        o.thumb=item.thumbnail_url;
        o.name = item.title;
        o.video_id = item.video_id;
        
        o.p1x1="";
        o.id=fr.nextfreeid++;
        if ( fr.lpCurFolder && fr.lpCurFolder.Toplinks && fr.lpCurFolder.type=="v")
            fr.lpCurFolder.Toplinks.push(o);
    }
},

resizeIFrame:function( )
{
    var o1 = document.getElementById("idPlayVideoThumbs"); 
    var o2 = document.getElementById("idPlayVideoInner"); 
    var o3 = o2.firstChild;
    if ( !o3)
        return;
    var o4 = document.getElementById("idSlideshow"); 
    if ( !o4)
        return;
    if ( o4)
    {
        var dx = o4.offsetWidth;
        var dy = o4.offsetHeight;
        o3.id="idPV";
        o2.style.left="16px";
        o2.style.top="100px";
        o3.width=dx-300;
        o3.height=dy-60-18;
        o1.style.height=(dy-36)+"px";
    }
},


videoPlaying:false,
PlayVideo:function( o)
{
    if ( !fVideo)
        return;
    if ( !o)
    {
        fr.videoPlaying=false;
        $("#idPlayVideoInner").html("");
        $("#idPlayVideoThumbs").html("");
        $("#idPlayVideo").hide();        
        fr.ShowToplinks(fr.settings.fShowToplinks);
        fr.doResize();
        fr.doShowHelp();
        document.title = fr.title;
        chrome.extension.sendMessage({msg: "OnSP24PlayVideo",url:false}, function(response) { });
        return;
    }
    document.title = o.name;
    fr.videoPlaying=true;
    fr.doShowHelp();
    var s="<a href='"+o.url+"'>"+t["original"]+"</a>";
    $("#idVideoTitle").html(s);
    $("#idVideoClose").html(t["close"]);
    fr.myBindClick("#idVideoTitle", { }, function(ev) {$("#idPlayVideoInner").html("");window.location.replace( o.url);return false;});
         
    chrome.extension.sendMessage({msg: "OnSP24PlayVideo",url:o.url,title:o.name}, function(response) { });
    
    if ( o.playhtml)    
    {
        if ( o.playhtml.indexOf( "<iframe")==0)
            $("#idPlayVideoInner").html(o.playhtml);
        else
        {
            var sInner = "<iframe id='idPV' src='http://my.startpage24.com/_libs/extension.lib/index.php?cmd=Show&url="+o.url+"'></iframe>";
            $("#idPlayVideoInner").html(sInner);
        }
//        $("#idPlayVideoInner").html(o.playhtml);
        fr.resizeIFrame();
        
        
        //$("#idPlayVideoInner2").html(o.playhtml);
    }
    $("#idPlayVideo").show();
    //fr.myBindClick("#idPlayVideo", { }, function(ev) {fr.PlayVideo(0);return false;});
    fr.myBindClick("#idVideoClose", { }, function(ev) {fr.PlayVideo(0);return false;});
    fr.myBindClick("#idPlayVideoBg", { }, function(ev) {fr.PlayVideo(0);return false;});
    fr.myBindClick("#idPlayVideoThumbs", { }, function(ev) {fr.PlayVideo(0);return false;});
    
    
    
    $("#idToplinks").hide();
    
    $("#idPlayVideoThumbs").html("");
    if ( !fr.curvideolist)
        return;
        
    var j = 0;
    var y=0;
    
    var a = new Array();
    var m = 0;
    var len=fr.curvideolist.length;
    for ( var i = 0; i < len; i++)
    {
        var cur = fr.curvideolist[i];
        if ( cur.url == o.url)
        {
            if ( i > 0)
                a.push( fr.curvideolist[i-1]);
            else
            {
                len--;
                a.push( fr.curvideolist[len]);
            }
            for ( var j = i+1; j < len; j++)
                a.push(fr.curvideolist[j]);
            for ( j=0; j+1 < i; j++)
                a.push(fr.curvideolist[j]);
            break;
        }
    }
    for ( var i = 0; i < a.length; i++)
    {
        var cur = a[i];
        if ( cur.type != "video")
            continue;        
            
        var sInner = "";
        sInner+= '<div style="top:'+y+'px;background:#000" id="idv_'+j+'" class="clVideo"><a>';
        y+=136;
        var thumb = fr.GetToplinkThumb(cur);
        var si = GetImageSize(thumb);
        
        sInner+= fr.createVideoItemHtml(j,cur,thumb, 224,126,si); 
        
        sInner+= '</a><div id="id4v_'+j+'"  class="clOverlay"><a>'+cur.name+'</a></div>';
        sInner+= '</div>';
        
        $("#idPlayVideoThumbs").append(sInner);
        
        fr.myBindClick("#idv_"+j, { param: cur }, function(ev) {
            fr.PlayVideo(ev.data.param);
            return false;});
        fr.myBindIn("#idv_"+j, { param: 'id4v_'+j }, function(ev) {
               $("#"+ev.data.param).css("visibility","visible");
            });
        fr.myBindOut("#idv_"+j, { param: 'id4v_'+j }, function(ev) {
            $("#"+ev.data.param).css("visibility","hidden");
            });
        j++;
    }
},

formatPrice:function ( value, currency)
{
    if ( currency == "EUR")
        return value.toFixed(2) + " €";
    return currency+" "+value.toFixed(2);
},

getSecondsLeft:function (reitime)
{
    if ( !reitime)
        return 0;
    if ( reitime == "")
        return 0;
	
	var date = new Date( reitime);
	var jetzt = new Date(); 
	var Zeit = jetzt.getTime() / 1000;
	var Endzeit = date.getTime() / 1000;
  	var sec = Math.floor(Endzeit - Zeit);
  	return sec;
},

formatTime:function (sec)
{	
    if (sec<=0)
        return t["beendet"];	
    s = sec%60;
    m = Math.floor(sec/60);
    h = Math.floor(m/60);
    m = m%60;
    d = Math.floor(h/24);
    h = h%24;
    
    
    
    var sInner = "";
    if (sec<=60)
        sInner = sec +" " + t["sekunden"];
    else if (sec<=60*60)
        sInner = m +t["min"]+" " + s + t["sek"];
    else if (sec<=24*60*60)
        sInner = h +t["std"]+" " + m + t["min"];
    else if ( d == 1)        
        sInner = d +t["tag"]+" " + h + t["std"];
    else
        sInner = d +t["tage"]+" " + h + t["std"];
        
    if ( sec  < fr.settings.ebaysec)
        sInner = "<span style='color:#f00'>"+sInner+"</span>";
    return sInner;
    
},

eBayClicked:function ()
{
    if ( fr.nextEBayItem && fr.nextEBayItem.ViewItemURLForNaturalSearch)
        fr.doNav(fr.nextEBayItem.ViewItemURLForNaturalSearch)
},

getNextEbayItemTimeString:function ()
{
    if ( !fr.nextEBayItem)
        return false;
    var date = fr.nextEBayItem.EndDate;
    
    if ( !date)
        return false;
	var jetzt = new Date(); 
	var Zeit = jetzt.getTime() / 1000;
	var Endzeit = date.getTime() / 1000;
  	var sec = Math.floor(Endzeit - Zeit);
	
	if (sec<=0)
		return 2;
    if ( sec > fr.settings.ebaysec)
        return false;
    return sec +"s";
},

doSetPage:function ( p)
{
    this.nCurPage=p;
    this.doResizeHome();
},
 
doNav:function ( url)
{
    $("#idAll").show();
    if ( !fFirefox && url.indexOf("chrome://")>=0)
        L64P.browser.navigateChromeURL({url:url}); 
    else if ( fFirefox && url.indexOf("chrome:")>=0 && url.indexOf("downloads.xu")>=0)
    {
        var derDownloader = Components.classes["@mozilla.org/download-manager-ui;1"].getService(Components.interfaces.nsIDownloadManagerUI);
        if (derDownloader)
        {
            $("#idAll").hide();
            derDownloader.show();
        }
        else
            window.location.replace( url);
    }
    else
        window.location.replace( url);
},

doChangePage:function ( d)
{
    if ( d == -1)
    {
        if ( this.nCurPage>0)
            this.nCurPage--;
        else
            this.nCurPage= this.nPages-1;
        fr.doResizeHome();   
    }
    else if ( d == 1)
    {
        if ( this.nCurPage+1<this.nPages)
            this.nCurPage++;
        else
            this.nCurPage=0;
        fr.doResizeHome();
    }
},

doShowName:function ( id)
{
    if (fr.drag)
        return;
    if ( fr.idCurrentEdit)
        return;
    var o = document.getElementById(id); 
    if ( o)
        o.style.visibility = "visible";
        
    //aaaaaaaaaaaaaaaaaaaaaaaaaa
    if ( !fr.idCurrentEdit)
    {
        $('#'+id.replace("id4_", "idback_")).css( "opacity","1.0"); // Chrome
        $('#'+id.replace("id4_", "idback_")).css( "filter", "alpha(opacity = 100)");
    }
    
    //if ( this.fEditMode)
    {
        var o = document.getElementById(id.replace("id4_", "idBlack_")); 
        if ( o)
            o.style.visibility = "visible";
    }
},

doShowNameHome:function ( idText, idToplink, jpg)
{ 
    if (fr.drag)
        return;
    if ( fr.idCurrentEdit)
        return;
    if ( !jpg)
        return;
    jpg = jpg.replace("_224", "_448");
    fr.curTimer++;
    //setTimeout( fr.doShowScreenshot, 500, idToplink,jpg,fr.curTimer);
    setTimeout( function ( idToplink, url, timer){
                fr.doShowScreenshot(idToplink, url, timer);
                }, 500, idToplink,jpg,fr.curTimer);
    var o = document.getElementById(idText); 
    if ( o)
        o.style.visibility = "visible";
        
    var o = document.getElementById(idText.replace("id4_", "idBlack_")); 
    if ( o)
        o.style.visibility = "visible";
        
    if ( !fr.idCurrentEdit)
    {
        $('#'+idText.replace("id4_", "idback_")).css( "opacity","1.0"); // Chrome
        $('#'+idText.replace("id4_", "idback_")).css( "filter", "alpha(opacity = 100)");
    }
},

doShowScreenshot:function ( idToplink, url, timer)
{   
    if ( timer != fr.curTimer)
        return;
    var o2 = document.getElementById("idOverlay"); 
    var o3 = document.getElementById( "id_"+idToplink); 
    if ( o2 && o3)
    {
        var x = fr.lpOverlayPos[idToplink].x;
        o2.style.left = x+"px";
        var y = fr.lpOverlayPos[idToplink].y;
        o2.style.top = y+"px";
        var dx = fr.lpOverlayPos[idToplink].dx;
        o2.style.width = dx+"px";
        var dy = fr.lpOverlayPos[idToplink].dy;
        o2.style.height = dy+"px";
        
        var si = GetImageSize(url);
        if ( si )
            o2.innerHTML=fr.createVideoOverlayHtml( url, dx, dy,si);
        else
            o2.innerHTML="<img width='100%' height='100%' src='"+url+"'></img>";                 
        o2.style.visibility = "visible";
    }
},


doHideName:function ( id)
{
    fr.curTimer++;
    var o = document.getElementById(id); 
    if ( o)
        o.style.visibility = "hidden";
    
    var o = document.getElementById(id.replace("id4_", "idBlack_")); 
    if ( o)
        o.style.visibility = "hidden";
    
    if ( !fr.idCurrentEdit)
        if ( !this.lpCurFolder || this.lpCurFolder.type != "v")
            $('#'+id.replace("id4_", "idback_")).css( "opacity", fr.settings.trans); // Chrome
            
    //$('#'+id.replace("id4_", "idback_")).css( "filter", "alpha(opacity = 80)");
    
    var o2 = document.getElementById("idOverlay"); 
    if ( o2)
        o2.style.visibility = "hidden";
},

doAdd1x1:function ( p1x1)
{
    if ( !p1x1 || p1x1=="")
        return;
    var f=document.createElement("div");
    f.id="picload_"+this.n1x1Count;
    this.n1x1Count++;
    f.style.cssText ='visibility:hidden;display:none;';
    document.body.appendChild(f);
    f.innerHTML="<img src='"+p1x1+"'></img>";                 
},

doResize:function () 
{
    fr.resizeIFrame();
    fr.doResizeHome();
},

slideDX:0,
slideDY:0,
positionSlideshow:function()
{
    this.slideDX=0;
    this.slideDY=0;
    var o = document.getElementById("idSlide"); 
    if ( o && o.width && o.height)
    {
        fr.doResizeHome();
        $("#body").css("visibility","visible");
    }
    else
        setTimeout( function(){fr.positionSlideshow(1);} , 50);        
},

myBind:function( id, what, ob, callback)
{
    if (typeof(callback) != "function")
        return;
    $(id).unbind(what); // avoid calling it twice
    //ob.callback = callback;
    $(id).bind(what, ob, function(ev) { 
        return callback(ev);
        });
},

myBindIn:function( id, ob, callback)
{
    fr.myBind( id, "mouseenter", ob, callback);
},
myBindOut:function( id, ob, callback)
{
    fr.myBind( id, "mouseleave", ob, callback);
},
myBindClick:function( id, ob, callback)
{
    fr.myBind( id, "click", ob, callback);
},

curvideolist:0,
transToplinks:0,
doResizeHome:function ( ) 
{       
    var editAfterResize = fr.idCurrentEdit;
    fr.closeEdit( 2);
    
    var bkcolor = fr.GetBackgroundColor();
    if ( bkcolor != -1)
    {
        $("#idSlideshow").html("");
        $("#idSlideshow").css("background", bkcolor);
        $("#idSlideshow").css("visibility","visible");
        var b1 = bkcolor;
        var b2 = fr.GetGradientColor(b1);
        
        if ( fFirefox)
            $("#idSlideshow").css("background", "linear-gradient(135deg, "+b1+" 0%,"+b2+" 100%");
        else
            $("#idSlideshow").css("background", "-webkit-linear-gradient(top left, "+b1+" 0%, "+b2+" 100%)");
    }
    else
    {
        var o = document.getElementById("idSlide"); 
        if ( o && o.width && o.height)
        {
            if ( fr.degree == 90 || fr.degree == -90 || fr.degree == 270)
            {
                if ( !fr.slideDX)
                    fr.slideDX = o.height;
                if ( !fr.slideDY)
                    fr.slideDY = o.width;
            }
            else
            {
                if ( !fr.slideDX)
                    fr.slideDX = o.width;
                if ( !fr.slideDY)
                    fr.slideDY = o.height;
            }
                
            var o2 = document.getElementById("idSlideshow"); 
            if ( o2)
            {
                o2.style.visibility = "visible";
                var dx = o2.offsetWidth;
                var dy = o2.offsetHeight;
                
                userContent.Aspect = parseInt(userContent.Aspect)
                if ( !userContent.Aspect)
                {
                    o.style.position="relative";
                    o.width=dx;
                   // console.log("width="+dx);
                    o.height=dx*fr.slideDY/fr.slideDX;
                    if ( o.height< dy)
                    {
                        o.height=dy;
                        o.width=dy*fr.slideDX/fr.slideDY;
                        o.style.top="0px";
                        var m = (dx-o.width)/2;
                        o.style.left=m+"px";
                    }
                    else
                    {
                        var m = (dy-o.height)/2;
                        o.style.top=m+"px";
                        o.style.left="0px";
                    }
                   // console.log("width2="+o.width);
                }
                else if ( userContent.Aspect == 1)
                {
                    o.width=dx;
                    o.height=dy;
                }
                else // Balken
                {
                    o.style.position="relative";
                    o.width=dx;
                    o.height=dx*fr.slideDY/fr.slideDX;
                    if ( o.height> dy)
                    {
                        o.height=dy;
                        o.width=dy*fr.slideDX/fr.slideDY;
                        o.style.top="0px";
                        var m = (dx-o.width)/2;
                        o.style.left=m+"px";
                    }
                    else
                    {
                        var m = (dy-o.height)/2;
                        o.style.top=m+"px";
                        o.style.left="0px";
                    }
                }
            }
        }
    }
    o = document.getElementById("idSearchButton"); 
    x = o.offsetWidth;
    var xx = o.offsetLeft;
    if ( x < 10)
        x = 10;           
    o = document.getElementById("idInput"); 
    o.style.width = x-10+"px";
    
    var o2 = document.getElementById("idSearchButton2"); 
    o2.style.left = xx+x+"px";
    
    
    //-------------------------------- PrepareToplinks for drawing--------------------------------
    o = document.getElementById("toplinks"); 
    dx = o.offsetWidth;
    dy = o.offsetHeight;
    
    if ( dx < 860)
        $("#langKey_addfolder").hide();
    else 
        $("#langKey_addfolder").show();
       
    if ( dx < 750)
        $("#langKey_editToplinks-2").hide();
    else 
        $("#langKey_editToplinks-2").show();
        
    if ( dx < 800)
        $("#langKey_addToplink").hide();
    else 
        $("#langKey_addToplink").show();
        
    dy-=5;
    dy1 = (dy-20)/3;
    if ( dy1 > 126)
        dy1 = 126;
        
    dx1 = 224*dy1/126;
    nCols = Math.floor((dx+10)/(dx1+10));
    
    var bottom2 = this.lpCurFolder ? this.lpCurFolder.Toplinks : fr.lpToplinkBottomFolder;
    var bottom = new Array();
     
    for ( var j = 0; j < bottom2.length; j++)
    {
        var cur = bottom2[j];
        if ( !cur)
            continue;
        if ( !(fr.settings.folder&1) && cur.type == "e")
                continue;
        if ( !(fr.settings.folder&2) && cur.type == "a")
            continue;
        if ( !(fr.settings.folder&4) && cur.type == "m")
            continue;
        if ( !(fr.settings.folder&8) && cur.type == "v")
            continue;
        bottom.push(cur);           
    }
                
    fr.aEBayTimesToRefresh = false;
    if ( this.lpCurFolder && this.lpCurFolder.type =="e")
    {
        for ( var j = 0; j < bottom.length; j++)
        {
            var sec = fr.getSecondsLeft(bottom[j].end);            
            bottom[j].timeLeft = fr.formatTime(sec);
            bottom[j].sec = sec;
        }                
        bottom.sort(function(a,b){
            var e1 = a.timeLeft == t["beendet"];
            var e2 = b.timeLeft == t["beendet"];
            if ( e1 && !e2)
                return 1;
            else if ( !e1 && e2)
                return -1;
            if ( a.end > b.end)
                return 1;
            return -1;
            });
        //if ( fr.needRefresh)
        //    setTimeout( function(){fr.doResizeHome();}, 1000);
    }
    
    fr.curvideolist = 0;
    if ( this.lpCurFolder && this.lpCurFolder.type =="v")
    {
        fr.curvideolist = bottom;
        if ( this.fEditMode)
            fr.fVideosChanged=true; // we are in videofolder in edit mode
    }

    this.nToplinks=bottom.length;
    if ( !fVideoVersion)
        if ( this.nCurFolderLevel>0)
            this.nToplinks++; // Up-Toplink
    
    this.nToplinksPerPage=nCols*3;
    if ( this.nToplinksPerPage<1)
        this.nPages = 0;
    else
        this.nPages=Math.floor((this.nToplinks+this.nToplinksPerPage-1)/this.nToplinksPerPage);

    if ( this.nCurPage+1>this.nPages)
        this.nCurPage = this.nPages-1;
    if ( this.nCurPage<0)
        this.nCurPage = 0;
        
    ofs = this.nCurPage*this.nToplinksPerPage;
    
    var nTotal = this.nToplinks;
    count = this.nToplinksPerPage;
    /*if ( this.fEditMode)
    {
        nTotal+=2;
    }*/
    if ( count+ofs > nTotal)
    {
        count = nTotal-ofs;
        nCols = Math.floor((count+2)/3);
    }
    
    var sInner="";
    for ( var j = 0; j<count; j++)
    {
        i = j+ofs;
        var cur = bottom[i];
        if ( !cur)
            continue;
        if ( !cur.screenshotURL)
        {
            this.GetScreenshotUrl( cur, !cur.thumb);
        }        
        var thumb = fr.GetToplinkThumb(cur);
        sInner+= '<img class="clThumbBase" src="'+thumb+'"></img>';      
        
        if ( cur.p1x1 != "")
        {
             this.doAdd1x1(cur.p1x1);
             cur.p1x1= "";
        }
    }   
    $ ("#idHiddenThumbs").html( sInner);
    fr.transToplinks = new Object();
    //-------------------------------- DrawToplinks --------------------------------    
    for ( m = 0; m<2; m++) // Beim 2ten Mal die Events setzen
    {
        sInner=""
        for ( var j = 0; j<count; j++)
        {
            i = j+ofs;
             
            if ( this.nCurFolderLevel>0 && !fVideoVersion)
            {
                if ( i == 0) // zurück
                {
                    if ( m)
                    {
                        fr.myBindClick("#id_"+j, { }, function(ev) {fr.doSetFolder( -1);return false;});
                        fr.myBindIn( "#id_"+j, { param: 'id4_'+j }, function(ev) {fr.doShowName( ev.data.param);});                        
                        fr.myBindOut( "#id_"+j, { param: 'id4_'+j }, function(ev) {fr.doHideName( ev.data.param);});
                    }
                    else
                    {
                        var cur = fr.lpCurFolder;
                        
                        sInner+= '<div id="idback_'+j+'" class="clToplinkBack" style="opacity:'+fr.settings.trans+'">';
                        sInner+= '<div id="id_'+j+'" class="clToplink"><a><img draggable=false class="clThumb" width="100%" height="100%" src="./png/folder_back.png"></img></a>';
                        if ( cur)
                            sInner+= '<div id="id4_'+j+'" class="clOverlay"><a>'+cur.name+'</a></div>';
                        sInner+= '</div>';
                        sInner+= '</div>';
                    }
                    continue;
               }
               i--;
            }        
           
           
            var cur = bottom[i];
            if ( !cur)
                continue;
                
            var fFolder = ( cur.type == "f" || cur.type == "m" || cur.type == "a" || cur.type == "e" || cur.type == "v");
            var fShowSearchUrl = dy1>88 && !this.fEditMode && cur.searchurl != "" && !fFolder;
            var fShowTitle = ( cur.def && !fShowSearchUrl && cur.url && cur.url.indexOf("ebay")>=0);
            if ( m)
            {
                if ( cur.type == "e")
                {
                    //$("#idOverlayEBayFolder").unbind('click');
                    //$("#idOverlayEBayFolder").bind('click', { }, function(ev) {fr.eBayClicked();return false;});
                }
                
                fr.myBindClick("#idback_"+j, { }, function(ev) {return false;});
                
                if ( fFolder)
                {
                    fr.myBindClick("#id_"+j, { param: cur.id }, function(ev) {fr.doSetFolder( ev.data.param);return false;});
                }
                else if ( !this.fEditMode)
                {
                    //fr.ReplaceRedirectLanguage(cur.url, false)
                    if ( cur.type == "video")
                        fr.myBindClick("#id_"+j, { param: cur }, function(ev) {fr.PlayVideo(ev.data.param);return false;});
                    else
                        fr.myBindClick("#id_"+j, { param: cur.url }, function(ev) {fr.doNav( fr.ReplaceRedirectLanguage(ev.data.param, false));return false;});
                }
                if ( cur.screenshotURL && cur.screenshotURL != "*" && !fFolder && !fShowTitle && !this.fEditMode && cur.type != "downloads")
                    fr.myBindIn("#id_"+j, { param1: 'id4_'+j,param2: j, param3: cur.screenshotURL }, 
                                     function(ev) {fr.doShowNameHome( ev.data.param1, ev.data.param2, ev.data.param3);});
                else
                    fr.myBindIn("#id_"+j, { param: 'id4_'+j }, function(ev) {fr.doShowName( ev.data.param);});
                    
                fr.myBindOut("#id_"+j, { param: 'id4_'+j }, function(ev) {fr.doHideName( ev.data.param);});
                                              
                if ( this.fEditMode)
                {
                    fr.myBind("#id_"+j,'mousedown', { param: "#id_"+j, param2:cur.id}, function(ev) {fr.HandleDrag( 1,ev.data.param,ev.data.param2);});
                    fr.myBind("#id_"+j,'mouseup', { }, function(ev) {fr.HandleDrag( 0);});
                                        
                    $("#id5_"+j).unbind('click');
                    
                    //fr.myBindClick("#idbegin_"+j, { param: cur.id }, function(ev) {fr.MoveBegin( ev.data.param);return false;});
                    //fr.myBindClick("#idend_"+j, { param: cur.id }, function(ev) {fr.MoveEnd( ev.data.param);return false;});
                }
                fr.myBindClick("#idedit_"+j, { param: cur.id }, function(ev) {fr.EditUrl( ev.data.param,false);return false;});
                fr.myBindClick("#iddel_"+j, { param: cur.id }, function(ev) {fr.DelToplink( ev.data.param);return false;});
                
                if ( fShowSearchUrl)
                {
                    //$("#idsearch_"+j).unbind('click');
                    fr.myBindClick("#idsearch_"+j, { param1:'idInput_'+j, param2:cur.searchurl}, function(ev) {fr.doSearchToplink( ev.data.param1,ev.data.param2);return false;});
                    fr.myBind("#idform_"+j,'submit', { param1:'idInput_'+j, param2:cur.searchurl}, function(ev) {fr.doSearchToplink( ev.data.param1,ev.data.param2);return false;});
                }
            }
            else
            {
                var thumb = fr.GetToplinkThumb(cur);
                fr.transToplinks[cur.id] = 'idback_'+j;
                if ( fr.idCurrentEdit == cur.id || cur.type == "video")
                    sInner+= '<div id="idback_'+j+'" class="clToplinkBack" >'; // aaaaaaaaaaaaaaaaa
                else
                    sInner+= '<div id="idback_'+j+'" class="clToplinkBack" style="opacity:'+fr.settings.trans+'">'; // aaaaaaaaaaaaaaaaa
                if ( fr.drag==2 && fr.dragToplinkId == cur.id) // Resize during D&D: Set new divId and make item hidden
                {
                    fr.dragId="id_"+j;
                    sInner+= '<div style="visibility:hidden;cursor:default" id="id_'+j+'" class="clToplink"></div>';
                }
                else if ( fFolder)
                {
                    sInner+= '<div id="id_'+j+'" class="clToplink" ><a><img draggable=false  class="clThumb" width="100%" height="100%" src="'+thumb+'"></img></a>';
                    if ( cur.type == "f")
                        sInner+= '<div class="clOverlayFolder"><a style="font-size:18px;font-weight:bold;color:#666;">'+cur.name+'</a></div>';
                    else if ( cur.type == "e")
                    {
                        /*var s = fr.getNextEbayItemTimeString()
                        if ( s && s != 2)
                        {
                            var ebayending = t['ebayending'].replace("[sec]", s);
                            sInner+= '<div id="idOverlayEBayFolder"><center>'+ebayending+'</center></div>';
                        }
                        else*/
                            sInner+= '<div style="visibility:hidden" id="idOverlayEBayFolder"></div>';
                    }
                    sInner+= '<div id="id4_'+j+'" class="clOverlay"><a>'+cur.name+'</a></div>';

                    sInner+= '<div id="id5_'+cur.id+'" class="clEditOverlay"></div>';
                    //if ( this.fEditMode)
                    {
                        sInner+= fr.CreateEditModeButtons( j, cur, dy1);
                        
                    }
                    sInner+= '</div>';
                }
                else
                {
                    if ( this.fEditMode)
                    {                
                        if ( cur.type == "ebayitem")
                        {
                            sInner+= fr.createEBayItemHtml(j,cur,thumb, dy1); 
                        }
                        else
                        {
                            if ( cur.type == "video")
                                sInner+= '<div style="cursor:default;background:#000" id="id_'+j+'" class="clToplink"><a>';
                            else
                                sInner+= '<div style="cursor:default" id="id_'+j+'" class="clToplink"><a>';
                            if ( cur.type == "app")
                            {
                                var si = new Object();
                                si.w = si.h = 90;
                            }
                            else
                                var si = GetImageSize(thumb);
                                
                            if ( cur.type == "video")
                            {
                                sInner+= fr.createVideoItemHtml(j,cur,thumb, dx1, dy1,si);                                 
                            } 
                            else if ( si)
                                sInner+= '<img draggable=false  class="clThumb" style="width:'+si.w*dx1/224+'px;height:'+si.h*dx1/224+'px; margin-left:'+(224-si.w)*dx1/224/2+'px;margin-top:'+(126-si.h)*dx1/224/2+'px;" src="'+thumb+'"></img>';
                            else
                                sInner+= '<img draggable=false  class="clThumb" width=100% height=100%  src="'+thumb+'"></img>';                         
                            sInner+= '</a><div id="id4_'+j+'" class="clOverlay"><a>'+cur.name+'</a></div>';
                            sInner+= '<div id="id5_'+cur.id+'" class="clEditOverlay"></div>';
                        }
                        sInner+= fr.CreateEditModeButtons( j, cur, dy1);
                    }
                    else
                    {
                        if ( cur.type == "ebayitem")
                        {
                            sInner+= fr.createEBayItemHtml(j,cur,thumb, dy1); 
                        }
                        else
                        {
                            if ( cur.type == "video")
                                sInner+= '<div id="id_'+j+'" style="background:#000" class="clToplink" ';
                            else
                                sInner+= '<div id="id_'+j+'" class="clToplink" ';
                            if ( cur.type == "app")
                            {
                                var si = new Object();
                                si.w = si.h = 90;
                                if ( cur.name.indexOf( "Web Store")>=0)
                                    sInner+= 'style="background:#bbb"';
                            }
                            else
                                var si = GetImageSize(thumb);
                            sInner+= '><a href="'+fr.ReplaceRedirectLanguage(cur.url, false)+'">';
                            
                            if ( cur.type == "video")
                            {
                                sInner+= fr.createVideoItemHtml(j,cur,thumb, dx1,dy1,si);                                 
                            } 
                            else if ( si)
                                sInner+= '<img draggable=false class="clThumb" style="width:'+si.w*dx1/224+'px;height:'+si.h*dx1/224+'px; margin-left:'+(224-si.w)*dx1/224/2+'px;margin-top:'+(126-si.h)*dx1/224/2+'px;" src="'+thumb+'"></img>';
                            else
                                sInner+= '<img draggable=false class="clThumb" width=100% height=100%  src="'+thumb+'"></img>'; 
                            sInner+= '</a><div id="id4_'+j+'" class="clOverlay"><a href="'+fr.ReplaceRedirectLanguage(cur.url, false)+'">'+cur.name+'</a></div>'; 
                            sInner+= '<div id="id5_'+cur.id+'" class="clEditOverlay"></div>';
                        }
                        sInner+= fr.CreateEditModeButtons( j, cur, dy1);
                    }
                    /*if ( fShowTitle)
                      sInner+= '<div class="clToplinkTitle"><center>'+cur.name+'</center></div>';
                      */
                    sInner+= '</div>';
                }
                if ( fShowSearchUrl)
                {                    
                    sInner+= '<div id="id3_'+j+'" class="clSearchToplink"><div class="clSearchToplinkL"></div>';
                    sInner+= '<div class="clSearchToplinkM"><form id="idform_'+j+'"><input class="clInput" id="idInput_'+j+'" type="text" /></form></div>';
                    sInner+= '<div id="idsearch_'+j+'" class="clSearchToplinkR"></div></div>';
                }
                
                
                
                sInner+= '</div>';
            }
    //        sInner+= '<div id="id4_'+j+'" class="clOverlay">'+cur.name+'</div>';
        }
        
        if ( !m)
        {
            sInner += "<div id='idOverlay'></div>";
            if ( this.slastInner != sInner)
            {
                this.slastInner= sInner;                 
                $("#toplinks").html(sInner);                
            }
        }
    }
    
    //-------------------------------- Toplink-Positionen berechnen --------------------------------
    x = (dx+10-(dx1+10)*nCols)/2;
    y = (dy-dy1*3-20)/2;
    row = 0;
    m = 2+5*dy1/126;
    var col = 0;
    
    
    var oParent = document.getElementById("toplinks"); 
    var xParent = parseInt(oParent.offsetLeft);
    var yParent = parseInt(oParent.offsetTop);  
        
    fr.lpDragTargets=0;
    var fdragitem=false;
    for (var j=0; j<count; j++)
    {
        var i = j+ofs;               
        if ( this.nCurFolderLevel>0 && !fVideoVersion)
        {
            i--; // zurück
        }        
        
        
        s = "idback_"+j;
        o2 = document.getElementById(s); 
        if ( !o2)
            continue;
        o2.style.width = dx1+"px";
        o2.style.height = dy1+"px";
        o2.style.left = x+"px";
        o2.style.top = y+"px";   
            
            /*
            
        s = "id_"+j;
        o2 = document.getElementById(s); 
        if ( !o2)
            continue;
        o2.style.width = "100%";
        o2.style.height = "100%";
        o2.style.left = 0+"px";
        o2.style.top = 0+"px";       
        */
        if ( fr.drag)
        {
            
            var cur = i>=0?bottom[i]:0;
            if (!fr.lpDragTargets)
                fr.lpDragTargets = new Array();
            if ( cur)
            {
                if ( fr.dragToplinkId == cur.id)
                    fdragitem=true;    
                    
                var target = new Object(); // Insert before
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y-dy1/3;
                target.height = dy1*2/3;
                target.toplinkId = cur.id;
                target.divId = "#id_"+j;
                fr.lpDragTargets.push( target);
            }
            
            //if ( !cur || cur.type=="f")
            {
                var target = new Object(); // Insert into
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y+dy1/3;
                target.height = dy1/3;
                
                if ( !cur || cur.type=="f")
                {
                    target.toplinkId = cur ? cur.id : -1;
                    target.divId = "#id_"+j;
                    target.mode = 1;
                }
                else if ( fdragitem && i+1<bottom.length) // Lücke war schon, d.h. Mitte gehört dem nächsten
                {
                    target.toplinkId = bottom[i+1].id;
                    target.divId = "#id_"+(j+1);
                }
                else // Lücke kommt noch, d.h. Mitte gehört diesem
                {
                    target.toplinkId = cur.id;
                    target.divId = "#id_"+j;
                }
                fr.lpDragTargets.push( target);
            }
            
            if ( row == 2 && i+1<bottom.length)
            {
                var target = new Object(); // Insert after
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y-dy1/3 +dy1+10;
                target.height = dy1*2/3;
                target.toplinkId = bottom[i+1].id;
                target.divId = "#id_"+(j+1);
                fr.lpDragTargets.push( target);
            }
            else if ( i+1==bottom.length)
            {
                var target = new Object(); // Insert after
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y-dy1/3 +dy1+10;
                target.height = dy1*2/3;
                target.toplinkId = "end";
                target.divId = "#id_"+(j);
                target.mode = 2; // At the end
                fr.lpDragTargets.push( target);
            }
        }
        
        if ( !this.lpOverlayPos[j])
            this.lpOverlayPos[j] = new Object();
            
        if ( col*2+1 == nCols && nCols < 5) // exact in the middle
		{
		    
			if ( row != 1)
			    this.lpOverlayPos[j].x = x;
			else
			    this.lpOverlayPos[j].x = x+dx1+10;
				
			if ( row == 0)
				this.lpOverlayPos[j].y  = y+dy1+10;
			else if ( row == 2)
			    this.lpOverlayPos[j].y  = y-2*dy1-2*10;
		    else
				this.lpOverlayPos[j].y  = y;
		}
		else
		{
            if ( col>=nCols/2)
                this.lpOverlayPos[j].x = x-2*dx1-2*10;
            else
                this.lpOverlayPos[j].x = x+dx1+10;
            
            if ( j%3 == 2)
                this.lpOverlayPos[j].y  = y-dy1-10;
            else
                this.lpOverlayPos[j].y  = y;
        }
        this.lpOverlayPos[j].dx  = 2*dx1+16;
        this.lpOverlayPos[j].dy = 2*dy1+14;
        
        s = "id3_"+j;
        o2 = document.getElementById(s); 
        if ( o2)
        {
            o2.style.width = (dx1-10)+"px";
            o2.style.height = 24+"px";
            o2.style.left = (5)+"px";
            o2.style.top = (dy1-30)+"px";
        }
        
        row++;
        y+= dy1+10;
        if ( row > 2)
        {
            col++;
            y = (dy-dy1*3-20)/2;
            x+=dx1+10;
            row=0;
        }
    }
    
    sInner="";
    if ( !fVideoVersion)
        if ( this.nCurFolderLevel>0)
            sInner = '<a id="idDotUp" class="clDots"><img src="./png/up.png"></img>  </a>';
    for (var i=0; i<this.nPages; i++)
    {
        if ( i == this.nCurPage)
            sInner+= '<a id="iddot_'+i+'" class="clDots"><img src="./png/dotSel.png"></img>  </a>';
        else
            sInner+= '<a id="iddot_'+i+'" class="clDots""><img src="./png/dot.png"></img>  </a>';
    }
    document.getElementById("divDots").innerHTML = sInner; 
    if ( this.nCurFolderLevel>0)
        $("#idDotUp").click(function() {fr.doSetFolder(-1);return false;});
    for (var i=0; i<this.nPages; i++)
    {  
        fr.myBindClick("#iddot_"+i, { param: i}, function(ev) {fr.doSetPage( ev.data.param);return false;});
    }
    
    o3 = document.getElementById("divLeft"); 
    o3.style.top = (80+(dy-38)/2)+"px";
    if ( this.nPages > 1)
        o3.style.display = 'block';
    else
        o3.style.display = 'none';
    o3 = document.getElementById("divRight"); 
    o3.style.top = (80+(dy-38)/2)+"px";
    if ( this.nPages > 1)
        o3.style.display = 'block';
    else
        o3.style.display = 'none';
        
    if ( editAfterResize)
    {
        fr.EditUrl( editAfterResize, true);
    }
    /*
    if ( fr.needRefresh)
    {
        setTimeout(function(){
            if ( fr.needRefresh)
            {
                fr.needRefresh=false;
                fr.doResizeHome();
            }
            }, 500);
    }*/
},


drag:0,
dragId:0,
dragToplinkId:0,
dragX:0,dragY:0,
dragBefore:0,
dragAllowPage:true,
mousehandleradded:false,
HandleDrag:function( mode, divId, toplinkId)
{
    if ( fr.idCurrentEdit)
        return;
        
    if ( fr.lpCurFolder && fr.lpCurFolder.type != "f" && fr.lpCurFolder.type != "v")
        return;
    if ( mode == 1)
    {
        if ( !fr.mousehandleradded)
        {
            fr.mousehandleradded = true;
            // addEventListener only if user want to drag&drop toplinks
            document.addEventListener( "mousemove", this.myMouseMove,false); 
        }
    
        this.dragToplinkId = toplinkId; 
        this.dragId = divId;
        this.drag = 1;
        this.dragBefore = 0;
        this.dragX = parseInt( $("#idDrag").css("left"));
        this.dragY = parseInt( $("#idDrag").css("top"));
        fr.dragLastTarget = -1;
    }
    else if ( mode == 0)
    {
        if ( !this.drag)
            return;
        this.drag = 0;
        $("#idDrag").hide();
        $("#idDrag").html("");
        $(this.dragId).css("visibility","visible");
        if ( this.dragBefore)
        {
            if ( fr.dragBefore.toplinkId != fr.dragToplinkId)
                fr.MoveToplinkBefore( this.dragToplinkId, this.dragBefore, true);
        }
        fr.doResize();
    }
    else if ( this.drag)
    {
        var x = parseInt( $("#idDrag").css("left"));
        var y = parseInt( $("#idDrag").css("top"));
        if ( this.drag == 1) // Noch nicht gestartet
        {
            if ( Math.abs(x-this.dragX)>5 || Math.abs(y-this.dragY)>5)
            {
                $("#idDrag").show();
                fr.doResize();
                this.drag = 2; // Starte jetzt das D&D
                $(this.dragId).css("visibility","hidden");
                var s = $(this.dragId).html();
                $(this.dragId).html("");
                $("#idDrag").html(s);
            }
        }
        else if ( fr.lpDragTargets)
        {
            x+=224/2;
            y+=126/2;
            
            var oParent = document.getElementById("toplinks"); 
            var xParent = parseInt(oParent.offsetLeft);
            var dxParent = parseInt(oParent.offsetWidth);
    
            if ( x < xParent&& this.nCurPage>0)
            {
                if ( fr.dragAllowPage)
                {
                    fr.dragAllowPage = false;
                    this.nCurPage--;
                    fr.doResize();
                }
                return;
            }
            else if ( x > dxParent+xParent && this.nCurPage+1<this.nPages)
            {
                if ( fr.dragAllowPage)
                {
                    fr.dragAllowPage = false;
                    this.nCurPage++;
                    fr.doResize();
                }
                return;
            }
            
            fr.dragAllowPage = true;
            this.dragBefore = 0;
            $(".clToplink").css( "border","1px solid #fff");
            for ( var j = 0; j < fr.lpDragTargets.length;j++)
            {
                var target = fr.lpDragTargets[j];                
                if ( x>=target.x && y>=target.y && x < target.x+target.width && y < target.y+target.height)
                {
                    this.dragBefore = target;
                    if ( 1)
                    {
                        if ( fr.dragBefore.toplinkId != fr.dragLastTarget)
                        {
                            fr.dragLastTarget = fr.dragBefore.toplinkId;
                            //console.log("doResizeHome2 "+fr.dragBefore.toplinkId+ "-"+fr.dragToplinkId);
                            fr.MoveToplinkBefore( fr.dragToplinkId, fr.dragBefore, false);
                            fr.doResize();
                        }
                    }
                    if ( target.mode)
                        $(target.divId).css( "border","1px solid #f00");
                    else
                        $(target.divId).css( "border","1px solid #00f");                                        
                    break;
                }
            }
            
        }
    }
},

CreateEditModeButtons:function( j, tl, dy1)
{
    if (fr.drag)
        return "";
        
    if ( fr.lpCurFolder && fr.lpCurFolder.type == "a") // Cannot delete an App
        return "";
        
    var sInner = '<div id="idBlack_'+j+'" class="clBlackButton"><center>'
    var w = 49*dy1/126/2;
    var fFolder = ( tl.type == "f" || tl.type == "m" || tl.type == "a" || tl.type == "e" || tl.type == "v");
    //if ( tl.type != "ebayitem")
    if ( !fr.lpCurFolder || fr.lpCurFolder.type == "f")
    {
        //sInner+= '<img width='+w+' id="idbegin_'+j+'" src="./png/movebegin.png" title="'+(fFolder?t['idbeginf']:t['idbegin'])+'"/>';
        //sInner+= '<img width='+w+' id="idend_'+j+'" src="./png/moveend.png" title="'+(fFolder?t['idendf']:t['idend'])+'"/>';
        if ( tl.type != "downloads")
            sInner+= '<img width='+w+' id="idedit_'+j+'" src="./png/editurl.png" title="'+(fFolder?t['ideditf']:t['idedit'])+'"/>';
    }
    sInner+= '<img width='+w+' id="iddel_'+j+'" src="./png/del.png" title="'+(fFolder?t['iddelf']:t['iddel'])+'"/>';
    sInner+= '</center></div>';
    return sInner;
},
 
createEBayItemHtml:function(j,cur,thumb, dy1)
{
    var f10 = 10*dy1/126;
    var f11 = 11*dy1/126;
    var f12 = 12*dy1/126;
    var f13 = 13*dy1/126;
    var f16 = 16*dy1/126;
    var sInner = '<div style="" id="id_'+j+'" class="clToplink"><a href="'+cur.url+'">';
    sInner+= '<div style="position:absolute; left:2%;top:4%;font-size:'+f12+'px;color:#000;font-weight:bold;"><img draggable=false class="clThumb" height=16px src="./png/ebay.png"></img></div>';                             
    sInner+= '<div style="position:absolute; left:32%;top:4%;right:2%;height:12%;font-size:'+f12+'px;color:#000;font-weight:bold;">'+cur.name+'</div>'; 
    sInner+= '<div style="position:absolute; left:32%;top:19%;right:2%;height:52%;font-size:'+f10+'px;color:#000;font-weight:normal;">'+cur.text+'</div>'; 
    sInner+= '<div style="position:absolute; left:2%;top:19%;width:29%;height:51%;"><img draggable=false class="clThumb" width=100% height=100%  src="'+thumb+'"></img></div>'; 
    sInner+= '<div style="position:absolute; left:2%;top:74%;height:24%;font-size:'+f16+'px;color:#00d;font-weight:bold;">'+cur.price+'</div>'; 

    if ( cur.sofort)
        sInner+= '<div style="position:absolute; left:2%;right:2%;top:75%;font-size:'+f10+'px;color:#777;font-weight:bold;"><center>'+t['buyitnow']+'</center></div>'; 
    
    if ( cur.shipping)
        sInner+= '<div style="position:absolute; left:2%;top:87%;width:36%;height:24%;font-size:'+f11+'px;color:#777;font-weight:normal;">'+t['shipping']+': '+cur.shipping+'</div>'; 
    else
        sInner+= '<div style="position:absolute; left:2%;top:87%;height:24%;font-size:'+f11+'px;color:#777;font-weight:normal;">'+t['noshipping']+'</div>'; 
    sInner+= '<div id="id6_'+j+'" style="position:absolute; left:40%;top:87%;right:2%;height:24%;font-size:'+f13+'px;color:#777;font-weight:bold;text-align:right">';
    sInner+= cur.timeLeft+'</div>'; 
    sInner+= '</a><div id="id4_'+j+'" class="clOverlay"><a href="'+cur.url+'">'+cur.name+'</a></div>'; 
    
    if ( cur.sec >= 0)
    {
        if ( !fr.aEBayTimesToRefresh)
            fr.aEBayTimesToRefresh = new Array();
        var o = new Object();
        o.end = cur.end;
        o.id = 'id6_'+j;
        fr.aEBayTimesToRefresh.push( o);
    }
    return sInner;
},

createVideoItemHtml:function(j,cur,thumb, dx1, dy1,si)
{
    var sInner="";
    for ( var i = 0; i < VideoSites.length; i++)
    {
        if ( cur.url.toLowerCase().indexOf(VideoSites[i].filter)>=0)
        {
            if ( !si)
            {
                si = new Object();
                si.w = VideoSites[i].w;
                si.h = VideoSites[i].h;                
            }
            if ( si)
            {
                var w = dx1;
                var h = w*si.h/si.w;
                if ( h<dy1)
                {
                    h = dy1;
                    w = h*si.w/si.h;
                }
                var mx = (dx1-w)/2;
                var my = (dy1-h)/2;
                
                sInner+= '<div class="clThumb" style="overflow:hidden;padding:0px;height:100%;width:100%;" >'; 
               // if ( mx >5 || my>5) // no round corners
                    sInner+= '<img draggable=false style="width:'+w+'px;height:'+h+'px; margin-left:'+mx+'px;margin-top:'+my+'px;" src="'+thumb+'"></img>';
               // else
                 //   sInner+= '<img draggable=false class="clThumb" style="width:'+w+'px;height:'+h+'px; margin-left:'+mx+'px;margin-top:'+my+'px;" src="'+thumb+'"></img>';
                sInner+= '</div>'; 
            }
            else
                sInner+= '<img draggable=false class="clThumb" width=100% height=100%  src="'+thumb+'"></img>'; 
            sInner+= '<div style="position:absolute; right:0;top:0;"><img draggable=false class="clVideoStrip"  src="./png/movie.png"></img></div>';  
            sInner+= '<div style="position:absolute; right:-1px;bottom:0;height:24px;"><img draggable=false class="clVideoLogo"  src="'+VideoSites[i].thumb+'"></img></div>';  
            break;
        }
    }
    return sInner;
},

createVideoOverlayHtml:function( thumb, dx1, dy1,si)
{
    var sInner="";
    if ( !si)
        return "";
    
    var w = dx1;
    var h = w*si.h/si.w;
    if ( h<dy1)
    {
        h = dy1;
        w = h*si.w/si.h;
    }
    var mx = (dx1-w)/2;
    var my = (dy1-h)/2;
    
    sInner+= '<div class="clThumb" style="overflow:hidden;padding:0px;height:100%;width:100%;" >'; 
    sInner+= '<img draggable=false style="width:'+w+'px;height:'+h+'px; margin-left:'+mx+'px;margin-top:'+my+'px;" src="'+thumb+'"></img>';
    sInner+= '</div>'; 
    return sInner;
},
 
onHistoryChange:function(ev)
{
    $("#idAll").hide();
    
    $("#idInput").val("");
    var s = window.location.hash;
    for ( i = 0; i < s.length; i++)
    {
        if ( s.charAt(i)=='_') 
        {
            return;	            
        }
    }
},

prepareToplinksRecur: function( parent)
{
    for (var i=0; i<parent.length; i++)
    {
        if ((typeof(parent[i].url) != undefined) && (parent[i].url!= undefined))
        {
	        if  (parent[i].url.indexOf("http://")==-1)
	        if  (parent[i].url.indexOf("https://")==-1)
		        parent[i].url = "http://"+parent[i].url; 
        }
        
        fr.replaceZanoxRedirect(parent[i]);
        parent[i].url = fr.ReplaceEBayAmazonPostfix(parent[i].url);
        parent[i].def = true;
        parent[i].thumb=this.GetThumb(parent[i].url, parent[i].name);
        if ( parent[i].Toplinks)
            this.prepareToplinksRecur( parent[i].Toplinks);
    }
},

reloadRedirectThumbs: function( parent)
{
    for (var i=0; i<parent.length; i++)
    {
        var url = parent[i].url;
        if( url && url.indexOf("startpage24.com/redirect.asp")>=0)
        {
            parent[i].thumb=fr.GetThumb(parent[i].url, parent[i].name);
        }
        if ( parent[i].Toplinks)
            this.reloadRedirectThumbs( parent[i].Toplinks);
    }
},

hideHelp:function( id, bit)
{
    fr.settings.help|=bit;
    $("#"+id).hide();
    fr.SaveSettings();
},

InitAutoComplete:function () 
{
    var id = "#idInput";
    $( id).autocomplete({ source: function( request, response ) {
		 
		var datenow = new Date();		
        var autcopleteURL = "https://www.google.de/s?hl="+fr.curLang+"&cp=1&gs_id=6&xhr=t&q="+$(id).val(); //http://ariadne.esemos.de/www_suggestion/ariadne/suggestion?q="+$("#search").val()+"&ts="+datenow.getTime()+"&&context=web"; 
		$.ajax({
  			dataType: 'jsonp',
  		    url: autcopleteURL,
  		    success: function (j) {
				x = j[1];//.suggestions.Suggests;
					x2 = new Array();
					s = $(id).val().toLowerCase();
					inarr = false;
					exx = 0;
					$.each(x, function(index, value) {
						if( s !=  value[0]/*.suggest[2]*/ ) {
							x2.push( value[0]/*.suggest[2]*/);
						}
						else 
							inarr = true;
						
						if( $.strstr(value[0], s) ) {
							exx += 1;
						}
					;
					});
					
					if(inarr) x2.unshift(s);
					if(x2.length > 0) {
						if(exx > 0) {
							ac_helper = x2[0];
							ac_helper = ac_helper.replace($(id).val().toLowerCase(),$(id).val());
						}
						else 
							ac_helper = "";
						    if($("#idInput_suggestion").html() != ac_helper ) {
							    $("#idInput_suggestion").html(ac_helper);
                                    //doSearch(x2[0]); // search first autocomplete entry								
							    }
						
						if(x2.length > 8 ) x2.length = 8 ;
						response( $.map( x2, function( item ) {
							return {
								label: item,
								value: item
							}
						}));
					}
					else {
						$(id).autocomplete("close");
					}
		
		}});
		},
		minLength: 1,
		autoFocus: false,
		select: function(event, ui) {
		    $("#idInput_suggestion").html(ui.item.label);
			$(id).val(ui.item.label);
			fr.doSearch(-1)
			//$("#idForm").submit(); 
			return false;
		},
		
		focus: function(event, ui) {
			if($("#idInput_suggestion").html() != ui.item.label ) {
			}
		},
		search: function(event,ui) {
			$("#idInput_suggestion").html("");
		},
		open: function(event,ui) {
		
		    if ( typeof( ac_closeString)!= 'undefined')
		    if ( ac_closeString == $(id).val()) // avoid that autocomplete goes up after pressing return;
		    {
        	    $(id).autocomplete("close");
        	    return;
            }
		},
		close: function() {
			$("#idInput_suggestion").html("");
		}
	});
	
	fr.myBind("ul.ui-autocomplete", "menublur", {}, function(event, ui) {
	    $("#idInput_suggestion").html("");
    		
	    });
	$(id).keydown(function(e) {
        if(e.keyCode == 13) 
        {
            e.preventDefault();
            if( $(id).val() != "") 
            {
                ac_closeString = $(id).val();
        	    $(id).autocomplete("close");
        	    fr.doSearch(-1)
            }
    		return false;
        }
        else  if(e.keyCode == 27) 
        {
        	e.preventDefault();
        	if( $(id).val() != "") 
            {
                ac_closeString = $(id).val();
        	    $(id).autocomplete("close");
            }
        	return false;
        }
        ac_closeString = "";        	
        var s = $(id).val();
        
    });
    
    $(id).keyup(function(e) {
		
        var s = $(id).val();
    });
},


DownloadSlideList:function()
{

var s = [
{}
,{"countries":"de","Slideshow":[
{"url":"http://www.google.de/imgres?hl=en&safe=images&tbo=d&as_st=y&biw=1618&bih=922&tbs=isz:l&tbm=isch&tbnid=8eXhVM3_AJLc3M:&imgrefurl=http://socialbarrel.com/ebay-unveils-new-logo/43799/&docid=MmaSalJbEyzgeM&imgurl=http://socialbarrel.com/wp-content/uploads/2012/09/eBay-Unveils-New-Logo-A.png&w=1280&h=960&ei=gEcSUaGLN8nZsgaZl4H4DQ&zoom=1&iact=hc&vpx=238&vpy=161&dur=546&hovh=194&hovw=259&tx=122&ty=96&sig=116452770256358130937&page=1&tbnh=139&tbnw=185&start=0&ndsp=39&ved=1t:429,r:1,s:0,i:83","icon":"http://my.startpage24.com/_libs/extension.lib/png/backebay.png","name":"eBay Unveils New Logo"}
]
}
,{"countries":"us",}
,{"countries":"fr",}
,{"countries":"gb",}
];
//userContent.ThemeID="mode";
    var url = "https://my.startpage24.com/_libs/extension.lib/index2.php?cmd=Slideshow&callback=?&params="+userContent.ThemeID;
    var opt = { 'dummy' : Math.floor(Math.random()*123456789)};
    $.getJSON( url, opt, function(data) 
    { 
        var list = data.response;
        //alert( typeof(list));
        
        if ( typeof(list)!= 'object' && typeof(list)!= 'array')
            return;
        if ( !list)
            return;
    //console.log( "DownloadSlideList:");
   // console.log( list);
     
        var def = 0;
        for ( var i = 0; i< list.length; i++)
        {
            if ( !list[i].countries)
            {
                def = i;
                break;
            }
        }
        userContent.Slideshow = list[0].Slideshow;
        if ( fr.settings.country)
            for ( var i = 0; i< list.length; i++)
            {
                if ( list[i].countries && list[i].countries.indexOf( fr.settings.country)>=0)
                {
                    userContent.Slideshow = list[i].Slideshow;
                    break;
                }
            }
    
        fr.SetDefaultSlideshowlist();
    });    
},

GetDefaults:function( callback)
{
    if ( typeof(chrome)!= 'undefined')
    {
        // Chrome
        
        var sitems = L64P._db._locStorage.getItem("defaults")
            
        if ((sitems == null)||(typeof(sitems)== 'undefined'))
        {
			defaults = defaults2;
			L64P._db._locStorage.setItem("defaults", JSON.stringify(defaults)); 
		}
		else
		{
			defaults = JSON.parse(sitems);
			if ( !defaults || !defaults.addOnShops)
			    defaults = defaults2;
        }
        callback();
        
        /*chrome.storage.local.get("defaults", function(data)
        {
            if ( !data)
            {
                defaults = defaults2;
                L64P._db._locStorage.setItem("defaults", JSON.stringify(defaults)); 
            }
            else
                defaults = JSON.parse(data);
            callback();
        });
        */
    }
    else // Firefox
    {
        if ( !fr._locStorage)
            fr.setStorage();
        var sitems = fr._locStorage.getItem("defaults")
            
        if ((sitems == null)||(typeof(sitems)== 'undefined'))
        {
			defaults = defaults2;
			fr._locStorage.setItem("defaults", JSON.stringify(defaults)); 
		}
		else
		{
			defaults = JSON.parse(sitems);
			if ( !defaults || !defaults.addOnShops)
			    defaults = defaults2;
        }
        callback();
        
    }
    setTimeout(function(){fr.DownloadDefaults();}, 1500);
},

DownloadDefaults:function()
{
if (0)
    if ( defaults.date)
    {
        var cur = new Date();
        var d = new Date( defaults.date);
        var t1 = d.getTime() / 1000;
        var t2 = cur.getTime() / 1000;
  	    var sec = Math.floor(t2-t1);
        //alert( t1+" "+t2+" "+ sec);
  	    if ( sec < 60*60*6) // max once every 6 hours
  	        return;
    }
    var url = "https://my.startpage24.com/_libs/extension.lib/index4.php?callback=?&params="+userContent.ThemeID;
    $.getJSON( url, {}, function(data) 
    { 
        var defaultsNew = data.response;
        if ( defaultsNew && defaultsNew.addOnShops && defaultsNew.addOnThumbs && defaultsNew.SearchURLs && defaultsNew.Frames)
        {
            defaultsNew.date= new Date();
            //alert( print_r(defaultsNew.Frames));
            if (fFirefox)
                fr._locStorage.setItem("defaults", JSON.stringify(defaultsNew)); 
            else 
                L64P._db._locStorage.setItem("defaults", JSON.stringify(defaultsNew)); 
        }
    });    
},

SetDefaultSlideshowlist:function()
{
    var m = fr.settings.lastSlide;
    if ( !m)
        fr.curSlide = 0;
    else
        fr.curSlide = parseInt( m)+1;

     if ( !userContent.Slideshow)        
        return;        
    if ( fr.curSlide >= userContent.Slideshow.length)
        fr.curSlide = 0;
        
    fr.foundSlides = new Array();
    for ( var j = 0; j < userContent.Slideshow.length; j++)
    {
        var imageinfo = new Object();
        imageinfo.url = userContent.Slideshow[j].icon;
        imageinfo.titleNoFormatting  = userContent.Slideshow[j].name;
        imageinfo.contentNoFormatting = "";
        imageinfo.originalContextUrl = userContent.Slideshow[j].url;
        fr.foundSlides.push(imageinfo);
    }
    
    fr.settings.lastSlide = fr.curSlide+"s";
    var sl = userContent.Slideshow[fr.curSlide];
    fr.setCurSlide( sl.icon, 0, sl.name, sl.url);
    fr.cacheSlide( fr.curSlide+1);
},


SetUserContent:function( )
{
    var def = 0;
    for ( var i = 0; i< userContentLocale.length; i++)
    {
        if ( !userContentLocale[i].countries)
        {
            def = i;
            break;
        }
    }
    if ( fr.settings.country)
        for ( var i = 0; i< userContentLocale.length; i++)
        {
            if ( userContentLocale[i].countries && userContentLocale[i].countries.indexOf( fr.settings.country)>=0)
            {
                userContent = userContentLocale[i];
                return;
            }
        }
    userContent = userContentLocale[def];     
},

ChangeLanguage:function( )
{
    fr.SetUserContent();
    if ( fr.settings.fChangeToplinks)
    {
        fr.DelDefaultToplinks(0);
        fr.prepareToplinksRecur( userContent.Toplinks);
        
        for ( var i = 0; i <userContent.Toplinks.length;i++)
        {
            var o = userContent.Toplinks[i];
            o.id=fr.nextfreeid++;
            fr.lpToplinkBottomFolder.push( o);
        }
        fr.SaveToplinks();
    }
},

ResetTheme:function( )
{
    if ( !confirm(t["resethelp2"]))
        return;
        
    fr.CreateBestOfBar();
    fr.SetDefaultSettings();    
    fr.ChangeLanguage();
    fr.setDefaultToplinks();    
    fr.ShowToplinks(fr.settings.fShowToplinks);
    fr.doResize();
    fr.doShowHelp();
    fr.ShowMsgDlg(0);
    fr.ShowMsgDlg(1);
},

SetDefaultSettings:function () 
{
    fr.settings = new Object();   
    fr.settings.fShowToplinks = true;
    fr.settings.fPauseSlide = false;
    fr.settings.fChangeToplinks = false;
    fr.settings.folder=fVideo?255:(255-8);
    fr.settings.special=255;
    
    fr.settings.trans= userContent.trans ? userContent.trans : "0.9";
    fr.settings.ebaysec = 60;
    fr.settings.mostVisitedFilter=",";
    fr.settings.fUseThemeDefaults = true;
    fr.settings.fShowSlideshow = false;
    fr.settings.lastSlide = "";
    
    fr.settings.country ="de";
    for(i=0; i< fr.aLanguages.length; i++)
    {
        var l = fr.aLanguages[i].toLowerCase();
        if ( l == "de-ch")
        {
            fr.settings.country ="ch";break;
        }
        else if ( l.indexOf("de")==0)
        {
            fr.settings.country ="de";break;
        }
        else if ( l == "en-us")
        {
            fr.settings.country = "us";break;
        }
        else if ( l.indexOf("en")==0)
        {
            fr.settings.country ="gb";break;
        }
        else if ( l.indexOf("fr")==0)
        {
            fr.settings.country ="fr";break;
        }
        else if ( l.indexOf("es")==0)
        {
            fr.settings.country ="es";break;
        }
        else if ( l.indexOf("it")==0)
        {
            fr.settings.country ="it";break;
        }
        else if ( l.indexOf("pl")==0)
        {
            fr.settings.country ="pl";break;
        }
        else if ( l.indexOf("tr")==0)
        {
            fr.settings.country ="tr";break;
        }
        else if ( l.indexOf("nl")==0)
        {
            fr.settings.country ="nl";break;
        }
    }
  
    /*
    if ( fr.curLang == "de")
        fr.settings.country = "de";
    else if ( fr.curLang == "en")
        fr.settings.country = "us";
    else if ( fr.curLang == "fr")
        fr.settings.country = "fr";
    else 
        fr.settings.country = "";
        */
    fr.SetUserContent();
    fr.settings.sync=true;
    fr.settings.border=userContent.border;

    if ( userContent.textcolor)
        fr.settings.color_text = userContent.textcolor;
    else
        fr.settings.color_text = '#fff';
        
    if ( userContent.bordercolor)
        fr.settings.color_border = userContent.bordercolor;
    else
        fr.settings.color_border = '#000';
        
    if ( userContent.backgroundcolor)
        fr.settings.color_background = userContent.backgroundcolor;
    else
        fr.settings.color_background = '#555';

    fr.settings.SlideshowSearch = userContent.SlideshowSearch;
    fr.settings.help=15;
    if ( fFirefox)
        fr.settings.help|=64
    fr.SaveSettings();

},

FindToplinkType:function( parent, type)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.type == type)
            return o;         
        if ( o.Toplinks)
        {
            var result = this.FindToplinkType( o, type);
            if ( result)
                return result;
        }
    }
    return 0;
},

FindToplinkByUrl:function( parent, url)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.url == url)
            return o;         
        if ( o.Toplinks)
        {
            var result = this.FindToplinkByUrl( o, url);
            if ( result)
                return result;
        }
    }
    return 0;
},

AddDefaultFolder:function ( fSave) 
{
    if ( fVideoVersion)
        return;
    if ( fr.settings.special&1)
    if ( !fr.FindToplinkType( 0, "downloads"))
    {
        var o = new Object();
        o.searchurl="";
        o.type="downloads"
        o.name = t["downloads"];
        o.thumb="./png/downloads.png";
        if ( fFirefox)
            o.url="chrome://mozapps/content/downloads/downloads.xul";
        else
            o.url="chrome://downloads/";
        
        o.Toplinks = new Array();
        o.p1x1="";
        o.id=fr.nextfreeid++;
        if ( feBayVersion)
            fr.lpToplinkBottomFolder.push(o);
        else
            fr.lpToplinkBottomFolder.splice(0,0,o);
        fSave = true;
    }
    
    if ( fr.settings.folder&1)
    if ( !fr.FindToplinkType( 0, "e"))
    {
        var o = new Object();
        o.searchurl="";
        o.type="e"
        o.name = t["ebaylist"];
        o.Toplinks = new Array();
        o.p1x1="";
        o.id=fr.nextfreeid++;
        fr.lpToplinkBottomFolder.splice(0,0,o);
        fSave = true;
    }
    
    if ( fr.settings.folder&4)
    if ( !fr.FindToplinkType( 0, "m"))
    {
        var o = new Object();
        o.searchurl="";
        o.type="m"
        o.name = t["mostvisited"];
        o.Toplinks = new Array();
        o.p1x1="";
        o.id=fr.nextfreeid++;
        if ( feBayVersion)
            fr.lpToplinkBottomFolder.push(o);
        else
            fr.lpToplinkBottomFolder.splice(0,0,o);
        fSave = true;
    }
    
    if ( !fFirefox)
    if ( fr.settings.folder&2)
    if ( !fr.FindToplinkType( 0, "a"))
    {
        var o = new Object();
        o.searchurl="";
        o.type="a"
        o.name = t["apps"];
        o.Toplinks = new Array();
        o.p1x1="";
        o.id=fr.nextfreeid++;
        if ( feBayVersion)
            fr.lpToplinkBottomFolder.push(o);
        else
            fr.lpToplinkBottomFolder.splice(0,0,o);
        fSave = true;
    }
    
    if ( fr.settings.folder&8)
    if ( !fr.FindToplinkType( 0, "v"))
    {
        var o = new Object();
        o.searchurl="";
        o.type="v"
        o.name = t["videolist"];
        o.Toplinks = new Array();
        o.p1x1="";
        o.id=fr.nextfreeid++;
        if ( feBayVersion)
            fr.lpToplinkBottomFolder.push(o);
        else
            fr.lpToplinkBottomFolder.splice(0,0,o);
        fSave = true;
    }
    if ( fSave)    
        fr.SaveToplinks();

},
        
setDefaultToplinks:function () 
{
    if ( fVideoVersion)
        return;
    fr.nextfreeid=1;
    fr.prepareToplinksRecur( userContent.Toplinks);
    fr.lpToplinkBottomFolder = fr.CopyArray( userContent.Toplinks, true);  
    fr.SetIds( fr.lpToplinkBottomFolder);
    
    fr.AddDefaultFolder( true);
    
    fr.lpCurFolder = 0;
    fr.nCurFolderLevel = 0;
    fr.curFilter="";
},

doShowHelp:function () 
{
    $(".clHelp").hide();
   
    if ( fr.lpCurFolder && fr.lpCurFolder.type == "e")
    {
        if ( !(fr.settings.help&16))
            $("#idHelpEBay").show();
    }
    else if ( fr.lpCurFolder && fr.lpCurFolder.type == "v")
    {
        if ( !(fr.settings.help&256) && !fr.videoPlaying)
            $("#idHelpVideo").show();
    }
    else
    {
        if ( fr.fEditMode)
        {
            if ( !fr.lpCurFolder || fr.lpCurFolder.type == "f")
                if ( !(fr.settings.help&32))
                    $("#idHelpDrag").show();
        }
        else
        {
            //if ( !(fr.settings.help&1))
            //    $("#idHelpEdit").show();
            if ( !(fr.settings.help&2))
                $("#idHelpSlideshow").show();
            if ( !(fr.settings.help&4))
                $("#idHelpSearch").show();
            if ( !(fr.settings.help&8))
                $("#idHelpSettings").show();
                
            if ( !fr.settings.fShowToplinks)
            {
                if ( !(fr.settings.help&128))
                    $("#idHelpToggle").show();
            }
            
            if ( !(fr.settings.help&64))
                $("#idHelpHomepage").show();
        }
    }
},

SetStars:function( count, clicked)
{
    if ( fr.shadowcolor == "#000")
        var s1 = "./png/star1.png";
    else
        var s1 = "./png/star3.png";
    var s2 = "./png/star2.png";
    if ( count<0)
        count = fr.settings.Stars;
        
    if ( clicked)
    {
        fr.settings.Stars=count;
        fr.SaveSettings();
        var url = "https://my.startpage24.com/_libs/theme/upload-file.php?cmd=rat&theme="+userContent.ThemeID+"&serial="+fr.settings.sn+"&r="+count;
        url += "&callback=?";
        var opt = { 'dummy' : Math.floor(Math.random()*123456789)};
        $.getJSON( url, opt, function(data) 
        { 
            //alert( data);
        });    
    }
        
    $("#star1").attr( "src", count>=1?s1:s2);
    $("#star2").attr( "src", count>=2?s1:s2);
    $("#star3").attr( "src", count>=3?s1:s2);
    $("#star4").attr( "src", count>=4?s1:s2);
    $("#star5").attr( "src", count>=5?s1:s2);
},


setHistory:function()
{
	var bAddHistory = false; 
	try{
		bAddHistory = (typeof(history.next)== 'undefined'); 
	}
	catch(e){
		bAddHistory = true; 
	}
	
	if (bAddHistory)
	{
		//alert("Add"); 
		history.pushState({A:'SET'}, "Startpage24", location.href); 
	}
		
}, 

_locStorage:false,
setStorage:function()
	{
		var url = "http://ffext.startpage24.com/";
		var ios = Components.classes["@mozilla.org/network/io-service;1"]
          .getService(Components.interfaces.nsIIOService);
		var ssm = Components.classes["@mozilla.org/scriptsecuritymanager;1"]
          .getService(Components.interfaces.nsIScriptSecurityManager);
		var dsm = Components.classes["@mozilla.org/dom/storagemanager;1"]
          .getService(Components.interfaces.nsIDOMStorageManager);
 		var uri = ios.newURI(url, "", null);
		var principal = ssm.getCodebasePrincipal(uri);
		var FFstorage = dsm.getLocalStorageForPrincipal(principal, "");
		fr._locStorage = FFstorage; 
	},	


myGetLocalStorage:function( callback)
{
    if ( typeof(chrome)!= 'undefined')
    {
        // Chrome
        chrome.storage.sync.get('newToplinks', function(data)
        {
            //alert( languageList);
            callback(data);
        });
    }
    else // Firefox
    {
        if ( !fr._locStorage)
            fr.setStorage();
        var sitems = fr._locStorage.getItem('newToplinks')
        if ((sitems == null)||(typeof(sitems)== 'undefined'))
			aItems = new Array();
		else
			aItems = JSON.parse(sitems);
			
        callback({newToplinks:aItems});
    }
},    

myDelLocalStorage:function()
{
    if ( typeof(chrome)!= 'undefined')
        chrome.storage.sync.set({newToplinks: 0}, function(){}); 
    else
        fr._locStorage.setItem("newToplinks", 0); 
},

addNewToplinksFromList:function()
{
    fr.myGetLocalStorage( function(data)
    //chrome.storage.sync.get('newToplinks', function(data)
	{

	    var sitems = data.newToplinks; 
	    if ( !sitems)
	        return;
        if ( !sitems.length)
        {
            fr.myDelLocalStorage();
          //  L64P._db._locStorage.setItem('newToplinks', 0);
            //chrome.storage.sync.set({newToplinks: 0}, function(){}); 
	        return;
	       }
	    if ((sitems == null)||(typeof(sitems)=='undefined'))
		    return;
	    var fAdded = false;
	    for (var i =0; i<sitems.length; i++)
		{
		    var j = sitems[i].indexOf( '<->');
		    if ( j>=0)
		    {
    		    var title = sitems[i].substr(0,j);
    		    var url = sitems[i].substr(j+3);
            }
            else
            {
                var title = "";
                var url = sitems[i];
    		}   
    		
    		var tl = fr.FindToplinkByUrl( 0, url);
    		if ( !tl)
    		{
    		    var o = new Object();
                o.searchurl="";
                o.type="l"
                o.url = url;
                o.name = title;
                o.p1x1="";
                o.id=fr.nextfreeid++;
                fr.lpToplinkBottomFolder.splice(0,0,o);// = a.concat( fr.lpToplinkBottomFolder);
                fAdded=true;
    		}
			//alert( title+"   +   "+url);
		}
        if ( fAdded)
        {
            fr.SaveToplinks();
            fr.doResizeHome();
        }
		fr.myDelLocalStorage();
    });
},
				
nextEBayItem:0,
page:0,
startvideoid:false,
doInit:function () 
{

//var i = window.location.href;
    if ( window.location.href.indexOf( "page=ebay")>=0)
        fr.page="ebay";
    else if ( window.location.href.indexOf( "page=video")>=0)
    {
        var i = window.location.href.indexOf( "&id=");
        if ( i >=0)
        {
            fr.startvideoid = window.location.href.substr( i+4);
            i = fr.startvideoid.indexOf( "&");
            if ( i>=0)
                fr.startvideoid = fr.startvideoid.substr( 0,i);
        }
        fr.page="video";
    }     
        
//alert( "a:"+window.location.href);
    if ( fFirefox)
    {
        setTimeout(function(){fr.setHistory();}, 500);
     //   if ( window.history.length<=1)
     //       window.history.pushState({}, "Startpage24", window.location.href);
    }
    fr.InitAutoComplete();
    
    fr.doShowHelp();
    // prevent Drag&Drop
    $(document).bind("dragstart", function(e) {
         if (e.target.nodeName.toUpperCase() == "IMG") 
             return false;
         else if (e.target.nodeName.toUpperCase() == "A") 
            return false;
         else
            alert( e.target.nodeName.toUpperCase());
    });

   
fr.SetStars(-1,false);

fr.myBindIn("#idStars", {  }, function(ev) {$(".clstar").show()});
fr.myBindOut("#idStars", {  }, function(ev) {$(".clstar").hide()});
fr.myBindIn("#star1", {  }, function(ev) {fr.SetStars(1,false);});
fr.myBindOut("#star1", {  }, function(ev) {fr.SetStars(-1,false);});
fr.myBindClick("#star1", {  }, function(ev) {fr.SetStars(1,true);});
fr.myBindIn("#star2", {  }, function(ev) {fr.SetStars(2,false);});
fr.myBindOut("#star2", {  }, function(ev) {fr.SetStars(-1,false);});
fr.myBindClick("#star2", {  }, function(ev) {fr.SetStars(2,true);});
fr.myBindIn("#star3", {  }, function(ev) {fr.SetStars(3,false);});
fr.myBindOut("#star3", {  }, function(ev) {fr.SetStars(-1,false);});
fr.myBindClick("#star3", {  }, function(ev) {fr.SetStars(3,true);});
fr.myBindIn("#star4", {  }, function(ev) {fr.SetStars(4,false);});
fr.myBindOut("#star4", {  }, function(ev) {fr.SetStars(-1,false);});
fr.myBindClick("#star4", {  }, function(ev) {fr.SetStars(4,true);});
fr.myBindIn("#star5", {  }, function(ev) {fr.SetStars(5,false);});
fr.myBindOut("#star5", {  }, function(ev) {fr.SetStars(-1,false);});
fr.myBindClick("#star5", {  }, function(ev) {fr.SetStars(5,true);});
    
    //$("#idHelpEdit").click( function() { fr.hideHelp( "idHelpEdit",1);return false;});    
    $("#idHelpSlideshow").click( function() {fr.hideHelp( "idHelpSlideshow",2);return false;});    
    $("#idHelpSearch").click( function() {fr.hideHelp( "idHelpSearch",4);return false;});    
    $("#idHelpSettings").click( function() {fr.hideHelp( "idHelpSettings",8);return false;});    
    $("#idHelpEBay").click( function() {fr.hideHelp( "idHelpEBay",16);return false;});
    $("#idHelpVideo").click( function() {fr.hideHelp( "idHelpVideo",256);return false;});
    $("#idHelpDrag").click( function() {fr.hideHelp( "idHelpDrag",32);return false;});    
    $("#idHelpHomepage").click( function() {fr.hideHelp( "idHelpHomepage",64);return false;});    
    $("#idHelpToggle").click( function() {fr.hideHelp( "idHelpToggle",128);return false;});    
    
    $("#idChromeSettings").click( function() {
        L64P.browser.showSettings({where:'newTab'});
        return false;
    });    
    
    $("#idebay").click( function() {
        var url = fr.ReplaceRedirectLanguage("http://go.startpage24.com/redirect.asp?Target=ebay.[postfix]&country=[country]&lang=[lang]&serial=[serial]", false);
        window.location.replace( url);
        return false;
    });    
    
    $("#idyoutube").click( function() {
        window.location.replace( "http://youtube.com");
        return false;
    });    
    $("#idvimeo").click( function() {
        window.location.replace( "http://vimeo.com");
        return false;
    });    

    var b1 = fr.GetBorderColor();
    var b2 = fr.GetGradientColor(b1);
    
    if ( fFirefox)
    {
        $("#idBottombarGradient").css("background", "linear-gradient(to bottom, "+b2+" 0%,"+b1+" 100%");
        $("#topbar").css("background", "linear-gradient(to bottom, "+b2+" 0%,"+b1+" 100%");
    }
    else
    {
        $("#idBottombarGradient").css("background", "-webkit-linear-gradient(top, "+b2+", "+b1+")");
        $("#topbar").css("background", "-webkit-linear-gradient(top, "+b2+", "+b1+")");
    }
    
    //$("#body").css("background",fr.GetBorderColor());
    $(".clTextColor").css("color",fr.GetTextColor());
    
    
    if ( fVideoVersion)
    {
        var o = new Object();
        o.searchurl="";
        o.type="v"
        o.name = t["videolist"];
        o.Toplinks = new Array();
        o.p1x1="";
        o.id=fr.nextfreeid++;
        fr.lpToplinkBottomFolder = new Array();
        fr.lpToplinkBottomFolder.splice(0,0,o);
        fr.doSetFolder( o.id);
        
        fr.doResize();
        fr.CreateBestOfBar();
        fr.onHistoryChange(0);
    }
    else
    {
        L64P.toplinks.getLocal({},function(data)
	    {
	        //alert( "getLocal: <"+data.toplinks+">");
	        //data.toplinks=false;//####fr
		    fr.lpToplinkBottomFolder = data.toplinks;
		    fr.nextfreeid=data.nextid;
	        if ( fr.lpToplinkBottomFolder == false || fr.lpToplinkBottomFolder == null)
            {
                fr.setDefaultToplinks();            
            }
            
            if ( fr.settings.version != 29) // Add video folder once
            {
                fr.settings.version = 29;
                if ( !(fr.settings.folder&8))
                {
                    fr.settings.folder |= 8;
                    fr.AddDefaultFolder( true);
                    fr.SaveSettings();
                }
            }
            
            //fr.GetNextFreeId( fr.lpToplinkBottomFolder);
            //fr.SetIds( fr.lpToplinkBottomFolder);
            
            if ( fr.page=="ebay")
            {
                if ( !(fr.settings.folder&1))
                {
                    fr.settings.folder |= 1;
                    fr.SaveSettings();
                }
                var tl =fr.FindToplinkType( 0, "e");
                if ( tl)
                {
                    fr.doSetFolder( tl.id);
                }
                else
                {
                    var o = new Object();
                    o.searchurl="";
                    o.type="e"
                    o.name = t["ebaylist"];
                    o.Toplinks = new Array();
                    o.p1x1="";
                    o.id=fr.nextfreeid++;
                    fr.lpToplinkBottomFolder.splice(0,0,o);
                    fr.SaveToplinks();
                    fr.doSetFolder( o.id);
                }
            }
            else if ( fr.page=="video")
            {
                if ( !(fr.settings.folder&8))
                {
                    fr.settings.folder |= 8;
                    fr.SaveSettings();
                }
                var tl =fr.FindToplinkType( 0, "v");
                if ( tl)
                {
                    fr.doSetFolder( tl.id);
                }
                else
                {
                    var o = new Object();
                    o.searchurl="";
                    o.type="v"
                    o.name = t["videolist"];
                    o.Toplinks = new Array();
                    o.p1x1="";
                    o.id=fr.nextfreeid++;
                    fr.lpToplinkBottomFolder.splice(0,0,o);
                    fr.SaveToplinks();
                    fr.doSetFolder( o.id);
                }
                
            }
            
            fr.addNewToplinksFromList();
            fr.doResize();
            fr.CreateBestOfBar();
            fr.onHistoryChange(0);
        });
    
        fr.lpCurFolder = 0;
        fr.nCurFolderLevel = 0;
        fr.curFilter="";
    }

    
                
    //userContent.pattern = "./png/pattern_left.png";
    if ( userContent.pattern)
    {
        var o = document.getElementById( "idTopbarImg");
        if ( o)
            o.style.display="none";
        o = document.getElementById( "idBorder");
        o.style.background="url("+userContent.pattern+")";
        document.getElementById( "idSlideshow").style.left="40px";
        document.getElementById( "idSlideshow").style.right="40px";
    }
        
    fr.RefreshBorder();
    
    window.addEventListener( "resize",this.doResize,false);
    //window.onresize = this.doResize; 
    fr.InitSearchProvider();
   
    // ------------ Set Language text ------------ 
    /*$("#idSearchButton2").html(t['search']);
    $("#idFilterText").html(t['filter']);
    $("#idButtonDone").val(t['done']);
    $("#idEditModeCancel").val(t['cancel']);
      */  
   
   
    var slideshowSearchWord = fr.GetSlideshowSearchWord();
    if ( slideshowSearchWord || (userContent.Slideshow && userContent.Slideshow.length > 0))
    {
        var sInner = "";
        //aspect: 0:Stretch keep aspect ratio 1: stretch ohne aspect ratio 2: Balken 
        if ( slideshowSearchWord)
        {
            if ( fr.settings.NextSlide)
                fr.setCurSlide( fr.settings.NextSlide, 0, fr.settings.NextTitle, fr.settings.NextUrl);
            fr.LoadSlides( slideshowSearchWord);
        }
        else
        {
            if ( fr.settings.NextSlide)
                fr.setCurSlide( fr.settings.NextSlide, 0, fr.settings.NextTitle, fr.settings.NextUrl);
            //fr.SetDefaultSlideshowlist();
            fr.DownloadSlideList();
        }
        setTimeout(function(){fr.positionSlideshow(1);}, 100);
        fr.createSlideshowControls();
    }
    
    $("#idInputFilter").keyup(function() { fr.SetFilter(this.value)});
    $("#idForm").submit(function(){fr.doSearch(-1)});     
    $("#idAddFolder").click( function() {fr.AddToplink(true);return false;});
    $("#idAddUrl").click( function() {fr.AddToplink(false);return false;});
    //$("#idDelAll").click( function() {fr.DelAllToplinks();});
    $("#idSettings").click( function() {fr.ShowMsgDlg( 1);return false;});    
    $("#idEditMode").click( function() {fr.doEditMode(1);return false;});
    $("#idEditModeDone").click( function() {fr.doEditMode(0);return false;});
    $("#idEditModeCancel").click( function() {fr.doEditMode(-1);return false;});
    
    $("#idSearchButton2").click( function() {fr.doSearch( -1);return false;});
    $("#divLeft").click( function() {fr.doChangePage( -1);return false;});
    $("#divRight").click( function() {fr.doChangePage( 1);return false;});
    $("#idSlideToggle").click( function() {fr.ShowToplinks(2);return false;});

    $("#idSlideshow").css("visibility","hidden");
    $("#body").css("visibility","visible");
    setTimeout(function(){$("#body").css("idSlideshow","visible");},100);
    setTimeout(function(){$('#idInput').focus().val("").scrollTop();},150);
    
    fr.myBind("#idDrag",'mouseup', { }, function(ev) {fr.HandleDrag( 0);return false;});    
    
    fr.nextEBayItem = L64P.ebay.getNextItem(); 
       
    fr.ShowToplinks(fr.settings.fShowToplinks);

    var si = window.setInterval(function()
	{
	    fr.iCounter++;
	    var o = document.getElementById( "idOverlayEBayFolder");
	    if ( o)
	    {
	        if ( fr.iCounter%5 == 0)
	        {
	            o.style.visibility = "hidden";
	        }
	        else if ( fr.iCounter%5 == 1)
	        {
	            var s = fr.getNextEbayItemTimeString();
	            if ( s == 2) // Zeit ist abgelaufen
	            {	                
	                fr.nextEBayItem = L64P.ebay.getNextItem(); 
	                return;
	            }
                if ( s)
                {
                    var ebayending = t['ebayending'].replace("[sec]", s);
                    sInner = '<center>'+ebayending+'</center>';
                    //o.innerHTML = sInner;
                    $("#idOverlayEBayFolder").html(sInner);
    	            o.style.visibility = "visible";
                }
	        }
        }
        if ( fr.aEBayTimesToRefresh && fr.iCounter%5 == 0)
        {
            for ( var i = 0; i < fr.aEBayTimesToRefresh.length; i++)
            {
                var o = fr.aEBayTimesToRefresh[i];
                if ( o)
                {
                    var sec = fr.getSecondsLeft(o.end);
                    $("#"+o.id).html(fr.formatTime(sec))
                }
            }
        }
//	        window.clearInterval(si);
	}, 200);
},

iCounter:0,
aEBayTimesToRefresh:false,

myMouseMove:function(ev) 
{
    if (!ev)
        ev = window.event;
    var xx = ev.pageX;
    var yy = ev.pageY;
    
    if ( !xx && !yy)
    {
        xx = ev.x;
        yy = ev.y;
    }
    var x = xx;     
    var y = yy;
    x-=224/2;
    y-=126/2;
    var scrY = document.documentElement.scrollTop;
    $("#idDrag").css({"left":x+"px"});
    $("#idDrag").css({"top":y+"px"});
    if ( fr.drag)
        fr.HandleDrag( 2);
},


curframe:0,
RefreshBorder:function( )
{
    fr.curframe = 0;
    var border = fr.GetCurBorder();
    if (typeof(Frames) == 'undefined')
        Frames = new Array();
    if ( border)
    {
        $("#topbar").css("background", "");
        for ( var i = 0; i < Frames.length; i++)
        {
            var frame = Frames[i];
            if ( frame.id == border)
            {
                fr.curframe = frame;
                var sInner="";
                var ox = parseInt( frame.ox);
                var oy = parseInt( frame.oy);
                var w = parseInt( frame.width);
                var h = parseInt( frame.height);
                var ofs = parseInt( frame.offset);
                var x,y;
                for ( y = -oy; y< 2000; y+=h-oy)
                {
                    sInner+='<div style="-webkit-transform: rotate(-90deg);-moz-transform: rotate(-90deg);position:absolute;left:-'+ofs+'px;top:'+y+'px;"><img src="'+frame.png+'" /></div>';
                    sInner+='<div style="-webkit-transform: rotate(90deg);-moz-transform: rotate(90deg);position:absolute;right:-'+ofs+'px;top:'+y+'px;"><img src="'+frame.png+'" /></div>';
                }
                for ( x = -ox; x< 3000; x+=w-ox)
                {
                    sInner+='<div style="position:absolute;left:'+x+'px;top:0px;"><img src="'+frame.png+'" /></div>';
                }
                document.getElementById( "idFrame").innerHTML = sInner;
            }
        }
    }   
    else
    {
        $("#idFrame").html("");
    }
},

installFull:function()
{
    Check = confirm(t["fullversion"]);
    if (Check == true)
      window.location.replace( "http://startpage24.com");
},
 
createSlideshowControls:function () 
{ 
    var sInner="";
    sInner+="<div id='idPrev' style='margin-left:30px;float:left'><img src='./png/slide_prev"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    if ( fr.settings.fPauseSlide)
        sInner+="<div id='idPause' style='margin-left:10px;float:left'><img id='idPauseSlide' src='./png/slide_play"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    else
        sInner+="<div id='idPause' style='margin-left:10px;float:left'><img id='idPauseSlide' src='./png/slide_pause"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    sInner+="<div id='idNext' style='margin-left:10px;float:left'><img src='./png/slide_next"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    sInner+="<div id='idRotL' style='margin-left:10px;float:left'><img src='./png/slide_rotl"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    sInner+="<div id='idRotR' style='margin-left:10px;float:left'><img src='./png/slide_rotr"+(fr.fDarkIcons?"_dark.png":".png")+"'/></div>";
    sInner+="<div style='margin-top:0px;margin-left:20px;width:250px;float:left;'><a style='color:"+fr.GetTextColor()+";' href='"+this.SlideshowUrl+"'>"+this.SlideshowTitle+"</a></div>";
    $("#idSlideControls").html(sInner);
    
    $("#idPrev").click( function() {fr.prevSlide();return false;});
    $("#idPause").click( function() {fr.pauseSlide();return false;});
    $("#idNext").click( function() {fr.nextSlide();return false;});
    $("#idRotL").click( function() {fr.rotateSlide(-90);return false;});
    $("#idRotR").click( function() {fr.rotateSlide(90);return false;});
    
    if ( fr.settings.fShowToplinks)
        $("#idSlideToggle").css( "background","url(./png/slide_toggle"+(fr.fDarkIcons?"_dark.png":".png")+")");
    else
        $("#idSlideToggle").css( "background","url(./png/slide_toggle2"+(fr.fDarkIcons?"_dark.png":".png")+")");
},

nPauseTimer:0,
SlideshowSec:20,
degree:0,
SlideshowTitle:"",
SlideshowUrl:"",
pauseSlide:function () 
{
    fr.settings.fPauseSlide = !fr.settings.fPauseSlide;
    if ( fr.settings.fPauseSlide)
    {
        this.nPauseTimer++;
        $("#idPauseSlide").attr( "src", "./png/slide_play"+(fr.fDarkIcons?"_dark.png":".png"));
    }
    else
    {
        $("#idPauseSlide").attr( "src", "./png/slide_pause"+(fr.fDarkIcons?"_dark.png":".png"));
        this.nPauseTimer++;
//        setTimeout( fr.autoSlide, this.SlideshowSec*1000, this.nPauseTimer);
        setTimeout( function( timer) { 
                fr.autoSlide(timer);
                }, this.SlideshowSec*1000, this.nPauseTimer);
    }
    fr.SaveSettings();
},

SaveToplinks:function()
{
    if ( fVideoVersion)
        return;
    var a = fr.CopyArray( fr.lpToplinkBottomFolder, true);
    L64P.toplinks.setLocal({data:a}); 
},

SaveSettings:function()
{
    L64P.settings.set({id:'settings', data:fr.settings});
},

setCurSlide:function( url, deg, title, linkurl)
{
    if ( fr.GetBackgroundColor() != -1)
        return;
    if ( url && url.indexOf( "backebay.png")>=0)
        url = "./png/backebay.png";

    if ( $("#idSlide").attr("src") == url && this.degree == deg)
        return;
    
    
    this.SlideshowTitle = title;
    this.SlideshowUrl = linkurl;
    this.degree = deg;
    
    
    var o = document.getElementById("idSlideshow"); 
    if ( o)
    {
        if ( !url)
        {
            var o2 = document.getElementById("idSlide"); 
            if ( o2)
                url = o2.src;
        }
        sInner =  "<img style='-webkit-transform: rotate("+deg+"deg);-moz-transform: rotate("+deg+"deg);' id='idSlide' src='"+url+"'></img>";
        //sInner +=  "<img id='idSlideHidden' style='display:none'></img>";
        //o.innerHTML =  sInner;
        $("#idSlideshow").html(sInner);
        
        //$("#idFrame").unbind('click'); 
        fr.myBindClick("#idFrame", { }, function(ev) {
        
            fr.ShowToplinks(2);
        });
        
        //$("#idToplinks").unbind('click'); 
        fr.myBindClick("#idToplinks", { }, function(ev) {
        
            fr.ShowToplinks(2);
        }); 
        
        //$("#idToplinks").unbind('click'); 
        fr.myBindClick("#idToplinks", { }, function(ev) {
        
            fr.ShowToplinks(2);
        }); 

    }
        
    if ( fr.settings.fPauseSlide) // Pause: Use the same slide next time
    {
        fr.settings.NextSlide = url;
        fr.settings.NextTitle = title;
        fr.settings.NextUrl = linkurl;
        fr.SaveSettings();
    }        
                
    fr.testImage(url, function(url,state) {
                        if( state == "error")
                        {
                            for ( var i = 0; i < fr.foundSlides.length; i++)
                            {
                                if ( fr.foundSlides[i].url == url)
                                {
                                    fr.foundSlides.splice(i,1);
                                }
                            }
                            fr.nextSlide();
                        }
                    }, 2000);
    
    
},

rotateSlide:function ( deg) 
{
    var d = this.degree + deg;
    if ( d > 360)
        d = 0;
    else if ( d < 0)
        d+=360;
        
    this.setCurSlide( 0, d,0,0);
    this.positionSlideshow();
},

autoSlide:function ( timer) 
{
    if ( timer != fr.nPauseTimer) 
        return;// is not the latest timer
    fr.nextSlide();
},

nextSlide:function () 
{
    fr.curSlide++
    if ( fr.curSlide >= fr.foundSlides.length)
        fr.curSlide=0;
    var imageinfo = fr.foundSlides[fr.curSlide];
    if ( imageinfo)
    {
        this.setCurSlide( imageinfo.url, 0, imageinfo.titleNoFormatting+" - "+imageinfo.contentNoFormatting, imageinfo.originalContextUrl);
        this.createSlideshowControls();
    }
    
    this.cacheSlide( fr.curSlide+1);
   
    this.positionSlideshow();
    if ( !fr.settings.fPauseSlide)
    {
        this.nPauseTimer++;
        setTimeout( function( timer) {
                fr.autoSlide(timer);
                }, this.SlideshowSec*1000, this.nPauseTimer);
    }
},

cacheSlide:function ( nextSlide) 
{
    if ( nextSlide >= fr.foundSlides.length)
        nextSlide=0;
    if ( nextSlide < 0)
        nextSlide=fr.foundSlides.length-1;
    if ( nextSlide < 0)
        nextSlide=0;
    var imageinfo = fr.foundSlides[nextSlide];
    
    if (typeof(imageinfo) == 'undefined' || !imageinfo)
        return;
        
    /*if ( imageinfo)
        $("#idHiddenImg").attr( "src",imageinfo.url);
      */  
    fr.testImage(imageinfo.url, function(url,state) {
    if( state == "error")
    {
        for ( var i = 0; i < fr.foundSlides.length; i++)
        {
            if ( fr.foundSlides[i].url == url)
            {
                fr.foundSlides.splice(i,1);
            }
        }
     }
     else if ( !fr.settings.fPauseSlide) // Pause: Use the same slide next time
        {
        for ( var i = 0; i < fr.foundSlides.length; i++)
        {
            if ( fr.foundSlides[i].url == url)
            {
                var imageinfo = fr.foundSlides[i];
                fr.settings.NextSlide = imageinfo.url;
                fr.settings.NextTitle = imageinfo.titleNoFormatting+" - "+imageinfo.contentNoFormatting;
                fr.settings.NextUrl = imageinfo.originalContextUrl;
                fr.SaveSettings();
                //alert( "cache:"+fr.settings.NextTitle);
            }
        }
    }
    
    }, 2000);
},

testImage:function(url, callback, timeout) 
{
    timeout = timeout || 5000;
    var timedOut = false, timer;
    var img = new Image();
    img.onerror = img.onabort = function() {
        if (!timedOut) {
            clearTimeout(timer);
            callback(url, "error");
        }
    };
    img.onload = function() {
        if (!timedOut) {
            clearTimeout(timer);
            callback(url, "success");
        }
    };
    img.src = url;
    timer = setTimeout(function() {
        timedOut = true;
        callback(url, "timeout");
    }, timeout); 
},

prevSlide:function () 
{
    if ( fr.curSlide>0)
        fr.curSlide--;
    else if ( fr.foundSlides.length>=1)
        fr.curSlide = fr.foundSlides.length-1;
    var imageinfo = fr.foundSlides[fr.curSlide];
    if ( imageinfo)
    {
        this.setCurSlide( imageinfo.url, 0, imageinfo.titleNoFormatting+" - "+imageinfo.contentNoFormatting, imageinfo.originalContextUrl);
        this.createSlideshowControls();
    }
    this.cacheSlide( fr.curSlide-1);
    this.positionSlideshow();
},


ShowToplinks:function ( mode) 
{
    if ( mode == 2)
        fr.settings.fShowToplinks = !fr.settings.fShowToplinks;
    else
        fr.settings.fShowToplinks = mode;
    fr.SaveSettings();
    fr.doShowHelp();
    fr.checkAddButtons();
    if ( fr.settings.fShowToplinks)
    {
        $("#idSlideToggle").css( "background","url(./png/slide_toggle"+(fr.fDarkIcons?"_dark.png":".png")+")");
        $("#idFilterText").show();
        $("#idFilter").show();
        $("#idSlideControls").hide();
        $("#idToplinks").show();
        $("#idEditMode").show();
        this.doResize();
    }
    else
    {
        $("#idSlideToggle").css( "background","url(./png/slide_toggle2"+(fr.fDarkIcons?"_dark.png":".png"));
        $("#idFilterText").hide();
        $("#idFilter").hide();
        $("#idToplinks").hide();
        $("#idSlideControls").show();
        $("#idEditMode").hide();
    }
},
   
fDarkIcons:false,
InitSearchProvider:function () 
{
    var sInner="<font face=arial>";
    
    var shadowcolor;
    var bkcolor = "";
    var textcolor;
    var bordercolor = fr.GetBorderColor();
    if ( fr.curframe)
    {   
        textcolor = fr.curframe.textcolor;
        bkcolor = fr.curframe.bkcolor;
    }
    else
    {   
        textcolor = fr.GetTextColor();
    }
    var c = textcolor.charAt(1);
    if ( !fr.curframe && (bordercolor=="#000" || bordercolor=="#000000"))
    {
        shadowcolor = "#000";
        if ( fVideoVersion)
            $("#idLogo").attr("src","./png/logo_video.png");
        else
            $("#idLogo").attr("src","./png/logo_blue.png");
        fr.fDarkIcons=false;
    }
    else if ( c < '8')
    {
        shadowcolor = "#fff";
        
        if ( fVideoVersion)
            $("#idLogo").attr("src","./png/logo_video_black.png");
        else
            $("#idLogo").attr("src","./png/logo.png");
        fr.fDarkIcons=true;
    }
    else
    {
        shadowcolor = "#000";
        if ( fVideoVersion)
            $("#idLogo").attr("src","./png/logo_video.png");
        else
            $("#idLogo").attr("src","./png/logo_white.png");
        fr.fDarkIcons=false;
    }
    

    if ( fr.fDarkIcons)
    {
        $("#idImgAddUrl").attr("src","./png/addToplinks_dark.png");
        $("#idImgEditMode").attr("src","./png/moveToplink_dark.png");
        $("#idImgSettings").attr("src","./png/settings_dark.png");
    }
    else
    {
        $("#idImgAddUrl").attr("src","./png/addToplinks.png");
        $("#idImgEditMode").attr("src","./png/moveToplink.png");
        $("#idImgSettings").attr("src","./png/settings.png");
    }
    
    if ( fr.curframe)
        var color = 'style="color:'+textcolor+';text-shadow: '+shadowcolor+' 4px 4px 4px;"';
    else
        var color = 'style="color:'+textcolor+';text-shadow: none"';
    
    if (typeof(SearchURLs) == 'undefined')
        SearchURLs = new Array();
        
    for (var i=0; i<SearchURLs.length; i++)
    {
        var name = SearchURLs[i].name;
        if ( name.indexOf( "langkey")>=0)
            name = t[name];
        if ( fr.nCurSearchProvider == i)
            name = "<b>"+name+"</b>";                    
        s = '<a id="idSearch_'+i+'" class="clSearch" '+color+'>'+name+'</a>';
        sInner+=s;
    }
    document.getElementById("searchProvider").innerHTML = sInner; 
    var o = document.getElementById("searchProvider");
    
    if ( bkcolor)
    {
        var o2 = document.getElementById("searchProviderBackground");
        o2.style.width = o.clientWidth+"px";
        o2.style.height = "20px";
        o2.style.background = bkcolor;
        $("#idStars3").css( "background",bkcolor);
        $("#searchProviderBackground").show();
    }
    else
    {
        $("#idStars3").css( "background","");
        $("#searchProviderBackground").hide();
    }
    
    for (var i=0; i<SearchURLs.length; i++)
    {
        fr.myBindClick("#idSearch_"+i, { param: i }, function(ev) {fr.doSearch( ev.data.param);return false;});
    }
},

doSearchToplink:function ( id,url)
{
    o = document.getElementById( id); 
    sText = o.value;    
    var s = fr.ReplaceRedirectLanguage( url, false);
    
    sText = escape(sText);
    if ( s.indexOf( "startpage24.com/redirect.asp") >=0)
        sText = escape(sText);
    s = s.replace("LINK64SEARCHTEXT", sText);
    s = s.replace("%P1%", sText);    
    $("#idAll").show();
    window.location.replace( s);
},

doSearch:function ( i) 
{
    if( i < 0)
        i = fr.nCurSearchProvider;
    count = SearchURLs.length; 
    if ( i<count)
    {
        o = document.getElementById("idInput"); 
        sText = o.value;
        
        if ( sText.indexOf("changelanguage:")>=0)
        {
            var i = sText.indexOf(":");
            fr.curLang=sText.charAt(i+1)+sText.charAt(i+2);
            if ( fr.curLang =="de")
                t = t_de;
            else
                t = t_en;
            SetLanguage( );
            fr.CreateBestOfBar();
            fr.InitSearchProvider();
            return; 
        }
        
        if ( sText.toLowerCase().indexOf( "http:") == 0 || sText.toLowerCase().indexOf( "https:") == 0)
        {
            $("#idAll").show();
            window.location.replace( s);
            return;
        }
        if ( sText.toLowerCase().indexOf( "www.") == 0)
        {
            $("#idAll").show();
            window.location.replace( "http://"+s);
            return;
        }
        if ( sText && sText !="")
        {
    	    s = fr.ReplaceRedirectLanguage(SearchURLs[i].url, true);
    	    sText = escape(sText);
            if ( s.indexOf( "startpage24.com/redirect.asp") >=0)
                sText = escape(sText);
                
            s = s.replace("LINK64SEARCHTEXT", sText);
            s = s.replace("%P1%", sText);
            $("#idAll").show();
            window.location.replace( s);
        }
        else
        {
            fr.nCurSearchProvider = i;
            fr.InitSearchProvider();
        }
    }
},

mySetFocus:function( id)
{
    var fIE8 = false;
    var o = document.getElementById(id);    
    if ( o && o.focus)
    {
        o.selectionStart = 0;
        o.selectionEnd = 1000;
        o.focus();        
    }
},

lastState:0,
fVideosChanged:false,
doEditMode:function ( on) 
{
    if ( !fr.settings.fShowToplinks)
       return;
    
    if ( on > 0)
    {        
        $("#idFilterText").hide();
        $("#idFilter").hide();        
        $("#idEditMode").hide();
        $(".clEditMode").show();
        $("#idSlideToggle").hide();
        $("#idSettings").hide();
        $("#idTextLinks").css( "right","320px");
        $("#idTextLinks").css( "left","260px");
        
        if ( fr.curFilter)
            fr.SetFilter( "");
            
        lastState = new Object();
        lastState.folder = this.lpCurFolder?this.lpCurFolder.id:0;
        lastState.page = fr.nCurPage;
        
        fr.fVideosChanged=false;
    }
    else
    {
        fr.closeEdit(2);
        $("#idFilterText").show();
        $("#idFilter").show();
        $("#idToplinks").show();        
        $("#idEditMode").show();
        $("#idSlideToggle").show();
        $("#idEditMode").show();
        $(".clEditMode").hide();
        $("#idSettings").show();
        $("#idTextLinks").css( "right","130px");
        $("#idTextLinks").css( "left","380px");
        
        if ( on == -1) //Cancel edit mode
        {
            if ( !fVideoVersion)
            {
                L64P.toplinks.getLocal({},function(data)
	            {
		            fr.lpToplinkBottomFolder = data.toplinks;
    	            fr.nextfreeid=data.nextid;
	                fr.lpCurFolder = 0;
	                fr.nCurFolderLevel = 0;
	                fr.SetFilter( "");
	                if ( lastState)
	                {
	                    fr.nCurPage = lastState.page;
	                    if ( lastState && lastState.folder)
	                        fr.doSetFolder( lastState.folder);
                        else
                            fr.doResize();
    	                    
                    }
	            });	    
            }
            on = 0;
        }
        else
        {
            if ( fVideo && fr.fVideosChanged)
            {
                var tl = fr.FindToplinkType( 0, "v");
                if ( tl)
                {
                    var videoItemIds = new Array();
                    for ( var i = 0; i < tl.Toplinks.length;i++) 
                    {
                        videoItemIds.push( tl.Toplinks[i].url);
                    }
                    L64P.video.saveItems({id:videoItemIds});  //.videoid
                }
            }
            fr.SaveToplinks();
        }        
    }

    this.fEditMode = on;
    fr.doShowHelp();
    this.doResize();
},

DelAllToplinks:function ( ) 
{
    fr.lpToplinkBottomFolder = new Array();
    this.lpCurFolder = 0;
    this.curFilter="";
    this.nCurFolderLevel = 0;
    fr.SetFilter( "");
},

Backup:function ( ) 
{
    var obj = new Object();
    obj.toplinks = fr.lpToplinkBottomFolder;
    obj.settings = fr.settings;
    
    
    L64P._db.get({id:'ebay_items', type:'sync'}, function(data)
    {
        var sitems = data; 
	    if ((sitems == null)||(typeof(sitems)=='undefined'))
		    obj.ebayitems = new Array();
	    else 
		    obj.ebayitems = JSON.parse(sitems);
			
        var dataitems = L64P.video.getWatchedItems({},function(data)
        {
            obj.videoitems = data.items;
            var sData = JSON.stringify(obj);
            
            var url = "http://my.startpage24.com/_libs/extension.lib/backup.php?mode=backup&sn="+fr.settings.sn;
            if ( fr.settings.backupkey)
                url += "&key="+fr.settings.backupkey;
                
            var jqxhr = $.post( url, sData, function(data, textStatus, jqXHR) 
            {
                data = JSON.parse(data);
                
                if ( data.errorNumber == 0)
                {
                    if ( fr.settings.backupkey != data.response)
                    {
                        fr.settings.backupkey = data.response;
                        fr.settings.lastbackup = new Date();
                        fr.SaveSettings();
                    }
                    
                    $("#idbackup2").html(t["langKey_backupresult"].replace("[key]",data.response));
                    
                }
                else
                    alert( "Could not backup your data ( Error "+data.errorNumber+")");
            });
        
        }); 
    });
},

Restore:function ( key) 
{
    if ( !key)
        return;
    
    var url = "https://my.startpage24.com/_libs/extension.lib/backup.php?callback=?&mode=restore&key="+key;
    var opt = { 'dummy' : Math.floor(Math.random()*123456789)};
    $.getJSON( url, opt, function(data) 
    {
        if ( data.errorNumber>0)
            $("#idrestore2").html(t["langKey_restorefailed2"]);  
        else
        {
            try
			{
				var obj = JSON.parse(data.response);
				if ( obj.toplinks)
                    fr.lpToplinkBottomFolder = obj.toplinks;
                if ( obj.settings)
                {
                    var oldSettings = fr.settings;
                    
                    fr.settings = obj.settings;
                    
                    fr.settings.sn = oldSettings.sn;
                    fr.settings.backupkey = oldSettings.backupkey;
                    fr.settings.lastbackup = oldSettings.lastbackup;
                }

                if ( obj.videoitems)
                {
                    var videoUrls = new Array();
                    for ( var i = 0; i < obj.videoitems.length;i++) 
                    {
                        videoUrls.push( obj.videoitems[i].video_url);
                    }
                    L64P.video.saveItems({id:videoUrls});
                    
                    for ( var i = 0; i < obj.videoitems.length;i++) 
                    {
                        var crc = L64P.util._crc32(obj.videoitems[i].video_url);
                        var videoitem = obj.videoitems[i];
                        if ( fFirefox)
                            L64P._db.set({id:"video_item_"+ crc, data:JSON.stringify(videoitem), type:'sync'}); 
                        else
                            L64P._db.set({id:"video_item_"+ crc, data:videoitem, type:'sync'}); 
                    }
                    //alert( print_r(obj.videoitems));

                }
                
                if ( obj.ebayitems)
                {
                //alert( print_r(obj.ebayitems));
                    L64P.ebay._syncCache(obj.ebayitems); 
				    L64P._db.set({id:'ebay_items', data:JSON.stringify(obj.ebayitems), type:'sync'}); 
				    L64P._db.set({id:'ebay_watch', data:Math.random(), type:'sync'}); 
                }
                         
                $("#idrestore2").html(t["langKey_restoreresult"]);  
                fr.CreateBestOfBar();
                fr.ShowToplinks(fr.settings.fShowToplinks);
                fr.doResize();
                fr.doShowHelp();
                fr.ShowMsgDlg(0);
                fr.ShowMsgDlg(1);
			}
			catch(err)
			{
			    $("#idrestore2").html(t["langKey_restorefailed"]);  
			    //alert( "Invalid data found for this key!");
			}
        }
    });
  /*
    L64P._db.get({id:'video_items', type:'sync'}, function(data)
    {
        obj.video_items = data;
        alert( "backup"+);
    });
    */
},

AddToplink:function ( fFolder) 
{
    if ( fFolder)
    {
        var s=t["deffolder"];
    }
    else
    {
        var s="http://www.";
    }
    if ( !s)
        return;        
    var o = new Object();
    o.searchurl="";
    if ( fFolder)
    {
        o.type="f"
        o.name = s;
        o.Toplinks = new Array();
    }
    else
    {
        o.type="l"
        o.url = s;
       //o.thumb=this.GetThumb(o.url);
        o.name = t["newToplink"];

    }    
    o.p1x1="";
    o.id=this.nextfreeid++;
    
    //var a = new Array();
    //a.push( o);    
    
    if ( !this.lpCurFolder)
    {
        fr.lpToplinkBottomFolder.splice(0,0,o);// = a.concat( fr.lpToplinkBottomFolder);
	}
	else
    {
        fr.lpCurFolder.Toplinks.splice(0,0,o);//a.concat( this.lpCurFolder.Toplinks);
	}

    //if ( 
    //    this.AddToplinkToSubfolder( 0, this.lpCurFolder.id == lpToplinkBottomFolder, o)
    	
	fr.nCurPage = 0;
	this.doResize();
	fr.delOnCancel=o.id;
    fr.EditUrl( o.id,false);
},

GetThumbHelper:function( _addOnThumbs, url)
{
    var u = url.toLowerCase()
    if ( _addOnThumbs)
    {
        var thumbsPath = _addOnThumbs.thumbsPath;
        var thumbs = _addOnThumbs.thumbs;
        for ( i = 0; i < thumbs.length; i++)
        {
            if ( thumbs[i].filter)
            {
                var n = u.indexOf( thumbs[i].filter.toLowerCase());
                if ( n >=0)
                {
                    return thumbsPath+thumbs[i].url+".png";
                }
            }
            else
            {
                var s = thumbs[i].url;
                var n = u.indexOf( s);
                if ( n >=0)
                {
                    var c = n == 0 ? '.' : u.charAt(n-1);
                    if ( c == '.' || c == '/')
                        return thumbsPath+thumbs[i].url+".png";
                }
            }
        }
    }     
    return false;
},

GetThumb:function( url, name)
{
    if ( !url)
        return;
    if ( url.indexOf( "zanox.")>=0 || url.indexOf( "zanox-affiliate.")>=0)
    {
        url = "http://"+name;
    }
    if( url.indexOf("startpage24.com/redirect.asp")>=0 )
    {
        var n = url.indexOf("redirect.asp?Target=");
        if( n >=0)
        {
            n = url.indexOf( "=", n);
            url = "http://"+url.substr(n+1);
            url = fr.ReplaceRedirectLanguage( url, false);
        }
        else            
            url = fr.ReplaceRedirectLanguage(url, false);
    }
    else if( url.indexOf("my.startpage24.com/_libs/extension.lib/ebay.php")>=0 )
        url = fr.ReplaceRedirectLanguage(url, false);
    
    var s = fr.GetThumbHelper( addOnThumbs3, url); 
    if ( !s)
        s = fr.GetThumbHelper( addOnThumbs, url); 
    return s;
},

SetScreenshotUrl:function ( parent, url, screenshotURL)
{
    var j;
    var refresh = false;
    for( j = 0; j<parent.length;j++)
    {
        if ( parent[j].url == url && parent[j].screenshotURL != screenshotURL)
        {
            parent[j].screenshotURL = screenshotURL;
            refresh = true;
        }
        if ( parent[j].Toplinks)
            erg |= SetScreenshotUrl( parent[j].Toplinks, url, screenshotURL);
    }
    return refresh;
},

//ScreenshotWaiting:0,
GetScreenshotUrl:function ( o, frefresh)
{
    if ( o && o.type=="video")
    {
        o.screenshotURL = o.thumb;
        return;
    }
    if ( !o.url)
        return;
    o.screenshotURL = "*";
    //fr.ScreenshotWaiting++;
	L64P.toplinks.getScreenshotURL({data:o}, function(data){
	//alert (data.toplink.url+ " = "+data.toplink.screenshotURL)
	if ( frefresh)
        if ( o.screenshotURL != "*")
	    //if ( fr.SetScreenshotUrl( lpToplinkBottomFolder, o.url, data.toplink.screenshotURL))
	        fr.doResize();
	//fr.ScreenshotWaiting--;
	//if ( !fr.ScreenshotWaiting)
	//    fr.SaveToplinks();

	});
    return "";
},


replaceZanoxRedirect:function(o)
{
    if ( !o || !o.url)
        return false;
    if ( o.url.indexOf( "zanox.")>=0 || o.url.indexOf( "zanox-affiliate.")>=0)
        if ( o.url.indexOf( "startpage24.com/redirect.asp") < 0)
        {
            o.url = fr.ReplaceRedirectLanguage("http://go.startpage24.com/redirect.asp?name="+o.name+"&country=[country]&lang=[lang]&serial=[serial]&Target=URL&"+o.url, false);
            return true;
        }
    return false;
},

CreateBestOfBar:function()
{

    if (typeof(addOnShops) == 'undefined')
        var shops = new Array();
    else if ( addOnShops[fr.settings.country])
        var shops = addOnShops[fr.settings.country].Shops;
    else
        var shops = addOnShops["de"].Shops;
        
        
    var i1;
    var a = new Array();
    for ( i1 = 0; i1 < shops.length; i1++)
    {
        if ( !shops[i1].url)
            shops[i1].url = "http://"+shops[i1].name;
        fr.replaceZanoxRedirect(shops[i1]);
        if ( !shops[i1].thumb)
            shops[i1].thumb = this.GetThumb(shops[i1].url, shops[i1].name);
            
        if ( shops[i1].thumb)
        {
            if ( i1>1)
                a.push(shops[i1]);
        }
    }
    
    a.sort(function(a,b){return Math.round(Math.random()*20-10);});
    
    var iEbay =  Math.round(Math.random()*7);
    var iAmazon =  Math.round(Math.random()*7);
    var sInner="";
    
    //var surl="http://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fncdfeghkpohnalmpblddmnppfooljekh&t=Incredible+StartPage+for+Chrome";
    
    
    var surl="http://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fstartpage24-with-a-classi%2Fidmjjnnadgpnniaebiicdndgjlgpadcb%2F";
    sInner += "<a href='"+surl+"'><img id='imgFB' style='margin-right:10px;position:relative;top:-22px;' src='./png/";
    if ( fr.curLang == "de")
        sInner += "fb_de.png";
    else
        sInner += "fb_en.png";
    sInner += "'/></a>";
    
//    sInner += '<iframe src="https://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fwww.startpage24.com&amp;send=false&amp;layout=standard&amp;width=250&amp;show_faces=false&amp;font&amp;colorscheme=light&amp;action=like&amp;height=30&amp;appId=255650564552166" scrolling="no" frameborder="0" style="position:relative;border:none; top:-16px;overflow:hidden; width:250px; height:30px;" allowTransparency="true"></iframe>';
    
//sInner += '<iframe src="//www.facebook.com/plugins/like.php?href=https%3A%2F%2Fchrome.google.com%2Fwebstore%2Fdetail%2Fstartpage24-with-a-classi%2Fidmjjnnadgpnniaebiicdndgjlgpadcb%2F&amp;send=false&amp;layout=standard&amp;width=450&amp;show_faces=true&amp;font&amp;colorscheme=light&amp;action=like&amp;height=80&amp;appId=255650564552166" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:450px; height:80px;" allowTransparency="true"></iframe>';


    for ( i1 = 0; i1 < a.length; i1++)
    {
        if ( i1 == iEbay)
        {
            var url = fr.ReplaceRedirectLanguage("http://go.startpage24.com/redirect.asp?Target=ebay.[postfix]&country=[country]&lang=[lang]&serial=[serial]", false);
            var thumb = this.GetThumb(url, "ebay.de");
            sInner += "<a href='"+url+"'><img style='margin-left:-10px;position:relative;top:-10px;' src='"+thumb+"' height=50px/></a>"
        }
        if ( i1 == iAmazon)
        {
            var url = fr.ReplaceRedirectLanguage("http://go.startpage24.com/redirect.asp?Target=amazon.[postfix]&country=[country]&lang=[lang]&serial=[serial]", false);
            var thumb = this.GetThumb(url, "amazon.de");
            sInner += "<a href='"+url+"'><img style='margin-left:-10px;position:relative;top:-10px;' src='"+thumb+"' height=50px/></a>"
        }
         
        /*var si = GetImageSize(a[i1].thumb);
        if ( si)
        {
            var w = Math.floor(si.w*50/126);
            var h = Math.floor(si.h*50/126);
            var l = Math.floor((224-si.w)*50/126/2-10);
            var t = Math.floor((126-si.h)*50/126/2-10);
            sInner += "<a href='"+a[i1].url+"'><img style='margin-left:"+l+"px;top:"+t+"px;' width="+w+"px height="+h+"px src='"+a[i1].thumb+"' /></a>"
        }
        else*/
        sInner += "<a href='"+a[i1].url+"'><img style='margin-left:-10px;position:relative;top:-10px;' src='"+a[i1].thumb+"' height=50px/></a>"
    }
    $("#idBestofbar").html( sInner);
},

CreateVideoBar:function()
{
    if ( $("#idVideobar").html( ))
        return;
    var a = new Array();
    for ( var i1 = 0; i1 < VideoSites.length; i1++)
    {
        a.push(VideoSites[i1]);
    }
    
    a.sort(function(a,b){return Math.round(Math.random()*20-10);});
    while ( a.length < 30)
    {
        a = a.concat( a);
    }
    var sInner="";
    sInner += "<a style='font-size:12px;position:relative;top:-6px;'>"+t["supported"]+"</a>";
    for ( i1 = 0; i1 < a.length; i1++)
    {
        sInner += "<a href='"+a[i1].url+"'><img style='margin-left:5px;margin-top:3px; ' src='"+a[i1].thumb+"' height=24px/></a>"
    }
    $("#idVideobar").html( sInner);
},

foundSlides:0,
curSlide:0,
LoadSlides:function( what )
{
    q = new L64GSearch(); 
    q.getImages({query:what, num:24},function(data)
    {
        if (data.result)
        {
            fr.foundSlides = data.result;
            fr.foundSlides.sort(function(a,b){return Math.round(Math.random()*20-10);}); // Shuffle array
            fr.curSlide = Math.floor(Math.random()*fr.foundSlides.length);
            if ( fr.curSlide < fr.foundSlides.length)
            {
                var imageinfo = fr.foundSlides[fr.curSlide];
                                
                if ( !fr.settings.fPauseSlide) // Pause: Use the same slide next time
                {
                    fr.settings.NextSlide = imageinfo.url;
                    fr.settings.NextTitle = imageinfo.titleNoFormatting+" - "+imageinfo.contentNoFormatting;
                    fr.settings.NextUrl = imageinfo.originalContextUrl;
                    fr.SaveSettings();
                }
                if ( $("#idSlideshow").html() == "" || $("#idSlide").attr( "src") == "")
                {                                   
                    fr.setCurSlide( imageinfo.url, 0, imageinfo.titleNoFormatting+" - "+imageinfo.contentNoFormatting, imageinfo.originalContextUrl);
                    setTimeout(function(){fr.positionSlideshow(1);}, 200);
                }
                fr.cacheSlide( fr.curSlide+1);
                //else
                //    $("#idSlideHidden").attr( "src", imageinfo.url);
                fr.createSlideshowControls();
            }
        } 
    }); 
},
 
MoveBegin:function ( id)
{
    this.ModifyToplinkRecur( 0, id, "begin");
    this.doResize();
},
MoveEnd:function ( id)
{
    this.ModifyToplinkRecur( 0, id, "end");
    this.doResize();
},

idCurrentEdit:0,
delOnCancel:"",
closeEdit:function ( nApply)
{
    if ( nApply==1)
    {
        if (document.getElementById("idEditUrl")) // Not if editing a folder
        {
            var s = $("#idEditUrl").val();
            if ( !s || s == "http://www.")
            {
                alert( t["invalidUrl"]);
                return false;
            }
        }
    }
    $("#idAll").hide();
    if ( !fr.idCurrentEdit)
        return false;
        
    if ( fr.delOnCancel == fr.idCurrentEdit && nApply == 0)
    {
        this.ModifyToplinkRecur( 0, fr.idCurrentEdit, "del");
        fr.idCurrentEdit = 0;
        this.doResize();
        fr.SaveToplinks();
        return true;
    }
    else if ( nApply)
    {
        if ( nApply==1)
            fr.delOnCancel=0;
        var tl = fr.FindToplink( fr.lpCurFolder, fr.idCurrentEdit);
        if ( tl)
        {
            tl.name = $("#idEditName").val();
            var old =tl.url;
            tl.url = $("#idEditUrl").val();
            if ( tl.url != old)
            {
                tl.thumb = "";
                tl.screenshotURL = "";
            }
            tl.thumb = fr.GetThumb(tl.url, tl.name);
            tl.searchurl = $("#idEditSearchUrl").val();
            if ( !fr.fEditMode && nApply != 2)
                fr.SaveToplinks();
        }
    }
    $("#id5_"+fr.idCurrentEdit).css("visibility","hidden");
    $("#id5_"+fr.idCurrentEdit).html( "");
    fr.idCurrentEdit = 0;
    return true;
},

GetToplinkThumb:function( tl)
{
    if ( tl.thumb)
        return tl.thumb;
    
    if ( tl.screenshotURL && tl.screenshotURL != "*" && tl.screenshotURL.indexOf("invalid_224")< 0)
        return tl.screenshotURL;
        
    if ( tl.type == "e") 
        return "./png/folder_ebay.png";
    else if ( tl.type == "a") 
        return "./png/folder_apps.png";
    else if ( tl.type == "v") 
        return "./png/folder_video.png";
    else if ( tl.type == "m") 
        return "./png/folder_most.png";
    else if ( tl.type == "f") 
        return "./png/folder.png";
        
    return "./png/nothumb.png";
},   

EditUrl:function ( id, fNoAnimation)
{
    if ( fr.idCurrentEdit)
        return;
    //this.closeEdit();
        
    var j = fr.transToplinks[id];
    if ( j)
        $("#"+j).css("opacity","1.0");
        
    $("#id5_"+id).css("opacity","0");
    $("#id5_"+id).css("filter","alpha(opacity = 0)");
    
    var tl = fr.FindToplink( this.lpCurFolder, id);
    var fFolder = tl && ( tl.type == "f" || tl.type == "m" || tl.type == "a" || tl.type == "e" || tl.type == "v");
    if ( tl)
    {
    }
    var sInner = "";
    sInner += "<span style='position:relative;top:20px;margin-left:32%;'>"+t["name"]+"</span><br><input style='position:relative;top:20px;left:32%;margin-bottom:10%;width:65%' id='idEditName' type='text'/><br>";
    if ( !fFolder)
    {
        sInner += "<span style='margin-left:3%'>"+t["url"]+"</span><br> <input style='margin-bottom:5%;width:94%;margin-left:3%;' id='idEditUrl' type='text'/><br>";
        sInner += "<span style='margin-left:3%'>"+t["searchurl"]+"</span><br> <input style='margin-left:3%;margin-bottom:5%;width:94%' id='idEditSearchUrl' type='text'/><br>";
        sInner += "<span style='position:relative;top:-15px;left:3%;font-size:10px;font-weight:normal'>"+t["searchurl2"]+"<br/></span>";
    }
    sInner += "<center><input id='idCloseEdit' type='button' value='"+t["apply"]+"' style='width:100px;'/><input id='idCancelEdit' type='button' value='"+t["cancel"]+"' style='width:100px;'/></center>";
    sInner += "<div style='position:absolute;left:5%;top:5%;height:25%;width:25%;'><img style='max-height:100%;max-Width:100%' id='idEditImg' /></div>";

    $("#id5_"+id).html( sInner);
    
    $("#idEditUrl").keyup(function(e) {
		
		var url = $("#idEditUrl").val();
		var s = fr.GetThumbHelper( addOnThumbs3, url); 
        if ( !s)
            s = fr.GetThumbHelper( addOnThumbs, url); 
		if ( s)
        {
            $("#idEditImg").attr( "src", s);
            return;
        }
        $("#idEditImg").attr( "src","./png/nothumb.png");
        
    });
    
    if ( tl)
    {
        $("#idEditName").val( tl.name);
        $("#idEditUrl").val( tl.url);
        $("#idEditSearchUrl").val( tl.searchurl);
        var sImg = fr.GetToplinkThumb( tl);
        if ( sImg)
            $("#idEditImg").attr( "src", sImg);
        else
            $("#idEditImg").hide();
    } 
        
    $("#id5_"+id).css("visibility","visible");
    fr.idCurrentEdit = id;
    
    
    fr.myBindClick("#idCancelEdit", { param: 0 }, function(ev) {
        fr.closeEdit(0);        
        return false;
    });
    fr.myBindClick("#idCloseEdit", { param: 0 }, function(ev) {
        if ( fr.closeEdit(1))
            fr.doResize();
        return false;
    });
    
   
    
	//$("#id5_"+id).unbind('click'); 
	fr.myBindClick("#id5_"+id, { }, function(ev) {return false;}); // Eat this click                    
	
	if ( fNoAnimation)
	{
	    $("#id5_"+id).css("width","400px");
        $("#id5_"+id).css("height","240");
        $("#id5_"+id).css("left","-101px");
        $("#id5_"+id).css("right","0px");
        $("#id5_"+id).css("top","-65px");
        $("#id5_"+id).css("bottom","0px");
        $("#id5_"+id).css("z-index","500");
        $("#id5_"+id).css("opacity","1");
        $("#id5_"+id).css("filter","alpha(opacity = 100)");
	}
	else
	{
        $("#id5_"+id).css("width","");
        $("#id5_"+id).css("height","");
        $("#id5_"+id).css("left","0px");
        $("#id5_"+id).css("right","0px");
        $("#id5_"+id).css("top","0px");
        $("#id5_"+id).css("bottom","0px");
        $("#id5_"+id).css("z-index","500");
        $("#id5_"+id).animate({    
                width:"400px",
                height:"240px",
                left:"-101px",
                top:"-65px",
                opacity: "1",
	            filter: "alpha(opacity = 100)"
              }, 200, function() {
              
                    fr.mySetFocus( "idEditName");

              });        
    }
    $("#idAll").show();
    //$("#id5_"+id).css("visibility","visible");
},

FindToplink:function( parent, id)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.id == id)
            return o;         
        if ( o.Toplinks)
        {
            var result = this.FindToplink( o, id);
            if ( result)
                return result;
        }
    }
    return 0;
},

GetToplinkIndex:function( bottom, toplinkId)
{
    for ( var j = 0; j < bottom.length; j++)
    {
        if ( bottom[j].id == toplinkId)
            return j;
    }   
    return-1;
},

MoveToplinkBefore:function ( toplinkId, target, fAllowIntoFolder)
{
    if (target.mode == 1 && !fAllowIntoFolder) // Not into Folder during D&D
        return;
    var bottom = fr.lpCurFolder ? fr.lpCurFolder.Toplinks : fr.lpToplinkBottomFolder;
    var i = fr.GetToplinkIndex( bottom, toplinkId);
    if ( i<0)
        return;
    var o = bottom[i];

    if ( fr.lpCurFolder)
    {
        if ( target.toplinkId < 0 && target.mode == 1 && this.nCurFolderLevel>0) // Backbutton
        {
            if ( fr.lpCurFolder.type == "v") // Videos must not be move in any other folder
                return;
            bottom.splice(i,1); // Del 1 Element at i
            fr.lpCurFolder.Toplinks = bottom;
            var parent = fr.FindToplink( 0, this.lpFolderStack[this.nCurFolderLevel-1].id);
            if ( parent)
                parent.Toplinks.push(o);
            else
                fr.lpToplinkBottomFolder.push(o);
            return;
        }
    }
    
    if (target.mode == 2)  // At the end
    {
        bottom.splice(i,1); // Del 1 Element at i
        bottom.push(o); // insert 1 element at before
    }
    else
    {
        var before = fr.GetToplinkIndex( bottom, target.toplinkId);
        if ( before<0)
            return;
        if (target.mode == 1) 
        {
            var oFolder = bottom[before];
            if ( oFolder && oFolder.type !="f")
                return;            
            bottom.splice(i,1); // Del 1 Element at i
            if ( !oFolder.Toplinks)
                oFolder.Toplinks = new Array();
            oFolder.Toplinks.push( o);
        }
        else
        {
            if ( i > before)
            {   
                bottom.splice(i,1); // Del 1 Element at i
                bottom.splice(before,0,o); // insert 1 element at before
               
            }     
            else if ( i < before)
            {                
                bottom.splice(before,0,o); // insert 1 element at before
                bottom.splice(i,1); // Del 1 Element at i
                 
            }  
        }
    }
    if ( fr.lpCurFolder)
        fr.lpCurFolder.Toplinks = bottom;
    else
        fr.lpToplinkBottomFolder = bottom;
},

DelDefaultToplinks:function ( parent)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.def == true)
        { 
            bottom.splice( i,1);
            if ( !parent)
                fr.lpToplinkBottomFolder = bottom;
            else
                parent.Toplinks = bottom;
            i--;
            continue;
        }
        if ( o.Toplinks)
            this.DelDefaultToplinks( o);
    }
},

ModifyToplinkRecur:function ( parent, id, mode)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.id == id)
        { 
            var a2 = bottom.slice( i+1);
            var a1 = bottom.slice( 0,i);
            bottom = a1.concat(a2);
            
            if ( mode == "begin")
            {
                a1 = new Array();
                a1.push( o);
                bottom = a1.concat(bottom);
            }
            else if ( mode == "end")
            {
                bottom.push(o);
            }
            else if ( mode == "del")
            {
                if ( o.type=="m")
                    fr.settings.folder &= (255-4);
                else if ( o.type=="a")
                    fr.settings.folder &= (255-2);
                else if ( o.type=="e")
                    fr.settings.folder &= (255-1);
                else if ( o.type=="v")
                    fr.settings.folder &= (255-8);
                else if ( o.type=="downloads")
                    fr.settings.special &= (255-1);
                    
                if( parent && parent.type=="v" && !fr.fEditMode) // Video folder
                {
                    var videoItemIds = new Array();
                    for ( var i = 0; i < bottom.length;i++) 
                    {
                        videoItemIds.push( bottom[i].url);
                    }
                    L64P.video.saveItems({id:videoItemIds}); 
                }
                
                if ( o.ebayid)
                {
                    var ebayIemsToDelete = new Array();
                    ebayIemsToDelete.push( o.ebayid);
                    L64P.ebay.removeItem({id:ebayIemsToDelete}); 
                }
                else if( fr.lpCurFolder && fr.lpCurFolder.type=="m") // Most visited
                {
                    var m = md5( o.url);
                    if ( !fr.settings.mostVisitedFilter)
                        fr.settings.mostVisitedFilter=",";
                    fr.settings.mostVisitedFilter += m+",";
                }
            }
            if ( !parent)
                fr.lpToplinkBottomFolder = bottom;
                
            else
                parent.Toplinks = bottom;
            //this.lpCurFolder = bottom;
            return true;
        }
        if ( o.Toplinks)
            if ( this.ModifyToplinkRecur( o, id,mode))
                return true;
    }
    return false;
},

DelToplink:function ( id)
{
    this.ModifyToplinkRecur( 0, id, "del");
    this.doResize();
    fr.SaveToplinks();
},

nextfreeid:1,
/*GetNextFreeId:function( parent)
{
    for (var i=0; i <parent.length; i++)
    {   
        if ( parent[i].id)
            if ( parent[i].id>=this.nextfreeid)
                this.nextfreeid = parent[i].id+1;
        if ( parent[i].Toplinks)
            this.GetNextFreeId( parent[i].Toplinks);
    }
},
*/
SetIds:function( parent) // Make sure every toplink has an own id
{
    for (var i=0; i <parent.length; i++)
    {
        if ( !parent[i].id)
            parent[i].id=this.nextfreeid++;
        if ( parent[i].Toplinks)
            this.SetIds( parent[i].Toplinks);
    }
},

colorclicked:function( id)
{
    var i = id.indexOf( '_');
    var def = id.slice(i+1);
    id = id.slice(0,i);
    fr.CreateColorSectors( id, '#'+def);
},

dlgbackgroundcolor:-1,
dlgbordercolor:-1,
dlgtextcolor:-1,
CreateColorSectors:function( id, def)
{
    if ( id == "idbackgroundcolors")
    {
        fr.dlgbackgroundcolor = def;
        a = ["000","777","aaa","fff","f00","f80","ff0","8f0","0f0","0f8","0ff","08f","00f","008","80f","f0f","f08"];
    }
    else if ( id == "idbordercolors")
    {
        fr.dlgbordercolor = def;
        a = ["000","777","aaa","fff","f00","f80","ff0","8f0","0f0","0f8","0ff","08f","00f","008","80f","f0f","f08"];
    }
    else
    {
        fr.dlgtextcolor = def;
        a = ["000","777","c0c0c0","fff","f00","f80","ff0","8f0","0f0","0f8","0ff","08f","00f","008","80f","f0f","f08"];
    }
    if ( def == "#000000")
        def = "#000";
    var sInner="";
    for ( var i = 0; i < a.length; i++)
    {
        var id2 = id+"_"+a[i];
        sInner +="<div id='"+id2+"' class='clColorSelect' style='background:#"+a[i]+"'>";
        if ( def == ('#'+a[i]))
            sInner += "<img style='position:relative;left:3px;top:3px;' src='./png/radio1.png'/>";
        sInner += "</div>";
    }    
    $("#"+id).html( sInner);
    
    for ( var i = 0; i < a.length; i++)
    {
        var id2 = id+"_"+a[i];
        fr.myBindClick("#"+id2, { param: id2}, function(ev) {fr.colorclicked( ev.data.param);return false;});
    }
},

slideclicked:function( )
{
    if ( $("#idcheckslideshow").attr( "checked"))
        $("#idSlideshowSearch").attr( "disabled",false);
    else
        $("#idSlideshowSearch").attr( "disabled",true);
},

radioclicked:function( )
{
    if ( $("#idchecknodefaults").attr( "checked"))
        $("#idNoDefaults").show();
    else
        $("#idNoDefaults").hide();   
},


settings:0,
ShowMsgDlg:function( mode)
{
    if ( mode == 1)
    {
    
        if ( fVideoVersion)
        {
            $("#idToplinkSettings").hide();
            $("#idcheckcountry").hide();
            $("#idsync").hide();
        }
            
        $("#b1").unbind('click'); 
        $("#b2").unbind('click'); 
        $("#b3").unbind('click'); 
        
        $("#b1").click(function() {fr.ShowMsgDlg(0);return false;});
        $("#b2").click(function() {fr.ShowMsgDlg(2);return false;});
        $("#b3").click(function() {fr.ShowMsgDlg(3);return false;});
            
        $("#b1").val(t['cancel']);
        $("#b2").val(t['ok']);
        $("#b3").val(t['apply']);
        
        if ( fFirefox)
        {
            $(".chromeOnly").hide();
        }
        if ( !fVideo)
        {
            fr.settings.folder&=(255-8);
            $("#idVideoSettings").hide();
        }
        
        $("#idresethelp").val(t['resethelp']);
        $("#idresettheme").val(t['resettheme']);
        
        $("#idebaysec").val( fr.settings.ebaysec);
        $("#idresettheme").unbind('click');        
        $("#idresettheme").click(function() {fr.ResetTheme();return false;});

        /*$("#idbackup").unbind('click');        
        $("#idbackup").click(function() {fr.ShowBackupDlg(1);return false;});
        $("#idrestore").unbind('click');        
        $("#idrestore").click(function() {fr.ShowRestoreDlg(1);return false;});
        */
        $("#idresethelp").unbind('click'); 
        $("#idresethelp").click(function() {fr.settings.help=(fFirefox?64:0); fr.doShowHelp();return false;});
        $("#idcheckebay").attr( "checked", !!(fr.settings.folder&1));
        $("#idcheckapps").attr( "checked", !!(fr.settings.folder&2));
        $("#idcheckhistory").attr( "checked", !!(fr.settings.folder&4));
        $("#idcheckvideo").attr( "checked", !!(fr.settings.folder&8));
        
        $("#idcheckad").attr( "checked", !(fr.settings.disableAds));
        
        $("#idcheckcountry").attr( "checked", !!fr.settings.fChangeToplinks);
        
        $("#idchecksync").attr( "checked", !!(fr.settings.sync));
        
        $("#idchecknodefaults").attr( "checked", !fr.settings.fUseThemeDefaults);
        $("#idcheckslideshow").attr( "checked", !!fr.settings.fShowSlideshow);
        
        fr.radioclicked();
        fr.slideclicked()
        
        $("#idchecknodefaults").unbind('click'); 
        $("#idcheckslideshow").unbind('click'); 
        $("#idchecknodefaults").click(function() { fr.radioclicked();});
        $("#idcheckslideshow").click(function() { fr.slideclicked();});
        
        $("#idSlideshowSearch").val( fr.settings.SlideshowSearch);
        fr.CreateColorSectors( "idbackgroundcolors", fr.settings.color_background);
        fr.CreateColorSectors( "idbordercolors", fr.settings.color_border);
        fr.CreateColorSectors( "idtextcolors", fr.settings.color_text);
        
        var sInner ="<option value=''>"+t["noborder"]+"</option>";
        for ( var i = 0; i < Frames.length; i++)
        {
            var frame = Frames[i];
            if ( fr.curLang == "de")
                sInner+="<option value='"+frame.id+"'>"+frame.de+"</option>";
            else
                sInner+="<option value='"+frame.id+"'>"+frame.en+"</option>";
        }
                
        $("#idSelectTrans").val( fr.settings.trans);
                
        $("#idSelectBorder").html(sInner);
        $("#idSelectBorder").val( fr.settings.border);
        
        sInner="<option value='de'>"+t["langKey_de"]+"</option>";
        sInner+="<option value='gb'>"+t["langKey_gb"]+"</option>";
        sInner+="<option value='us'>"+t["langKey_us"]+"</option>";
        sInner+="<option value='fr'>"+t["langKey_fr"]+"</option>";
        sInner+="<option value='pl'>"+t["langKey_pl"]+"</option>";
        sInner+="<option value='es'>"+t["langKey_es"]+"</option>";
        sInner+="<option value='it'>"+t["langKey_it"]+"</option>";
        sInner+="<option value='ch'>"+t["langKey_ch"]+"</option>";
        sInner+="<option value='nl'>"+t["langKey_nl"]+"</option>";
        sInner+="<option value='tr'>"+t["langKey_tr"]+"</option>";
        sInner+="<option value=''>"+t["langKey_other"]+"</option>";
        $("#idSelectCountry").html(sInner);
        $("#idSelectCountry").val( fr.settings.country);
        
        if ( fFirefox)
        {
            sInner="<option value='1'>"+t["langKey_icon1"]+"</option>";
            sInner+="<option value='2'>"+t["langKey_icon2"]+"</option>";
            sInner+="<option value='-1'>"+t["langKey_icon3"]+"</option>";
            $("#idSelectIcon").html(sInner);
            
            var videoicon = fr._locStorage.getItem('videoicon')
            if (!videoicon)
                videoicon = 2;
            $("#idSelectIcon").val( videoicon);
        }
        else
        {
            $("#langKey_icon").hide();
            $("#idSelectIcon").hide();
        }
        
        $("#idMsgDlg").show();
    }
    else if ( mode == 0) // cancel
        $("#idMsgDlg").hide();
    else if ( mode == 2 || mode == 3) // 2 == ok   3 == apply
    {
        if ( mode == 2)
            $("#idMsgDlg").hide();
        var o = 0;
        if ( $("#idcheckebay").attr("checked"))
            o+=1;
        if ( !fFirefox)
            if ( $("#idcheckapps").attr("checked"))
                o+=2;
        if ( $("#idcheckhistory").attr("checked"))
            o+=4;
        if ( $("#idcheckvideo").attr("checked"))
            o+=8;
            
        fr.settings.disableAds = !$("#idcheckad").attr( "checked");
        localStorage.setItem("IsAdDisabled", fr.settings.disableAds);
                        
        var oldSearchWord = fr.GetSlideshowSearchWord();        
        fr.settings.fUseThemeDefaults = !$("#idchecknodefaults").attr( "checked");
        fr.settings.fShowSlideshow = $("#idcheckslideshow").attr( "checked");
            
        var oldsync = fr.settings.sync;
        fr.settings.sync = !!$("#idchecksync").attr( "checked");
        fr.settings.fChangeToplinks = $("#idcheckcountry").attr( "checked");
        
        fr.settings.color_background = fr.dlgbackgroundcolor;
        fr.settings.color_border = fr.dlgbordercolor;
        fr.settings.color_text = fr.dlgtextcolor;
        fr.settings.border = $("#idSelectBorder").val();
        fr.settings.trans = $("#idSelectTrans").val();
        
        fr.settings.ebaysec = parseInt($("#idebaysec").val());
        if ( fr.settings.ebaysec<0)
            fr.settings.ebaysec = 0;
        
        var oldCountry = fr.settings.country;
        fr.settings.country = $("#idSelectCountry").val();
        
        if ( fFirefox)
            fr._locStorage.setItem('videoicon',$("#idSelectIcon").val());
        
        //if ( !fr.fShowSettingsOnly)
            fr.RefreshBorder();

        var b1 = fr.GetBorderColor();
        var b2 = fr.GetGradientColor(b1);
        
        if ( fFirefox)
            $("#idBottombarGradient").css("background", "linear-gradient(to bottom, "+b2+" 0%,"+b1+" 100%");
        else
            $("#idBottombarGradient").css("background", "-webkit-linear-gradient(top, "+b2+", "+b1+")");
//            $("#idBottombarGradient").css("background", "-webkit-linear-gradient(top, "+b2+", "+b1+", "+b2+")");
        
        if ( !$("#idFrame").html())
        {
            if ( fFirefox)
                $("#topbar").css("background", "linear-gradient(to bottom, "+b2+" 0%,"+b1+" 100%");
            else
                $("#topbar").css("background", "-webkit-linear-gradient(top, "+b2+", "+b1+")");
        }
        //$("#body").css("background",b1);
        
        $(".clTextColor").css("color",fr.GetTextColor());
        fr.settings.SlideshowSearch = $("#idSlideshowSearch").val( );
        var newSearchWord = fr.GetSlideshowSearchWord();
        
        //if ( !fr.fShowSettingsOnly)
        {
            if ( newSearchWord && oldSearchWord != newSearchWord)
            {
                $("#idSlide").attr("src","");
                fr.LoadSlides( newSearchWord);
                setTimeout(function(){fr.positionSlideshow(1);}, 100);
                fr.createSlideshowControls();
            }
            else if ( fr.settings.fUseThemeDefaults)
                if ( !newSearchWord && (userContent.Slideshow && userContent.Slideshow.length > 0))
                {
                    //fr.SetDefaultSlideshowlist();
                    fr.DownloadSlideList();
                }
        }
        fr.settings.folder = o;
        fr.AddDefaultFolder( false);
        {
            fr.SaveSettings();
            if ( !oldsync && fr.settings.sync)//Sync has turned on
                fr.SaveToplinks();
            if ( oldCountry != fr.settings.country)
            {
                fr.CreateBestOfBar();
                fr.reloadRedirectThumbs(fr.lpToplinkBottomFolder);
                fr.ChangeLanguage();
            }
            fr.InitSearchProvider();             
            fr.createSlideshowControls();
            fr.doResize();
        }
    }
},

ShowFirstDlg:function( mode)
{
    if ( mode == 1)
    {
        $("#b4").unbind('click'); 
        $("#b4").click(function() {fr.ShowFirstDlg(2);return false;});
        $("#b4").val(t['ok']);
        var sInner="<option value='de'>"+t["langKey_de"]+"</option>";
        sInner+="<option value='gb'>"+t["langKey_gb"]+"</option>";
        sInner+="<option value='us'>"+t["langKey_us"]+"</option>";
        sInner+="<option value='fr'>"+t["langKey_fr"]+"</option>";
        sInner+="<option value='pl'>"+t["langKey_pl"]+"</option>";
        sInner+="<option value='es'>"+t["langKey_es"]+"</option>";
        sInner+="<option value='it'>"+t["langKey_it"]+"</option>";
        sInner+="<option value='ch'>"+t["langKey_ch"]+"</option>";
        sInner+="<option value='nl'>"+t["langKey_nl"]+"</option>";
        sInner+="<option value='tr'>"+t["langKey_tr"]+"</option>";
        sInner+="<option value=''>"+t["langKey_other"]+"</option>";
        $("#idSelectCountry2").html(sInner);
        $("#idSelectCountry2").val( fr.settings.country);
        $("#idFirstDlg").show();
    }
    else if ( mode != 1)
    {
        if ( mode == 2)
            $("#idFirstDlg").hide();
        fr.settings.country = $("#idSelectCountry2").val();
        fr.SetUserContent();
        fr.doInit(); 
    }
},

ShowBackupDlg:function( mode)
{
    if ( mode == 1)
    {
        $("#b5").unbind('click'); 
        $("#b5").click(function() {fr.ShowBackupDlg(2);return false;});
        $("#b6").unbind('click'); 
        $("#b6").click(function() {fr.ShowBackupDlg(0);return false;});
        $("#b5").val(t['langKey_backupnow']);
        $("#b6").val(t['cancel']);
        
        $("#b5").show();
        $("#idbackup1").show();
        $("#idbackup2").hide();
        $("#idbackup2").html(t["pleasewait"]);
        
        $("#idBackupDlg").show();
    }
    else if ( mode != 1)
    {
        if ( mode == 2)
        {
            $("#b6").val(t['ok']);
            $("#b5").hide();
            $("#idbackup1").hide();
            $("#idbackup2").show();
            fr.Backup();
            return;
        }
        $("#idBackupDlg").hide();
        //fr.settings.country = $("#idSelectCountry2").val();
    }
},

ShowRestoreDlg:function( mode)
{
    if ( mode == 1)
    {
        $("#b7").unbind('click'); 
        $("#b7").click(function() {fr.ShowRestoreDlg(2);return false;});
        $("#b8").unbind('click'); 
        $("#b8").click(function() {fr.ShowRestoreDlg(0);return false;});
        $("#b7").val(t['langKey_restorenow']);
        $("#b8").val(t['cancel']);
        $("#b7").show();
        $("#idrestore1").show();
        $("#idrestore2").hide();
        $("#idrestore2").html(t["pleasewait"]);
        $("#idRestoreDlg").show();
        
        if ( fr.settings.backupkey)
            $("#idrestoreKey").val(fr.settings.backupkey);
        
        fr.mySetFocus("idrestoreKey");
    }
    else if ( mode != 1)
    {
        if ( mode == 2)
        {
            $("#b8").val(t['ok']);
            $("#b7").hide();
            $("#idrestore1").hide();
            $("#idrestore2").show();
            
            fr.Restore($("#idrestoreKey").val());
            return;
        }
        $("#idRestoreDlg").hide();
        //fr.settings.country = $("#idSelectCountry2").val();
    }
},

ReplaceEBayAmazonPostfix:function( url)
{
    if ( !url)
        return "";
    var s = url;
    
    if( url.indexOf("startpage24.com/redirect.asp")<0)
        return url; 
    s = s.replace("amazon.de","amazon.[postfix]");
    s = s.replace("ebay.de","ebay.[postfix]");
    s = s.replace("lang=de","lang=[lang]&serial=[serial]");        
    s = s.replace("country=de","country=[country]");
    return s;     
},

ReplaceRedirectLanguage:function( url, fAllUrls)
{
    if ( !url)
        return "";
    var s = url;
    if ( !fAllUrls)
    {
        url = fr.ReplaceEBayAmazonPostfix(url);
    }     
    s = s.replace("[lang]", fr.curLang);
    if ( !fr.settings.country)
        fr.settings.country = "de";
    var c = fr.settings.country;
    var n = c.indexOf("-");
    if ( n>0)
        c = c.slice(n+1);
    s = s.replace("[country]", c);
    s = s.replace("[serial]", fr.settings.sn);
    
    //de,gb,us,fr,pl,es,it,ch,nl,tr 
    if ( c == "de" || c=="fr" || c=="es" || c=="it"|| c=="pl"|| c=="ch"|| c=="nl"|| c=="tr")
        s = s.replace("[postfix]", c);
    else if ( c == "gb" || c == "uk")
        s = s.replace("[postfix]", "co.uk");
    else 
        s = s.replace("[postfix]", "com");
    
    return s;
},

CopyArray:function( aOld, fSave)
{
    var a = new Array();
    for ( var i = 0; i < aOld.length; i++)
    {
        if (fSave)
        {
            if ( aOld[i].type == "ebayitem") // save not all            
                continue;
            if ( aOld[i].type == "video") // save not all
                continue;
        }
        var o = fr.CopyObject(aOld[i], fSave);
        a.push(o);
    } 
    return a;
},

CopyObject:function(oOld, fSave)
{
    var o = new Object();
    for ( var name in oOld)
    {
        if ( name == "Toplinks")
        {
            o.Toplinks = fr.CopyArray(oOld.Toplinks,fSave);
        }
        else  
        {
            o[name] = oOld[name];
        }        
    } 
    return o;
},

GetBackgroundColor:function()
{
    if ( !fr.settings.fUseThemeDefaults && ( !fr.settings.fShowSlideshow || !fr.settings.SlideshowSearch))
        return fr.settings.color_background;
        
    if ( fr.settings.fUseThemeDefaults)
    {
        if ( !userContent.SlideshowSearch && !userContent.Slideshow)
            return userContent.backgroundcolor ? userContent.backgroundcolor : "#333";
    }
    return -1;
},

GetTextColor:function()
{
    if ( fr.settings.fUseThemeDefaults)
        return userContent.textcolor ? userContent.textcolor  : "#fff";
    else
        return fr.settings.color_text;
},
GetBorderColor:function()
{
    if ( fr.settings.fUseThemeDefaults)
        return userContent.bordercolor ? userContent.bordercolor : "#000";
    else
        return fr.settings.color_border;
},

GetGradientColor:function(b1)
{
    if ( !b1)
        b1 = "#000";
        
    if ( b1 == "#000" || b1 == "#000000")
        return "#333";
        
    var b2="";
    for ( var i = 0; i < b1.length; i++)
    {
        var c = b1.charAt(i);
        switch(c)
        {
        case '0':c='0';break;
        case '1':c='0';break;
        case '2':c='1';break;
        case '3':c='1';break;
        case '4':c='2';break;
        case '5':c='2';break;
        case '6':c='3';break;
        case '7':c='4';break;
        case '8':c='4';break;
        case '9':c='5';break;
        case 'a':c='6';break;
        case 'b':c='7';break;
        case 'c':c='8';break;
        case 'd':c='9';break;
        case 'e':c='a';break;
        case 'f':c='b';break;
        }
        b2 += c;
    }
    return b2;
},
GetCurBorder:function()
{
    if ( fr.settings.fUseThemeDefaults)
    {
        if ( userContent.border == 0)
            userContent.border = false;
        return userContent.border;
    }
    return fr.settings.border;
},

GetSlideshowSearchWord:function()
{
    if ( !fr.settings.fUseThemeDefaults && fr.settings.fShowSlideshow)
        return fr.settings.SlideshowSearch;
    if ( fr.settings.fUseThemeDefaults && userContent.SlideshowSearch)
        return userContent.SlideshowSearch;
    return 0;
},

GetSN:function()
{
    //http://go.startpage24.com/v6_vars.asp?Lang=de&SubLang=de&CurLang=de&country=de&guid=DBCF3DB893C14D759241ADFCD5D890FC&IID=&AID=&CID=&sku=Live&Version=10088
    var guid=""
    var c="0123456789abcdef";
    for ( var i = 0; i < 32; i++)
    {
        guid += c.charAt( Math.floor(Math.random()*16));
    }
    
    if ( nVersion!=1)
    {
        var v = fFirefox ? 20000+nVersion : (10000+nVersion);
    }
    else
        v=1;
        
    var p = "Lang=de&SubLang=de&CurLang=de&country=de&guid="+guid+"&IID="+L64statInfo.IID+"&AID="+L64statInfo.AID+"&CID="+L64statInfo.CID+"&sku=Live&Version="+v;
    var url = "https://my.startpage24.com/_libs/extension.lib/index.php?cmd=vars&callback=?&params="+escape(p);
    var opt = { 'dummy' : Math.floor(Math.random()*123456789)};
    $.getJSON( url, opt, function(data) 
    { 
        fr.settings.sn = data.response["SERIAL"]
        fr.SaveSettings();
    });    
},


curLang:"en",
needRefresh:false,
fShowSettingsOnly:false

} // end of fr

function SetLanguage( )
{
    $.each($(".langKey"), function()
    {
	    id = $(this).attr("id"); 
	    var j = id.indexOf( '-');
	    if ( j>=0)
		    $('#'+id).html(t[id.slice( 0,j)]);
        else
	        $('#'+id).html(t[id]);
    });	
    
    $("#idSearchButton2").html(t['search']);
    $("#idFilterText").html(t['filter']);
    $("#idButtonDone").val(t['done']);
    $("#idButtonCancel").val(t['cancel']);
    $("#idStars2").attr("title", t["ratetext"]);
}

function GetCountry( callback)
{
    if ( typeof(chrome)!= 'undefined')
    {
        // Chrome
        chrome.i18n.getAcceptLanguages(function(languageList) 
        {
            //alert( languageList);
            callback(languageList);
        });
    }
    else // Firefox
    {
        if ( typeof(navigator)!= 'undefined')
            var language = navigator.userLanguage || navigator.language;
        else
            var language = "de";
//        alert(language);
        languageList = new Array()
        languageList.push( language);
        callback(languageList);

    }
}

function GetImageSize(url)
{
    var o = 0;
    $(".clThumbBase").each( function(){
        if ( $(this).attr( "src") == url)
        {   
            o = new Object();   
            o.w = this.naturalWidth;
            o.h = this.naturalHeight;
//            o.h = $(this).attr( "height");
            if ( !o.w)
            {
                o = 0;
            }
            else if ( o.w == 224 && o.h == 126)
                o = 0;
            else
                o = o;
        }
    });
    return o;        
}


L64P.events.onEBayChange=function(details)
{
    fr.nextEBayItem = L64P.ebay.getNextItem(); 
    
    if ( fr.lpCurFolder && fr.lpCurFolder.type=="e")
    {
        var ebayItems = L64P.ebay.getWatchedItems({site:fr.settings.country, loc:true}); 	
        if ( ebayItems)
        {
            fr.ConvertEBayData( ebayItems);
            fr.doResizeHome();
        }
    }
}

L64P.events.onNewVideo = function(details)
{
    if ( !fVideo)
        return;
    if ( fr.lpCurFolder && fr.lpCurFolder.type=="v")
    {
        var videoItems = L64P.video.getWatchedItems({},function(data)
        {
            fr.ConvertVideoData( data.items);
            fr.doResizeHome();
        }); 
        
        
        if ( videoItems)
        {
            fr.ConvertVideoData( videoItems);
            fr.doResizeHome();
        }
    }
}

L64P.events.onTopLinkChanged = function(details)
{
	if (details.type == 'user')
	{
	    if ( !fVideoVersion)
	    {
	        L64P.toplinks.getLocal({},function(data)
	        {
		        fr.lpToplinkBottomFolder = data.toplinks;
    	        fr.nextfreeid=data.nextid;
	            fr.lpCurFolder = 0;
	            fr.nCurFolderLevel = 0;
	            fr.SetFilter( "");
	        });
        }
	}
	if (details.type == 'system')
	{
		// ein neuer toplink wurde durch das ansurfen einer Seite hinzugefügt. 
	}
}


aLanguages:0,
$(document).ready(function() 
{
    var lang = "de"; 
	if (typeof(chrome)!= 'undefined')
	{
	    fFirefox = false;
		lang = chrome.i18n.getMessage("language");
	}
	else
	{
	    fFirefox = true;
	    lang = navigator.userLanguage || navigator.language;
    }
    //var lang = chrome.i18n.getMessage("language");
    if ( lang.indexOf("de")>=0)
        fr.curLang = "de";
   
   feBayVersion = ( userContent.ThemeID == "basicebayext");
   fVideoVersion = ( userContent.ThemeID == "basicvideoext");
   fVideoVersion = true;
   
   fr.title = fVideoVersion ? "Video Downloader professional":"Startpage24";
   document.title = fr.title;
    
    if  (!fFirefox)      
        chrome.extension.sendMessage({msg: "OnSP24SetLang",lang:fr.curLang,fVideoVersion:fVideoVersion}, function(response) { });
        
   
//fr.curLang = "en";//#####
        
    if ( fr.curLang == "en")
        t = t_en;
 /*   else if ( fr.curLang == "it")
        t = t_it;
    else if ( fr.curLang == "fr")
        t = t_fr;
    else if ( fr.curLang == "es")
        t = t_es;
    else if ( fr.curLang == "pt")
        t = t_pt;
    else if ( fr.curLang == "ru")
        t = t_ru;
    else if ( fr.curLang == "nl")
        t = t_nl;
    else if ( fr.curLang == "pl")
        t = t_pl;
        */
    SetLanguage( );
   
    fr.GetDefaults(function()
    {
        if ( defaults.addOnShops)
            addOnShops = defaults.addOnShops;
        Frames = defaults.Frames;
        SearchURLs = defaults.SearchURLs;
        VideoSites = defaults.VideoSites;
        if ( defaults.addOnThumbs3)
          addOnThumbs3 = defaults.addOnThumbs3;
        if ( defaults.addOnThumbs)
          addOnThumbs = defaults.addOnThumbs;

      GetCountry(function(languageList) 
      {
        fr.aLanguages = languageList;
        fr.settings = new Object(); 
        L64P.settings.get({id:'settings'}, function(data){
                var askForCountry=false;
                //data=0;//####fr
                if ( data)
                {
                    fr.settings = data;
                    fr.SetUserContent();
                }
                else
                {
                    askForCountry = true;
                    fr.SetDefaultSettings();
                }
                
                if ( !fVideo)
                    fr.settings.folder&=(255-8);
                    
                if ( !fr.settings.sn)
                {   
                    fr.GetSN();
                }
                if ( !fr.settings.trans)
                {   
                    fr.settings.trans = userContent.trans ? userContent.trans : "0.9";
                }
                 
    //            if ( window.location.href.indexOf( "html")>=0)
                if ( window.location.href.indexOf( "options=1")>=0)
                    fr.fShowSettingsOnly=true;
                if ( fr.fShowSettingsOnly)
                {
                    fr.doInit(); 
                    //$("#idUI").html("");
                    //$("#body").css("visibility","visible");
                    fr.ShowMsgDlg(1);
                }
                else
                {
                    if ( !askForCountry)
                        fr.doInit(); 
                    else
                    {
                        $("#body").css("visibility","visible");
                        fr.ShowFirstDlg(1);
                    }
                }
                });
                
        });
    }); // GetDefaults

});



