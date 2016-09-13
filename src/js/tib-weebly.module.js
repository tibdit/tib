var TIBIT = (function(tibit) {

    // Executes in 'this' context of TibInitiator - it is assigned to tibit.generateSub and imported as TibInitiator.generateSub when TibInitiator is instantiated.
    var generateSub= function(){


        var e = this.domElement,
            parent = e,
            SUB = null,
            parentID;

        // Search upwards through parent elements of current button for a container with ID of format "blog-post-X" - if found, set this ID as our SUB
        do{
            parent = parent.parentElement;
            parentID = parent.id;
            if( parentID.substr(0,10) === "blog-post-" ) SUB = parentID;
        } while ( !SUB && parent.tagName !== "BODY");


        return SUB;
    };

    tibit.generateSub = generateSub;

    tibit.CONSOLE_OUTPUT && console.log('successfully loaded weebly module');

    return tibit;

})(TIBIT || {});