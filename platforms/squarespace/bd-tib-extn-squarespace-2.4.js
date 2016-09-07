// Initialise our extension object that will be imported by tibInit
BDtibExtension = function(that) {
    // Hook called after our tibHandler object is created, but before initButtons is run
    this.extensionInit = function(){
        // Save list of tib button DOM objects to a variable
        var buttons = document.getElementsByClassName('bd-tib-btn');
        // iterate over list of buttons
        for(var i = 0; i < buttons.length; i++){
            var SUB;
            // Search parents for a container <article> tag - if found, use the ID of this as the SUB
            if(this.findParentByTag(buttons[i], 'ARTICLE')){
                SUB =this.findParentByTag(buttons[i], 'ARTICLE').id
            }
            // Search upwards through parents for a header or footer - if found, use 'sqs-site' as the ID
            else if(this.findParentByTag(buttons[i], 'FOOTER') || this.findParentByTag(buttons[i], 'HEADER')){
                SUB = 'sqs-site';
            }
            // Search upwards for a <body> tag - if found, and the body has an ID, use this as the SUB, otherwise
            // just use 'sqs-site' as the SUB
            else{
                var parentBody = this.findParentByTag(buttons[i], 'BODY');
                SUB = parentBody.id || 'sqs-site';
            }
            buttons[i].dataset.bdSub = SUB;
        }
    };

    // Search upwards through parents of e for an element with the specified tag name, and return this element if found
    this.findParentByTag = function(e, tag){

        // Iterate 10 levels up
        for(var i = 0; i < 10; i++){
            // If e has no parentNode, give up
            if(!e.parentNode){ return false; }
            // set e to it's parent element
            e = e.parentNode;

            // Check if e has the specified tagName property - if so, return this element
            if(e.tagName === tag){
                return e;
            }
        }

        // If we've iterated 10 times and not found the tag, return false
        return false;


    };
}