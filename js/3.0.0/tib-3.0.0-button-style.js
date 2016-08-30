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

    var buttons = tibit.buttons;

    var styleButton = function(){ // Constructor function


        this.domElement.classList.add('bd-tib-btn-' + this.params.BTN);
        console.log('style params: ');
        console.log(this.params);
        loadButton(this.params, this.domElement);

    };

    console.log(tibit.buttons);
    tibit.buttons.TibButton.prototype.style= styleButton;



    var loadButton= function(params, domElement){

        var buttonFile = params.BTN || "default";
        console.log(params.BTN);
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
                console.log(p.BTN);
                console.log(e);
                writeButton(tibbtn.responseXML, p, e);

            }
        };
    };



    var writeButton= function( source, params, domElement) {
    // Called from context of XMLHttpRequest.onreadystatechange handler - different 'this' context from ButtonStyle obj

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

        setColour(params,domElement);
        setHeight(params,domElement);

        if(!domElement.classList.contains('bd-tib-btn')){
            domElement.classList.add('bd-tib-btn');
        }

        // Rewrite reference to counterElement to match imported button
        domElement.tibButton.counterElement= domElement.getElementsByClassName('bd-btn-counter')[0] || null;

        if(domElement.tibButton.counterElement) tibit.initiators.getQty(params);

    };



    var setColour= function(params, domElement){

        var backdrop = domElement.getElementsByClassName('bd-btn-backdrop')[0];  // the button face element used to set a custom colour
        if ( backdrop && params.BTC ) {
            backdrop.style.fill = params.BTC; // fill will only work for svg, needs expansion to include CSS
        }
    };



    var setHeight = function(params, domElement){

        if ( params.BTH ) {
            domElement.style.height = params.BTH + "px";
        }

        // TODO: Re-implement this browser fix
        var s= domElement.children[0];
        //console.log('xx', s);

        if (s.style.width === "") { // width of SVG element needs to be set for MSIE/EDGE
            s.style.width= (s.getBBox().width*(s.parentNode.clientHeight / s.getBBox().height )).toString()+"px";
            //console.log( s.getBBox().width, s.parentNode.clientHeight, s.getBBox().height, s.style.width);
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


    buttons.params.BTH = '';
    buttons.params.BTC = '';
    buttons.params.BTS = '';
    buttons.params.BTN = 'default';

    tibit.buttons = buttons;

    //loadElementParams = function(params, e){
    //
    //    for ( var paramName in params ) {
    //        if ( e.getAttribute('data-bd-' + paramName) ){
    //            params[paramName] = e.getAttribute('data-bd-' + paramName);
    //        }
    //    }
    //
    //    return params;
    //};

    console.log('TIBIT: successfully loaded button-style module');

    return tibit;

})(TIBIT || {});