TibCallback= function(url){
    this.token = this.extractUrlToken(url);
    if(this.storageAvailable('localStorage')){
        this.persistAck();
    }
    this.closeWindow();
};

TibCallback.prototype.extractUrlToken= function(url){
    // for clarity, steps are individually broken down, reusing a single variable

    var token= new URI(url);

    token= token.query(true); // retreive the querystring parameters into js object
    token= token.tibtok; // pull out the value of the tibtok= querystring parameter
    token= URI.decode(token); // convert any percent-encoded characters
    token= atob(token); // base64 decode the token
    token= JSON.parse(token); // convert the serialised json token string into js object

    return token;
};

TibCallback.prototype.persistAck= function(){
    var tibDetails = {ISS: this.token.ISS, QTY: this.token.QTY};
    localStorage.setItem("bd-subref-" + this.token.SUB, JSON.stringify(tibDetails));
};

TibCallback.prototype.storageAvailable= function(type) {

    // test for available browser localStorage
    // developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API

    try {
        var storage = window[type],
            x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return false;
    }
};

TibCallback.prototype.closeWindow= function( ) {

    //add noclose to querystring of tib initiator to prevent popup tib window from closing

    if ( URI(window.location).query(true).noclose ) {
        return false;
    }

    try {
        var tibWindow= window.open('','_self');
        tibWindow.close();
    }
    catch(ex) {
        console.error( "bd: attempt to close callback window failed");
    }

    return false;
    // function should never return, since window is gone
};
