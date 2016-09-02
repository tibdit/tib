/*************************************/
// TIB CALLBACK MODULE
/*************************************/
/*
 *
 * Module concerned with polling Tib window, keeping track of tib completion, extracting tib token, and persisting
 * tib through local storage, and firing custom event to be handled by other modules.
 *
 * */

var TIBIT = (function(tibit){


    // Initializing closure variables for later setting/usage
    var callbackIntervalID, tibWindow, token;

    var DUR = 1; // TODO: pass from an initiator variable?
<<<<<<< HEAD:js/3.0.0/tib-3.0.0-callback.js

    var initializeCallback = function( window ){
=======
    var tibInitiator;


    var initializeCallback = function(window, initiator){

        tibInitiator = initiator;
>>>>>>> develop:js/src/tib-callback.module.js

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

<<<<<<< HEAD:js/3.0.0/tib-3.0.0-callback.js
        tibit.CONSOLE_OUTPUT && console.log( 'Running persistAck for storage  ' );

        var storageKey = tibit.CONSTANTS.SUBREF_PREFIX + token.obj.SUB + "-TIBBED";

        var duration = DUR * (isTestnet(token.obj.PAD) ? 300000 : 86400000 );
        tibit.CONSOLE_OUTPUT && console.log('Duration calculated as "'+ duration + '"');
=======

        var storageKey = tibit.CONSTANTS.SUBREF_PREFIX + token.obj.SUB + "-TIBBED";

        var duration = DUR * (tibInitiator.isTestnet(token.obj.PAD) ? 300000 : 86400000 );
        console.log(duration);
>>>>>>> develop:js/src/tib-callback.module.js
        // 300000   = 1000 * 60 * 5        (5 mins)
        // 86400000 = 1000 * 60 * 60 * 24  (24 hours)

        var issueDate = new Date( token.obj.ISS );
<<<<<<< HEAD:js/3.0.0/tib-3.0.0-callback.js
        tibit.CONSOLE_OUTPUT && console.log('Retrieved issue date ' + issueDate);
        var expireDate = new Date( issueDate.getTime() + duration );
        tibit.CONSOLE_OUTPUT && console.log('Generated expire date '+ expireDate);
=======
        console.log(new Date(issueDate.getTime() + 300000));
        var expireDate = new Date( issueDate.getTime() + duration );
        console.log('Generated expire date'+ expireDate);
>>>>>>> develop:js/src/tib-callback.module.js

        var storageObj = { ISS: issueDate, // Issue Time
                            EXP: expireDate}; // Expiry Time
        localStorage.setItem(storageKey, JSON.stringify(storageObj));

        // Fire custom 'tibstate' event for any post-tib functions to hook into
        var tibEvent = document.createEvent('customEvent');
        tibEvent.initCustomEvent('tibstate', true, false, storageKey); // Event specifies the key of localstorage element containing relevant data
        window.dispatchEvent(tibEvent);

    };
<<<<<<< HEAD:js/3.0.0/tib-3.0.0-callback.js



    var callbackHandler = function(){
    // Handler for callback interval - checks the tibWindow every cycle and if conditions are met,
    // persists the tib via localstorage and closes

        if(callbackDone()){ // Polls tibWindow for tib completion

=======



    var callbackHandler = function(){
    // Handler for callback interval - checks the tibWindow every cycle and if conditions are met,
    // persists the tib via localstorage and closes

        if(callbackDone()){ // Polls tibWindow for tib completion

>>>>>>> develop:js/src/tib-callback.module.js
            token = extractTibToken(); // Save querystring token as json string AND js object to token variable
            closeWindow(tibWindow);

            if( validateTibToken(token) ){
                persistAck(); // Save to local storage and fire 'tibstate' custom event
            }

        }

    };

<<<<<<< HEAD:js/3.0.0/tib-3.0.0-callback.js
    var isTestnet = function( PAD ){

        // true if PAD set and first character not 'm', 'n', or '2'

        return PAD && ( "mn2".search( PAD.substr(0,1)) !== -1 );

    };
=======

>>>>>>> develop:js/src/tib-callback.module.js

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
<<<<<<< HEAD:js/3.0.0/tib-3.0.0-callback.js

    };



    var extractTibToken = function(){

=======
    };



    var extractTibToken = function(){

>>>>>>> develop:js/src/tib-callback.module.js
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

<<<<<<< HEAD:js/3.0.0/tib-3.0.0-callback.js


=======


>>>>>>> develop:js/src/tib-callback.module.js
    var validateTibToken = function(){

        token.timestamp = new Date(token.obj.SEN || token.obj.ISS);
        token.offset = Date.now() - token.timestamp.getTime();

        if(1 === 3) {
            // tib token issued more than five minutes ago
            // or more than 20 seconds into the future
            console.log('Token is invalid \n \t', token);
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

    tibit.initializeCallback = initializeCallback;


    tibit.CONSOLE_OUTPUT && console.log('successfully loaded callback module');

    return tibit;



})(TIBIT || {});