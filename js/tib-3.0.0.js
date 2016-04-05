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

            if(typeof ext === "undefined"){ /* If no extension exists, run ackBySubref as normal */
                that.ackBySubref( token.SUB, token.QTY ); // will fail if localStorage missing
            }
            else{
                if(ext.preAckBySubref){ /* If an extension exists, and a preAckBySubref function is specified, run
                 this, passing in the default ackBySubref as a parameter */
                    ext.preAckBySubref(that.ackBySubref, token.SUB, token.QTY);
                }
                else{ /* If no preAckBySubref function exists, run ackBySubref as normal */
                    that.ackBySubref( token.SUB, token.QTY );
                }
            }
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

        tibButtonsClass= tibButtonsClass || "bd-tib-btn";
        defaultBTN= defaultBTN || "default";


        this.sweepOldTibs();

        var buttons= document.getElementsByClassName( tibButtonsClass);
        var buttonNames= [], pageSUBs= [], buttonSources = [];


        for (var i=0, n=buttons.length; i<n; i++) {
            var e= buttons[i];
            var SUB, BTN, TIB, dataASN, BTS;
            SUB= e.getAttribute("data-bd-SUB");
            SUB= SUB || "blank";
            e.classList.add("bd-subref-" + SUB);


            BTN= e.getAttribute("data-bd-BTN");
            BTN= BTN || defaultBTN;
            e.classList.add( tibButtonsClass + "-" + BTN);
            e.dataset.bdBtn = e.dataset.dataBdBtn || BTN;

            BTS = e.getAttribute('data-bd-BTS');
            BTS = BTS || buttonResourcesUrl;
            buttonSources[BTN] = BTS;

            TIB= e.getAttribute("data-bd-TIB");
            TIB= TIB || window.location.hostname + window.location.pathname;

            dataASN = e.getAttribute("data-bd-ASN");
            ASN = dataASN || ASN;

            if ( localStorage["bd-subref-" + SUB] ) {
                e.classList.add("tibbed");  // add the tibbed class
            }
            if (testnet) {
                e.classList.add("testnet");
            }

            e.addEventListener("click", this.tib( SUB, TIB, ASN));
            buttonNames.push( BTN);
            pageSUBs.push(SUB);
        }

        function manageCounters(){
            // retrieve counters for SUBs on page with couunter buttons
            pageSUBs= pageSUBs.filter(function (v, i, a) { return a.indexOf (v) === i; });  // deduplicate pageSUBs
            for (var k=0, u=pageSUBs.length; k<u; k++) {
                that.getCounter( pageSUBs[k]);
            }
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
                this.loadButton( buttonNames[j], buttonSources[buttonNames[j]], manageCounters);
            }
        }

    };

    this.getCounter= function( SUB) {

        // TODO counter caching in localStorage

        var buttons= document.getElementsByClassName( "bd-subref-" + SUB);
        var hasCounter= false;
        var TIB;
        var QTY;

        var that= this;

        for (var i=0, n=buttons.length; i<n; i++) {
            var e= buttons[i];
            var c = e.getElementsByClassName('bd-btn-counter');
            if (c.length !== 0) {
                hasCounter= true;

                TIB= e.getAttribute("data-bd-TIB");
                TIB= TIB || window.location.hostname + window.location.pathname;

                break;
            }
        }

        if (hasCounter) {

            try{
                // Check the localStorage JSON string for a QTY value
                QTY = JSON.parse(localStorage.getItem('bd-subref-' + SUB)); /* Convert JSON string to JS obj */
                QTY = QTY.QTY; /* Set QTY to the value we need from the JS obj */
                if(!QTY){
                    throw 'QTY is empty'; /* If the JSON array has no QTY value, we throw an error, meaning we
                     query tib.me/getqty/ for the QTY value we need instead */
                }

                that.writeCounter(SUB, QTY);
            }

            catch(err){
                // If unable to find a QTY value in localStorage, because it's not a JSON string, or because the
                // JSON array contains no QTY value, then make an XML request to tib.me/getqty/

                setTimeout(function(){
                    /* TODO Delay this based on XMLRequest events rather than a flat delay */
                    var tibqty= new XMLHttpRequest();

                    var tibQtyFetch;

                    if (ASN && TIB) {
                        tibQtyFetch = "?TIB=" + TIB +  "&ASN=" + ASN + (SUB ? "&SUB=" + SUB : '');
                    } else {
                        tibQtyFetch = "?PAD=" + PAD + (TIB ? "&TIB=" + TIB : '') + (SUB ? "&SUB=" + SUB : '') + (ASN ? "&ASN=" + ASN + "&DSP=TRUE" : '');
                    }

                    tibQtyFetch= "https://" + prefix + "tib.me/getqty/" + tibQtyFetch;

                    tibqty.open( 'GET', tibQtyFetch, true);
                    tibqty.send();
                    tibqty.SUB = SUB;

                    if(typeof ext === "undefined"){ /* If no extension is defined, set the tibqty onreadystatechange
                     handler as normal */
                        tibqty.onreadystatechange = function () {
                            if (tibqty.readyState === 4 && tibqty.status === 200) {
                                that.writeCounter(SUB, JSON.parse(tibqty.response).QTY);
                            }
                        };
                    }
                    else {
                        if(ext.customCounterHandler){ /* If an extension is present, and a customCounterHandler is
                         specified, set the tibqty onreadystatechange handler to a function that returns this
                         customCounterHandler - this allows us to pass in both the XMLHttpRequest object and the
                         tibHandler object */
                            ext.primaryTibQtyReqs[tibqty.SUB] = tibqty;
                            tibqty.onreadystatechange = function(){
                                return ext.customCounterHandler(tibqty, that);
                            };
                        }
                        else{ /* If an extension is present but no custom handler is specified, set the default
                         handler as normal */
                            tibqty.onreadystatechange = function () {
                                if (tibqty.readyState === 4 && tibqty.status === 200) {
                                    that.writeCounter(SUB, JSON.parse(tibqty.response).QTY);
                                }

                            };
                        }
                    }

                }, 10);

            }

        } else {
            return false;
        }
    };





    this.writeCounter= function( SUB, QTY) {

        QTY= Number(QTY); // protect against injection

        var buttons= document.getElementsByClassName( "bd-subref-" + SUB);

        for (var i=0, n=buttons.length; i<n; i++) {
            var e= buttons[i];
            var c= e.getElementsByClassName('bd-btn-counter')[0];
            if (c) {
                c.textContent= QTY;
            }
        }
    };



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
                for(var j= 0, m = keysToRemove.length; j < m; i++){ /* Should m=keysToRemove.length be var
                 m=keystoRemove.length? */
                    localStorage.removeItem(keysToRemove[j]);
                }
            }
        }
    };



    this.loadButton= function( BTN, BTS, callback ){

        // cache-friendly load button SVG and inline it inside the DOM <buttons>
        // svg loaded from [buttonResourcesUrl]/bd-tib-btn-[buttonName].svg
        BTN= BTN || "default";
        BTS = BTS || "https://widget.tibdit.com/buttons/";

        that = this;

        // TODO add a slash to end of URL when using custom BTS

        var tibbtn= new XMLHttpRequest();
        tibbtn.open("GET", BTS + "tib-btn-" + BTN + ".svg", true);
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
                e.setAttribute('data-bd-BTC', BTC);
                /* Setting the BTC property in priority of data-attribute > tibInit param > default value, then
                 setting the data-bd-BTC to give us something to target with our CSS */
                if(BTC){
                    var cssStr = '';
                    cssStr = 'button[data-bd-BTC="' + BTC + '"] .bd-btn-backdrop{';
                    cssStr += 'fill: ' + BTC + ';';
                    cssStr += '}';
                /* Creating CSS string to be appended to styleElement - further CSS selectors and corresponding
                 styles can later be created (e.g. BTH) */
                }
                if(cssStr){styleElement.appendChild(document.createTextNode(cssStr));}

            }

            var head = document.head || document.getElementsByTagName('head')[0];
            head.appendChild(styleElement);
            /* Appending the styleElement with all our button-specific CSS to the <head> tag */

            // TODO This is reloading all counters (ManageCounters) for each button type‽‽
            // managecounters should be called only once after all buttons loaded?
            callback();
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

                    if(typeof ext === "undefined"){ /* If no extension is present, run persistAck as normal */
                        that.persistAck( token.SUB, token.ISS, token.QTY);
                    }
                    else{
                        if(ext.prePersistAck){ /* If an extension is present and a prePersistAck function exists,
                         run this function, passing persistAck as a callback */
                            ext.prePersistAck(that.persistAck, token.SUB, token.ISS, token.QTY);
                        }
                        else{ /* If an extension exists but has no persistAck function, run persistAck as normal */
                            that.persistAck( token.SUB, token.ISS, token.QTY);
                        }
                    }

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