/* TIB INITIATION FUNCTIONS */

// var bd= new tibHandler(...)


function tibHandler( PAD, DUR, CBK, ASN, PLT, params) {
    this.params = params;
    DUR= DUR || 1;
    ASN = ASN;
    /* TODO check if ASN = ASN needs to be set here */
    var testnet= false, pollForToken= false, mDUR= DUR * (3600000*24);

    var prefix= '';  // NOT IN PRODUCTION

    var tibWindowName= ""; // "tibit";
    var tibWindowOptions= "height=721,width=640,menubar=no,location=no,resizable=no,status=no";

    var cbkHandler, cbkPoller;

    if (PAD) {
        if ( "mn2".search(PAD.substr(0,1)) !== -1 ) {
            // console.log(PAD);
            // testnet bitcoin address, DUR is minutes
            DUR= Math.max( 1, DUR); // minimum 1 minutes
            mDUR= DUR * 60000; // ( 1000ms/s ⨉ 60s/m )
            testnet= true;
        }

        else {
            // not a testnet bitcoin address, DUR is days
            DUR= Math.max( 1, DUR); // minimum 24 hours
            mDUR= DUR * 86400000; // ( 1000ms/s ⨉ 60s/m x ⨉ 60 m/h ⨉ 24h/d )
        }
    }

    // if CBK is provided, assume that all callback processing will happen in the tibit window
    // otherwise, assume it will be handled inline in the tibbee window button window
    if (!CBK) {
        // console.log(window.location.hostname);
        CBK= window.location.protocol+"//"+window.location.host + "/nothing_to_see_here/tib_callback/404.err";
        pollForToken= true;
        cbkHandler = new tibCallback( true);
        cbkPoller = 0;
    }



    this.tib= function( SUB, TIB, ASN) {
        // construct tib initiator and open tibit popup

        var that= this;

        return function tib(e){

            that.sweepOldTibs();

            if ( e.currentTarget.classList.contains('tibbed') ) {
                window.open("https://" + prefix + "tib.me/account_overview",tibWindowName,tibWindowOptions);
                // window.open("https://tib.me/account_overview",tibWindowName,tibWindowOptions);
                return false;
            }

            var tibInitiator;

            if (ASN && TIB) {
                tibInitiator = "?TIB=" + TIB +  "&ASN=" + ASN + "&DSP=TRUE" + (CBK ? "&CBK=" + CBK : '') + (SUB ? "&SUB=" + SUB : '');
            } else {
                tibInitiator = "?PAD=" + PAD + (TIB ? "&TIB=" + TIB : '') + (CBK ? "&CBK=" + CBK : '') + (SUB ? "&SUB=" + SUB : '') + (ASN ? "&ASN=" + ASN + "&DSP=TRUE" : '');
            }

            tibInitiator= "https://" + prefix + "tib.me/" + tibInitiator;
            // console.log(tibInitiator);
            // tibInitiator= "https://tib.me/" + tibInitiator; // + "&noclose=true";

            var tibWindow= window.open(tibInitiator,tibWindowName,tibWindowOptions);

            if (pollForToken) {
                cbkPoller= setInterval( function() {
                    tibWindowPoll( tibWindow, cbkHandler);
                }, 100);
            }
            return tibWindow;
        };


        function tibWindowPoll( tibWindow, cbkHandler, cbkPoller) {

            var tibWindowUrl, domain;


            try {
                if (tibWindow.closed) {
                    // tib window closed without passing tib token back to local domain
                    // TODO unpress button
                    clearInterval(cbkPoller);
                    return;
                }
                tibWindowUrl= tibWindow.location;
                domain= tibWindow.location.hostname;
            }
            catch(e) {
                if (e.code === e.SECURITY_ERR) {
                    // tib window is still on another domain - keep waiting
                    return;
                } else {
                    // some other unexpected error - abort polling - leave tib window open
                    // TODO unpress button
                    clearInterval(cbkPoller);
                    throw e;
                }
            }

            var l= domain.length;

            if (domain.length === 0) {
                // window accessible, but probably still initialising - keep waiting
                return;
            }

            if (domain.substr(l-6) === "tib.me" || domain.substr(l-6) === "tib.it" || domain === "tib.tibdit.com") {
                // incase insecure browser lets us see cross domain - keep waiting
                return;
            }

            // tib window is done - token expected
            // TODO unpress button

            clearInterval(cbkPoller);
            var token= cbkHandler.processToken( tibWindowUrl); // should always set localStorage?

            if ( ! URI(tibWindow.location).query(true).noclose ) {
                console.log( tibWindowUrl);
                tibWindow.close();
            }

            that.ackBySubref(token.SUB, token.QTY);

            // TODO if no token
        }
    };


    this.initButtons= function( defaultBTN, buttonResourcesUrl, tibButtonsClass) {

        // install button click handlers
        // adds the bd-subref-[SUB] class to each button
        // adds the bt-tib-btn-[btnName] class to each button
        // install storage event handler
        // loads inline button SVG into DOM

        var that=this;
        that.counterHandlers = {};

        tibButtonsClass= tibButtonsClass || "bd-tib-btn";
        defaultBTN= defaultBTN || "default";

        this.sweepOldTibs();

        var buttons= document.getElementsByClassName( tibButtonsClass);
        var buttonNames= [], buttonSources = [];
        pageSUBs= [];

        for (var i=0, n=buttons.length; i<n; i++) {
            var e = buttons[i];

            var lSUB = null, lASN = null, lBTN = null, lPAD = null, lBTS = null, lTIB = null;
            /* Clearing tib attributes */

            lSUB= e.getAttribute("data-bd-SUB") || "blank";
            e.classList.add("bd-subref-" + lSUB);
            e.dataset.bdSub = lSUB;
            /* Setting parameters as data-attributes so we can access them on a button-by-button basis */

            lASN = e.getAttribute("data-bd-ASN") || this.params.ASN;
            if(lASN){ e.dataset.bdAsn = lASN };
            /* ASN has no default value, so we check it has a value stored before setting the data-attribute */

            lPAD = e.getAttribute("data-bd-PAD") || this.params.PAD;
            if(lPAD){ e.dataset.bdPad = lPAD }

            lBTN = e.getAttribute("data-bd-BTN") || this.params.BTN || defaultBTN;
            /* data-attributes > tibInit params > defaults */
            e.classList.add( tibButtonsClass + "-" + lBTN);
            e.dataset.bdBtn = lBTN;

            lBTS = e.getAttribute('data-bd-BTS') || this.params.BTS || buttonResourcesUrl;
            buttonSources[lBTN] = lBTS; /* This seems redundant? Maybe copy the forced data-bd-BTN above? */
            e.dataset.bdBts = lBTS;

            lTIB= e.getAttribute("data-bd-TIB") || this.params.TIB || window.location.hostname + window.location.pathname;
            e.dataset.bdTib = lTIB;

            if ( localStorage["bd-subref-" + lSUB] ) {
                e.classList.add("tibbed");  // add the tibbed class
            }
            if (testnet) {
                e.classList.add("testnet");
            }

            e.addEventListener("click", this.tib( lSUB, lTIB, lASN));
            buttonNames.push(lBTN);
            pageSUBs.push(lSUB);

            var getQtyParams = {'PAD':lPAD, 'SUB':lSUB, 'ASN': lASN, 'TIB': lTIB };
            var getQtyQueryString = this.buildQueryString(getQtyParams);

            e.dataset.bdCounterId = getQtyQueryString;
        }

        // Install storage event handler
        if (!pollForToken) {
            window.addEventListener('storage', function(e) {

                // fired when localStorage is updated by persistAck
                // e.newValue will be null if a remove event

                if ( e.newValue && e.key.substr(0,10) === "bd-subref-") {
                    that.ackElementsInClass(e.key);
                }
            });
        }



        // load inline button SVG into DOM
        buttonNames= buttonNames.filter(function (v, i, a) { return a.indexOf (v) === i; }); // deduplicate buttonNames
        for (var j=0, m=buttonNames.length; j<m; j++) {
            if (buttonNames[j] !== "none") {
                this.loadButton( buttonNames[j], buttonSources[buttonNames[j]]);
            }
        }

    };

    this.parseQueryString = function(queryString){
        queryString = queryString.split('&');

        return queryString();
    }

    // Takes an object as a parameter and returns the object as a query param string (?key1=val1&key2=val2)
    this.buildQueryString = function(params){
        var queryString = '';
        for(var key in params){
            // Append '?' if the queryString string is empty (start of the query string), else add '&' separator
            // Append 'key=val' to the string if a value is stored, otherwise append ('')
            queryString += (params[key] ? (queryString ? '&' : '?') + (key + '=' + params[key]) : '');
        }
        return queryString;
    }

    this.sweepOldTibs= function()  {


        // deletes all expired tibs from localStorage
        // nb: all tibs for the domain must have the same acknowledgement duration for this to be reliable

        var expireLimit = Date.now() - mDUR;

        // any tibs with an issue time prior to expireLimit are out of date, and can be removed
        if(localStorage.length){
            var keysToRemove = [];
            for (var i=0, n=localStorage.length; i<n; i++) {
                var key= localStorage.key(i);
                var ISS;

                if ( key.substr(0,10) === "bd-subref-" ) {
                    var localStorageJSON;
                    try{
                        /* Attempt to parse JSON string and save ISS for later usage */
                        localStorageJSON = JSON.parse(localStorage.getItem(key));
                        ISS = localStorageJSON.ISS;
                    }
                    catch(err){
                        /* If localStorage value is not a JSON string, convert it to one and continue */
                        localStorageJSON = localStorage.getItem(key); /* Get raw date string from localstorage */
                        localStorageJSON = {'ISS' : localStorageJSON}; /* Convert string to JS object */
                        localStorageJSON = JSON.stringify(localStorageJSON); /* Convert JS object to JSON string */
                        ISS = localStorageJSON.ISS; /* Save ISS to variable for later usage */
                        localStorage.setItem(key, localStorageJSON); /* Re-set localstorage value to JSON string */
                    }

                    if ( Date.parse(ISS) < expireLimit ) {
                        keysToRemove.push(key);
                    }
                }
            }
            if(keysToRemove.length){
                for(var j= 0, m = keysToRemove.length; j < m; j++){ /* Should m=keysToRemove.length be var
                 m=keystoRemove.length? */
                    localStorage.removeItem(keysToRemove[j]);
                }
            }
        }
    };



    this.loadButton= function( BTN, BTS){

        // cache-friendly load button SVG and inline it inside the DOM <buttons>
        // svg loaded from [buttonResourcesUrl]/bd-tib-btn-[buttonName].svg
        BTN= BTN || "default";
        BTS = BTS || "https://widget.tibdit.com/buttons/";

        var that = this;

        // TODO add a slash to end of URL when using custom BTS

        var tibbtn= new XMLHttpRequest();
        tibbtn.open("GET", BTS + "tib-btn-" + BTN + ".html", true);
        tibbtn.responseType="document";
        tibbtn.send();

        tibbtn.onreadystatechange= function( ) {
            if (tibbtn.readyState == 4 && tibbtn.status == 200) {
                writeButtons();
            }
        };

        function writeButtons(){

            // overwrites <object> embedded svg with inline SVG to allow external CSS styling

            var buttons= document.getElementsByClassName( "bd-tib-btn-" + BTN);

            var btnImport= tibbtn.responseXML.getElementById( "tib-btn-" + BTN);
            if (! btnImport) {
                throw "bd: failed to load svg element tib-btn-" + BTN + " from " + tibbtn.responseURL;
            }

            var btnLinkCss= tibbtn.responseXML.getElementById( "tib-btn-" + BTN + "-css");
            if (btnLinkCss) {
                var headElement= document.getElementsByTagName('head')[0];
                var tibCssElement= document.getElementById('bd-css-tib-btn');
                headElement.insertBefore(btnLinkCss, tibCssElement.nextSibling);
            }

            var styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            styleElement.setAttribute('class', 'bd-btn-' + BTN + '-styles');
            /* Creating our style element to append CSS to in the for loop */

            for (var i=0, n=buttons.length; i<n; i++) {
                var e= buttons[i];

                if (e.children.length === 0) {
                    e.appendChild(document.importNode(btnImport,true));
                } else {
                    // target <button> element should have <object> as first or only child
                    e.replaceChild(document.importNode(btnImport,true),e.children[0]);
                }
                var s = e.children[0];   // we don't want duplicate id's in the DOM
                s.removeAttribute("id");

                    if (s.style.width === ""  && s.classList.contains('bd-tib-btn-svg')) { // width of SVG element needs to be set for MSIE/EDGE
                    s.style.width=(s.getBBox().width*(s.parentElement.clientHeight / s.getBBox().height )).toString()+"px";
                }
                // prevent default submit type/action if placed within a form
                if (e.tagName === 'BUTTON' && !e.getAttribute('type') ) {
                    e.setAttribute('type','button'); // prevents default submit type/action if placed withing form
                }

                var BTC = e.getAttribute('data-bd-BTC') || that.params.BTC;
                /* BTC set to data-bd-BTC if present, otherwise defaulted to value passed in tibInit */

                var cssStr = '';
                /* cssStr declared outside of if statement to account for other properties being set and appended
                 using this variable */

                if(e.getAttribute('data-bd-BTC')){
                    cssStr = 'button[data-bd-BTC="{BTC}"] .bd-btn-backdrop{ fill: {BTC}; }';
                    cssStr = cssStr.replace(/{BTC}/g, BTC);
                    /* Creating CSS string to be appended to styleElement - further CSS selectors and corresponding
                     styles can later be created (e.g. BTH) */
                }

                e.setAttribute('data-bd-BTC', BTC || 'default');
                /* Setting data-bd-BTC so that our CSS has something to target */

                styleElement.appendChild(document.createTextNode(cssStr));

                getQtyParams = {};
                getQtyParams.SUB = e.getAttribute('data-bd-SUB');
                getQtyParams.ASN = e.getAttribute('data-bd-ASN');
                getQtyParams.PAD = e.getAttribute('data-bd-PAD');
                getQtyParams.TIB = e.getAttribute('data-bd-TIB');
                var getQtyQueryString = e.getAttribute('data-bd-counter-id');
                var lCounterHandler = that.counterHandlers[getQtyQueryString];

                var c= e.getElementsByClassName('bd-btn-counter')[0];

                if(!lCounterHandler && c){
                    /* If we can't find a functionally equivalent counterHandler, we create a new one */
                    that.counterHandlers[getQtyQueryString] = new CounterHandler(getQtyParams, getQtyQueryString, that);
                }
                else if(c){
                    var localStorageEntry = localStorage.getItem(getQtyQueryString);
                    var QTY = JSON.parse(localStorageEntry).QTY;
                    that.counterHandlers[getQtyQueryString].writeCounter( QTY)
                }


            }

            var cssStr = '';
            if(that.params.BTC){
                cssStr = 'button[data-bd-BTC="{BTC}"] .bd-btn-backdrop{ fill: {BTC}; }';
                cssStr = cssStr.replace(/{BTC}/g, that.params.BTC);

                styleElement.appendChild(document.createTextNode(cssStr));
            }
            /* Creating and appending a CSS string in the case that we have a tibHandler.params.BTC value set. This
             is done outside of the for loop to avoid repeatedly adding this CSS for each button */

            var head = document.head || document.getElementsByTagName('head')[0];
            head.appendChild(styleElement);
            /* Appending the styleElement with all our button-specific CSS to the <head> tag */

            // TODO This is reloading all counters (ManageCounters) for each button type‽‽
            // managecounters should be called only once after all buttons loaded?
        }


    };




    /* ACKNOWLEDGE TIB FUNCTIONS

     these functions add the 'tibbed' class to buttons with a coresponding entry in LocalStorage

     a backend alternative is required if tibs are persisted in the backend (ie: unique users in tibbee operated database)
     */


    this.ackElementsInClass= function( classToAck, QTY) {

        var localStorageArray = localStorage.getItem(classToAck);
        localStorageArray = JSON.parse(localStorageArray);
        QTY = QTY || localStorageArray.QTY;

        // add 'tibbed' class to all buttons with classToAck
        var buttons= document.getElementsByClassName( classToAck);
        for (var i=0, n=buttons.length; i<n; i++) {
            var e= buttons[i];
            e.classList.add("tibbed");
            var c= e.getElementsByClassName('bd-btn-counter')[0];
            if ( c && QTY) {
                c.textContent= QTY;
            }
        }
        return i;
    };



    this.ackByClass= function( tibButtonsClass) {

        // alternative approach - use when there are fewer buttons in the DOM than potential ack'd tibs to check

        // starting with the DOM and hunting the persistent storage for matched tib records may be quicker for others
        // requires a class to have been applied to all elements to check.

        tibButtonsClass= tibButtonsClass || "bd-tib-btn";

        this.sweepOldTibs();

        var buttons= document.getElementsByClassName( tibButtonsClass);

        for (var i=0, n=buttons.length; i<n; i++) {    // iterate through elements with .tibButtonsClass
            var e= buttons[i];
            // for each button, is there a matching tib record in localStorage?
            if ( localStorage["bd-subref-" + e.getAttribute("data-bd-SUB")] ) {
                e.classList.add("tibbed");  // add the tibbed class
            }
        }
    };



    this.ackByStorage= function() {

        // iterates through localStorage,
        // acks class for localStorage entries with bd-subref- prefix

        this.sweepOldTibs();

        for (var i=0, n=localStorage.length; i<n; i++) {
            var key= localStorage.key(i);

            if ( key.substr(0,10) === "bd-subref-" ) {
                this.ackElementsInClass(key);
            }
        }
    };



    this.ackBySubref= function( SUB, QTY) {

        // when the specific subref is known, just derive class
        // and ack that class

        this.sweepOldTibs();

        var key="bd-subref-" + SUB;

        if( localStorage[key] ) {  // why did I put this condition here?  Console error when missing?  Should use QTY from localStorage
            /* Doesn't ackelementsInClass get the QTY from localStorage if present? ~ Nadil */
            this.ackElementsInClass( key, QTY);
        }
    };
}

