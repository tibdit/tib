var Tibit = (function(Tibit){

    /*****************
     TIB BUTTON STYLE
    *****************/

    // tibHandler.ButtonStyle object handles all functionality relating to the front end styling of Tib buttons (loading in SVG's, colours, etc)

    Tibit.ButtonStyle = function(tibButton){
        // Duplicating params from TibButton - probably just a temp solution

        this.params = {
            BTS : "",  // Source to fetch injected BTN button from
            BTC : "",  // Button Face (backdrop) Colour
            BTH : ""  // Button Height,
        };
        this.params.BTN = tibButton.params.BTN;
        this.tibButton = tibButton;
        this.domElement = tibButton.domElement;
        loadElementParams(this.params, this.domElement);
        loadButton(this.params, this.domElement);
        this.domElement.classList.add('bd-tib-btn-' + this.params.BTN);
    }


    loadButton= function(params, domElement){

        var buttonFile = params.BTN || "default";
        var buttonLocation = params.BTS || "https://widget.tibit.com/buttons/";

        var tibbtn= new XMLHttpRequest();
        tibbtn.open("GET", buttonLocation + "tib-btn-" + buttonFile + ".html", true);
        tibbtn.responseType= "document";
        tibbtn.send();

        // Initializing new variables with passed parameters to make available within onreadystatechange closure
        var p = params;
        var e = domElement;
        tibbtn.onreadystatechange= function(){
            if (tibbtn.readyState === 4 && tibbtn.status === 200 && tibbtn.responseXML) {
                writeButton(tibbtn.responseXML, p, e);
            }
        };
    };




    writeButton= function( source, params, domElement) {

        var sourceElement= source.getElementById("tib-btn-" + params.BTN);
        if (! sourceElement) throw "bd: failed to find tib-btn-" + params.BTN + " in received XML";

        var buttonElement= document.importNode(sourceElement, true);

        if (domElement.children.length === 0) {
            domElement.appendChild(buttonElement);  // insert if no placeholder
        } else {
            domElement.replaceChild(buttonElement, domElement.children[0]);  // replace placeholder
        }

        domElement.children[0].removeAttribute("id");  // Removing imported SVG ID to avoid potential duplicates

        injectCss( source, params);

        setColour(params,domElement);
        setHeight(params,domElement);

        if(!domElement.classList.contains('bd-tib-btn')){
            domElement.classList.add('bd-tib-btn');
        }

        // Rewrite reference to counterElement to match imported button
        domElement.tibButton.counterElement= domElement.getElementsByClassName('bd-btn-counter')[0] || null;

        domElement.tibButton.writeCounter(domElement.tibInitiator.getQty());

    };

    setColour= function(params, domElement){
        var backdrop = domElement.getElementsByClassName('bd-btn-backdrop')[0];  // the button face element used to set a custom colour
        if ( backdrop && params.BTC ) {
            backdrop.style.fill = params.BTC; // fill will only work for svg, needs expansion to include CSS
        }
    };

    setHeight = function(params, domElement){
        if ( params.BTH ) {
            domElement.style.height = params.BTH + "px";
        }

        // TODO: Re-implement this browser fix
        var s= domElement.children[0];
        console.log('xx', s);
        if (s.style.width === "") { // width of SVG element needs to be set for MSIE/EDGE
            s.style.width= (s.getBBox().width*(s.parentNode.clientHeight / s.getBBox().height )).toString()+"px";
            console.log( s.getBBox().width, s.parentNode.clientHeight, s.getBBox().height, s.style.width);
        }
    };


    injectCss = function( source, params){

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

        if (! document.getElementById("tib-btn-" + params.BTN + "-css")) { // buton-style-specific CSS not already
        // injected
            var styleElement = source.getElementById("tib-btn-" + params.BTN + "-css");   // extract button specifc CSS from source
            if (styleElement) {
                headElement.insertBefore(styleElement, styleElement.nextSibling); // inject button specific CSS immediatly after
            }
        }
    };

    loadElementParams = function(params, e){

        for ( var paramName in params ) {
            if ( e.getAttribute('data-bd-' + paramName) ){
                params[paramName] = e.getAttribute('data-bd-' + paramName);
            }
        }

        return params;
    };

    return Tibit;

})(Tibit || {});