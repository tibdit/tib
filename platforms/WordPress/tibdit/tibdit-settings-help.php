<?php 

$plugurl= plugin_dir_url( __FILE__ );

$bd_help_overview=<<<bd_help_overview
      <p>
            tibit enables your visitors to send you 'pocket change' microdonations or micropayments called 'tibs'.  You may collect tibs
            either as a token of appreciation for content you provide free, or as a tiny fee to access some content on your site, or both.
      </p>
      <p>
            Each tib button or link has a sub-reference, which is used to keep track of what has been tibbed.  For this plugin, by default, the 
            wordpress post id or page id is automatically set for the sub-reference.
      </p>
      <p>
            Users set their own tib value, and every transaction is always for just one tib.  This means 'tibbers' don't have to think twice before 
            deciding whether or not to tib something.   You won't know exactly who is spending how much, but tibs
            average around GBP 0.15 each (or USD 0.25), so the more people you get to tib your site, the more money you collect.  
      </p>
      <p>
            To make tibbing affordable and accessible to everyone, tibit uses bitcoin to transfer the money to you, once you have received a few tibs.  If you do 
            not already have a bitcoin address, getting one is very easy.  Please see the bitcoin tab on the left to learn how to get one for your blog.
      </p>
bd_help_overview;

$bd_help_settings=<<<bd_help_settings
    
      <p>
            Enter your public bitcoin address below, not your bitcoin private key.  A green tick will show when you have entered a valid bitcoin address.  If you use 
            a testnet bitcoin address, a yellow 'testmode' beaker will also be shown.  See the test mode tab on the left to learn more about tibit testmode.
      </p>
      <p>
            After a user tibs your site or a post, a cookie is stored in the user's browser to show an acknowledgement and prevent re-tibbing of the same 
            post or page (i.e. the same sub-reference) for a duration you can select between one and seven days.
      </p>

bd_help_settings;

$bd_help_bitcoin=<<<bd_help_bitcoin
      <p>
            Getting a bitcoin address is easy - and you don't need to know anything about bitcoin to get started.  You can obtain and configure a bitcoin address 
            quickly, and find out how to spend or convert the bitcoin you have collected later, perhaps once you have collected enough for it to be worthwhile.  
      </p>
      <p>
            You have many options available if you do not already have a bitcoin address you wish to use.  Here are three:
            <ol>
                  <li>
                        One very fast and very simple way is to go to <a href=https://bitaddress.org style="font-family: monospace;" target='_tibit'>bitaddress.org</a> 
                        and follow the instructions there.  While not as secure as more complicated options, this is suitable if you want to get set up and do not expect 
                        to receive a large amount of money in a short timeframe.
                  </li>
                  <li>      
                        If you are UK/EU based and would rather convert your bitcoin easily into GBP/EUR, then you may want to try <a href=https://cryptopay.me/ 
                        style="font-family: monospace;" target='_tibit'>Cryptopay</a>.  
                  </li>
                  <li>
                        If you want a really secure online bitcoin wallet to accumulate and keep your bitcoin for a long time, then we suggest <a style="font-family: monospace;" 
                        href=https://blockchain.info/wallet>Blockchain.info</a>.
                  </li>
            </ol>
      </p> 
      <p>
            Regardless of how you obtain your a bitcoin address, it is <b><u>extremely important</u></b> that you keep the secret private key safe and secure.  For 
            example, you might want to print it twice and put the copies in different places. If you lose your private key, you will have lost any bitcoin at 
            the corresponding address. If someone else gets hold of your key, they can easily steal your bitcoin! You only need your private key when you want to
            transfer or spend your bitcoin.
      </p>
      <p>
            You can check the balance of bitcoin at your address at any time by clicking the button labelled 'view transactions'
      </p>
bd_help_bitcoin;


$bd_help_shortcodes=<<<bd_help_shortcodes
      <p>
            As well as the tibit widget (see widgets tab on left) shortcodes are supported for placing tibbing buttons wherever you want on your blog. 
      </p>
      <p>
            Use<span style="font-family: monospace;"> [tib_site] </span> to place a 'site wide' tib button that will use the same counter and subref wherever it 
            appears.  The subref used by <span style="font-family: monospace;"> [tib_site] </span> is<span style="font-family: monospace;"> WP_SITE</span>
      </p>
      <p>
            Use<span style="font-family: monospace;"> [tib_post] </span>to place a tib button specific to an individual posts.  The tib counter and subref will be 
            specific to the current WordPress post ID, for example<span style="font-family: monospace;"> WP_123</span>.

            By enclosing part of a post in shortcode tags like this:&ensp;
            <span style="font-family: monospace;"> <i>beginning-of-post...</i> [tib_post] <i>...rest-of-post...</i> [/tib_post] </span> 
            the <i>rest-of-post</i> part will be shown only after the reader had paid a tib. 
      </p>

      <p>
            Use<span style="font-family: monospace;"> ... [tib_inline]<i> text </i>[/tib_inline] ... </span> 
            or <span style="font-family: monospace;"> [tib_inline text='<i>text</i>'] </span> to make <i>text</i> a tibbable link. 
            By default, this shortcode will use the WordPress post ID, for example<span style="font-family: monospace;"> WP_123</span>.
            
      </p>

bd_help_shortcodes;

// Took this out of help-text because the functionality isn't working. Move it back into the block above when it works!
// <p>
//       You can also override settings for individual shortcodes.  For example<span style="font-family: monospace;"> [tib_post payaddr="bitcoinaddress"] </span> 
//       or<span style="font-family: monospace;"> [tib_site subref="WP_<i>sometext</i>"] </span>.
// </p>


$bd_help_widgets=<<<bd_help_widgets

      <p>
            You can place tib widgets anywhere permitted by your WordPress theme.  Widgets let you specify a title, intro blurb, and subref.  
      </p>
      <p>
            We recommended you always set subref to <span style="font-family: monospace;"> WP_<i>sometext</i> </span> which is specific to the widget. This 
            ensures that each widget gets its own counter.
      </p>
bd_help_widgets;


$bd_help_testmode=<<<bd_help_testmode

      <p><img src='$plugurl/resources/images/testmode-icon-24px.png' style='width: 1.3em; vertical-align: middle'></p>
      <p>
            You can use tibit testmode to check the plugin on your site with no risk.
      </p>
      <p>
            Bitcoin addresses that start with <span style="font-family: monospace;">'m'</span> or <span style="font-family: monospace;">'n'</span> are 'testnet' 
            addresses that can be used readily with no actual money or value involved.  tibit will detect a testnet address and trigger testmode, which allows 
            anyone to experiment with tibbing at no risk.  They can purchase a bundle of testmode tibs by magic and then spend them on any tibbable site with a 
            testnet bitcoin address configured.  tibit testmode is indicated with the yellow beaker icon shown above.
      </p>

      <p>
            Conversely, bitcoin addresses that start with a <span style="font-family: monospace;">'1'</span> are production, or 'mainnet' addresses, and users need
            to have purchased a bundle of real tibs in order to tib you if you have configured a bitcoin 'mainnet' addresses. The bitcoin testnet and mainnet are 
            completely separate, there is no risk of spending real tibs/bitcoins on the testnet, or the reverse.
      </p>
      <p>
            You can generate you own testnet bitcoin address in just a few seconds at<br><a style="font-family: monospace;" 
            href="https://www.bitaddress.org/bitaddress.org-v2.9.3-SHA1-7d47ab312789b7b3c1792e4abdb8f2d95b726d64.html?testnet=true">bitaddress testnet edition</a>.
      </p>

bd_help_testmode;
?>

