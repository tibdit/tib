var TIBIT = (function(tibit) {


    var modifySubs = function(){
    // Cycle .bd-tib-btn elements, attempt to find container (body or article) and assign the HTML ID of the container
    // as a subref (either by setting data-bd-SUB, or manually modifying TibInitiator if present

        // Save list of tib button DOM objects to a variable
        var buttons = document.getElementsByClassName('bd-tib-btn');

        for(var i = 0; i < buttons.length; i++) {

            var e = buttons[i],
                tibInitiator = e.tibElement && e.tibElement.tibInitiator, // && operator used to prevent erroring if tibElement not present
                SUB;

            // Search parents for a container <article> tag - if found, use the ID of this as the SUB
            if (findParentByTag(e, 'ARTICLE')) {
                SUB = findParentByTag(e, 'ARTICLE').id;
            }

            // Search upwards for a <body> tag - if found, and the body has an ID, use this as the SUB, otherwise
            // just use 'sqs-site' as the SUB
            else {
                var parentBody = findParentByTag(e, 'BODY');
                SUB = parentBody.id || 'sqs-site';
            }

            if(SUB) e.dataset.bdSub = SUB;
            if(SUB && tibInitiator){
                tibInitiator.params.SUB = SUB;
                tibInitiator.updateQTY();
            }

        }

    };

    // Search upwards through parents of e for an element with the specified tag name, and return this element if found

    var findParentByTag = function(e, tag){

        tibit.CONSOLE_OUTPUT && console.log('findParentByTag searching for parent with ' + tag + ' for element: \n \t', e);

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

        tibit.CONSOLE_OUTPUT && console.log('findParentByTag found no parent with tag ' + tag);

        // If we've iterated 10 times and not found the tag, return false
        return false;

    };

    switch(document.readyState) {

        case 'loading':
            tibit.CONSOLE_OUTPUT && console.log('Document is still loading - setting event listener');
            document.addEventListener('DOMContentLoaded', modifySubs);
            break;
        case 'loaded': // for older Android
        case 'interactive':
        case 'complete':
            tibit.CONSOLE_OUTPUT && console.log('Document loaded - attempting to modify subs');

            if(document.getElementsByClassName('bd-tib-btn')){
                modifySubs();
            }

    }

    tibit.CONSOLE_OUTPUT && console.log('successfully loaded squarespace module');

    return tibit;

})(TIBIT || {});