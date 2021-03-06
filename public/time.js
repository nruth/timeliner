
var gStart, gEnd;

var url = '.';
var tl;
var eventSource1;
var minGlobal;
var maxGlobal;
var articles = new Array();
var globalTags = new Array();
var timeoutID;
var YEAR_RANGE_START = 1950;
var YEAR_RANGE_END = 2012;
var concurrent = 0;

function checkSpelling(){
	var http = false;

	if(navigator.appName == "Microsoft Internet Explorer") {
	  http = new ActiveXObject("Microsoft.XMLHTTP");
	} else {
	  http = new XMLHttpRequest();
	} 
		
	var url="http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20search.spelling%20where%20query%3D%22"+Q+"%22&format=json&callback=spell";
  http.open("GET", url, true);
  http.onreadystatechange=function() {
    if(http.readyState == 4) {
	    //cbfunc();
  	  eval(http.responseText);
  	}
  }
  http.send(null);
}


function spell(input){
	if (input.query.results!=null){	
		var sugg=input.query.results.suggestion;
		//alert(sugg);
		document.getElementById('suggestion').innerHTML="Did you mean <a href='search?q="+sugg+"'>"+sugg+"</a>?";
	}
}

function onLoad() {
	eventSource1 = new Timeline.DefaultEventSource();
	var tl_el = document.getElementById("my-timeline");
	var theme1 = Timeline.ClassicTheme.create();
	//theme1.autoWidth = true; // Set the Timeline's "width" automatically.
	theme1.timeline_start = new Date(Date.UTC(YEAR_RANGE_START, 1, 1));
	theme1.timeline_stop  = new Date(Date.UTC(YEAR_RANGE_END, 1, 1));
	
	var d = Timeline.DateTime.parseGregorianDateTime("2011-02-06");
	//var d = Date.parse("2011-02-06");
	
	//console.log(d);

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
	
	eventSource1.loadJSON("", url); // The data was stored into the 
											   // timeline_data variable.
	tl.layout(); // display the Timeline
	
	minGlobal=null;
	maxGlobal=null;
    more();
	tl.getBand(0).addOnScrollListener(function(){
        more();
    });
  
  //if the user isn't jumping around let's grab some more data for later
  timeoutID = window.setTimeout(forcemore, 6000);
  checkSpelling();
}

function forcemore(){
  //alert('making more work');
  var minDate = tl.getBand(0).getMinDate();
  if(!Q || !minGlobal.getYear()) {
    // alert('no data yet');
    window.setTimeout(forcemore, 8000);
    return;
  }
  
  var min_global_month = (parseInt(minGlobal.getMonth()) + 2) % 12;
  var timeline_min_month = (parseInt(minDate.getMonth()) + 1) % 12;
  if(min_global_month < timeline_min_month){
    // alert('found enough for now');
    window.setTimeout(forcemore, 10000);
    return;
  } else {
    // alert('values are ok, min_global_month '+min_global_month+ ' timeline_min_month ' +timeline_min_month);
  }
  
  //alert("..."+minGlobal);
  
  var a = parseInt(minGlobal.getYear()) + 1900; 
  var m = parseInt(minGlobal.getMonth()) + 1;
  var d = parseInt(minGlobal.getDate());

  if (m<10)m='0'+m;
  if (d<10)d='0'+d;  
  
  //alert("a = "+a+" m ="+m+" d = "+d);
 
  var nueva=Timeline.DateTime.parseGregorianDateTime(a+"-"+m+"-"+d);
  nueva.setTime(nueva.getTime() - Timeline.DateTime.gregorianUnitLengths[Timeline.DateTime.WEEK]);

  //alert(nueva+" - "+minGlobal);
  if (nueva.getTime() != minGlobal.getTime()){
    //alert('made more work');
    addEvents(nueva,minGlobal);
    minGlobal = nueva;
  } else {
    // alert('gap too small to query '+nueva.getTime() + ' ' + minGlobal.getTime());
    window.setTimeout(forcemore, 10000);
    return;
  }
  
  // alert('scheduling next background work');
  timeoutID = window.setTimeout(forcemore, 2000);
}

function more(){
	var minDate = tl.getBand(0).getMinDate();
	var maxDate = tl.getBand(0).getMaxDate();
	//alert(minGlobal+" - "+maxGlobal+" ----- "+minDate+" - "+maxDate);		
	//console.log(tl.getBand(0));
	//alert(minDate);
	if (minGlobal==null && maxGlobal==null){
		minDate.setTime(minDate.getTime() + 1.1*Timeline.DateTime.gregorianUnitLengths[Timeline.DateTime.WEEK]);
		maxDate.setTime(maxDate.getTime() - 1.1*Timeline.DateTime.gregorianUnitLengths[Timeline.DateTime.WEEK]);
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
	concurrent++;
	if (concurrent>0)
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
	
	var url="http://query.yahooapis.com/v1/public/yql?q=use%20'http%3A%2F%2Fhacku-upc-timeliner.heroku.com%2Fnews.xml'%3B%20select%20*%20from%20news%20where%20query%3D%22"+Q+"%22%20and%20start%3D%22"+startD+"%22%20and%20end%3D%22"+endD+"%22&format=json&diagnostics=false&debug=true&callback=cbfunc";
  http.open("GET", url, true);
  http.onreadystatechange=function() {
    if(http.readyState == 4) {
	    //cbfunc();
  	  eval(http.responseText);
  	}
  }
  http.send(null);
}

function addGlobalTag(t){
	document.getElementById('globalTags').innerHTML+=t;
}

function cbfunc( input ){
	if (input.query.results!=null){
		var items = input.query.results.content;  
	  var no_items=items.length;  
		var new_data = {
  		'dateTimeFormat': 'iso8601',
  		'events' : []
  	};
	  for(var i=0;i<no_items;i++){
	  	var startN= items[i]["web-publication-date"];
  		var title = items[i]["web-title"];  
  		//var desc = items[i].abstract;  
  		//startN=startN.substr(0,startN.indexOf("T"));	
        if(!articles[title + startN]){
	  		var url = items[i]["web-url"];
			if (items[i].tags!=null){
				var tags=items[i].tags.tag;
				var no_tags=tags.length;
				var tagsText="Related topics:<br />";
				//alert(no_tags);
				for(var j=0; j<no_tags; j++){
					var tagName= tags[j]["web-title"];
					var tagURL= tags[j]["web-url"];				
					tagsText+="<a href='"+tagURL+"' target='_blank'>"+tagName+"</a> - ";
					if (globalTags[tagURL+tagName]==null) globalTags[tagURL+tagName]=1;
					else globalTags[tagURL+tagName]++;
					if (globalTags[tagURL+tagName]==15) {
						var thisGlobalTag="<a href='"+tagURL+"' target='_blank'>"+tagName+"</a> "+
							"<a href='search?q="+tagName+"' style='font-size:8px;'>TimelineSearch</a>"+
							"&nbsp;&nbsp;";
						addGlobalTag(thisGlobalTag);
					}
				}
			}
			var thumb='';
			if (items[i].fields!=null){
				thumb=items[i].fields.field.content;	
			}
			
    		new_data.events.push({'start': startN,
  				'title': title,
  				'description': tagsText,
  				'image': thumb,
  				'link': url
    		});
    		articles[title + startN] = true;
  		//} else {
        //alert('skipping duplicate');
  		}
  		
    } 
    eventSource1.loadJSON(new_data, url);
  }
  concurrent--;
  if (concurrent==0)
	  document.getElementById('loading').style.visibility='hidden';
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