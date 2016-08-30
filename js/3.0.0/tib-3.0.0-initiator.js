var Tibit = (function(Tibit){
    // Our Tib Initiator module, concerned with the interactions with the tibbing app. Exposes our TibInitiator
    // constructor, which can be instantiated and used to dispatch a tibbing window, retrieve counters, and validate Tib
    // params

    // Our pseudoconstants, available anywhere within our TibInitiator closure (but not from outside of it)
    // TODO: would it make more sense to expose these as properties of the Tibit object? Defining the same constants
    // in multiple modules seems redundant.
    var SUBREF_PREFIX= 'bd-subref-';
    var QTY_CACHE_DURATION= 20; // minutes

    Tibit.Initiator = function( domElement){
        this.params = {

            PAD : "",  // Payment Address - Bitcoin address Tib value will be sent to
            SUB : "",  // Subreference - Identifies the specific item being tibbed for any counter
            CBK : "",  // Callback - If specified, the users browser will be redirected here after the Tib is confirmed
            ASN : "",  // Assignee - 3rd party that Tib value will be sent to.  Only valid if PAD not specified
            TIB : ""  // URL used to retreive the snippet telling the user what they are tibbing
        };

        loadObjectParams(Tibit.params, this.params); // Import siteParams passed to constructor to this.params

        // tibInitiator is independent of any particular domElement, so retreiving and data-params is optional
        if(domElement){
            loadElementParams(this.params, domElement);
        }

        if ( !this.params.TIB ) {          // If no TIB specified, default to the current page URL
            this.params.TIB = window.location.hostname + window.location.pathname + window.location.search; // + ??
        }


        if ( !this.params.SUB ) {          // If no SUB is provided, use a hash of the TIB url
            this.params.SUB=  generateSub(this.params.TIB);
        }

        // If not CBK is specified, we just set to window.location.origin - this will never be seen as our callback
        // handler methods will extract the token, process/persist the tib, and close the window before being seen
        // by the user.
        if(!this.params.CBK){
            this.params.CBK = window.location.origin;
        }

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

            tibWindow = window.open( tibUrl.href, tibWindowName, tibWindowOptions);

            // If using default (inline) CBK, we initialize the callback handlers on dispatch
            if(this.params.CBK === window.location.origin){
                Tibit.Callback.initialize(tibWindow);
            }
        };

        this.getQty= function(){

            var storageKey = SUBREF_PREFIX + this.params.SUB + '-QTY', subrefQTY;

            // Value from params takes precedence
            subrefQTY = this.params.QTY;

            // No value from params set, attempt to fetch + parse QTY from localstorage
            if(!subrefQTY){
                subrefQTY = localStorage.getItem(storageKey);
                if(subrefQTY) subrefQTY = JSON.parse(localStorage.getItem(storageKey)).QTY;
            }

            // No value from params or localStorage, initiate getQTY request
            if( !subrefQTY ) {
                // retreive the current Tib count for this initiator

                var qtyHttp= new XMLHttpRequest();
                var initiatorUrl= "https://tib.me/getqty/" + querystring(this.params);
                qtyHttp.open('GET', initiatorUrl, true);
                qtyHttp.send();

                var that = this;
                qtyHttp.onreadystatechange= function(){
                    if ( qtyHttp.readyState === 4 && qtyHttp.status === 200 ) {
                        subrefQTY = {
                            QTY : JSON.parse(qtyHttp.response).QTY,
                            EXP : new Date(new Date().getTime() + (1000 * 60 * QTY_CACHE_DURATION)) // 20 minutes from now
                        };
                        localStorage.setItem(storageKey, JSON.stringify(subrefQTY));
                        var tibEvent = document.createEvent('customEvent');
                        tibEvent.initCustomEvent('tibstate', true, false, storageKey);
                        window.dispatchEvent(tibEvent);

                    }
                };
            }
            return subrefQTY;
        };


    }

    generateSub = function(TIB) {

        // generate SHA256 hash, truncate to 10 chars, and use this for the SUB.
        // potential to overload with platform specific code, but that will require DOM element (as argument?)

        hash = TIB.replace(/^(https?:)?(\/\/)?(www.)?/g, '');  // remove generic url prefixes
        hash = murmurhash3_32_gc(hash, 0);   // possibly move to
        // https://github.com/garycourt/murmurhash-js/blob/master/murmurhash3_gc.js
        return "TIB-SHA256-" + hash;
    };

    loadObjectParams= function(source, params){

        // Given an object, populate the existing properties of this.params

        if (typeof source !== "undefined") {
            for ( var p in params) params[p] = source[p] || params[p];
        }
    };



    querystring= function(params) {

        // assembles Tib initiator parameters into URL querystring

        var querystring = "?";
        for ( var param in params ) {
            if(params[param]){ // Skip to next param if value is an empty string
                querystring += param;
                querystring += "=";
                querystring += encodeURIComponent(params[param]);
                querystring += "&";
            }
        }
        return querystring.substr(0,querystring.length);  // truncate trailing ampersand
    };

    loadElementParams = function(params, e){

        for ( var paramName in params ) {
            if ( e.getAttribute('data-bd-' + paramName) ){
                params[paramName] = e.getAttribute('data-bd-' + paramName);
            }
        }

        return params;
    };

    return Tibit;

})(Tibit || {});