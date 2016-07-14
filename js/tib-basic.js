

// Takes a JS object as a parameter


function tibInit(siteParams){  // TODO namespace closure 

    // perform after-page-loaded actions
    // a siteParams objects gives default parameters for buttons.  Available params are:
    //   styled button injection: BTN, BTS, BTC, BTH  see TibButton constructor
    //   tib initiator: PAD, ASN, SUB, TIB, CBK  see TibIniator Constructor

    switch(document.readyState) {
        case 'loading':
            // When used as callback for a document event listener, "this" context will be the document, so we
            // override this using .bind(bd)
            document.addEventListener('DOMContentLoaded', afterLoad);  // do we need .bind()?
            break;
        case 'loaded': // for older Android
        case 'interactive':
        case 'complete':
            afterLoad();    
    }

    function afterLoad() {
        sweepStorage();
        initButtons( siteParams);
    }
}

// TODO siteParams could be a namespace level object, accessible through the closure.  
// This would make more sense of passing in instance specific objects as a parameter to the constructors.
// It would resolve the button-styling-specifc stuff being in the TibButton constructor.


var SUBREF_PREFIX= 'bd-subref-';
var QTY_CACHE_DURATION= 20; // minutes



/**********
 PAGE LOAD
**********/


function initButtons( siteParams) {

    // adds and instantiates a TibButton object for all DOM elements with the 'bd-tib-btn' class
    // settings are defaulted to matching items in the siteParams object, and data-bd-* attributes in the DOM element

    var buttons = document.getElementsByClassName('bd-tib-btn');
    for ( var i = 0, n = buttons.length; i < n; i++ ) {
        buttons[i].tibButton = new TibButton( siteParams, buttons[i]);  
        // Construct TibInitiator for button, feeding in site default params + local params from element data-bd-*
    }
}



function sweepStorage() {

    // Remove expired tib acknowledgements and subref counters from localStorage

    for(var key in localStorage){
        if ( key.substr( 0, SUBREF_PREFIX.length) === SUBREF_PREFIX ) {
            var item = JSON.parse( localStorage.getItem(key));
            var expiry = new Date(item.EXP).getTime();
            if ( Date.now() >  expiry) {
                console.log(new Date(expiry));
                console.log('removing ' + key);
                localStorage.removeItem(key);
            }
        }
    }
}




/***********
 TIB BUTTON
***********/

// manages the behaviour of tibbing buttons, attached 
// handles click event, counter retreival and display, adds core button classes

function TibButton( siteParams, domElement) {

    this.params = {  // Primarily for related TibButtonStyle class, setting BTN triggers TibButtonStyle features
        BTN : "",  // Button Style to be injected, if any
        BTS : "",  // Source to fetch injected BTN button from
        BTC : "",  // Button Face (backdrop) Colour
        BTH : "",  // Button Height,
        QTY : ""
        // TODO move BTS, BTC, BTH to TibButtonStyling (add to existing params object)
        // TODO support for QTY initialisation by backend as param
    };

    this.domElement = domElement;
    this.tibbed= false;
    this.counterElement= null;
    this.initiator = new TibInitiator(siteParams, this.domElement);

    this.loadObjectParams(siteParams);
    this.loadElementParams(this.domElement);

    window.addEventListener('storage', this.storageUpdate.bind(this)); // handles tibbed events and counter updates
    this.domElement.addEventListener("click", this.initateTib.bind(this));

    this.counterElement= this.domElement.getElementsByClassName('bd-btn-counter')[0] || null;
    if (this.counterElement) {
        this.writeCounter(this.getQty());
    }

    if (this.params.BTN) {
        this.buttonStyle = new TibButtonStyle(this);   // TODO DON'T need .params argument since 'this' already passed
    }

    if ( this.isTestnet() ) this.domElement.classList.add("testnet");

    this.domElement.classList.add( SUBREF_PREFIX + this.initiator.params.SUB );  // Add subref class for easier reference later

    if(localStorage.getItem(SUBREF_PREFIX + this.initiator.params.SUB + '-TIBBED')){
        this.acknowledgeTib();
    }
}



