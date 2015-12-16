=== Plugin Name ===  
Contributors: Justin_Maxwell_  
Donate link: n/a  
Tags: micropayments, microdonations, monetisation, monetization, fundraising,   button, integration, shortcode  
Requires at least: 3.3
Tested up to: 4.3.1  
Stable tag: 1.4.4
License: GPL3  
License URI: http://www.gnu.org/licenses/gpl-3.0.html

tibs are tiny payments typically around 15 pence (25 cents).  

This plugin makes collecting tibs as either micropayments or microdonations simple for WordPress users.

tib buttons are placed on the site using either widgets or shortcodes.

Demo video: https://www.youtube.com/watch?v=Nqpkws4YyFM

Demo scenarios: http://tibdit.com/wordpress/demo-site/?interest=jb

=== Description ===
# Description

## tib 
/tÉªb/  

_noun (pl. tibs)_
a small amount of money, typically around GBP 0.15 (USD 0.25), chosen by an individual tibber to ensure that they â€œdo not need to think twiceâ€ before spending.

_verb (v.tr tibbed)_ 
to send a tib to a tibbee, either as a gratuity (a microdonation), or as payment for access to content or a service (a micropayment).

_s.a. tibber, tibbee c.f. tip, tidbit_

## tibit
tibit provides a simple, original approach to collecting micropayments from visitors.

Users, or *tibbers*, pre-define their *tib* amount with a value where they 'won't have to think twice', and purchase a bundle of these tibs.

Publishers, or *tibbees* can collect tibs from tibbers simply by linking to the tibit web application from their site.  There is no need to register or create any sort of account with tibit to use our system to collect micropayments and microdonations through our service.  All that is required is a bitcoin address. Links to some suggested ways obtain one are included in the instructions on the dashboard settings page.

This plugin automates the process for WordPress site operators, including the receipt and processing of the token returned from the tibit application which acknowledges the payment of a tib and displays a count of tibs received.   This counter can be site-wide, widget-specific, or post-specific.

To get a feel for how tibit works, please visit http://demo.tibdit.com



== Installation ==

1. Install and activate the tibit plugin from the Plugins menu in your WordPress Dashboard.

2. Go to the new tibit page in the Settings menu of the Dashboard, read through the instructions there, and configure:  
    * A title and intro text to appear when the widget is used,
    
    * Your bitcoin address,
    
    * How many days the site should acknowlege a users tib.
    
          The tibbing button is deactivated with a checkmark overlayed for this period.
    
1. Place either the widget, or the shortcodes [tib_post] and [tib_site] at the locations you wish to display a tib button.

tibit provides a testmode, where you can experiment with the plugin and the tibit service without using actual currency.  Details are at the bottom of the settings page.

If bitcoin concerns you as perhaps to complex, follow the simple instructions on the settings page.  You can easily start collecting tibs now and get to grips with bitcoin later on.

tibit would be very grateful to here about your experiences installing and configuring the plugin at feedback@tibdit.com


== Frequently Asked Questions ==

### what is tibit? 

tibit is a system that enables users to send microdonations and micropayments to sites publishing a tib button alongside their content or service.  Unlike other micropayment offerings, tibit is designed so that these payments can be made 'without a second thought'.

In time, this will result in your blog receiving many tiny donations if your site visitors are appreciative, rather than hardly any with other approaches to collecting donations.

### what is a tib? 

A tib is a user-specific pre-set value that is sent to sites with the user confirms the payment.

### it sounds very complicated 

It's really not.  We suggest you look at demo.tibit.com, and the instructions on the plugin settings page, to see just how straightforward it is.

### what is the difference between `[tib_post]` and `[tib_site]` 

The `[tib_post]` shortcode passes a subreference of `"WP_ID_nnn"` to tibit, so it is the particular post with the wordpress id of `nnn` that is being tibbed.  The returned tib count will show the total of tibs sent for just this post.

Per-post counters are persisted in the wordpress post metadata.

