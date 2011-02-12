
var gStart, gEnd;

var url = '.';
var tl;
var eventSource1 = new Timeline.DefaultEventSource();
var minGlobal, maxGlobal;
var timeoutID;
var YEAR_RANGE_START = 1950;
var YEAR_RANGE_END = 2012;

function onLoad() {
	var tl_el = document.getElementById("my-timeline");
	
	var theme1 = Timeline.ClassicTheme.create();
	//theme1.autoWidth = true; // Set the Timeline's "width" automatically.
	theme1.timeline_start = new Date(Date.UTC(YEAR_RANGE_START, 1, 1));
	theme1.timeline_stop  = new Date(Date.UTC(YEAR_RANGE_END, 1, 1));
	
	var d = Timeline.DateTime.parseGregorianDateTime("2011-02-06")
	var bandInfos = [
		Timeline.createBandInfo({
			 width:          200, 
			 intervalUnit:   Timeline.DateTime.DAY, 
			 intervalPixels: 200,
			 eventSource:	 eventSource1,
			date:           d,
			theme:          theme1,
			layout:         'original'  // original, overview, detailed
		 
		 }),
		Timeline.createBandInfo({
      overview:       true,
			width:          30, // set to a minimum, autoWidth will then adjust
			intervalUnit:   Timeline.DateTime.MONTH, 
			intervalPixels: 200,
			eventSource:    eventSource1,
			date:           d,
			theme:          theme1,
			layout:         'original'  // original, overview, detailed
		
		})
	];
	
	bandInfos[1].syncWith = 0;
	bandInfos[1].highlight = true;
													
	// create the Timeline
	tl = Timeline.create(tl_el, bandInfos, Timeline.HORIZONTAL);
	
	//eventSource1.loadJSON(timeline_data, url); // The data was stored into the 
											   // timeline_data variable.
	tl.layout(); // display the Timeline
	
	minGlobal=null;
	maxGlobal=null;
  more();
	tl.getBand(0).addOnScrollListener(function(){
    more();
  });
  
  //if the user isn't jumping around let's grab some more data for later
  timeoutID = window.setTimeout(forcemore, 10000);
}

function forcemore(){
  // alert('making more work');
  var minDate = tl.getBand(0).getMinDate();
  if(!Q || !minGlobal.getYear()) {
    // alert('no data yet');
    window.setTimeout(forcemore, 8000);
    return;
  }
  
  var min_global_month = (parseInt(minGlobal.getMonth()) + 1) % 12;
  var timeline_min_month = (parseInt(minDate.getMonth()) + 1) % 12;
  if(min_global_month < timeline_min_month){
    // alert('found enough for now');
    window.setTimeout(forcemore, 20000);
    return;
  } else {
    // alert('values are ok, min_global_month '+min_global_month+ ' timeline_min_month ' +timeline_min_month);
  }
  
  var a = parseInt(minGlobal.getYear()) + 1900; 
  var m = parseInt(minGlobal.getMonth()) + 1;
  var d = minGlobal.getDate();

  if (m<10)m='0'+m;
  if (d<10)d='0'+m;  
  
  // alert("a = "+a+" m ="+m+" d = "+d);
 
  var nueva=Timeline.DateTime.parseGregorianDateTime(a+"-"+m+"-"+d);
  nueva.setTime(nueva.getTime() - Timeline.DateTime.gregorianUnitLengths[Timeline.DateTime.WEEK]);

  // alert(nueva+" - "+minGlobal);
  if (nueva.getTime() != minGlobal.getTime()){
    // alert('made more work');
    addEvents(nueva,minGlobal);
    minGlobal = nueva;
  } else {
    // alert('gap too small to query '+nueva.getTime() + ' ' + minGlobal.getTime());
    window.setTimeout(forcemore, 20000);
    return;
  }
  
  // alert('scheduling next background work');
  timeoutID = window.setTimeout(forcemore, 8000);
}