TibButton.prototype.loadObjectParams = function(source){

    // import matching params from source object as defaults

    if (typeof source === "object") {
        for (var p in this.params) this.params[p] = source[p];
    }
};



TibButton.prototype.loadElementParams = function(){

    // imports params set via element data-bd-* attributes

    for ( var paramName in this.params ) {
        if ( this.domElement.getAttribute('data-bd-' + paramName) ){
            this.params[paramName] = this.domElement.getAttribute('data-bd-' + paramName) || this.params[paramName];
        }
    }
};



TibButton.prototype.acknowledgeTib= function() {

    // set the button to tibbed state

    this.tibbed= true;  
    this.domElement.classList.add('tibbed');
};



TibButton.prototype.isTestnet= function() {

    // ask the initiator if PAD is a bitcoin testnet address

    return this.initiator.isTestnet();
};



TibButton.prototype.initateTib= function() {
    this.initiator.tib();
    // TODO if class 'tibbed' do something different maybe
};


TibButton.prototype.getQty= function(){

    var storageKey = SUBREF_PREFIX + this.initiator.params.SUB + '-QTY', subrefQTY;

    // Value from params takes precedence
    subrefQTY = this.params.QTY;

    // No value from params set, attempt to fetch + parse QTY from localstorage
    if(!subrefQTY){
        subrefQTY = localStorage.getItem(storageKey);
        if(subrefQTY) subrefQTY = JSON.parse(localStorage.getItem(storageKey)).QTY;
    }

    // No value from params or localStorage, initiate getQTY request
    if( !subrefQTY ) {
        // retreive the current tib count for this initiator

        var qtyHttp= new XMLHttpRequest();
        var initiatorUrl= "https://tib.me/getqty/" + this.initiator.querystring();
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
                // localStorage change event only fires if modified by a different window, so we must manually call
                // writeCounter TODO: find localStorage event workaround
                that.writeCounter(JSON.stringify(subrefQTY));
            }
        };
    }
    return subrefQTY;
};

TibButton.prototype.writeCounter= function( QTY) {

    // if the button 

    if ( this.counterElement && !isNaN(QTY) && QTY !== '') { // isNaN('') will return false
        this.counterElement.textContent = parseInt(QTY, 10);
    }
};



TibButton.prototype.storageUpdate= function(e) {

    // localStorage listener to update the buttons counter
    // used as the callback for TibInitiator, and when a tib is acknowledged

    if ( e.newValue && e.key === SUBREF_PREFIX + this.initiator.params.SUB + "-QTY" ) {
        // TODO: if a value is set from params, do we overwrite it after a tib?
        this.writeCounter( JSON.parse(e.newValue).QTY);
        }
    if ( e.newValue && e.key === SUBREF_PREFIX + this.initiator.params.SUB + "-TIBBED" ) {
        this.acknowledgeTib();
    }
};




/*****************
 TIB BUTTON STYLE
*****************/

// TibButtonStyle object handles all functionality relating to the front end styling of tib buttons (loading in SVG's, colours, etc)

function TibButtonStyle(tibButton){
    // Duplicating params from TibButton - probably just a temp solution
    this.params = tibButton.params;
    this.tibButton = tibButton;
    this.domElement = tibButton.domElement;
    this.loadButton();
    this.domElement.classList.add('bd-tib-btn-' + this.params.BTN);
}


