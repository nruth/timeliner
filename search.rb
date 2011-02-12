require 'sinatra'
require 'haml'

get '/search' do
  haml :index
end

__END__

@@index
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<script src="http://static.simile.mit.edu/timeline/api-2.3.0/timeline-api.js?bundle=true" type="text/javascript"></script>
<script type="text/javascript"> 
var Q="#{params['q']}";
</script>
<script src="time.js" type="text/javascript"> </script>
<title>News Timeline</title>
</head>


<body onload="onLoad();" onresize="onResize();" style="background:#FFFFFF;">

<table width="100%"><tr><td align="center">

<div id="my-timeline" style="height: 230px; width:900px; font-size:10px; font-family:Verdana, Arial, Helvetica, sans-serif;"></div>
<br />
<img src="loading.gif" style="visibility:hidden" id="loading" />
<br />
<br />
<form action="search" method="get">

<input type="text" style="width:300px; font-size:16px;" name="q" value="#{params['q']}" />
<br />
<br />
<input type="submit" value="Search" />
</form>

</td></tr></table>
</body>
</html>
