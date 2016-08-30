/*************************************/
// TIB BUTTON MODULE
/*************************************/
/*
*
* Module containing the tibit.Button constructor, which instantiates a tibit.Initiator and optionally a
* tibit.ButtonStyle on a given DOM element, which the Button can then use to dispatch tibs on click, fetch and set
* counters, and import/style a button. Also manages some classes/ID's attached to the DOM element.
*
* */

var TIBIT = (function(tibit){

    switch(document.readyState) {
        case 'loading':
            document.addEventListener('DOMContentLoaded', afterLoad);
            break;
        case 'loaded': // for older Android
        case 'interactive':
        case 'complete':
            initButtons();
    }

    var TibButton= function( domElement) {

        // constructor for Button class, invoked by initButtons, 

        this.params = {
            BTN : "",  // Will instantiate a ButtonStyle object if specified
            QTY : "" // Will directly set the value of a counter element, if present (e.g. if QTY persisted through backend)
        };

        this.tibbed= false;

        this.domElement = domElement;

        loadObjectParams(tibit.params, this.params);
        tibit.loadElementParams(this.params, this.domElement);

        this.domElement.tibInitiator = new tibit.Initiator(this.domElement);

        //window.addEventListener('storage', storageUpdate.bind(this)); // handles tibbed events and counter updates
        this.domElement.addEventListener("click", this.domElement.tibInitiator.dispatch.bind(this.domElement.tibInitiator));
        window.addEventListener('tibstate', storageUpdate.bind(this));

        this.counterElement= this.domElement.getElementsByClassName('bd-btn-counter')[0] || null;
        if (this.counterElement) this.writeCounter(this.domElement.tibInitiator.getQty());

        if (this.params.BTN) this.styleButton(); // buttonStyle = new tibit.ButtonStyle(this);

        // CSS/HTML Class Assignments
        if ( tibit.isTestnet(this.domElement.tibInitiator.params.PAD) ) this.domElement.classList.add("testnet");
        this.domElement.classList.add( tibit.CONSTANTS.SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB );  // Add subref class for easier reference later

        // Acknowledge tibbed state if persisted through localStorage
        if ( localStorage.getItem(tibit.CONSTANTS.SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB + '-TIBBED') ) {
            acknowledgeTib(this.domElement);
        }

        if ( this.domElement.tagName === 'BUTTON' && !this.domElement.getAttribute('type') ) {
            // TODO determine if button being overwritted by TibButtonStyle.writeButton affects this
            this.domElement.setAttribute('type','button'); // prevents default submit type/action if within <form>
        }
    };



    var writeCounter= function( QTY) {
        if ( this.counterElement && !isNaN(QTY) && QTY !== '' && QTY !== null) { // isNaN('') will return false
            this.counterElement.textContent = parseInt(QTY, 10);
        }
    };



    var acknowledgeTib= function(e) {

        // set the button to tibbed state

        e.tibbed= true;
        e.classList.add('tibbed');
    };



    var storageUpdate= function(e) {

        // localStorage/tibstate listener to update the buttons counter
        // used as the callback for tibHandler.tibInitiator, and when a Tib is acknowledged
        // for tibstate custom event, detail attribute contains the localStorage key

        if(e.type === 'tibstate'){
            e.key= e.detail;
            e.newValue= localStorage[e.key];
        }

        if ( e.newValue && e.key === tibit.CONSTANTS.SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB + "-QTY" ) {
            // TODO: if a value is set from params, do we overwrite it after a Tib?  YES
            this.writeCounter( JSON.parse(e.newValue).QTY);
            }

        if ( e.newValue && e.key === tibit.CONSTANTS.SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB + "-TIBBED" ) {
            acknowledgeTib(this.domElement);
        }
    };



    var loadObjectParams= function(source, params){

        // Given an object, populate the existing properties of this.params

        if (typeof source !== "undefined") {
            for ( var p in params) params[p] = source[p] || params[p];
        }
    };


    TibButton.prototype.writeCounter= writeCounter;

    tibit.buttons= {
        TibButton: TibButton,
        initButtons: initButtons
    };


    return tibit;


})(TIBIT || {});