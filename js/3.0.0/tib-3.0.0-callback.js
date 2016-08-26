var Tibit = (function(Tibit){



    Tibit.Callback = {};

    // Initializing closure variables for later setting/usage
    var callbackIntervalID, tibWindow, token;

    var DUR = 1; // TODO: pass from an initiator variable?

    initialize = function(window){

        tibWindow = window; // Overwriting our tibWindow closure var on new callback initialisation
        tibWindow.initialHref = tibWindow.location.href;

        // setInterval returns an interval ID - saved to closure variable callbackIntervalID to later clear interval
        callbackIntervalID = setInterval( function() {
            callbackHandler();
        }, 100);

    };

    function persistAck(){


        var storageKey = Tibit.constants.SUBREF_PREFIX + token.obj.SUB + "-TIBBED";

        var duration = DUR * (Tibit.isTestnet(token.obj.PAD) ? 300000 : 86400000 );
        // 300000   = 1000 * 60 * 5        (5 mins)
        // 86400000 = 1000 * 60 * 60 * 24  (24 hours)

        var storageObj = { ISS: new Date( token.obj.ISS ), // Issue Time
                            EXP: new Date( issueDate + duration )}; // Expiry Time
        localStorage.setItem(storageKey, JSON.stringify(storageObj));

        // Fire custom 'tibstate' event for any post-tib functions to hook into
        var tibEvent = document.createEvent('customEvent');
        tibEvent.initCustomEvent('tibstate', true, false, storageKey);
        window.dispatchEvent(tibEvent);

    }


    function callbackHandler(){
        // Handler for callback interval - checks the tibWindow every cycle and if conditions are met,
        // persists the tib via localstorage and closes

        if(callbackDone()){ // Polls tibWindow for tib completion

            token = extractTibToken(); // Save querystring token as json string AND js object to token variable
            closeWindow(tibWindow);

            if( validateTibToken(token) ){
                persistAck(); // Save to local storage and fire 'tibstate' custom event
            }

        }
    }

    function callbackDone(){
        var domain;

        try {
            if( tibWindow.closed){
                clearInterval(callbackIntervalID); // window closed externally, no callback with token
                return false;
            }
            domain = tibWindow.location.hostname; // should throw e.SECURITY_ERR if on different origin
        }
        catch(ex){
            if(ex.code === ex.SECURITY_ERR) return false; // tib window is still on another domain (i.e. //tib.me) - keep waiting
            else{
                clearInterval(callbackIntervalID); // some unexpected error - abort polling - leave tib window open
                throw ex;
            }
        }

        if(tibWindow.initialHref === tibWindow.location.href || domain.length === 0) return false; // window is accessible, but probably still initialising - keep waiting
        if (domain.substr(domain.length-6) === "tib.me") return false; // insecure browser lets us see cross domain - keep waiting

        clearInterval(callbackIntervalID);
        return true;
    }

    function extractTibToken(){
        var queryString = tibWindow.location.search;
        var tokenObj, signature;

        var reTok = "[^\?]*\?(.*&)?tibtok=([^&]*)";
        token = queryString.match(reTok)[2]; // extract value of tibok=x querystring param
        token = decodeURIComponent(token); // convert any percent-encoded characters
        token = atob(token); // base64 decode the token string
        tokenObj = JSON.parse(token); // convert JSON serialised token string into a JS object

        return {
            json : token,
            obj : tokenObj
        };

    }

    function validateTibToken(){

        token.timestamp = new Date(token.obj.SEN || token.obj.ISS);
        token.offset = Date.now() - token.timestamp.getTime();

        if(token.offset > (5 * 60 * 1000) || token.offset < -(20 * 1000)) {
            // tib token issued more than five minutes ago
            // or more than 20 seconds into the future
            console.log('Token is invalid');
            return false;
        }

        return true;

    }

    function closeWindow(){
        var re= "[^\?]*\?(.*&)?noclose($|[=&])";  // add noclose querystring parameter to initiator (buggy - not always included in callback)
        if(tibWindow.location.search.search(re) !== -1) return false; // to prevent popup window from being automatically closed

        try{
            tibWindow.close();
        }
        catch(ex){ console.error( "attempt to automatically close callback window failed"); }

        return false; // function should never return, since window is gone
    }

    function localStorageAvailable() {
        try {
            x = '__storage_test__';
            window.localStorage.setItem(x, x);
            window.localStorage.removeItem(x);
            return true;
        }
        catch(e) {
            return false;
        }
    }

    Tibit.Callback.initialize = initialize;
    return Tibit;
})(Tibit || {});