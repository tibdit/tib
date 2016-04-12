

	 /*!
	  * $script.js JS loader & dependency manager
	  * https://github.com/ded/script.js
	  * (c) Dustin Diaz 2014 | License MIT
	  */
	(function(e,t){typeof module!="undefined"&&module.exports?module.exports=t():typeof define=="function"&&define.amd?define(t):this[e]=t()})("$script",function(){function p(e,t){for(var n=0,i=e.length;n<i;++n)if(!t(e[n]))return r;return 1}function d(e,t){p(e,function(e){return!t(e)})}function v(e,t,n){function g(e){return e.call?e():u[e]}function y(){if(!--h){u[o]=1,s&&s();for(var e in f)p(e.split("|"),g)&&!d(f[e],g)&&(f[e]=[])}}e=e[i]?e:[e];var r=t&&t.call,s=r?t:n,o=r?e.join(""):t,h=e.length;return setTimeout(function(){d(e,function t(e,n){if(e===null)return y();!n&&!/^https?:\/\//.test(e)&&c&&(e=e.indexOf(".js")===-1?c+e+".js":c+e);if(l[e])return o&&(a[o]=1),l[e]==2?y():setTimeout(function(){t(e,!0)},0);l[e]=1,o&&(a[o]=1),m(e,y)})},0),v}function m(n,r){var i=e.createElement("script"),u;i.onload=i.onerror=i[o]=function(){if(i[s]&&!/^c|loade/.test(i[s])||u)return;i.onload=i[o]=null,u=1,l[n]=2,r()},i.async=1,i.src=h?n+(n.indexOf("?")===-1?"?":"&")+h:n,t.insertBefore(i,t.lastChild)}var e=document,t=e.getElementsByTagName("head")[0],n="string",r=!1,i="push",s="readyState",o="onreadystatechange",u={},a={},f={},l={},c,h;return v.get=m,v.order=function(e,t,n){(function r(i){i=e.shift(),e.length?v(i,r):v(i,t,n)})()},v.path=function(e){c=e},v.urlArgs=function(e){h=e},v.ready=function(e,t,n){e=e[i]?e:[e];var r=[];return!d(e,function(e){u[e]||r[i](e)})&&p(e,function(e){return u[e]})?t():!function(e){f[e]=f[e]||[],f[e][i](t),n&&n(r)}(e.join("|")),v},v.done=function(e){v([null],e)},v});



 (function() {

	 $script('https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.17.0/URI.min.js', 'urijs');

	 var BTN = "&#x2772;&#x26C0;&ensp;tib&ensp;&#x21AC;&#x2773;";
	 var rtfBTN = "❲⛀ tib ↬❳"; /* Setting our base button strings - unicode for html/markdown, and a normal string
	  for RTF */

	 $script.ready(['urijs'], function () {

		 TIB = new URI(window.location); /* Using URI.js library to get current location */

		 if (TIB.hostname() === "www.tumblr.com") { /* Must be running on tumblr, if not, throw up an alert for the
		  user */
			 blogName = jQuery('.caption').html(); /* Grab the caption from the edit window for the blog name */
			 TIB = 'www.' + blogName + '.tumblr.com'; /* Prepend blog name to tumblr url to get blog URL */

			 postEditor = jQuery('.post-form'); /* Attempting to grab the editor window as a jQuery object */
			 if (postEditor.length) {
				 var paste = generateButtonCode(getEditorMode(), BTN, PAD, TIB, generateSUB()); /* Creating our
				  output by running generateButtonCode */

				 if(getEditorMode() === 'html' || getEditorMode() === 'markdown'){
					 insertButtonAce(paste); /* As HTML and Markdown use the same editor, we can use the same
					  function to insert the output of generateButtonCode */
				 }
				 else if(getEditorMode() === 'richtext'){
					 insertButtonRTF(paste);
				 }


			 }
			 else { /* If we were unable to retrieve the editor, we throw an alert that we could not find an editor
			  window */
				 window.alert(window.location + " not recognised as tumblr edit window");
			 }
		 }
		 else {
			 window.alert(window.location + " not recognised as tumblr window");
		 }

		 function insertButtonAce(paste){
			 var editor = ace.edit(jQuery('.ace_editor')[0]); /* Grabbing the editor */
			 editor.setValue(editor.getValue() + '\n\n' + paste); /* Get the value from the Ace Editor and append
			  our paste string to it (with some newlines inbetween) */
		 }

		 function insertButtonRTF(paste){
			 /* To insert a link, we create an anchor tag using document.CreateElement, set the href property to the
			  paste string we generated earlier, and wrap it in the appropriate tags as well as setting it's class
			   to our standard bd-tib-btn-tumblr-txt class. Finally, we append it as a child of .editor-richtext */
			 var rtfEditor = jQuery('.editor-richtext')[0];

			 var a = document.createElement('a');
			 a.setAttribute('href', paste);
			 a.classList.add('bd-tib-btn-tumblr-txt');
			 a.innerText = rtfBTN;

			 var bold = document.createElement('b');
			 var h2 = document.createElement('h2');

			 bold.appendChild(a);
			 h2.appendChild(bold);

			 link = h2;

			 rtfEditor.appendChild(link);
		 }

		 function generateButtonCode(mode, BTN, PAD, TIB, SUB) {
			 var paste;
			 switch (mode) {
				 case 'html':
					 paste = "<h2><b><a class='bd-tib-btn-tumblr-txt' href='https://tib.me/?PAD={PAD}&TIB={TIB}&SUB={SUB}''>{BTN}</a></b></h2>";
					 break;
				 case 'markdown':
					 paste = "<h2><b><a class='bd-tib-btn-tumblr-txt' href='https://tib.me/?PAD={PAD}&TIB={TIB}&SUB={SUB}'>{BTN}</a></b></h2>";
					 break;
				 case 'richtext':
					 paste = "https://tib.me/?PAD={PAD}&TIB={TIB}&SUB={SUB}";
					 break;
			 }
			 /* First we generate a string/template based on the type of editor we're currently using, replacing
			  the relevant parts of the URL with {PARAM} placeholders */

			 paste = paste.replace('{BTN}', BTN);
			 paste = paste.replace('{PAD}', PAD);
			 paste = paste.replace('{TIB}', TIB);
			 paste = paste.replace('{SUB}', SUB);
			 /* Now, we can replace the {PARAM} placeholders with the actual value we want to insert */

			 return paste;
		 }

		 function generateSUB(){
			 /* Generate a SUBreference of the pattern 'tumblr-{blog name}-{random string}' */
			 var SUB = 'tumblr-' + blogName + '-';
			 var possibleCharacters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; /* Defining the list
			  of possible characters to randomly select from */
			 for(i = 0; i < 5; i++){
				 SUB += possibleCharacters[Math.floor(Math.random() * possibleCharacters.length)];

				 /*
				   a) Generate a random number between 0 and 1
				   b) Multiply this number by the length of possibleCharacters to get a number between 0 and this length
				   c) Run the resultant number through Math.floor to round down to the nearest integer
				   d) Append the corresponding character within possibleCharacters to the SUB string */
			 }
			 return SUB;
		 }

		 function getEditorMode() {
			 /* If a postEditor is stored, check whether we are in html, markdown, or richtext editing mode and
			  set this as a property of postEditor. Then, return this postEditor.mode property */
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

 	});



})();
