/*************************************/
// TIB INITIATOR MODULE
/*************************************/
/*
*
* Module concerned with the interactions with the tibbing app.
* Exposes our Tibit.Initiator constructor, which can be instantiated and used to dispatch a tibbing window, retrieve
* counters, and validate Tib params.
*
* */

var TIBIT = (function(tibit){


    var Initiator = function( domElement){

        this.dispatch= function() {
            // initiate the Tib by opening the tib.me popup window - this is primarily used as an onClick handler,
            // but can alternatively be used as

            var tibWindowName= "tibit";
            var tibWindowOptions= "height=721,width=640,menubar=no,location=no,resizable=no,status=no";

            // Use initiator params to generate URL, and open in new window
            var tibUrl = document.createElement('a');
            tibUrl.href = "///";
            tibUrl.hostname = "tib.me";
            tibUrl.protocol = "https";
            tibUrl.search = querystring(this.params);
            tibUrl.search= tibUrl.search.substr(0,tibUrl.search.length-1);  // remove trailing ampersand

            var tibWindow = window.open( tibUrl.href, tibWindowName, tibWindowOptions);

            // If using default (inline) CBK, we initialize the callback handlers on dispatch
            if(this.params.CBK !== 'none' && this.params.CBK === window.location.origin){
                tibit.CONSOLE_OUTPUT && console.log('No CBK specified - initializing inline callback poller');
                tibit.initializeCallback(tibWindow, this);
            }

            return tibWindow;
        };

        this.generateSub= tibit.generateSub;

        this.updateQty= function(callback){


            tibit.CONSOLE_OUTPUT && console.log('Running updateQTY for storageKey "'+storageKey+'"');

            // Value from params takes precedence
            var subrefQTY = this.params.QTY;

            // No value from params set, attempt to fetch + parse QTY from localstorage
            if(!subrefQTY){
                subrefQTY = localStorage.getItem(storageKey + '-QTY');
                if(subrefQTY) subrefQTY = JSON.parse(localStorage.getItem(storageKey + '-QTY')).QTY;
                tibit.CONSOLE_OUTPUT && console.log('updateQty retrieved QTY '+subrefQTY+' from localStorage');
            }

            if(!subrefQTY){
                tibit.CONSOLE_OUTPUT && console.log('subrefQTY not set (' + subrefQTY + ') - attempting to fetch');
                fetchQty();
                subrefQTY = null;
            }
            else{
                var tibEvent = document.createEvent('CustomEvent');
                tibEvent.initCustomEvent('tibstate', true, false, storageKey + '-QTY');
                window.dispatchEvent(tibEvent);
            }

            return subrefQTY;

        };

        this.isTestnet= function(PAD){

            // true if PAD set and first character not 'm', 'n', or '2'

            return this.params.PAD && ( "mn2".search(this.params.PAD.substr(0,1)) !== -1 );
        };

        var fetchQty = function(){

            var qtyHttp= new XMLHttpRequest();
            var initiatorUrl= "https://tib.me/getqty/" + querystring(params);
            qtyHttp.open('GET', initiatorUrl, true);
            qtyHttp.send();


            qtyHttp.onreadystatechange= function(){
                if ( qtyHttp.readyState === 4 && qtyHttp.status === 200 ) {
                    fetchQtyHandler(this);
                }
            };
        };

        var fetchQtyHandler = function(qtyHttp){

                var obj = {
                    QTY : JSON.parse(qtyHttp.response).QTY,
                    EXP : new Date(new Date().getTime() + (1000 * 60 * tibit.CONSTANTS.QTY_CACHE_DURATION)) // 20 minutes from now
                };

                localStorage.setItem(storageKey + '-QTY', JSON.stringify(obj));

                var tibEvent = document.createEvent('CustomEvent');
                tibEvent.initCustomEvent('tibstate', true, false, storageKey + '-QTY');
                window.dispatchEvent(tibEvent);


        };

        var querystring= function() {

            // assembles Tib initiator parameters into URL querystring

            var querystring = "?";
            for ( var param in params ) {
                if(params[param]){ // Skip to next param if value is an empty string
                    if(param === 'CBK' && params[param] === 'none') break;
                    querystring += param;
                    querystring += "=";
                    querystring += encodeURIComponent(params[param]);
                    querystring += "&";
                }
            }
            tibit.CONSOLE_OUTPUT && console.log('Generated querystring "'+ querystring + '"');
            return querystring.substr(0,querystring.length);  // truncate trailing ampersand
        };



        var loadElementParams = function(params, e){

            for ( var paramName in params ) {
                if ( e.getAttribute('data-bd-' + paramName) ){
                    params[paramName] = e.getAttribute('data-bd-' + paramName);
                }
            }

            return params;
        };

        this.domElement = domElement;
        var params = this.params = tibit.cloneObj(initiatorDefaultParams);

        // If we don't populate params with ElementParams within Initiator constructor, how does storageKey populate with correct SUB before fetching counter?
        tibit.loadElementParams( params, domElement);

        if ( !this.params.TIB ) {          // If no TIB specified, default to the current page URL
            this.params.TIB = window.location.hostname + window.location.pathname + window.location.search; // + ??
        }

        if ( !this.params.SUB ) {          // If no SUB is provided, use a hash of the TIB url
            this.params.SUB=  this.generateSub();
        }

        // If not CBK is specified, we just set to window.location.origin - this will never be seen as our callback
        // handler methods will extract the token, process/persist the tib, and close the window before being seen
        // by the user.
        if(!this.params.CBK){
            this.params.CBK = window.location.origin;
        }

        var storageKey = this.storageKey = tibit.CONSTANTS.SUBREF_PREFIX + this.params.SUB;


    };

    var generateSub = function() {

        // generate SHA256 hash, truncate to 10 chars, and use this for the SUB.
        // potential to overload with platform specific code, but that will require DOM element (as argument?)

        var hash = this.params.TIB.replace(/^(https?:)?(\/\/)?(www.)?/g, '');  // remove generic url prefixes
        hash = murmurhash3_32_gc(hash, 0);   // possibly move to
        // https://github.com/garycourt/murmurhash-js/blob/master/murmurhash3_gc.js
        return "TIB-SHA256-" + hash;
    };

    tibit.generateSub = tibit.generateSub || generateSub; // If tibit.generateSub not already defined, use default

    var initiatorDefaultParams = {

        PAD : "",  // Payment Address - Bitcoin address Tib value will be sent to
        SUB : "",  // Subreference - Identifies the specific item being tibbed for any counter
        CBK : "",  // Callback - If specified, the users browser will be redirected here after the Tib is confirmed
        ASN : "",  // Assignee - 3rd party that Tib value will be sent to.  Only valid if PAD not specified
        TIB : ""  // URL used to retreive the snippet telling the user what they are tibbing
    };


    // Exposing our top-level namespace variables/methods/constants as part of our working tibit object
    tibit.initiatorDefaultParams = initiatorDefaultParams;
    tibit.Initiator = Initiator;

    tibit.CONSOLE_OUTPUT && console.log('successfully loaded initiator module');

    // Return our working tibit object to be set to the global TIBIT object
    return tibit;

})(TIBIT || {});