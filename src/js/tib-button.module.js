/*************************************/
// TIB BUTTON STYLE MODULE
/*************************************/
/*
*
* Module concerned with styling and DOM representation of a Tib Button. This module will attempt to fetch a HTML/SVG
* button and insert it into the DOM. It will also take height/colour parameters. If the inserted button has a
* counter element, it will also initiate fetching and setting of tib QTY using initiator and button methods.
*
* */

var TIBIT = (function(tibit){



    var TibButton = function(e){ // Constructor function

        tibit.CONSOLE_OUTPUT && console.log('Generating TibButton for domElement \n \t', e);



        var loadButton= function(){
        // Initiate button loading process by making a HTTP request to our BTS (button source,) with writeButton as a callback

            var buttonFile = params.BTN || "default";
            var buttonLocation = params.BTS || "https://widget.tibit.com/buttons/";

            var tibbtn= new XMLHttpRequest();
            tibbtn.open("GET", buttonLocation + "tib-btn-" + buttonFile + ".html", true);
            tibbtn.responseType= "document";

            tibbtn.onreadystatechange= function(){
                if (tibbtn.readyState === 4 && tibbtn.status === 200 && tibbtn.responseXML) {
                     writeButton(tibbtn.responseXML);
                }
            };

            tibbtn.send();

        };



        var writeButton= function( source) {
        // Called from context of XMLHttpRequest.onreadystatechange handler - different 'this' context from ButtonStyle obj

            tibit.CONSOLE_OUTPUT && console.log('Button XML retrieved successfully - attempting to write button');

            var sourceElement= source.getElementById("tib-btn-" + params.BTN);
            if (! sourceElement) throw "bd: failed to find tib-btn-" + params.BTN + " in received XML";

            var buttonElement= document.importNode(sourceElement, true);

            if (domElement.children.length === 0) {
                domElement.appendChild(buttonElement);  // append/insert if no placeholder
            } else {
                domElement.replaceChild(buttonElement, domElement.children[0]);  // replace placeholder if present
            }

            domElement.children[0].removeAttribute("id");  // Removing imported SVG ID to avoid potential duplicates

            injectCss( source, params);

            setColour(  );
            setHeight(  );

            if(!domElement.classList.contains('bd-tib-btn')){
                domElement.classList.add('bd-tib-btn');
            }

            // Rewrite reference to counterElement to match imported button
            tibElement.counterElement = tibElement.getCounterElement();
            if(tibElement.counterElement) tibElement.writeCounter(tibInitiator.updateQty());

        };



        var setColour= function( ){
        // Attempt to set color of this buttons backdrop element ('.bd-btn-backdrop') based on params.BTC, if both present

            tibit.CONSOLE_OUTPUT && console.log('Setting button colour to '+ params.BTC );

            var backdrop = domElement.getElementsByClassName('bd-btn-backdrop')[0];  // the button face element used to set a custom colour
            if ( backdrop && params.BTC ) {
                backdrop.style.fill = params.BTC; // fill will only work for svg, needs expansion to include CSS
            }
        };



        var setHeight = function( ){
        // Attempt to set height of this buttons domElement based on a params.BTH property, if present.

            tibit.CONSOLE_OUTPUT && console.log('Setting button height to '+ params.BTH );

            if ( params.BTH ) {
                domElement.style.height = params.BTH + "px";
            }

            // TODO: Re-implement this browser fix
            var s= domElement.children[0];

            if (s.style.width === "") { // width of SVG element needs to be set for MSIE/EDGE
                s.style.width= (s.getBBox().width*(s.parentNode.clientHeight / s.getBBox().height )).toString()+"px";
            }
        };



        var injectCss = function( source, params){
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

            if (! document.getElementById("tib-btn-" + params.BTN + "-css")) { // buton-style-specific CSS not already injected
                var styleElement = source.getElementById("tib-btn-" + params.BTN + "-css");   // extract button specifc CSS from source
                if (styleElement) {
                    headElement.insertBefore(styleElement, styleElement.nextSibling); // inject button specific CSS immediatly after
                }
            }


        };

        var tibElement = this.tibElement = e.tibElement;
        var domElement = this.domElement = e;
        var tibInitiator = this.tibInitiator = e.tibInitiator;
        var params = this.params = {};

        // Copying and populating TibButton.params from button defaultParams and data-bd-attributes
        tibit.copyParams( buttonDefaultParams, this.params);
        tibit.loadElementParams( this.params, e);   // Only needed in style()?

        this.domElement.classList.add('bd-tib-btn-' + this.params.BTN);
        loadButton(this.params, this.domElement);

    };



    var buttonDefaultParams = {
    // Initialize our buttonDefaultParams object with accepted button params, to later be overridden within tibit.init()
        BTN : '',
        BTH : '',
        BTC : '',
        BTS : ''
    };

    tibit.TibButton = TibButton;
    tibit.buttonDefaultParams = buttonDefaultParams;

    tibit.CONSOLE_OUTPUT && console.log('TIBIT: successfully loaded button module');

    return tibit;

})(TIBIT || {});