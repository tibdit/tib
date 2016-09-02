/*************************************/
// TIBIT BASE MODULE
/*************************************/
/*
*
* Base tib.js module - contains functionality for initializing a page and hooking buttons onto each bd-tib-btn
* element, as well as helper functions used by other modules, and constant declarations
*
* */



var TIBIT= (function(tibit){


    var setDefaults= function(siteParams){

        // Initialising our params object as a property of our global tibit object

        for( var param in tibit.params ){
            if(siteParams[param]){
                tibit.params[param]= siteParams[param];
            }
        }
    };

    /********************
     PAGE LOAD FUNCTIONS
    ********************/

    var loadElementParams= function(params, e){

        // For each property in params, populate with data-bd-X attribute from e if present

        for ( var paramName in params ) {
            if ( e.getAttribute('data-bd-' + paramName) ){
                params[paramName]= e.getAttribute('data-bd-' + paramName);
            }
        }
        //if(params.BTN === 'chevron'){ debugger; }
        return params;
    };



    var sweepStorage= function() {

        // All 'TIBBED' and 'QTY' localStorage items have an EXP time generated and attached on creation - we cycle
        // through each item and delete them if this time has passed.

        for(var key in localStorage){

            if ( key.substr( 0, tibit.CONSTANTS.SUBREF_PREFIX.length) === tibit.CONSTANTS.SUBREF_PREFIX ) {

                var item= JSON.parse( localStorage.getItem(key));
                var expiry= new Date(item.EXP).getTime();

                if ( Date.now() >  expiry) {
                    localStorage.removeItem(key);
                }
            }
        }
    };



    var mapParams= function( source, target){

        // Given an object source, populate the named properties of an object target

        if ( typeof source !== "undefined" ) {
            for ( var pName in target ) {
                if( source.hasOwnProperty(pName) ) { // hasOwnProperty will return false for prototype properties
                    target[pName] = source[pName];
                    console.log(pName);
                }
            }
        }
    };



    var copyParams= function( source, target) {
        for ( var pName in source ) {
            if ( source.hasOwnProperty(pName) ) {
                target[pName] = source[pName];
            }
        }
    };



    var init = function(initiatorDefaultParams, buttonDefaultParams){

        mapParams(initiatorDefaultParams, tibit.initiatorDefaultParams);

        mapParams(buttonDefaultParams, tibit.buttonDefaultParams);

        console.log('initialising');

        switch(document.readyState) {
            case 'loading':
                console.log('found btns');
                document.addEventListener('DOMContentLoaded', tibit.initTibElements);
                break;
            case 'loaded': // for older Android
            case 'interactive':
            case 'complete':
                console.log('found btns');
                if(document.getElementsByClassName('bd-tib-btn')){
                    tibit.initTibElements();
                }
        }

    };

    // Takes a JS object as a parameter

    var params= {
        // Initiator Params
        PAD : "",
        SUB : "",
        CBK : "",
        ASN : "",
        TIB : "",
        // Button Type
        BTN : "",
        // Button Style Params
        BTS : "",
        BTC : "",
        BTH : ""
    };

    //  MODULE EXPORTS //

    var CONSTANTS= {
        SUBREF_PREFIX: 'bd-subref-',
        QTY_CACHE_DURATION: 20, // minutes
        BUTTON_CLASS: 'bd-tib-btn',
        BUTTON_STYLE_CLASS: 'bd-dynamic'
    };

    // Exposing our top level variables/methods/constants
    tibit.init = init;
    tibit.copyParams = copyParams;
    tibit.CONSTANTS = CONSTANTS;
    tibit.loadElementParams = loadElementParams;

    // Can't set tibit as an object literal, since we would overwrite the current tibit object (????)

    // Initialization Functions - must be run after all module functions/constants/variables declared

    sweepStorage();

    console.log('TIBIT: successfully loaded base module');

    // Return our working tibit object to be set to the global TIBIT object

    return tibit;



})(TIBIT || {});



/*
** MurmurHash3: Public Domain Austin Appleby http://sites.google.com/site/murmurhash/
** JS Implementation: Copyright (c) 2011 Gary Court MIT Licence http://github.com/garycourt/murmurhash-js
*/

function murmurhash3_32_gc(e,c){var h,r,t,a,o,d,A,C;for(h=3&e.length,r=e.length-h,t=c,o=3432918353,d=461845907,C=0;r>C;)A=255&e.charCodeAt(C)|(255&e.charCodeAt(++C))<<8|(255&e.charCodeAt(++C))<<16|(255&e.charCodeAt(++C))<<24,++C,A=(65535&A)*o+(((A>>>16)*o&65535)<<16)&4294967295,A=A<<15|A>>>17,A=(65535&A)*d+(((A>>>16)*d&65535)<<16)&4294967295,t^=A,t=t<<13|t>>>19,a=5*(65535&t)+((5*(t>>>16)&65535)<<16)&4294967295,t=(65535&a)+27492+(((a>>>16)+58964&65535)<<16);switch(A=0,h){case 3:A^=(255&e.charCodeAt(C+2))<<16;case 2:A^=(255&e.charCodeAt(C+1))<<8;case 1:A^=255&e.charCodeAt(C),A=(65535&A)*o+(((A>>>16)*o&65535)<<16)&4294967295,A=A<<15|A>>>17,A=(65535&A)*d+(((A>>>16)*d&65535)<<16)&4294967295,t^=A}return t^=e.length,t^=t>>>16,t=2246822507*(65535&t)+((2246822507*(t>>>16)&65535)<<16)&4294967295,t^=t>>>13,t=3266489909*(65535&t)+((3266489909*(t>>>16)&65535)<<16)&4294967295,t^=t>>>16,t>>>0}
