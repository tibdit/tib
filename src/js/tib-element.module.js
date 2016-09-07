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

var TIBIT= (function(tibit){


    // Declaring and/or initializing any module-level closure variables - these will be accessible from any function
    // scope defined within the buttons module.
    var buttons= {}; // Create our buttons namespace object container
    var tibElements= [];

    // Aliasing top-level namespace variables for convenient reference within module
    var CONSTANTS = tibit.CONSTANTS;



    var initTibElements= function() {

        // tibButtonDefaults={}  ??

        // button defaults {} should be as argument to initButtons, and will available via closure.

        // instantiates and attaches a TibElement object to all DOM elements with the 'bd-tib-btn' class
        // settings are defaulted to matching items in the siteParams object, and data-bd-* attributes in the DOM element

        tibit.CONSOLE_OUTPUT && console.log('Running initTibElements ');

        var buttons= document.getElementsByClassName(CONSTANTS.BUTTON_CLASS);
        for ( var i= 0, n= buttons.length; i < n; i++ ) {
            var tibElement= new tibit.TibElement( buttons[i]);
            tibit.tibElements.push( tibElement);
            // Construct tibHandler.Initiator for button, feeding in site default params + local params from element data-bd-*
        }

        tibit.CONSOLE_OUTPUT && console.log('tibit.tibElements array populated: \n \t', tibit.tibElements);
    };



    var TibElement= function( e) {

        tibit.CONSOLE_OUTPUT && console.log('Generating TibElement for domElement \n \t', e);

        this.getCounterElement= function( ) {

            // called on button construct and after style button imported
            counterElement= e.getElementsByClassName( 'bd-btn-counter')[0] || null;
            if ( counterElement )   tibInitiator.updateQty();   // get initiator to trigger event to update counter]

            return counterElement;
        };



        this.writeCounter= function( QTY) {
            if ( counterElement && !isNaN(QTY) && QTY !== '' && QTY !== null && QTY >= 0) {    // isNaN('') will return false
                counterElement.textContent= parseInt(QTY, 10);
            }
        };



        var setTibbed= function() {

            // set the button to tibbed state  
            // perhaps can't use 'e' as also called from event handler

            this.tibbed= true;
            e.classList.add('tibbed');
        };



        var setTestnet= function() {

            // set the button to tibbed state

            this.testnet= true;
            e.classList.add('testnet');
        };



        var storageUpdate= function(ev) {

            // localStorage/tibstate listener to update the buttons counter
            // used as the callback for tibHandler.tibInitiator, and when a Tib is acknowledged
            // for tibstate custom event, detail attribute contains the localStorage key
            // bound to DOM element, so this == e  ////  CHANGED this now == tibElement

            if(ev.type === 'tibstate') {
                ev.key= ev.detail;
                ev.newValue= localStorage[ev.key];
            }

            if ( ev.newValue && ev.key === tibInitiator.storageKey + "-QTY" ) {
                this.writeCounter( JSON.parse(ev.newValue).QTY);
                }

            if ( ev.newValue && ev.key === tibInitiator.storageKey + "-TIBBED" ) {
                setTibbed( e);
            }
        };


        // Declaring our closure variables in one place
        var tibElement, tibInitiator, tibbed, testnet, counterElement;

        // Set up internal and external references to this tibElement object
        tibElement = e.tibElement=  this;

        // Initiatlising public variables with closure aliases for clarity ('testnet' less readable than 'testnet')
        tibbed = this.tibbed = false;
        testnet = this.testnet = false;
        this.domElement= e;
        tibInitiator= e.tibInitiator= this.tibInitiator= new tibit.Initiator( e);

        // TODO: add TibInitiator this.storageKey property
        e.classList.add( tibInitiator.storageKey );

        e.addEventListener("click", tibInitiator.dispatch.bind( tibInitiator)); // Assign generated initiator's dispatch method to click event

        window.addEventListener( 'tibstate', storageUpdate.bind(this));   // intra-window update trigger
        window.addEventListener( 'storage', storageUpdate.bind(this));   // inter-window update trigger

        counterElement = this.counterElement = this.getCounterElement( ); // Initialised later in constructor, after tibInitiator is built
        if(counterElement) this.writeCounter(tibInitiator.updateQty());

        if ( e.classList.contains('bd-dynamic'))   e.tibButton = new tibit.TibButton(e);   // load and format a dynamic button

        if ( tibInitiator.isTestnet() )   setTestnet();   // set 'demo mode' class on button

        if ( localStorage.getItem( tibInitiator.storageKey + '-TIBBED' ))   setTibbed();   // set button to tibbed state

        if ( e.tagName === 'BUTTON' && !e.getAttribute('type'))  e.setAttribute( 'type', 'button' );   // prevent default submit type/action if within <form>




    }; // relocated from above to perhaps get access to e, this, tibInitiator...


    // PUBLIC VARIABLES/METHODS AT TOP LEVEL NAMESPACE
    tibit.TibElement= TibElement;
    tibit.initTibElements= initTibElements;

    tibit.tibElements= tibElements;


    tibit.CONSOLE_OUTPUT && console.log( 'successfully loaded element module');

    return tibit;


})(TIBIT || {});