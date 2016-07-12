TibCallback = function(){
    this.token = this.processToken();
    console.log(this.token);
};

TibCallback.prototype.processToken = function(){
    var token = this.extractUrlToken(window.location.href);
    return token;
};

TibCallback.prototype.extractUrlToken = function(url){
    // for clarity, steps are individually broken down, reusing a single variable

    var token= new URI(url);

    token= token.query(true); // retreive the querystring parameters into js object
    token= token.tibtok; // pull out the value of the tibtok= querystring parameter
    token= URI.decode(token); // convert any percent-encoded characters
    token= atob(token); // base64 decode the token
    token= JSON.parse(token); // convert the serialised json token string into js object

    return token;
};