On the other hand `[tib_site]` always passes a subreference of `"WP_SITE"` to tibit. This means the counter will include the total number of tibs from `[tib_site]` buttons across the wordpress site, because the subreference is constant.  

The `"WP_SITE"` counter is persisted in the WordPress site options data.

### what about the Widget 

The widget also uses the options data to record the count of tibs, but you can manually specify a different subreference for each widget, giving each it's own counter, or share a subreference, or set it to `"WP_SITE"` if you wish.  

The widget also lets you specify widget-specific headings, and a widget-specific bitcoin address - although this is not recommended.

### how do the counters get set 

Every time someone confirms a tib to some content of yours, we send back a token via the users browser, which is collected and processed by the Plugin. This token includes the total accumulated tibs for the unique combination of bitcoin address and subreference.  It is stored by the plugin inside WordPress so it can be displayed on the button when the page or post is displayed to a user.

== Screenshots ==
##Screenshots

1. The tib button in action.  These examples are 'testmode', the yellow beaker is shown only when the plugin is configured with a bitcoin testnet address.  

2. When a tib button is clicked, the tibit application opens in a new popup window or tab.  If the user is an existing user with a balance of unspent tibs, they are taken directly to the tib confirmation stage.  

3. After the user confirms the tib, the popup window is closed, which triggers the WordPress window to refresh.  Any paid-for content is revealed, and the tib button is replaced by a static acknowledgement of the tib being received.  

4. This is the tibit page within the Dashboard Settings menu.


== Changelog ==

= 1.4.4 =

* Bugfix for issue where BubbleButton class wasn't being appropriately included.

= 1.4.3 =

* Bugfix for issue where __autoload function would cause errors on certain configurations.

= 1.4.2 =

* Fixes to defaulting of values when not set (e.g. when updating from earlier versions) - should now recognise version changes and attempt to default values appropriately.
* Tested up to Wordpress 4.3.1
* Default button is now "SideSocialButton" and default colours are now tibit blue/green

= 1.4.1 =

* Some fixes to the display of the test mode icon on buttons.
* Reworked layout and styling for button customisation and selection.
* Ability to customise scale of buttons added.
* Expanded color picker functionality - now uses built in wordpress color picker for both primary and secondary colours, and shows/hides secondary colour picker for buttons without a secondary colour picker.
* Button customisation added to it's own tab.
* Alignment tweaks to SVG elements within buttons.
* Fixed referencing to some renamed functions.
* PHP version tested to 5.3.
* Buttons that have been tibbed now redirect the user to their profile rather than attempting to resend the tib.

= 1.4 =

* additional button configuration
* bugifx : tib recognition for posts on different pages
* PHP version tested to 5.2.6
* name changes from tibdit to tibit

= 1.3.1 =

* changes to versioning on js / css for cachebusting

= 1.3 = 

* Tib post feature added
* Custom colour feature added
* Bugs fixed

= 1.2.36 = 

* Expanded the help and information and moved it into the standard WordPress context help system
* Removed 'beta' indicator
* Removed bitcoin address from widget settings - all widgets now use the bitcoin address in the plugin settings
* Added customisation of widget background tint


= 1.2.35 =

* README tweaks
* screenshots added
* versioning added to javascript resources for browser cache management
* checked under WordPress 1.4

= 1.2.34 =

* fixed tooltips
* CSS improvements
* svn glitch

= 1.2.32 =

* Hopefully removed a .js conflict when certain scripts are combined together (and minified) by an unrelated WP plugin.

= 1.2.31 =

* Improved this README file.
* Fixed an incompatibility with earlier versions of PHP.

= 1.2.30 =

* Fixed a bug with plugin options not saving
* Significantly increased the amount of bitcoin address validation. 
* Prevented setting save with invalid bitcoin address
* Further improved the CSS to avoid collissions with themes or other plugins.
* Added beta icon to widget and settings page

= 1.2.22 =

* Added .bd CSS class to avoid style collisions with themes or other plugins

= 1.2.21 = 

* Fixed tooltip glitch

= 1.2.20 =

* First version uploaded to wordpress.org