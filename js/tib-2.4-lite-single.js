function tibInit( userParams) {  // can be string (PAD) or JS object { PAD, DUR, CBK, BTN }
    bd= new tibHandler( userParams);
    return bd;
}



/* TIB INITIATION FUNCTIONS */

function tibHandler( tibParams) {  

    defaultParams= { 
        PAD: "mytibs9YhLYtrVhQkmTdbDS51H54WyrxTx",    // tibbee bitcoin address
        DUR: "1", // number of days to acknowledge tib (or number of minutes if PAD is bitcoin testnet)
        CBK: window.location.hostname + "/tibcbk.html", // URL to handle returned tib-token
    };

    this.buttonsClass= "bd-tib-btn";

    var param;
    for( param in defaultParams ) this.tibParams[param]= defaultParams[param];
    for( param in userParams ) this.tibParams[param]= userParams[param];
    this.tibParams.DUR= Math.max( 1, this.tibParams.DUR);        


    var prefix= '';  // EMPTY STRING IN PRODUCTION

    this.testnet= ( tibParams.PAD && this.isTestnet( tibParams.PAD) );

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function(){
            bd.initButtons( this.tibParams);
        });
    } 
    else {
        bd.initButtons( this.tibParams);
    }


    this.initButtons= function( ) {

        // install button click handlers
        // adds the bd-subref-[SUB] class to each button
        // adds the bt-tib-btn-[btnName] class to each button // local install will style directly
        // install localStorage event handler
       
        var that=this;

        this.sweepOldTibs();

        var buttons= document.getElementsByClassName( this.buttonsClass);
        var pageSUBs= [];

        for (var i=0, n=buttons.length; i<n; i++) {
            var tibParams, e= buttons[i];

            tibParams.SUB= e.getAttribute("data-bd-SUB") || this.tibParams.SUB || window.location.pathname;
            tibParams.TIB= e.getAttribute("data-bd-TIB") || this.tibParams.TIB || window.location.hostname + window.location.pathname;
            tibParams.PAD= e.getAttribute("data-bd-PAD") || this.tibParams.PAD || "mytibs9YhLYtrVhQkmTdbDS51H54WyrxTx";

            e.classList.add("bd-subref-" + tibParams.SUB);
            
            if ( localStorage["bd-subref-" + tibParams.SUB] ) {
                e.classList.add("tibbed");  // add the tibbed class
            }

            if ( this.testnet || ( tibParams.PAD && this.isTestnet( tibParams.PAD) )) {
                // add testnet if primary PAD or button specific PAD are testnet addresses
                e.classList.add("testnet");
            }

            e.addEventListener("click", this.tib( tibParams));  // bind the onclick handler
            pageSUBs.push(tibParams.SUB);

            // init counters
        }

        // retrieve counters for SUBs on page with counter buttons [ ought to accomodate just TIB also ]
        pageSUBs= pageSUBs.filter(function (v, i, a) { return a.indexOf (v) === i; });  // deduplicate pageSUBs
        for (var k=0, u=pageSUBs.length; k<u; k++) { 
            that.getCounter( pageSUBs[k]); 
        }  //tibParams


        // install localStorage trigger to update button state
        window.addEventListener('storage', function(e) {

            // fired when localStorage is updated by persistAck
            // e.newValue will be null if a remove event

            if ( e.newValue && e.key.substr(0,10) === "bd-subref-") {
                that.ackElementsInClass(e.key);
            }
        });
    };


    this.tib= function( tibParams) { 

        var that= this;

        var tibWindow= { 
            url: '', 
            name: "tibit", 
            options: "height=721,width=640,menubar=no,location=no,resizable=no,status=no"
        };


        return function tib(e){  // this fn bound to tib button onclick event

            // construct tib initiator and open tibit popup 
            
            that.sweepOldTibs();

            if ( e.currentTarget.classList.contains('tibbed') ) { 
                // if allready tibbed, go to account settings
                tibWindow.url= "https://" + prefix + "tib.me/account_overview";
            }

            else {
                tibWindow.url+= (tibParams.PAD ? "&PAD=" + tibParams.PAD : '');
                tibWindow.url+= (tibParams.SUB ? "&SUB=" + tibParams.SUB : '');
                tibWindow.url+= (tibParams.CBK ? "&CBK=" + tibParams.CBK : '');
                tibWindow.url= "https://" + prefix + "tib.me/" + tibWindow.url; // + "&noclose=true";
            }

            tibWindow.handle= window.open(tibWindow.url,tibWindow.name,tibWindow.options);
            return tibWindow.handle;
        };
    };


    this.getCounter= function( tibParams) {  

        var that= this;

        var buttons= document.getElementsByClassName( "bd-subref-" + tibParams.SUB);
        var hasCounter= false;

        for (var i=0, n=buttons.length; i<n; i++) {
            var e= buttons[i];
            var c = e.getElementsByClassName('bd-btn-counter');
            if (c.length !== 0) {
                // at least one button on the page for this SUB has a counter
                hasCounter= true;
                break; 
            }
        }

        if ( ! hasCounter) {   
            // no button with counter for this subref
            return false;
        }

        else {   

            if ( localStorage.getItem('bd-subref-' + tibParams.SUB) ) {
                // use counter from localStorage
                tibParams.QTY= Number(JSON.parse(localStorage.getItem('bd-subref-' + tibParams.SUB)).QTY); 
                that.writeCounter( tibParams); 
            }
            
            else {  
                // retreive count from tib.me/getqty
                var tibqty= new XMLHttpRequest();

                tibqty.url+= (tibParams.PAD ? "&PAD=" + tibParams.PAD : '');
                tibqty.url+= (tibParams.SUB ? "&SUB=" + tibParams.SUB : '');
                tibqty.url= "https://" + prefix + "tib.me/getqty/" + tibqty.url; // + "&noclose=true";

                tibqty.open( 'GET', tibqty.url, true);
                
                tibqty.onreadystatechange = function () {
                    if (tibqty.readyState === 4 && tibqty.status === 200) {
                        QTY= Number(JSON.parse(tibqty.response).QTY); 
                        that.writeCounter( tibParams.SUB, tibParams.QTY);
                    }
                };
                tibqty.send();
            }
        } 
    };


    this.writeCounter= function( SUB, QTY) { // SUB QTY

        // set the content of the tib button counter subelement to the QTY

        var buttons= document.getElementsByClassName( "bd-subref-" + SUB);

        for (var i=0, n=buttons.length; i<n; i++) {
            var e= buttons[i];
            var c= e.getElementsByClassName('bd-btn-counter')[0];
            if (c) {
                c.textContent= Number(QTY);
            }
        }
    };


    this.sweepOldTibs= function( )  {

        // deletes all expired tibs from localStorage
        // nb: all tibs for the domain must have the same acknowledgement duration for this to be reliable

        if (this.testnet) {
            // at least one testnet bitcoin address used, DUR treated as minutes
            mDUR= DUR * 60000; // ( 1000ms/s ⨉ 60s/m )
        }
        else {
            // not a testnet bitcoin address, DUR is days
            mDUR= DUR * 86400000; // ( 1000ms/s ⨉ 60s/m x ⨉ 60 m/h ⨉ 24h/d )
        }

        var expireLimit = Date.now() - mDUR; // any tibs with an issue time prior to expireLimit are out of date, and can be removed
        var keysToRemove = [];

        for (var i=0, n=localStorage.length; i<n; i++) {

            key= localStorage.key(i);

            if ( key.substr(0,10) === "bd-subref-" ) {
                var tibbed = JSON.parse(localStorage.getItem(key));
                
                if ( Date.parse(tibbed.ISS) < expireLimit ) {
                    keysToRemove.push(key);
                }
            }

            for( var j=0, m=keysToRemove.length; j<m; j++) {
                localStorage.removeItem(keysToRemove[j]);
            }
        }
    };


    this.isTestnet= function( PAD) {
        return "mn2".search(PAD.substr(0,1)) !== -1 ;
    };


    this.ackElementsInClass= function( classToAck) {
        // add the 'tibbed' class and update the counter 
        // for buttons using the coresponding entry in LocalStorage

        tibDetails= JSON.parse( localStorage.getItem( classToAck));
        var buttons= document.getElementsByClassName( classToAck);

        for (var i=0, n=buttons.length; i<n; i++) {
            var e= buttons[i];
            e.classList.add("tibbed");
            var c= e.getElementsByClassName('bd-btn-counter')[0];
        
            if ( c && tibDetails.QTY) {
                c.textContent= tibDetails.QTY;
            }
        }
        return i;
    };
}






/* CALLBACK HANDLING FUNCTIONS */

function tibCallback( inline) {   // wont be inline for local install  // requires uri.js
 
    this.processToken= function( url) {

        var that= this;
        var token;

        if ( this.storageAvailable('localStorage') ) {

            try {
                token = that.extractUrlToken( url); 
                // token expected in GET params
                // set local storage item to record tibbed subref

                that.persistAck( token);
                that.closeWindow();
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


    this.persistAck= function( token ){

        // localStorage, becauase we want:
        // 1) to persist the tib acknowledgement across sessions, and
        // 2) sessionStorage is window-specific, so no good for message passing

        // [TODO] fallback to cookie storage

        var tibDetails = {ISS: token.ISS, QTY: token.QTY};
        localStorage.setItem("bd-subref-" + SUB, JSON.stringify(tibDetails));

        // SUB is the subreference provided in the tib initiator
        // ISS is the timestamp of when the token for this tib was first issued

        // TODO: Should handle TIB and/or PAD in addition to SUB
    };


    this.closeWindow= function( ) {

        // add noclose to querystring of tib initiator to prevent popup tib window from closing

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