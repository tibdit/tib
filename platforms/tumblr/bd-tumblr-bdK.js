

	 /*!
	  * $script.js JS loader & dependency manager
	  * https://github.com/ded/script.js
	  * (c) Dustin Diaz 2014 | License MIT
	  */
	(function(e,t){typeof module!="undefined"&&module.exports?module.exports=t():typeof define=="function"&&define.amd?define(t):this[e]=t()})("$script",function(){function p(e,t){for(var n=0,i=e.length;n<i;++n)if(!t(e[n]))return r;return 1}function d(e,t){p(e,function(e){return!t(e)})}function v(e,t,n){function g(e){return e.call?e():u[e]}function y(){if(!--h){u[o]=1,s&&s();for(var e in f)p(e.split("|"),g)&&!d(f[e],g)&&(f[e]=[])}}e=e[i]?e:[e];var r=t&&t.call,s=r?t:n,o=r?e.join(""):t,h=e.length;return setTimeout(function(){d(e,function t(e,n){if(e===null)return y();!n&&!/^https?:\/\//.test(e)&&c&&(e=e.indexOf(".js")===-1?c+e+".js":c+e);if(l[e])return o&&(a[o]=1),l[e]==2?y():setTimeout(function(){t(e,!0)},0);l[e]=1,o&&(a[o]=1),m(e,y)})},0),v}function m(n,r){var i=e.createElement("script"),u;i.onload=i.onerror=i[o]=function(){if(i[s]&&!/^c|loade/.test(i[s])||u)return;i.onload=i[o]=null,u=1,l[n]=2,r()},i.async=1,i.src=h?n+(n.indexOf("?")===-1?"?":"&")+h:n,t.insertBefore(i,t.lastChild)}var e=document,t=e.getElementsByTagName("head")[0],n="string",r=!1,i="push",s="readyState",o="onreadystatechange",u={},a={},f={},l={},c,h;return v.get=m,v.order=function(e,t,n){(function r(i){i=e.shift(),e.length?v(i,r):v(i,t,n)})()},v.path=function(e){c=e},v.urlArgs=function(e){h=e},v.ready=function(e,t,n){e=e[i]?e:[e];var r=[];return!d(e,function(e){u[e]||r[i](e)})&&p(e,function(e){return u[e]})?t():!function(e){f[e]=f[e]||[],f[e][i](t),n&&n(r)}(e.join("|")),v},v.done=function(e){v([null],e)},v});



 (function() {

	 $script('https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.17.0/URI.min.js', 'urijs');
	 $script(baseSRC + 'jsbn.js', 'jsbn');
	 $script(baseSRC + 'jsbn2.js', 'jsbn2');
	 $script(baseSRC + 'crypto-sha256.js', 'crpytosha256js');
	 $script(baseSRC + 'btcaddr_validator.js', 'btcvaljs');

	 var BTN = "&#x2772;&#x26C0;&ensp;tib&ensp;&#x21AC;&#x2773;";

	 $script.ready(['urijs', 'jsbn', 'jsbn2', 'crpytosha256js', 'btcvaljs'], function () {

		 /* MAIN INITIALISATION BLOCK
		 *
		 * we check we're on tumblr, check we have an editor window open, and then
		 * if both of these are true, we fire our generateInputWindow function that
		 * builds our tibbee toolbar. We also set watchElementVisibility using setTimeout
		 * to close our toolbar when the editor window closes. */

		 console.log(baseSRC);

		 TIB = new URI(window.location);

		 if (TIB.hostname() === "www.tumblr.com") {
			 TIB = TIB.hostname() + '/blog/' + jQuery('.caption').html();
			 console.log(TIB);

			 postEditor = jQuery('.post-form');
			 if (postEditor.length) {
				 generateInputWindow();
				 setTimeout(watchElementVisibility, 1000, postEditor);
			 }
			 else {
				 window.alert(window.location + " not recognised as tumblr edit window");
			 }
		 }
		 else {
			 window.alert(window.location + " not recognised as tumblr window");
		 }

		 /* MAIN INITIALISATION BLOCK */

		 function watchElementVisibility(element) {

			 if (element.is(':hidden')) {
				 jQuery('#tib-input-bar').remove();
			 }
			 else {
				 setTimeout(watchElementVisibility, 1000, element);
			 }
		 }

		 function appendCSS() {
			 jQuery('style.tibStyles').remove();
			 jQuery.get(baseSRC + 'tumblr-bdK-toolbar.css', function (data) {
				 jQuery('head').append('<style class="tibStyles">' + data + '</style>');
			 });
		 }

		 function generateButtonCode(mode, BTN, PAD, TIB) {
			 var paste;
			 switch (mode) {
				 case 'html':
					 paste = "<h2><b><a href='https://tib.me/?PAD={PAD}&TIB={TIB}''>{BTN}</a></b></h2>";
					 break;
				 case 'markdown':
					 paste = "## **[{BTN}](https://tib.me/?PAD={PAD}&TIB={TIB})**";
					 break;
				 case 'richtext':
					 paste = "{BTN}&emsp;https://tib.me/?PAD={PAD}&TIB={TIB}";
					 break;
			 }
			 paste = paste.replace('{BTN}', BTN);
			 paste = paste.replace('{PAD}', PAD);
			 paste = paste.replace('{TIB}', TIB);

			 return paste;
		 }

		 function btcValidator(e) {
			 target = jQuery(e.target);
			 submitButton = jQuery('#tib-form-copy');
			 if(check_address(target.val())){
				 submitButton.prop('disabled', false);
				 target.addClass('valid');
				 target.removeClass('invalid');
			 }
			 else if(target.val() == ''){
				 submitButton.prop('disabled', true);
				 target.removeClass('invalid');
				 target.removeClass('valid');
			 }
			 else{
				 submitButton.prop('disabled', true);
				 target.addClass('invalid');
				 target.removeClass('valid');
			 }
		 }

		 function generateInputWindow() {
			 if (jQuery('#tib-input-bar').length) {
				 jQuery('#tib-input-bar').fadeOut('fast', function () {
					 jQuery('#tib-input-bar').remove();

					 jQuery.get(baseSRC + 'tumblr-bdK-toolbar.html', function (data) {
						 jQuery('body').append(data);
						 jQuery('#tib-input-bar').fadeIn();
						 jQuery('#tib-form').submit(tibFormSubmitHandler);

						 appendCSS();


						 jQuery('#tib-form input#PAD').keyup({'target': '#tib-form input#PAD'}, btcValidator);

					 });
				 });
			 }
			 else {
				 console.log('testytest');
				 jQuery.get(baseSRC + 'tumblr-bdK-toolbar.html', function (data) {
					 jQuery('body').append(data);
					 jQuery('#tib-input-bar').fadeIn();
					 jQuery('#tib-form').submit(tibFormSubmitHandler);

					 appendCSS();

					 $script.ready('btcvaljs', function () {
						 jQuery('#tib-form input#PAD').keyup({'target': '#tib-form input#PAD'}, btcValidator);
					 });
				 });
			 }

		 }

		 function tibFormSubmitHandler(e) {
			 e.preventDefault();
			 PAD = jQuery('#PAD').val();
			 customTIB = jQuery('#TIB').val();

			 var paste = generateButtonCode(getEditorMode(), BTN, PAD, customTIB || TIB);

			 copyToClipboard(paste);

			 jQuery(this).find('#tib-form-copy').val('✔ Copied to clipboard').addClass('submitted');

			 setTimeout(function () {
				 jQuery('#tib-form-copy').val('Copy to clipboard').removeClass('submitted');
			 }, 2000);
		 }

		 function getEditorMode() {
			 if (postEditor.length) {

				 if (postEditor.find('.icon.html').is(':visible')) {
					 postEditor.mode = 'html';
				 }
				 else if (postEditor.find('.icon.markdown').is(':visible')) {
					 postEditor.mode = 'markdown';
				 }
				 else {
					 postEditor.mode = 'richtext';
				 }

				 return postEditor.mode;
			 }
		 }

		 /* Taken from Ignarron / copyToClipboard.html
		  https://gist.github.com/lgarron/d1dee380f4ed9d825ca7 */
		 var copyToClipboard = (function () {
			 var _dataString = null;
			 document.addEventListener("copy", function (e) {
				 if (_dataString !== null) {
					 try {
						 e.clipboardData.setData("text/plain", _dataString);
						 e.preventDefault();
					 } finally {
						 _dataString = null;
					 }
				 }
			 });
			 return function (data) {
				 _dataString = data;
				 document.execCommand("copy");
			 };
	 })();

 	});



})();
