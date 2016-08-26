/*************************************/
// TIB BUTTON MODULE
/*************************************/
/*
*
* Module containing the Tibit.Button constructor, which instantiates a Tibit.Initiator and optionally a
* Tibit.ButtonStyle on a given DOM element, which the Button can then use to dispatch tibs on click, fetch and set
* counters, and import/style a button. Also manages some classes/ID's attached to the DOM element.
*
* */

var Tibit = (function(Tibit){



    Tibit.Button = function( domElement) {



        this.writeCounter= function( QTY) {

            if ( this.counterElement && !isNaN(QTY) && QTY !== '' && QTY !== null) { // isNaN('') will return false
                this.counterElement.textContent = parseInt(QTY, 10);
            }
        };



        this.params = {
            BTN : "",  // Will instantiate a ButtonStyle object if specified
            QTY : "" // Will directly set the value of a counter element, if present (e.g. if QTY persisted through backend)
        };

        this.tibbed= false;

        this.domElement = domElement;

        loadObjectParams(Tibit.params, this.params);
        Tibit.loadElementParams(this.params, this.domElement);

        this.domElement.tibInitiator = new Tibit.Initiator(this.domElement);

        //window.addEventListener('storage', storageUpdate.bind(this)); // handles tibbed events and counter updates
        this.domElement.addEventListener("click", this.domElement.tibInitiator.dispatch.bind(this.domElement.tibInitiator));
        window.addEventListener('tibstate', storageUpdate.bind(this));

        this.counterElement= null;
        this.counterElement= this.domElement.getElementsByClassName('bd-btn-counter')[0] || null;
        if (this.counterElement) this.writeCounter(this.domElement.tibInitiator.getQty());

        if (this.params.BTN) this.buttonStyle = new Tibit.ButtonStyle(this);

        // CSS/HTML Class Assignments
        if ( Tibit.isTestnet(this.domElement.tibInitiator.params.PAD) ) this.domElement.classList.add("testnet");
        this.domElement.classList.add( Tibit.constants.SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB );  // Add subref class for
        // easier reference later

        // Acknowledge tibbed state if persisted through localStorage
        if(localStorage.getItem(Tibit.constants.SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB + '-TIBBED')){
            acknowledgeTib(this.domElement);
        }

        if (this.domElement.tagName === 'BUTTON' && !this.domElement.getAttribute('type') ) {
            // TODO determine if button being overwritted by TibButtonStyle.writeButton affects this
            this.domElement.setAttribute('type','button'); // prevents default submit type/action if within <form>
        }

    };



    var acknowledgeTib= function(e) {

        // set the button to tibbed state

        e.tibbed= true;
        e.classList.add('tibbed');
    };

    var storageUpdate= function(e) {
        // localStorage listener to update the buttons counter
        // used as the callback for tibHandler.tibInitiator, and when a Tib is acknowledged

        if(e.type === 'tibstate'){
            e.key= e.detail;
            e.newValue= localStorage[e.key];
        }

        if ( e.newValue && e.key === Tibit.constants.SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB + "-QTY" ) {
            // TODO: if a value is set from params, do we overwrite it after a Tib?
            this.writeCounter( JSON.parse(e.newValue).QTY);
            }
        if ( e.newValue && e.key === Tibit.constants.SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB + "-TIBBED" ) {
            acknowledgeTib(this.domElement);
        }
    };

    var loadObjectParams= function(source, params){

        // Given an object, populate the existing properties of this.params

        if (typeof source !== "undefined") {
            for ( var p in params) params[p] = source[p] || params[p];
        }
    };

    return Tibit;


})(Tibit || {});