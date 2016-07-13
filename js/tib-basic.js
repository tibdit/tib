// Takes a JS object as a parameter
function tibInit(siteParams){
    var bd;


    bd = new TibHandler(siteParams);

    switch(document.readyState) {
        case 'loading':
            document.addEventListener('DOMContentLoaded', bd.initButtons);
            break;
        case 'loaded': // for older Android
        case 'interactive':
        case 'complete':
            bd.initButtons();
    }

    return bd;
}


var SUBREF_PREFIX= 'bd-subref-';



/**********
TIB HANDLER
**********/

// Our TibHandler object, concerned with initialising our buttons and processing relevant local
// storage entries. We also initialise our defaultTibParams object using the parameters fed to
// the tibInit function.
function TibHandler( siteParams){

    this.initButtons = function(){


        var that = this;
        this.sweepOldTibs();

        var buttons = document.getElementsByClassName('bd-tib-btn');
        for(var i = 0, n = buttons.length; i < n; i++){
            var e = buttons[i];
            
            e.tibButton = new TibButton( siteParams, e);  // Construct TibInitiator for button, feeding in site default params + local params from element data-bd-*

            if ( localStorage[SUBREF_PREFIX + e.tibButton.initiator.params.SUB] ) {
                e.tibButton.acknowledgeTib();
            }
        }

        // Localstorage event listener - watches for changes to bd-subref-x items in localStorage
        window.addEventListener('storage', function(e) {
           if ( e.newValue && e.key.substr(0,10) === SUBREF_PREFIX ) {
               that.ackElementsInClass(e.key);
           }
        });
    };
}



TibHandler.prototype.ackElementsInClass= function ( key ) {

    // Attempt to grab QTY from localStorage item matching passed key

    var QTY= JSON.parse( localStorage.getItem(key)).QTY;
    var buttons= document.getElementsByClassName(key);
    for (var i= 0, n= buttons.length; i < n; i++) {
        var e = buttons[i];
        e.tibButton.acknowledgeTib( QTY);    // counter update included in acknowledgeTib
    }
};



TibHandler.prototype.sweepOldTibs= function() {

    // Remove expired tib acknowledgements from localStorage

    for(var key in localStorage){
        if ( key.substr( 0, SUBREF_PREFIX.length) === SUBREF_PREFIX ) {
            var item = JSON.parse( localStorage.getItem(key));
            var expiry = new Date(item.EXP).getTime();
            if ( Date.now() >  expiry) {
                localStorage.removeItem(key);
            }
        }
    }
};




/*********
TIB BUTTON
*********/

// Our TibButton object, concerned with the behaviour of our tibbing buttons - here we
// assign our onclick events, write our counters, and interact with the DOM element

function TibButton(siteParams, e){

    this.params = {
        BTN : "",  // Name of the button style to retreive/inject
        BTC : "",  // Colour for the face of the button
        BTH : ""  // Height in pixels
    };

    this.domElement = e;
    this.tibbed= false;
    this.initiator = new TibInitiator(siteParams, this.domElement);

    this.loadParams(siteParams);
    this.loadElementParams(this.domElement);

    if (this.params.BTN){
        this.loadButton();
        this.domElement.classList.add('bd-tib-btn-' + this.params.BTN);
    }

    if ( this.isTestnet() ) this.domElement.classList.add("testnet");

    this.domElement.classList.add( SUBREF_PREFIX + this.initiator.params.SUB );  // Add subref class for easier reference later
    this.domElement.addEventListener("click", this.initateTib.bind(this));
}



TibButton.prototype.loadParams = function(source){

    // import matching params from source object

    if (typeof source === "object") {
        for (var p in this.params) this.params[p] = source[p];
    }
};



