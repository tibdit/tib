

function tibInit( arg, handle) {  // can be string (PAD) or JS object { PAD, DUR, CBK, BTN }

    handle = handle || 'bd';
    /* TODO: come up with a less gross solution for creating/referencing a global object with a custom name  */

    tibCss();
    var obj = {};

    if (typeof arg === 'string') {
        obj.PAD = arg;
    } else if (typeof arg === 'object') {
        obj = arg;
    }

    if(window.location.hostname.search("tibit.local") !== -1){ /* Get assets from tibit.local rather than tibit.com,
     if running on tibit.local */
        obj.ENP = 'tibit.local'
    }
    obj.ENP = obj.ENP || 'tibdit.com';

    obj.VER = obj.VER || '3.0'; /* If the user hasn't specifically passed a version, version is set to 3.0, which
     will be symlinked to the most recent 3.0.x version */

    var scriptsToImport = ['tibjs'];
    /* Initialising an array of scripts to be imported before initialising
     tibHandler */
    $script('https://widget.'+ obj.ENP + '/assets/js/tib-'+ obj.VER + '.js', 'tibjs');

    $script('https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.17.0/URI.min.js', 'urijs');
    scriptsToImport.push('urijs');

    if (obj.PLT) { /* If a PLT is specified, import the corresponding extension JS file and add it to the list of
     scripts to import */
        $script('https://widget.'+ obj.ENP + '/assets/platforms/' + obj.PLT + '/bd-tib-extn-' + obj.PLT + '.js', 'extension');
        scriptsToImport.push('extension');
    }


    $script.ready(scriptsToImport, function () {

        if (obj.PLT) { /* If a PLT is specified, we initialise a BDtibExtension object, passing our tibHandler to the
         constructor */

            BDTibExtension.prototype = new tibHandler(obj.PAD, obj.DUR, obj.CBK, obj.ASN, obj.PLT, obj);
            BDTibExtension.prototype.constructor = BDTibExtension;

            window[handle] = new BDTibExtension(obj.PAD, obj.DUR, obj.CBK, obj.ASN, obj.PLT, obj);

            if(window[handle].extensionInit){
                window[handle].extensionInit();
            }
            /* Having constructed our object, we run extensionInit immediately */
        }
        else{
            window[handle] = new tibHandler(obj.PAD, obj.DUR, obj.CBK, obj.ASN, obj.PLT, obj);
        }

        // initButtons( defaultBTN, buttonResourcesUrl, tibButtonsClass)

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function () {
                window[handle].initButtons(obj.BTN, obj.BTS, 'bd-tib-btn');
            });
        } else {
            window[handle].initButtons(obj.BTN, obj.BTS, 'bd-tib-btn');
        }

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