function CounterHandler(tibParams, queryString, parent){
/* Counterhandler object - one of these is created for each counter we want to retrieve from the tibbing app */
    this.parent = parent;
    var prefix = '';
    this.queryString = queryString;
    this.OnReadyHandler = function(tibqty, that){
        /* See below - this is the onreadystatechangehandler for tibqty requests, wrapped in a function to allow us to
         pass both tibqty and the current counterHandler to it - default only gives us tibqty. "that" isn't used
          here, but is
         potentially used in extensions */
        if (tibqty.readyState === 4 && tibqty.status === 200) {

            if(localStorage.getItem(this.queryString)){
                var newLocalStorageEntry = JSON.parse(localStorage.getItem(this.queryString));
            }
            else{
                var newLocalStorageEntry = {};
            }

            newLocalStorageEntry.QTY = JSON.parse(tibqty.response).QTY;
            newLocalStorageEntry = JSON.stringify(newLocalStorageEntry);

            localStorage.setItem(this.queryString, newLocalStorageEntry);
            that.writeCounter(JSON.parse(tibqty.response).QTY);
        }
    }

    this.getCounter= function( tibParams) {

        var QTY;
        var that= this;

        try{
            /* Using JSON.parse on a string that isn't JSON throws an error. The string we're calling JSON.parse
             isn't necessarily JSON (in the case of transitioning from an earlier version of tib.js so we use
             try/catch to prevent the script halting */
            QTY = JSON.parse(localStorage.getItem(this.queryString)); /* Convert JSON string to JS obj */
            QTY = QTY.QTY; /* Set QTY to the value we need from the JS obj */
        }
        catch(err) { }
        /* We don't do anything in this catch block because we don't want to actually output every time we
         fail to parse JSON */

        if(QTY) { // If QTY retrieved from localstorage, write the QTY to buttons with same ID as this CounterHandler
            that.writeCounter(QTY);
        }
        else{
            /* TODO Delay this based on XMLRequest events rather than a flat delay */
            var tibqty= new XMLHttpRequest();

            var tibQtyFetch= "https://" + prefix + "tib.me/getqty/" + this.queryString;

            tibqty.open( 'GET', tibQtyFetch, true);
            tibqty.onreadystatechange = function(){
                return that.OnReadyHandler(tibqty, that);
                /* Returning that.counterHandler within an anonymous function in order to allow us to
                 * pass that as a parameter to that.counterHandler (used in processing in
                 * tibHandler extensions) */
            }

            tibqty.send();

        }


    };

    this.writeCounter= function(QTY) {

        QTY= Number(QTY); // protect against injection

        var buttons= document.querySelectorAll('[data-bd-counter-id="' + this.queryString + '"]');

        for (var i=0, n=buttons.length; i<n; i++) {
            var e= buttons[i];
            var c= e.getElementsByClassName('bd-btn-counter')[0];
            if (c) {
                c.textContent= QTY;
            }

        }
    };


    /* Functions/assignments here are to be executed on CounterHandler initialisation */
    this.getCounter(tibParams);

}




