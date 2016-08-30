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

    // Create our buttons object which will contain our buttons sub-namespace
    var buttons= {};
    tibit.tibButtons= [];

    var initButtons= function() {

        // instantiates and attaches a TibButton object to all DOM elements with the 'bd-tib-btn' class
        // settings are defaulted to matching items in the siteParams object, and data-bd-* attributes in the DOM element

        var buttons= document.getElementsByClassName(tibit.CONSTANTS.BUTTON_CLASS);
        for ( var i= 0, n= buttons.length; i < n; i++ ) {
            tibButton= new TibButton( buttons[i]);
            tibit.tibButtons.push( tibButton);
            // Construct tibHandler.Initiator for button, feeding in site default params + local params from element data-bd-*
        }
    };



    var TibButton= function( e) {

        // constructor for TibButton class, invoked by initButtons, argument is DOM element (the button)

        this.params = {};

        this.tibbed= false;
        this.testnet= false;

        tibInitiator= new tibit.Initiator( e);

        tibit.copyParams( buttons.params, this.params);
        tibit.loadElementParams( this.params, e);   // Only needed in style()?
        tibit.loadElementParams( tibInitiator.params, e);


        // TODO: add TibInitiator this.storageKey property
        e.classList.add( tibIinitator.storageKey );  

        e.addEventListener("click", tibInitiator.dispatch.bind( tibInitiator));
        
        window.addEventListener( 'tibstate', storageUpdate.bind(e));   // intra-window update trigger 
        window.addEventListener( 'storage', storageUpdate.bind(e));   // inter-window update trigger

        setCounterElement( e);

        if ( e.classList.contains('bd-dynamic'))   this.style();   // load and format a dynamic button

        if ( tibInitiator.isTestnet() )   setTestnet(e);   // set 'demo mode' class on button

        if ( localStorage.getItem( tibIinitator.storageKey + '-TIBBED' ))   setTibbed(e);   // set button to tibbed state
        
        if ( e.tagName === 'BUTTON' && !e.getAttribute('type'))  e.setAttribute( 'type', 'button' );   // prevent default submit type/action if within <form>

        this.tibInitiator= tibInitiator;
        e.tibInitiator= tibInitiator;
        this.domElement= e;
        e.tibButton= this;
        
    };



    var setCounterElement= function( e) {

        // called on button construct and after style button imported

        e.tibButton.counterElement= e.getElementsByClassName( 'bd-btn-counter')[0] || null;
        if ( this.counterElement )   tibInitiator.updateQty();   // get initiator to trigger event to update counter
    };



    var writeCounter= function( e, QTY) {
        if ( e.tibButton.counterElement && !isNaN(QTY) && QTY !== '' && QTY !== null) {    // isNaN('') will return false
            e.tibButton.counterElement.textContent= parseInt(QTY, 10);
        }
    };



    var setTibbed= function(e) {

        // set the button to tibbed state

        e.tibButton.tibbed= true;
        e.classList.add('tibbed');
    };



    var setTestnet= function(e) {

        // set the button to tibbed state

        e.tibButton.testnet= true;
        e.classList.add('testnet');
    };



    var storageUpdate= function(ev) {

        // localStorage/tibstate listener to update the buttons counter
        // used as the callback for tibHandler.tibInitiator, and when a Tib is acknowledged
        // for tibstate custom event, detail attribute contains the localStorage key
        // bound to DOM element, so this == e

        if(ev.type === 'tibstate') {
            ev.key= ev.detail;
            ev.newValue= localStorage[ev.key];
        }

        if ( ev.newValue && ev.key === this.tibInitiator.storageKey + "-QTY" ) {
            writeCounter( this, JSON.parse(ev.newValue).QTY);
            }

        if ( ev.newValue && ev.key === this.tibInitiator.storageKey + "-TIBBED" ) {
            setTibbed( this);
        }
    };





    var params= {};

    // Expose public buttons methods/variables
    tibit.TibButton= TibButton;
    buttons.initButtons= initButtons;
    buttons.params= params;

    tibit.buttons= buttons;


    console.log( 'TIBIT: successfully loaded button module');

    return tibit;


})(TIBIT || {});