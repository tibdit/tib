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



    var loadElementParams= function(params, e){

        tibit.CONSOLE_OUTPUT && console.log('running loadElementParams for following params obj & following element: \n \t' , params, '\n \t' , e);

        // For each property in params, populate with data-bd-X attribute from e if present

        for ( var paramName in params ) {

            if ( e.getAttribute('data-bd-' + paramName) ){
                params[paramName]= e.getAttribute('data-bd-' + paramName);
            }

        }

        tibit.CONSOLE_OUTPUT && console.log('finished loadElementParams, outputting following params obj: \n \t' , params);

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
                    tibit.CONSOLE_OUTPUT && console.log('Removing localstorage item ' + key);
                    localStorage.removeItem(key);
                }

            }

        }

    };



    var mapParams= function( source, target){
    // Given a source object and target object, copy any properties from source to target that already exist on target

        if ( typeof source !== "undefined" ) { // If source is not provided, do nothing

            for ( var pName in target ) {
                if( source.hasOwnProperty(pName) ) { // hasOwnProperty will return false for prototype properties
                    target[pName] = source[pName];
                }
            }

            tibit.CONSOLE_OUTPUT && console.log('mapParams mapped following source to following target obj: \n \t' , source, '\n \t', target);

        }

    };



    var cloneObj= function( source, target) {
    // Given a target obj, copy properties to target obj (to avoid duplicate references to same obj)

        var clone = {};

        if(typeof source === 'object'){

            for ( var pName in source ) {

                if ( source.hasOwnProperty(pName) ) { // hasOwnProperty to filter prototype properties
                    clone[pName] = source[pName];
                }

            }

            tibit.CONSOLE_OUTPUT && console.log('cloneObj mapped following source to following output obj: \n \t' , source, '\n \t', clone);

            return clone;

        }
        else{
            return false;
        }

    };



    var init = function(initiatorDefaultParams, buttonDefaultParams){
    // Initialize default param objects for initiators and buttons, and setup tibit.initTibElements to run on document load

        tibit.CONSOLE_OUTPUT && console.log('Running base tibit.init() function');

        mapParams(initiatorDefaultParams, tibit.initiatorDefaultParams);
        mapParams(buttonDefaultParams, tibit.buttonDefaultParams);
        console.log(document.readyState);

        switch(document.readyState) {

            case 'loading':
                tibit.CONSOLE_OUTPUT && console.log('Document is still loading - setting event listener');
                document.addEventListener('DOMContentLoaded', tibit.initTibElements);
                break;
            case 'loaded': // for older Android
            case 'interactive':
            case 'complete':
                tibit.CONSOLE_OUTPUT && console.log('Document loaded - attempting to create tib elements');

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

    tibit.CONSOLE_OUTPUT = tibit.CONSOLE_OUTPUT || false;

    var CONSTANTS= {
        SUBREF_PREFIX: 'bd-subref-',
        QTY_CACHE_DURATION: 20, // minutes
        BUTTON_CLASS: 'bd-tib-btn',
        BUTTON_STYLE_CLASS: 'bd-dynamic',
    };

    tibit.CONSOLE_OUTPUT && console.log('TIBIT.constants saved: \n \t', CONSTANTS);

    // Exposing our top level variables/methods/constants
    tibit.init = init;
    tibit.cloneObj = cloneObj;
    tibit.CONSTANTS = CONSTANTS;
    tibit.loadElementParams = loadElementParams;

    // Can't set tibit as an object literal, since we would overwrite the current tibit object (????)

    // Initialization Functions - must be run after all module functions/constants/variables declared

    sweepStorage();

    tibit.CONSOLE_OUTPUT && console.log('successfully loaded base module');

    // Return our working tibit object to be set to the global TIBIT object

    return tibit;



})(TIBIT || {});



/*
** MurmurHash3: Public Domain Austin Appleby http://sites.google.com/site/murmurhash/
** JS Implementation: Copyright (c) 2011 Gary Court MIT Licence http://github.com/garycourt/murmurhash-js
*/

function murmurhash3_32_gc(e,c){var h,r,t,a,o,d,A,C;for(h=3&e.length,r=e.length-h,t=c,o=3432918353,d=461845907,C=0;r>C;)A=255&e.charCodeAt(C)|(255&e.charCodeAt(++C))<<8|(255&e.charCodeAt(++C))<<16|(255&e.charCodeAt(++C))<<24,++C,A=(65535&A)*o+(((A>>>16)*o&65535)<<16)&4294967295,A=A<<15|A>>>17,A=(65535&A)*d+(((A>>>16)*d&65535)<<16)&4294967295,t^=A,t=t<<13|t>>>19,a=5*(65535&t)+((5*(t>>>16)&65535)<<16)&4294967295,t=(65535&a)+27492+(((a>>>16)+58964&65535)<<16);switch(A=0,h){case 3:A^=(255&e.charCodeAt(C+2))<<16;case 2:A^=(255&e.charCodeAt(C+1))<<8;case 1:A^=255&e.charCodeAt(C),A=(65535&A)*o+(((A>>>16)*o&65535)<<16)&4294967295,A=A<<15|A>>>17,A=(65535&A)*d+(((A>>>16)*d&65535)<<16)&4294967295,t^=A}return t^=e.length,t^=t>>>16,t=2246822507*(65535&t)+((2246822507*(t>>>16)&65535)<<16)&4294967295,t^=t>>>13,t=3266489909*(65535&t)+((3266489909*(t>>>16)&65535)<<16)&4294967295,t^=t>>>16,t>>>0}
