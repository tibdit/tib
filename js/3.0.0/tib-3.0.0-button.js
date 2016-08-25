var Tibit = (function(Tibit){

    var SUBREF_PREFIX= 'bd-subref-';
    var QTY_CACHE_DURATION= 20; // minutes
     // manages the behaviour of tibbing buttons, attached
     // handles click event, counter retreival and display, adds core button classes

    Tibit.Button = function( domElement) {

        /* PUBLIC METHODS */

        this.writeCounter= function( QTY) {

            if ( this.counterElement && !isNaN(QTY) && QTY !== '' && QTY !== null) { // isNaN('') will return false
                this.counterElement.textContent = parseInt(QTY, 10);
            }
        };

        /* PUBLIC VARIABLES */

        this.params = {  // Primarily for related TibButtonStyle class, setting BTN triggers TibButtonStyle features
            BTN : "",  // Button Style to be injected, if any
            QTY : ""
        };

        this.domElement = domElement;
        this.tibbed= false;

        this.counterElement= null;
        this.counterElement= this.domElement.getElementsByClassName('bd-btn-counter')[0] || null;

        this.domElement.tibInitiator = new Tibit.Initiator(this.domElement);

        loadObjectParams(Tibit.params, this.params);
        Tibit.loadElementParams(this.params, this.domElement);

        //window.addEventListener('storage', storageUpdate.bind(this)); // handles tibbed events and counter updates
        this.domElement.addEventListener("click", this.domElement.tibInitiator.dispatch.bind(this.domElement.tibInitiator));
        window.addEventListener('tibstate', storageUpdate.bind(this));


        if (this.counterElement) this.writeCounter(this.domElement.tibInitiator.getQty());

        if (this.params.BTN) this.buttonStyle = new Tibit.ButtonStyle(this);

        if ( Tibit.isTestnet(this.domElement.tibInitiator.params.PAD) ) this.domElement.classList.add("testnet");

        this.domElement.classList.add( SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB );  // Add subref class for
        // easier reference later

        if(localStorage.getItem(SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB + '-TIBBED')){
            acknowledgeTib(this.domElement);
        }

        if (this.domElement.tagName === 'BUTTON' && !this.domElement.getAttribute('type') ) {
            // TODO determine if button being overwritted by TibButtonStyle.writeButton affects this
            this.domElement.setAttribute('type','button'); // prevents default submit type/action if within <form>
        }


    }

    acknowledgeTib= function(e) {

        // set the button to tibbed state

        e.tibbed= true;
        e.classList.add('tibbed');
    };

    storageUpdate= function(e) {
        // localStorage listener to update the buttons counter
        // used as the callback for tibHandler.tibInitiator, and when a Tib is acknowledged

        if(e.type === 'tibstate'){
            e.key= e.detail;
            e.newValue= localStorage[e.key];
        }

        if ( e.newValue && e.key === SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB + "-QTY" ) {
            // TODO: if a value is set from params, do we overwrite it after a Tib?
            this.writeCounter( JSON.parse(e.newValue).QTY);
            }
        if ( e.newValue && e.key === SUBREF_PREFIX + this.domElement.tibInitiator.params.SUB + "-TIBBED" ) {
            acknowledgeTib(this.domElement);
        }
    };

    loadObjectParams= function(source, params){

        // Given an object, populate the existing properties of this.params

        if (typeof source !== "undefined") {
            for ( var p in params) params[p] = source[p] || params[p];
        }
    };

    return Tibit;


})(Tibit || {});