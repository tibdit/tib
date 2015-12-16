// version 13

// jQuery(document).ready(function($){
//     $('.my-color-field').wpColorPicker();
// });

function bd_payaddr_change( f, plugurl)
{
  bd_base54_clean( f);
  valid = "132mn";

  if( f.value === "")
  {
    payaddr_field_status.innerHTML="&emsp;&#10068;";
    payaddr_field_status.style.color='orange';
    submit.disabled = false;
  }
  else if( valid.indexOf(f.value.substr(0, 1)) == -1)
  {
    payaddr_field_status.innerHTML="&emsp;&cross;";
    payaddr_field_status.style.color='red';
    submit.disabled = true;
  }
  else if( f.value.length < 26)  // too short
  {
    payaddr_field_status.innerHTML="&emsp;&quest;";
    payaddr_field_status.style.color='blue';
    submit.disabled = true;
  }
  else if (check_address(f.value))  
  {
    payaddr_field_status.innerHTML="&emsp;&check;&nbsp;";
    payaddr_field_status.style.color='green';
    submit.disabled = false;
  }
  else
  {
    payaddr_field_status.innerHTML="&emsp;&cross;"; // long enough but invalid
    payaddr_field_status.style.color='orange';
    submit.disabled = true;
  }

  blockchain.disabled = submit.disabled;


  if( valid.indexOf(f.value.substr(0, 1)) >= 2 )
  {
    payaddr_field_status.innerHTML=
      payaddr_field_status.innerHTML.concat("&ensp;<img src='" + plugurl + "/testmode-icon-24px.png' style='width: 1em; vertical-align: middle'>");

      // document.getElementById('blockchain').onclick="{window.open('https://www.biteasy.com/testnet/addresses/" + f.value + "')}";
      // document.getElementById('blockchain').onclick=="{window.open('http://tibdit.com')}";

  }
  // else
  // {
  //   document.getElementById('blockchain').onclick="{window.open('https://www.biteasy.com/addresses/" + f.value + "')}";
  // }
}

function biteasy_blockchain()
{
  valid = "132mn";
  if ( valid.indexOf(document.getElementById('payaddr').value.substr(0, 1)) >= 2 )
  {
    window.open("https://www.biteasy.com/testnet/addresses/" + document.getElementById("payaddr").value);
  }
  else if (valid.indexOf(document.getElementById('payaddr').value.substr(0, 1)) != -1) 
  {
    window.open("https://www.biteasy.com/addresses/" + document.getElementById('payaddr').value);
  };
}

function bd_base54_clean( f) 
{
  ss = f.selectionStart;
  se = f.selectionEnd;
  f.value = f.value.replace(/[^A-HJ-NP-Za-km-z1-9]/g,"");
  f.setSelectionRange(ss,se);
}


function bd_plugin_lowercase_tib( f)
{
  ss = f.selectionStart;
  se = f.selectionEnd;
  f.value = f.value.replace( /([Tt][iI][bB])([^ACE-Zace-z][\w]*|$)/g, function(tibword) { return tibword.toLowerCase(); } );
  f.setSelectionRange(ss,se);
}


// function hidetooltips()
// {
//   document.styleSheets[0].cssRules[0].cssText = 
//     ".tooltip { display: none; }";
// }

