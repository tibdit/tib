

	 /*!
	  * $script.js JS loader & dependency manager
	  * https://github.com/ded/script.js
	  * (c) Dustin Diaz 2014 | License MIT
	  */
	(function(e,t){typeof module!="undefined"&&module.exports?module.exports=t():typeof define=="function"&&define.amd?define(t):this[e]=t()})("$script",function(){function p(e,t){for(var n=0,i=e.length;n<i;++n)if(!t(e[n]))return r;return 1}function d(e,t){p(e,function(e){return!t(e)})}function v(e,t,n){function g(e){return e.call?e():u[e]}function y(){if(!--h){u[o]=1,s&&s();for(var e in f)p(e.split("|"),g)&&!d(f[e],g)&&(f[e]=[])}}e=e[i]?e:[e];var r=t&&t.call,s=r?t:n,o=r?e.join(""):t,h=e.length;return setTimeout(function(){d(e,function t(e,n){if(e===null)return y();!n&&!/^https?:\/\//.test(e)&&c&&(e=e.indexOf(".js")===-1?c+e+".js":c+e);if(l[e])return o&&(a[o]=1),l[e]==2?y():setTimeout(function(){t(e,!0)},0);l[e]=1,o&&(a[o]=1),m(e,y)})},0),v}function m(n,r){var i=e.createElement("script"),u;i.onload=i.onerror=i[o]=function(){if(i[s]&&!/^c|loade/.test(i[s])||u)return;i.onload=i[o]=null,u=1,l[n]=2,r()},i.async=1,i.src=h?n+(n.indexOf("?")===-1?"?":"&")+h:n,t.insertBefore(i,t.lastChild)}var e=document,t=e.getElementsByTagName("head")[0],n="string",r=!1,i="push",s="readyState",o="onreadystatechange",u={},a={},f={},l={},c,h;return v.get=m,v.order=function(e,t,n){(function r(i){i=e.shift(),e.length?v(i,r):v(i,t,n)})()},v.path=function(e){c=e},v.urlArgs=function(e){h=e},v.ready=function(e,t,n){e=e[i]?e:[e];var r=[];return!d(e,function(e){u[e]||r[i](e)})&&p(e,function(e){return u[e]})?t():!function(e){f[e]=f[e]||[],f[e][i](t),n&&n(r)}(e.join("|")),v},v.done=function(e){v([null],e)},v});



 (function() {

	$script('https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.17.0/URI.min.js', 'urijs');

	var BTN="&#x2772;&#x26C0;&ensp;tib&ensp;&#x21AC;&#x2773;";

	$script.ready(['urijs'], function() {

		TIB= new URI(window.location);

		if( TIB.hostname() === "www.tumblr.com" ) {
			TIB= TIB.query(true).redirect_to;
			console.log(TIB);

			postEditor = jQuery('.post-form');
			if(postEditor.length) {
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

		function watchElementVisibility(element){

			if(element.is(':hidden')){
				jQuery('#tib-input-bar').remove();
			}
			else{
				setTimeout(watchElementVisibility, 1000, element);
			}
		}

		function appendCSS(){
			jQuery('style.tibStyles').remove();
			jQuery('head').append('' +
				'<style class="tibStyles">' +
				'#tib-input-bar{' +
				'position: fixed;' +
				'top: 0;' +
				'z-index: 50000;' +
				'width: 100%;' +
				'padding: 20px;' +
				'background: rgba(255,255,255, 0.8);' +
				'display: none;' +
				'}</style>');
		}

		function generateButtonCode(mode, BTN, PAD, TIB){
			var paste;
			switch(mode) {
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
			paste= paste.replace('{BTN}', BTN);
			paste= paste.replace('{PAD}', PAD);
			paste= paste.replace('{TIB}', TIB);

			return paste;
		}

		function generateInputWindow(){

			appendCSS();
			jQuery('#tib-input-bar').remove();


			jQuery.get('//widget.tibit.local/tibbee-integration/platforms/tumblr/tumblr-bdK-toolbar.html', function(data){
				jQuery('body').append(data);

				jQuery('#tib-input-bar').fadeIn();
				jQuery('#tib-form').submit(tibFormSubmitHandler);
			});
			//tibBar.append(tibForm);
			//jQuery('body').append(tibBar);
		}

		function tibFormSubmitHandler(e){
			e.preventDefault();
			PAD = jQuery('#PAD').val();
			console.log(PAD);

			var paste = generateButtonCode(getEditorMode(), BTN, PAD, TIB);

			window.prompt("copy this",paste);
		}

		function getEditorMode(){
			if(postEditor.length){

				if(postEditor.find('.icon.html').is(':visible')){
					postEditor.mode = 'html';
				}
				else if(postEditor.find('.icon.markdown').is(':visible')){
					postEditor.mode = 'markdown';
				}
				else{
					postEditor.mode = 'richtext';
				}

				return postEditor.mode;
			}
		}

	});

})();
