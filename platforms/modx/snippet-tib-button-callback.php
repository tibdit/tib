<?php
$modx->regClientStartupScript(MODX_ASSETS_URL.'js/tib.js');
$modx->regClientStartupScript('https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.17.0/URI.min.js');

$modx->regClientStartupHTMLBlock('
  <script type="text/javascript"> 
    var bd= new tibCallback(); 
    bd.processToken( window.location);
  </script>
');