TibButton.prototype.injectCss = function( source){

    // inject non-button-style dependant CSS
    // should be moved to writebutton, with anti-dupication

    var headElement= document.getElementsByTagName('head')[0];
    var genericCssElement= document.getElementById('bd-css-tib-btn');
    
    if (! genericCssElement) {
        var linkElement= document.createElement('link');  
        linkElement= {
            id: 'bd-css-tib-btn',
            rel: 'stylesheet',
            type: 'text/css',
            href: 'https://widget.tibit.com/assets/css/tib.css'
        }
        genericCssElement= headElement.appendChild(linkElement);
    }

    if (! document.getElementById("tib-btn-" + BTN + "-css")) { // buton-style-specific CSS not already injected
        var styleElement= source.getElementById( "tib-btn-" + BTN + "-css");   // extract button specifc CSS from source
        if ( styleElement ) {
            headElement.insertBefore(genericCssElement, tibCssElement.nextSibling); // inject button specific CSS immediatly after
    }



};



TibButton.prototype.loadElementParams = function(){

    // imports params set via element data-bd-* attributes

    for ( var paramName in this.params ){
        if ( this.domElement.getAttribute('data-bd-' + paramName) ){
            this.params[paramName] = this.domElement.getAttribute('data-bd-' + paramName) || this.params[paramName];
        }
    }
    this.initiator.loadElementParams(this.domElement);  // load element data- attributes for the initiator params also.
};



TibButton.prototype.acknowledgeTib= function( QTY) {

    // set the button to tibbed state, updates displayed count if value provided

    this.tibbed= true;
    this.domElement.classList.add('tibbed');
    if (QTY) this.writeCounter( QTY);
};



TibButton.prototype.isTestnet= function() {

    // ask the initiator if PAD is a bitcoin testnet address

    return this.initiator.isTestnet();
};



TibButton.prototype.initateTib= function() {

    // "this" context is the button element, since this occurs in the context of an onclick event
    this.initiator.tib();
    // if class 'tibbed' do something different maybe

};



TibButton.prototype.writeCounter= function( QTY){

    // write the provided QTY to the buttons bd-btn-counter sub-element
    // used as the callback for TibInitiator, and when a tib is acknowledged

    var c= this.domElement.getElementsByClassName('bd-btn-counter')[0];
    // isNaN('') will return false
    if ( c && !isNaN(QTY) && QTY !== '') {
        c.textContent = parseInt(QTY);
    }
};



TibButton.prototype.loadButton= function(){

    var buttonFile = this.params.BTN || "default";
    var buttonLocation = this.params.BTS || "https://widget.tibit.com/buttons/";


    var tibbtn= new XMLHttpRequest();
    tibbtn.open("GET", buttonLocation + "tib-btn-" + buttonFile + ".html", true);
    tibbtn.responseType= "document";
    tibbtn.send();

    var that= this;

    tibbtn.onreadystatechange= function(){
        if (tibbtn.readyState == 4 && tibbtn.status == 200 && tibbtn.responseXML) {
            that.writeButton(this.responseXML, that.params.BTN);
        }
    };
};



TibButton.prototype.writeButton= function( source, BTN) {



    if (! source) throw "bd: failed to load tib-btn-" + BTN;
    var content= source.getElementById("tib-btn-" + BTN);

    if (! content) throw "bd: failed to find tib-btn-" + BTN + " in received XML";

    // Inject the button, either as a new child of the container element or a replacement
    // for the immediate child
    if (this.domElement.children.length === 0) {
        this.domElement.appendChild(document.importNode(content, true));
    } else {
        // target <button> element should have <object> as first or only child
        this.domElement.replaceChild(document.importNode(content, true), this.domElement.children[0]);
    }

    // prevent default submit type/action if placed within a form
    if (this.domElement.tagName === 'BUTTON' && !this.domElement.getAttribute('type') ) {
        this.domElement.setAttribute('type','button'); // prevents default submit type/action if placed withing form
    }

    var backdrop = this.domElement.getElementsByClassName('bd-btn-backdrop')[0];  // the button face element used to set a custom colour
    if ( backdrop && this.params.BTC ) {
        backdrop.style.fill = this.params.BTC; // fill will only work for svg, needs expansion to include CSS
    }

    if ( this.params.BTH ) {
        this.domElement.style.height = this.params.BTH + "px";
    }

    var s= this.domElement.children[0];  // Removing imported SVG ID to avoid potential duplicates
    s.removeAttribute("id");

    if (s.style.width === "") { // width of SVG element needs to be set for MSIE/EDGE
        s.style.width= (s.getBBox().width*(s.parentNode.clientHeight / s.getBBox().height )).toString()+"px";
    }

    this.injectCss( source);

    this.initiator.getQty(this.writeCounter.bind(this));

};


/************
TIB INITIATOR
************/


function TibInitiatorParams( copyFrom) {
    this.PAD = "";  // Payment Address - Bitcoin address tib value will be sent to 
    this.SUB = "";  // Subreference - Identifies the specific item being tibbed for any counter 
    this.CBK = "";  // Callback - If specified, the users browser will be redirected here after the tib is confirmed
    this.ASN = "";  // Assignee - 3rd party that tib value will be sent to.  Only valid if PAD not specified
    this.TIB = "";  // URL used to retreive the snippet telling the user what they are tibbing

    if (typeof copyFrom !== "undefined") {
        for ( var p in this) this[p] = copyFrom[p] || this[p];
    }
}


// Our Tib Initiator object, concerned with the interactions with the tibbing app. We can use this
// to open our tibbing window, retrieve counters, and validate our tib params.

function TibInitiator( siteParams, domElement){

    this.params = {

            PAD : "",  // Payment Address - Bitcoin address tib value will be sent to
            SUB : "",  // Subreference - Identifies the specific item being tibbed for any counter
            CBK : "",  // Callback - If specified, the users browser will be redirected here after the tib is confirmed
            ASN : "",  // Assignee - 3rd party that tib value will be sent to.  Only valid if PAD not specified
            TIB : ""  // URL used to retreive the snippet telling the user what they are tibbing
    };


    this.loadParams(siteParams);
    
    if ( !this.params.TIB ) {
        // If no TIB specified, assume the current page URL

        this.params.TIB = window.location.hostname + window.location.pathname; // + window.location.search??

    }

    if ( !this.params.SUB ) {
        // If no SUB is provided, use a hash of the TIB url
        this.params.SUB=  this.getSub();
    }

    if(domElement){
        this.setParams(domElement);
    }
}



TibInitiator.prototype.loadParams= function(source){

    // Given an object, populate the existing properties of this.params

    if (typeof source !== "undefined") {
        for ( var p in this.params) this.params[p] = source[p] || this.params[p];
    }
};



TibInitiator.prototype.getSub= function() {

    // generate SHA256 hash, truncate to 10 chars, and use this for the SUB.
    // potential to overload with platform specific code, but that will require DOM element (as argument?)

    hash = this.params.TIB.replace(/^(https?:)?(\/\/)?(www.)?/g, '');  // remove generic url prefixes
    hash = murmurhash3_32_gc(hash, 0);   // possibly move to
    // https://github.com/garycourt/murmurhash-js/blob/master/murmurhash3_gc.js
    return "TIB-SHA256-" + hash;
};



TibInitiator.prototype.tib= function() {

    // initiate the tib by opening the tib.me popup window 

    var tibWindowName= "tibit";
    var tibWindowOptions= "height=721,width=640,menubar=no,location=no,resizable=no,status=no";
    // Use initiator params to generate URL, and open in new window
    window.open( "https://tib.me/" + this.querystring(), tibWindowName, tibWindowOptions);
};



TibInitiator.prototype.querystring= function() {

    // assembles tib initiator parameters into URL querystring 

    var querystring = "?";
    for ( var param in this.params ) {
        querystring += param;
        querystring += "=";
        querystring += encodeURIComponent(this.params[param]);
        querystring += "&";
    }
    return querystring.substr(0,querystring.length);  // truncate trailing ampersand
};



TibInitiator.prototype.getQty= function( callback){

    // retreive the current tib count for this initiator

    var qtyHttp= new XMLHttpRequest();
    var initiatorUrl= "https://tib.me/getqty/" + this.querystring();
    console.log(initiatorUrl);
    qtyHttp.open('GET', initiatorUrl, true);
    qtyHttp.onreadystatechange= function(){
        if ( qtyHttp.readyState === 4 && qtyHttp.status === 200 ) {
            callback( JSON.parse(qtyHttp.response).QTY);
        }
    };
    qtyHttp.send();
};



TibInitiator.prototype.isTestnet= function(){

    // true if PAD set and first character not 'm', 'n', or '2'

    return this.params.PAD && ( "mn2".search(this.params.PAD.substr(0,1)) !== -1 );
};



TibInitiator.prototype.loadElementParams= function(e) {
    for ( var p in this.params){
        if ( e.getAttribute('data-bd-' + p) ){
            this.params[p] = e.getAttribute('data-bd-' + p) || this.params[p];
        }
    }
};



/*
** MurmurHash3: Public Domain Austin Appleby http://sites.google.com/site/murmurhash/
** JS Implementation: Copyright (c) 2011 Gary Court MIT Licence http://github.com/garycourt/murmurhash-js
*/

function murmurhash3_32_gc(e,c){var h,r,t,a,o,d,A,C;for(h=3&e.length,r=e.length-h,t=c,o=3432918353,d=461845907,C=0;r>C;)A=255&e.charCodeAt(C)|(255&e.charCodeAt(++C))<<8|(255&e.charCodeAt(++C))<<16|(255&e.charCodeAt(++C))<<24,++C,A=(65535&A)*o+(((A>>>16)*o&65535)<<16)&4294967295,A=A<<15|A>>>17,A=(65535&A)*d+(((A>>>16)*d&65535)<<16)&4294967295,t^=A,t=t<<13|t>>>19,a=5*(65535&t)+((5*(t>>>16)&65535)<<16)&4294967295,t=(65535&a)+27492+(((a>>>16)+58964&65535)<<16);switch(A=0,h){case 3:A^=(255&e.charCodeAt(C+2))<<16;case 2:A^=(255&e.charCodeAt(C+1))<<8;case 1:A^=255&e.charCodeAt(C),A=(65535&A)*o+(((A>>>16)*o&65535)<<16)&4294967295,A=A<<15|A>>>17,A=(65535&A)*d+(((A>>>16)*d&65535)<<16)&4294967295,t^=A}return t^=e.length,t^=t>>>16,t=2246822507*(65535&t)+((2246822507*(t>>>16)&65535)<<16)&4294967295,t^=t>>>13,t=3266489909*(65535&t)+((3266489909*(t>>>16)&65535)<<16)&4294967295,t^=t>>>16,t>>>0}
