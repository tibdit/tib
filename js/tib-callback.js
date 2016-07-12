TibCallback= function(url){
    this.url = url;
};

TibCallback.prototype.processToken = function(){
    try {

        this.token = this.extractUrlToken(this.url);
        if (this.storageAvailable('localStorage')) {
            this.persistAck();
        }
        this.closeWindow();
    }
    catch (e) {
        var msg=  document.createElement('p');
        msg.appendChild(document.createTextNode( e.message + "<br>" + e.stack ));
        msg.appendChild(document.createTextNode( "bd: tib callback - tib paid but cannot persist"));
        throw "bd: tib callback - tib paid but cannot persist";
    }
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

TibCallback.prototype.generateExpiry= function(){
    var DUR = DUR || 1;
    console.log(DUR);
    var EXP;
    var ISS = new Date(this.token.ISS);
    // testnet PAD
    if(this.token.PAD && this.isTestnet(this.token.PAD)){
        EXP = ISS.getTime() + (DUR * 300000);  // 1000 * 60 * 5 (5 mins)
    }
    // realmode PAD or ASN
    else{
        EXP = ISS.getTime() + (DUR * 86400000);
    }

    return new Date(EXP);
};

TibCallback.prototype.isTestnet= function(PAD){
    // true if PAD set and first character not 'm', 'n', or '2'
    return PAD && ( "mn2".search(PAD.substr(0,1)) !== -1 );
};

TibCallback.prototype.persistAck= function(){
    var tibDetails = {ISS: new Date(this.token.ISS), QTY: this.token.QTY, EXP: this.generateExpiry()};
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
