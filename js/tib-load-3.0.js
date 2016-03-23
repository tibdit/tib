/*! * $script.js JS loader & dependency manager * https://github.com/ded/script.js * (c) Dustin Diaz 2014 | License MIT */
(function(e,t){typeof module!="undefined"&&module.exports?module.exports=t():typeof define=="function"&&define.amd?define(t):this[e]=t()})("$script",function(){function p(e,t){for(var n=0,i=e.length;n<i;++n)if(!t(e[n]))return r;return 1}function d(e,t){p(e,function(e){return t(e),1})}function v(e,t,n){function g(e){return e.call?e():u[e]}function y(){if(!--h){u[o]=1,s&&s();for(var e in f)p(e.split("|"),g)&&!d(f[e],g)&&(f[e]=[])}}e=e[i]?e:[e];var r=t&&t.call,s=r?t:n,o=r?e.join(""):t,h=e.length;return setTimeout(function(){d(e,function t(e,n){if(e===null)return y();!n&&!/^https?:\/\//.test(e)&&c&&(e=e.indexOf(".js")===-1?c+e+".js":c+e);if(l[e])return o&&(a[o]=1),l[e]==2?y():setTimeout(function(){t(e,!0)},0);l[e]=1,o&&(a[o]=1),m(e,y)})},0),v}function m(n,r){var i=e.createElement("script"),u;i.onload=i.onerror=i[o]=function(){if(i[s]&&!/^c|loade/.test(i[s])||u)return;i.onload=i[o]=null,u=1,l[n]=2,r()},i.async=1,i.src=h?n+(n.indexOf("?")===-1?"?":"&")+h:n,t.insertBefore(i,t.lastChild)}var e=document,t=e.getElementsByTagName("head")[0],n="string",r=!1,i="push",s="readyState",o="onreadystatechange",u={},a={},f={},l={},c,h;return v.get=m,v.order=function(e,t,n){(function r(i){i=e.shift(),e.length?v(i,r):v(i,t,n)})()},v.path=function(e){c=e},v.urlArgs=function(e){h=e},v.ready=function(e,t,n){e=e[i]?e:[e];var r=[];return!d(e,function(e){u[e]||r[i](e)})&&p(e,function(e){return u[e]})?t():!function(e){f[e]=f[e]||[],f[e][i](t),n&&n(r)}(e.join("|")),v},v.done=function(e){v([null],e)},v})

function tibInit( arg) {  // can be string (PAD) or JS object { PAD, DUR, CBK, BTN }
    if(window.location.hostname.search("tibit.local") !== -1){ /* Get assets from tibit.local rather than tibit.com,
     if running on tibit.local */
        var bdEnvPath = 'tibit.local'
    }
    var bdEnvPath = bdEnvPath || 'tibdit.com';

    tibCss(); /* tibCss isn't part of the closure, so bdEnvPath needs to be manually passed to it - should
     tibCss be part of the closure? */

    var bd;
    var obj = {};

    if (typeof arg === 'string') {
        obj.PAD = arg;
    } else if (typeof arg === 'object') {
        obj = arg;
    }

    obj.VER = obj.VER || '3.0'; /* If the user hasn't specifically passed a version, version is set to 3.0, which
     will be symlinked to the most recent 3.0.x version */

    var scriptsToImport = ['tibjs'];
    /* Initialising an array of scripts to be imported before initialising
     tibHandler */
    $script('https://widget.'+ bdEnvPath + '/assets/js/tib-'+ obj.VER + '.js', 'tibjs');

    if (obj.PLT) { /* If a PLT is specified, import the corresponding extension JS file and add it to the list of
     scripts to import */
        $script('https://widget.'+ bdEnvPath + '/assets/platforms/' + obj.PLT + '/bd-tib-extn-' + obj.PLT + '.js', 'extension');
        scriptsToImport.push('extension');
    }


    $script.ready(scriptsToImport, function () {

        bd = new tibHandler(obj.PAD, obj.DUR, obj.CBK, obj.ASN, obj.PLT, obj);

        if (obj.PLT) { /* If a PLT is specified, we initialise a BDtibExtension object, passing our tibHandler to the
         constructor */
            ext = new BDtibExtension(bd);
            ext.extensionInit();
            /* Having constructed our object, we run extensionInit immediately */
        }

        // initButtons( defaultBTN, buttonResourcesUrl, tibButtonsClass)

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                bd.initButtons(obj.BTN, obj.BTS, 'bd-tib-btn');
            });
        } else {
            bd.initButtons(obj.BTN, obj.BTS, 'bd-tib-btn');
        }

        return bd;

    });

    function tibCss() {
        if (!document.getElementById('bd-css-tib-btn')) {

            var headElement = document.getElementsByTagName('head')[0];

            var linkElement = document.createElement('link');
            linkElement.id = 'bd-css-tib-btn';
            linkElement.rel = 'stylesheet';
            linkElement.type = 'text/css';
            linkElement.href = '//widget.tibdit.com/assets/css/tib.css';
            // linkElement.href= 'css/tib.css';
            headElement.appendChild(linkElement);
        }
    }

}
