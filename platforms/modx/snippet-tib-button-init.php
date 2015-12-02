<?php
$modx->regClientStartupScript(MODX_ASSETS_URL.'js/tib.js');
$modx->regClientCSS('assets/css/tib.css');

$modx->regClientHTMLBlock('
  <script type="text/javascript"> 
    var bd= new tibHandler(  "' . $PAD . '", "' . $CBK . '", ' . $ACK . ');
    bd.initButtons( "/assets/svg"); 
    
  </script>
');
