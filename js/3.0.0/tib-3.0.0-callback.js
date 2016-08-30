/*************************************/
// TIB CALLBACK MODULE
/*************************************/
/*
 *
 * Module concerned with polling Tib window, keeping track of tib completion, extracting tib token, and persisting
 * tib through local storage, and firing custom event to be handled by other modules.
 *
 * */

var Tibit = (function(tibit){



    var callbacks = {};

    // Initializing closure variables for later setting/usage
    var callbackIntervalID, tibWindow, token;

    var DUR = 1; // TODO: pass from an initiator variable?



    var initialize = function(window){

        tibWindow = window; // Overwriting our tibWindow closure var on new callback initialisation
        tibWindow.initialHref = tibWindow.location.href;

        // setInterval returns an interval ID - saved to closure variable callbackIntervalID to later clear interval
        callbackIntervalID = setInterval( function() {
            callbackHandler();
        }, 100);

    };



    var persistAck = function(){
    // Pulls the ISS (tib issue time) from retrieved token.obj, generates an EXP (tib expiry time) and saves both of
    // these as JSON to a localStorage


        var storageKey = tibit.CONSTANTS.SUBREF_PREFIX + token.obj.SUB + "-TIBBED";

        var duration = DUR * (Tibit.isTestnet(token.obj.PAD) ? 300000 : 86400000 );
        // 300000   = 1000 * 60 * 5        (5 mins)
        // 86400000 = 1000 * 60 * 60 * 24  (24 hours)

        var issueDate = new Date( token.obj.ISS );
        var expireDate = new Date( issueDate + duration );

        var storageObj = { ISS: issueDate, // Issue Time
                            EXP: expireDate}; // Expiry Time
        localStorage.setItem(storageKey, JSON.stringify(storageObj));

        // Fire custom 'tibstate' event for any post-tib functions to hook into
        var tibEvent = document.createEvent('customEvent');
        tibEvent.initCustomEvent('tibstate', true, false, storageKey); // Event specifies the key of localstorage element containing relevant data
        window.dispatchEvent(tibEvent);

    };



    var callbackHandler = function(){
    // Handler for callback interval - checks the tibWindow every cycle and if conditions are met,
    // persists the tib via localstorage and closes

        if(callbackDone()){ // Polls tibWindow for tib completion

            token = extractTibToken(); // Save querystring token as json string AND js object to token variable
            closeWindow(tibWindow);

            if( validateTibToken(token) ){
                persistAck(); // Save to local storage and fire 'tibstate' custom event
            }

        }

    };



    var callbackDone = function(){
    // Assesses current tibWindow state to determine tib completion state - if all checks pass, clear the current
    // poller interval and return true.

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
    };



    var extractTibToken = function(){

        var tokenObj, signature;
        var queryString = tibWindow.location.search;

        var reTok = "[^\?]*\?(.*&)?tibtok=([^&]*)";
        token = queryString.match(reTok)[2]; // extract value of tibok=x querystring param
        token = decodeURIComponent(token); // convert any percent-encoded characters
        token = atob(token); // base64 decode the token string

        tokenObj = JSON.parse(token); // convert JSON serialised token string into a JS object

        return {
            json : token,
            obj : tokenObj
        };

    };



    var validateTibToken = function(){

        token.timestamp = new Date(token.obj.SEN || token.obj.ISS);
        token.offset = Date.now() - token.timestamp.getTime();

        if(token.offset > (5 * 60 * 1000) || token.offset < -(20 * 1000)) {
            // tib token issued more than five minutes ago
            // or more than 20 seconds into the future
            console.log('Token is invalid');
            return false;
        }

        return true;

    };



    var closeWindow = function(){

        var re= "[^\?]*\?(.*&)?noclose($|[=&])";  // add noclose querystring parameter to initiator (buggy - not always included in callback)
        if(tibWindow.location.search.search(re) !== -1) return false; // to prevent popup window from being automatically closed

        try{
            tibWindow.close();
        }
        catch(ex){ console.error( "attempt to automatically close callback window failed"); }

        return false; // function should never return, since window is gone

    };



    var localStorageAvailable = function() {

        try {
            x = '__storage_test__';
            window.localStorage.setItem(x, x);
            window.localStorage.removeItem(x);
            return true;
        }

        catch(e) {
            return false;
        }

    };

    callbacks.initialize = initialize;

    tibit.callbacks = callbacks;


    console.log('TIBIT: successfully loaded callback module');

    return tibit;



})(Tibit || {});