TibButtonStyle.prototype.loadButton= function(){

    var buttonFile = this.params.BTN || "default";
    var buttonLocation = this.params.BTS || "https://widget.tibit.com/buttons/";

    var tibbtn= new XMLHttpRequest();
    tibbtn.open("GET", buttonLocation + "tib-btn-" + buttonFile + ".html", true);
    tibbtn.responseType= "document";
    tibbtn.send();

    var that= this; // TODO replace with .bind(this)?

    tibbtn.onreadystatechange= function(){
        if (tibbtn.readyState === 4 && tibbtn.status === 200 && tibbtn.responseXML) {
            this.writeButton(tibbtn.responseXML, this.params.BTN);
        }
    }.bind(this);
};




TibButtonStyle.prototype.writeButton= function( source, BTN) { // TODO remove BTN as argument ?

    var sourceElement= source.getElementById("tib-btn-" + BTN);
    if (! sourceElement) throw "bd: failed to find tib-btn-" + BTN + " in received XML";

    var buttonElement= document.importNode(sourceElement, true);

    if (this.domElement.children.length === 0) {
        this.domElement.appendChild(buttonElement);  // insert if no placeholder
    } else {
        this.domElement.replaceChild(buttonElement, this.domElement.children[0]);  // replace placeholder
    }

    this.domElement.children[0].removeAttribute("id");  // Removing imported SVG ID to avoid potential duplicates

    if (this.domElement.tagName === 'BUTTON' && !this.domElement.getAttribute('type') ) {  // TODO relocate to TibButton since not a styling issue
        this.domElement.setAttribute('type','button'); // prevents default submit type/action if within <form>
    }

    this.injectCss( source);

    // TODO move below to a 'styleButton' function

    var backdrop = this.domElement.getElementsByClassName('bd-btn-backdrop')[0];  // the button face element used to set a custom colour
    if ( backdrop && this.params.BTC ) {
        backdrop.style.fill = this.params.BTC; // fill will only work for svg, needs expansion to include CSS
    }

    if ( this.params.BTH ) {
        this.domElement.style.height = this.params.BTH + "px";
    }

    var s= this.domElement.children[0];
    if (s.style.width === "") { // width of SVG element needs to be set for MSIE/EDGE
        s.style.width= (s.getBBox().width*(s.parentNode.clientHeight / s.getBBox().height )).toString()+"px";
    }

    // Rewrite reference to counterElement to match imported button
    this.tibButton.counterElement= this.domElement.getElementsByClassName('bd-btn-counter')[0] || null;

    this.tibButton.writeCounter(this.tibButton.getQty());

};



TibButtonStyle.prototype.injectCss = function( source){

    // inject non-button-style dependant CSS
    // should be moved to writebutton, with anti-dupication

    var headElement= document.getElementsByTagName('head')[0];
    var genericCssElement= document.getElementById('bd-css-tib-btn');

    if (! genericCssElement) {
        var linkElement= document.createElement('link');
        linkElement.id = 'bd-css-tib-btn';
        linkElement.rel= 'stylesheet';
        linkElement.type = 'text/css';
        linkElement.href = 'https://widget.tibit.com/assets/css/tib.css';
        genericCssElement= headElement.appendChild(linkElement);
    }

    if (! document.getElementById("tib-btn-" + this.params.BTN + "-css")) { // buton-style-specific CSS not already injected
        var styleElement = source.getElementById("tib-btn-" + this.params.BTN + "-css");   // extract button specifc CSS from source
        if (styleElement) {
            headElement.insertBefore(styleElement, styleElement.nextSibling); // inject button specific CSS immediatly after
        }
    }
};



/**************
 TIB INITIATOR
**************/


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


    this.loadObjectParams(siteParams);
    
    if ( !this.params.TIB ) {          // If no TIB specified, default to the current page URL
        this.params.TIB = window.location.hostname + window.location.pathname; // + window.location.search??
    }

    if ( !this.params.SUB ) {          // If no SUB is provided, use a hash of the TIB url
        this.params.SUB=  this.getSub();
    }

    if(domElement){
        this.loadElementParams(domElement);
    }

}



TibInitiator.prototype.loadObjectParams= function(source){

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
