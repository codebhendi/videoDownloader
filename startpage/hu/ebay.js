function L64eBay(details) {
	this.details = {_appname:"Link64Gm-797a-4b21-b48a-620abe8d2220", _site:"de", _customId:"chrome_startpage", _networkId:9 ,_trackingId: 5336663456};
	this.calls = {
		info: {
			 //url:"http://open.api.ebay.com/shopping"
			 url:"https://my.startpage24.com/_libs/prices.lib/shopping.php"
			,param: {callname: "GetMultipleItems" ,responseencoding: "JSON"}
			}
	};
	this.siteIDs = {at:16, de:77, us:0, uk:3, nl:147, ch:193, fr:71};
}

L64eBay.prototype._buildFilterArray =  function()
{
	var urlfilter = "";
  // Iterate through each filter in the array
  for(var i=0; i<filterarray.length; i++) {
    //Index each item filter in filterarray
    var itemfilter = filterarray[i];
    // Iterate through each parameter in each item filter
    for(var index in itemfilter) {
      // Check to see if the paramter has a value (some don't)
      if (itemfilter[index] !== "") {
        if (itemfilter[index] instanceof Array) {
          for(var r=0; r<itemfilter[index].length; r++) {
          var value = itemfilter[index][r];
          urlfilter += "&itemFilter\(" + i + "\)." + index + "\(" + r + "\)=" + value ;
          }
        } 
        else {
          urlfilter += "&itemFilter\(" + i + "\)." + index + "=" + itemfilter[index];
        }
      }
    }
  }
  return urlfilter;
}


L64eBay.prototype.getItems = function(details, callback)
{
	var sItems = ""; 
	for (i=0; i<details.itemIds.length; i++)
		sItems+=details.itemIds[i]+ ",";
	cur = this.calls.info; 
	//cur.param.appid = this.details._appname; done on server
	cur.param.affiliate ={};
	//cur.param.affiliate.trackingId= this.details._trackingId;
	//cur.param.affiliate.networkId= this.details._networkId;
	cur.param.affiliate.customId= this.details._customId;
	cur.param.siteName = this.details._site;
	cur.param.IncludeSelector="ShippingCosts";
	if (details.full == true)
		cur.param.IncludeSelector+=",Details,TextDescription";
	cur.param.itemID = sItems;
	jQuery.getJSON(cur.url + "?callbackname=?", cur.param,
		function(data)
		{
			if (typeof(callback)== 'function')
				callback({items: data.Item, error: data.Ack});
		}); 
}

