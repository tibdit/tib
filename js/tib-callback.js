TibCallback= function(url){
    
    this.url= url;
    this.DUR= 1;  // multiplier to persist tib acknowedgement (1= 1-day or 5-mins for testnet)

    try {
        this.extractUrlToken();
        this.generateDates();
        if ( localStorageAvailable() ) this.persistAck();
        this.closeWindow();
    }

    catch (e) {
        var msg=  document.createElement('p');
        msg.appendChild(document.createTextNode( e.message + "<br>" + e.stack ));
        msg.appendChild(document.createTextNode( "bd: tib callback - tib paid but cannot persist"));
        throw(e);
        throw "bd: tib callback - tib paid but cannot persist";
    }
};


TibCallback.prototype.extractUrlToken= function(url){
    var re= "[^\?]*\?(.*&)?tibtok=([^&]*)"; 
    var token= this.url.match(re)[2]; // extract the value of the tibtok= querystring parameter
    token= decodeURIComponent(token); // convert any percent-encoded characters
    token= atob(token); // base64 decode the token
    token= JSON.parse(token); // convert the serialised json token string into js object
    this.token= token;
};


TibCallback.prototype.generateDates= function() {
    // set the EXP param to the expiry of the tib acknowledgement
    this.ISS = new Date( this.token.ISS).getTime();
    var duration= this.DUR * ( this.isTestnet() ? 300000 : 86400000 );
    // 300000   = 1000 * 60 * 5        (5 mins)
    // 86400000 = 1000 * 60 * 60 * 24  (24 hours)
    this.EXP= new Date( this.ISS + this.DUR);
};


TibCallback.prototype.isTestnet= function(){
    // true if PAD set and first character not 'm', 'n', or '2'
    return this.token.PAD && ( "mn2".search(this.token.PAD.substr(0,1)) !== -1 );
};


TibCallback.prototype.persistAck= function(){
    var tibDetails = {
        ISS: this.ISS, 
        QTY: this.token.QTY,
        EXP: this.EXP
    };
    localStorage.setItem("bd-subref-" + this.token.SUB, JSON.stringify(tibDetails));
};


TibCallback.prototype.closeWindow= function( ) {
    var re= "[^\?]*\?(.*&)?noclose($|[=&])";  // add noclose  querystring parameter to initiator 
    if ( this.url.search(re) ) return false;  // to prevent popup window from being automatically closed

    try {
        var tibWindow= window.open('','_self');
        tibWindow.close();
    }
    catch(ex) { console.error( "bd: attempt to close callback window failed"); }
    return false; // function should never return, since window is gone
};


function localStorageAvailable() {
    try {   
        x = '__storage_test__';
        window.localStorage.setItem(x, x);
        window.localStorage.removeItem(x);
        return true;
    }
    catch(e) {
        return false;
    }
}
