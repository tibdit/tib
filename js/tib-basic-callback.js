TibCallback = (function(){
    TibCallback = {};
    initialize = function(tibWindow){
        pollInterval = setInterval( function() {
            callbackHandler( tibWindow );
        }, 100);
    };

    function callbackHandler(tibWindow){
        console.log('here comes dat tib');
    }

    TibCallback.initialize = initialize;
    return TibCallback;
})();