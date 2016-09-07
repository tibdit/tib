var TIBIT = (function(tibit) {


    var modifySub = function(e){
        // Save list of tib button DOM objects to a variable
            var SUB;
            // Search parents for a container <article> tag - if found, use the ID of this as the SUB
            if(findParentByTag(e, 'ARTICLE')){
                SUB = findParentByTag(e, 'ARTICLE').id;
            }
            // Search upwards for a <body> tag - if found, and the body has an ID, use this as the SUB, otherwise
            // just use 'sqs-site' as the SUB
            else{
                var parentBody = findParentByTag(e, 'BODY');
                SUB = parentBody.id || 'sqs-site';
            }

            e.dataset.bdSub = SUB;

    };

    // Search upwards through parents of e for an element with the specified tag name, and return this element if found
    var findParentByTag = function(e, tag){

        // Iterate 10 levels up
        for(var i = 0; i < 10; i++){
            // If e has no parentNode, give up
            if(!e.parentNode) return false;
            // set e to it's parent element
            e = e.parentNode;

            // Check if e has the specified tagName property - if so, return this element
            if(e.tagName === tag){
                tibit.CONSOLE_OUTPUT && console.log('findParentByTag found parent element with tag ' + tag + ': \t \n', e);
                return e;
            }
        }

        // If we've iterated 10 times and not found the tag, return false
        return false;

    };

    // Set TibElement to the return value of this immediately executed anonymous function
    var TibElement = function(original){ // Original TibElement passed as a parameter

        return function(e){

                modifySub(e);
                var that = {};
                original.call(that, e);
                return that;

        };

    }(tibit.TibElement);


    tibit.TibElement = TibElement;


    tibit.CONSOLE_OUTPUT && console.log('successfully loaded squarespace module');

    return tibit;

})(TIBIT || {});