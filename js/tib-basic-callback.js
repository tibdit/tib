
var Tibit = (function(Tibit){

    var SUBREF_PREFIX= 'bd-subref-';
    Tibit.Callback = {};
    var callbackIntervalID;
    var tibWindow;
    var token;
    var DUR = 1;
    initialize = function(window){

        tibWindow = window; // Overwriting our tibWindow closure var on new callback initialisation
        tibWindow.initialHref = tibWindow.location.href;

        callbackIntervalID = setInterval( function() {
            callbackHandler();
        }, 100);
    };

    function persistAck(){
        var duration = DUR * (isTestNet() ? 300000 : 86400000 );
        var storageKey = SUBREF_PREFIX + token.obj.SUB + "-TIBBED";
        console.log(token);
        var issueDate = new Date( token.obj.ISS ).getTime();
        var expireDate = new Date( issueDate + duration );

        localStorage.setItem(storageKey, JSON.stringify({ ISS: issueDate, EXP: expireDate }));
        var tibEvent = document.createEvent('customEvent');
        tibEvent.initCustomEvent('tibstate', true, false, storageKey);
        window.dispatchEvent(tibEvent);
    }


    function callbackHandler(){
        if(callbackDone()){
            token = extractTibToken();
            closeWindow(tibWindow);
            if(validateTibToken(token)) persistAck();
        }
    }

    function isTestNet(){
        return token.PAD && ( "mn2".search(this.token.PAD.substr(0,1)) !== -1 );
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