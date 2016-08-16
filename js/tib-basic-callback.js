
var Tibit = (function(Tibit){
    Tibit.Callback = {};
    var callbackIntervalID;
    var tibWindow;
    initialize = function(window){

        tibWindow = window;
        tibWindow.initialHref = tibWindow.location.href;

        callbackIntervalID = setInterval( function() {
            callbackHandler();
        }, 100);
    };

    function callbackHandler(){
        console.log('callbackHandler running');
        if(callbackDone()){
            console.log('latah');
        }
    }

    function callbackDone(){
        var domain;

        try {
            if( tibWindow.closed){
                clearInterval(callbackIntervalID); // window closed externally, no callback with token
                return false;
            }
            domain = tibWindow.location.hostname; // should throw e.SECURITY_ERR if on different origin
        }
        catch(ex){
            if(ex.code === ex.SECURITY_ERR) return false; // tib window is still on another domain (i.e. //tib.me) - keep waiting
            else{
                clearInterval(callbackIntervalID); // some unexpected error - abort polling - leave tib window open
                throw ex;
            }
        }

        if(tibWindow.initialHref === tibWindow.location.href || domain.length === 0) return false; // window is accessible, but probably still initialising - keep waiting
        if (domain.substr(domain.length-6) === "tib.me") return false; // insecure browser lets us see cross domain - keep waiting

        clearInterval(callbackIntervalID);
        console.log('interval cleared, returning true');
        return true;
    }

    Tibit.Callback.initialize = initialize;
    return Tibit;
})(Tibit || {});