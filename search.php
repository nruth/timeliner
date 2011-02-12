<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

<script src="http://static.simile.mit.edu/timeline/api-2.3.0/timeline-api.js?bundle=true" type="text/javascript"></script>
<script type="text/javascript"> 
<?php
$Q=$_REQUEST['q'];
echo('var Q="'.$Q.'";');
?>
</script>
<script src="time.js" type="text/javascript"> </script>
<link href="./style.css" rel="stylesheet" type="text/css" /> 
<title>News Timeline</title>
</head>


<body onload="onLoad();" onresize="onResize();" style="background:#FFFFFF;">

<table width="100%"><tr><td align="center">

<table><tr><td valign="bottom" colspan="2">
<a href="index.html">
<img src="logo.png" /> 
</a>
</td></tr><tr>
<td valign="bottom" align="left">
<div style="margin-bottom:10px;">
<a href="http://developer.yahoo.com/">
<img src="logoYahoo.png" />
</a>
</div>
</td><td valign="bottom" align="right">
<a href="http://www.guardian.co.uk/">
<img src="logoGuardian.png" />
</a>
</td></tr></table>
<br />
<form action="search.php" method="get">
<table><tr>
<td width="200px" valign="bottom"></td>
<td width="300px" valign="bottom">
<input type="text" style="width:300px; font-size:16px;" name="q" value="<?php echo($Q); ?>" />
</td><td valign="bottom">
<input type="submit" value="Search" />
</td><td width="200px" valign="bottom">
<div  id="suggestion" style="width:200px"></div>
</td></tr></table>
</form>
<br /><br />
<div id="my-timeline" style="height: 230px; width:1000px; font-size:10px; font-family:Verdana, Arial, Helvetica, sans-serif;"></div>
<br />
<img src="loading.gif" style="visibility:hidden" id="loading" />
<br />
<div id="globalTags" style="width:1000px; text-align:left;">
Related Topics:<br /><br />
</div>
</td></tr></table>
</body>
</html>