function more(){
	var minDate = tl.getBand(0).getMinDate();
	var maxDate = tl.getBand(0).getMaxDate();
	if (minGlobal==null && maxGlobal==null){
		addEvents(minDate,maxDate);
		maxGlobal=maxDate;
		minGlobal=minDate;   	
	}
	else if (minDate<minGlobal) {
	  addEvents(minDate,minGlobal);
		minGlobal=minDate;   
	}
	else if (maxDate>maxGlobal){
		addEvents(maxGlobal,maxDate);
		maxGlobal=maxDate;
	}
}

function addEvents(start,end){
	gStart=start;
	gEnd=end;
	//alert(start+"-"+end);
	/*var d=new Date();
	var aux=d-start;
	if (aux<0)aux='0';
	else{
		aux=aux/1000;
		aux=(aux/3600)/24;
		aux=Math.round(aux);
	}
	var aux2=d-end;
	if (aux2<0)aux2='0';
	else {
		aux2=aux2/1000;
		aux2=(aux2/3600)/24;
		aux2=Math.round(aux2);
	}
	alert(aux+"-"+aux2);	
	*/
	document.getElementById('loading').style.visibility='visible';
	
	var startD=(1900+start.getYear())+"-"+(1+start.getMonth())+"-"+start.getDate();
	//alert(startD);
	
	var endD=(1900+end.getYear())+"-"+(1+end.getMonth())+"-"+end.getDate();
	//alert(endD);
	var http = false;

	if(navigator.appName == "Microsoft Internet Explorer") {
	  http = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
	  http = new XMLHttpRequest();
	} 
	
//	var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20search.news(10)%20where%20query%3D%22Egypt%22%20&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=cbfunc";
	
	var url="http://query.yahooapis.com/v1/public/yql?q=use%20'http%3A%2F%2Fdl.dropbox.com%2Fu%2F10415031%2Fnews.xml'%3B%20select%20*%20from%20news%20where%20query%3D%22"+Q+"%22%20and%20start%3D%22"+startD+"%22%20and%20end%3D%22"+endD+"%22&format=json&diagnostics=false&debug=true&callback=cbfunc";
  http.open("GET", url, true);
  http.onreadystatechange=function() {
    if(http.readyState == 4) {
	    //cbfunc();
  	  eval(http.responseText);
  	}
  }
  http.send(null);
}

function cbfunc( input ){
	if (input.query.results!=null){
		var items = input.query.results.content;  
	  var no_items=items.length;  
	  for(var i=0;i<no_items;i++){  
	  	var startN= items[i]["web-publication-date"];
  		var title = items[i]["web-title"];  
  		var url = items[i]["web-url"];  
  		//var desc = items[i].abstract;  
  		//startN=startN.substr(0,startN.indexOf("T"));	
			
  		var new_data = {
    		'dateTimeFormat': 'iso8601',
    		'events' : [
  				{'start': startN,
  				'title': title,
  				'description': '',
  				'image': '',
  				'link': url
  				}
  			]
  		};
  		var auxDate=Timeline.DateTime.parseGregorianDateTime(startN);
  		//alert(auxDate);
  		//alert(gStart+"<?"+auxDate+"<?"+gEnd)
      // if (gStart<auxDate && auxDate<gEnd){
        // console.log(new_data);
        // console.log(startN);
  			eventSource1.loadJSON(new_data, url);
      // }
    } 
  }
	document.getElementById('loading').style.visibility='hidden';
	
	/*var a = minGlobal.getYear()+1900;
	var m = minGlobal.getMonth()+1;
	var d = minGlobal.getDate();	
	
	if (m<10)m='0'+m;
	if (d<10)d='0'+m;	
	*/
	//alert(a+"-"+m+"-"+d);
		
	//var nueva=Timeline.DateTime.parseGregorianDateTime(a+"-"+m+"-"+d);
	//nueva.setTime(nueva.getTime() - Timeline.DateTime.gregorianUnitLengths[Timeline.DateTime.WEEK]);
	
	//alert(nueva+" - "+minGlobal);
	//if (tl.getBand(1).getMinDate()<minGlobal) 	addEvents(nueva,minGlobal);
}

var resizeTimerID = null;
function onResize() {
	if (resizeTimerID == null) {
		resizeTimerID = window.setTimeout(function() {
			resizeTimerID = null;
			tl.layout();
		}, 500);
	}
	//more();
}