/* CALLBACK HANDLING FUNCTIONS */
// backend alternative required for persisting counters, and any local user tracking


function tibCallback( inline) {



    this.processToken= function( url) {

        var that= this;
        var token;

        if ( this.storageAvailable('localStorage') ) {

            try {

                $script.ready( 'urijs', function() {
                    token = that.extractUrlToken( url); // token expected in GET params

                    // set local storage item to record tibbed subref
                    // will not trigger an event for updating button if processToken called from same page (ie: inline)
                    // but we still need to store this for subsequent pages with tib buttons

                    that.persistAck( token.SUB, token.ISS, token.QTY);

                    if (! inline) {
                        //
                        that.closeWindow();
                    }

                });
            }

            catch (e) {
                var msg=  document.createElement('p');
                msg.appendChild(document.createTextNode( e.message + "<br>" + e.stack ));
                msg.appendChild(document.createTextNode( "bd: tib callback - tib paid but cannot persist"));
                throw "bd: tib callback - tib paid but cannot persist";
            }

            return token;
        }
    };




    this.extractUrlToken= function( url){

        // for clarity, steps are individually broken down, reusing a single variable

        var token= new URI(url);

        token= token.query(true); // retreive the querystring parameters into js object
        token= token.tibtok; // pull out the value of the tibtok= querystring parameter
        token= URI.decode(token); // convert any percent-encoded characters
        token= atob(token); // base64 decode the token
        token= JSON.parse(token); // convert the serialised json token string into js object

        return token;
    };

    this.persistAck= function( SUB, ISS, QTY ){

        // localStorage, becauase we want:
        // 1) to persist the tib acknowledgement across sessions, and
        // 2) sessionStorage is window-specific, so no good for message passing

        // [TODO] fallback to cookie storage
        var tibDetails = {ISS: ISS, QTY: QTY};
        localStorage.setItem("bd-subref-" + SUB, JSON.stringify(tibDetails));

        // SUB is the subreference provided in the tib initiator
        // ISS is the timestamp of when the token for this tib was first issued

        // Removed when no longer required by

    };

    this.closeWindow= function( ) {

        //add noclose to querystring of tib initiator to prevent popup tib window from closing

        if ( URI(window.location).query(true).noclose ) {
            return false;
        }

        try {
            var tibWindow= window.open('','_self');
            tibWindow.close();
        }
        catch(ex) {
            console.error( "bd: attempt to close callback window failed");
        }

        return false;
        // function should never return, since window is gone
    };




    this.storageAvailable= function(type) {

        // test for available browser localStorage
        // developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

        try {
            var storage = window[type],
                x = '__storage_test__';
            storage.setItem(x, x);
            storage.removeItem(x);
            return true;
        }
        catch(e) {
            return false;
        }
    };


}