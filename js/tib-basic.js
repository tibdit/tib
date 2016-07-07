/*! * $script.js JS loader & dependency manager * https://github.com/ded/script.js * (c) Dustin Diaz 2014 | License MIT */
(function(e,t){typeof module!="undefined"&&module.exports?module.exports=t():typeof define=="function"&&define.amd?define(t):this[e]=t()})("$script",function(){function p(e,t){for(var n=0,i=e.length;n<i;++n)if(!t(e[n]))return r;return 1}function d(e,t){p(e,function(e){return t(e),1})}function v(e,t,n){function g(e){return e.call?e():u[e]}function y(){if(!--h){u[o]=1,s&&s();for(var e in f)p(e.split("|"),g)&&!d(f[e],g)&&(f[e]=[])}}e=e[i]?e:[e];var r=t&&t.call,s=r?t:n,o=r?e.join(""):t,h=e.length;return setTimeout(function(){d(e,function t(e,n){if(e===null)return y();!n&&!/^https?:\/\//.test(e)&&c&&(e=e.indexOf(".js")===-1?c+e+".js":c+e);if(l[e])return o&&(a[o]=1),l[e]==2?y():setTimeout(function(){t(e,!0)},0);l[e]=1,o&&(a[o]=1),m(e,y)})},0),v}function m(n,r){var i=e.createElement("script"),u;i.onload=i.onerror=i[o]=function(){if(i[s]&&!/^c|loade/.test(i[s])||u)return;i.onload=i[o]=null,u=1,l[n]=2,r()},i.async=1,i.src=h?n+(n.indexOf("?")===-1?"?":"&")+h:n,t.insertBefore(i,t.lastChild)}var e=document,t=e.getElementsByTagName("head")[0],n="string",r=!1,i="push",s="readyState",o="onreadystatechange",u={},a={},f={},l={},c,h;return v.get=m,v.order=function(e,t,n){(function r(i){i=e.shift(),e.length?v(i,r):v(i,t,n)})()},v.path=function(e){c=e},v.urlArgs=function(e){h=e},v.ready=function(e,t,n){e=e[i]?e:[e];var r=[];return!d(e,function(e){u[e]||r[i](e)})&&p(e,function(e){return u[e]})?t():!function(e){f[e]=f[e]||[],f[e][i](t),n&&n(r)}(e.join("|")),v},v.done=function(e){v([null],e)},v})

// Takes a JS object as a parameter
function tibInit(obj){
    var bd;

    var scriptsToImport = [];
    $script('https://widget.tibit.local/assets/platforms/tumblr/crypto-sha256.js', 'cryptojs');
    scriptsToImport.push('cryptojs');

    $script.ready(scriptsToImport, function () {

        bd = new TibHandler(obj);

        if(document.readyState === 'loading'){
            document.addEventListener('DOMContentLoaded', function(){
               bd.initButtons();
            });
        }
        else{
            bd.initButtons();
        }

        return bd;

    });
}

function TibHandler(obj){
    defaultTibParams = new TibParams(obj);

    this.initButtons = function(){
        var that = this;
        this.sweepOldTibs();

        var buttons = document.getElementsByClassName('bd-tib-btn');
        for(var i = 0, n = buttons.length; i < n; i++){
            // Save current button to e for simpler reference
            var e = buttons[i];

            // Generate TibInitiator for button, feeding in global/default params + local params
            e.tibButton = new TibButton(defaultTibParams, e);
        }

        // Localstorage event listener - watches for changes to bd-subref-x items in localStorage
        window.addEventListener('storage', function(e){
           if(e.newValue && e.key.substr(0,10) === "bd-subref-"){
               that.ackElementsInClass(e.key);
           }
        });
    };

    this.ackElementsInClass = function(key){
        // Attempt to grab QTY from localStorage item matching passed key
        var QTY = JSON.parse(localStorage.getItem(key)).QTY;
        var buttons = document.getElementsByClassName(key);
        for (var j = 0, m = buttons.length; j < m; j++){
            var e = buttons[j];
            e.classList.add("tibbed");
            // Attempt to grab counter element for current button
            var c = e.getElementsByClassName('bd-btn-counter')[0];
            // If QTY obtained from storage, and button has a counter, write to it
            if(c && QTY){
                c.textContent = QTY;
            }
        }
    };

    this.sweepOldTibs = function(){
        var expireLimit = Date.now() - defaultTibParams.DUR;
        var keysToRemove = [];

        // Iterate over localStorage items
        if(localStorage.length){
            for(var k = 0, o = localStorage.length; k < o; k++){
                var key = localStorage.key(k);
                var ISS;
                if(key.substr(0,10) === "bd-subref-" ){
                    // Grab timestamp for given subref from localStorage
                    var localStorageJSON = JSON.parse(localStorage.getItem(key));
                    ISS = localStorageJSON.ISS;
                }
                // If sufficient time has passed, mark the localStorage item to be removed
                if(Date.parse(ISS) < expireLimit){
                    keysToRemove.push(key);
                }
            }
        }
        // If any items added to keysToRemove array, delete matching items from localStorage
        if(keysToRemove.length){
            for(var i= 0, n = keysToRemove.length; i < n; i++){
                localStorage.removeItem(keysToRemove[i]);
            }
        }

    }
}

function TibButton(defaultParams, e){
    this.tibInitiator = new TibInitiator(defaultParams, e);
    this.tibInitiator.loadElementData(e);

    var that = this;
    this.e = e;
    this.writeCounter = function(){
        var c = that.e.getElementsByClassName('bd-btn-counter')[0];
        // If the button has a counter and the counter has been marked pending, replace
        // the counter content with the retrieved QTY
        var QTY = that.tibInitiator.QTY;
        if(c && QTY){
            c.textContent = QTY;
        }
    };

    this.tibInitiator.getQTY(this.writeCounter, this);

    this.tibClick = function(){
        return function(){
            // "this" context is the button element, since this occurs in the context of an
            // onclick event
            this.tibButton.tibInitiator.tib();
        }
    };

    // move to tib button
    e.addEventListener("click", this.tibClick());

    // Add subref class for easier reference later
    e.classList.add("bd-subref-" + this.tibInitiator.tibParams.SUB);

    if ( localStorage["bd-subref-" + this.tibInitiator.tibParams.SUB] && JSON.parse(localStorage.getItem('bd-subref-' + this.tibInitiator.SUB)).ISS ){
        e.classList.add("tibbed");  // add the tibbed class
    }

}

function TibInitiator(defaultParams, e){

    this.tibParams = new TibParams(defaultParams);

    this.loadElementData = function(e){
        for(prop in this.tibParams){
            if(e.getAttribute('data-bd-' + prop)){
                this.tibParams[prop] = e.getAttribute('data-bd-' + prop);
            }
        }

    };

    if(!this.tibParams.TIB){
        this.tibParams.TIB = window.location.hostname + window.location.pathname;
    }
    console.log(this.tibParams.TIB);
    //If no SUB is provided, generate SHA256 hash, truncate to 10 chars, and use this for the SUB.
    if(!this.tibParams.SUB){
        // Remove protocol + www.
        this.tibParams.SUB = this.tibParams.TIB.replace(/.*?:\/\//g, '');
        this.tibParams.SUB = this.tibParams.SUB.replace('www.', '');
        this.tibParams.SUB = Crypto.SHA256(this.tibParams.SUB);
        this.tibParams.SUB = this.tibParams.SUB.substr(0, 10);
        this.tibParams.SUB = "TIB-SHA256-" + this.tibParams.SUB;
    }
    console.log(this.tibParams.SUB);


    this.generateInitiatorURL = function(getQty){
        var initiator =  "?PAD=" + this.tibParams.PAD + (this.tibParams.TIB ? "&TIB=" + this.tibParams.TIB : '')
            + (this.tibParams.CBK ? "&CBK=" + this.tibParams.CBK : '') + (this.tibParams.SUB ? "&SUB=" + this.tibParams.SUB : '')
            + (this.tibParams.ASN ? "&ASN=" + this.tibParams.ASN + "&DSP=TRUE" : '');
        initiator = "https://tib.me/" + (getQty === true ? 'getqty/' : '') + initiator;
        return initiator;
    };

    this.tib = function(){
        //that.sweepOldTibs();
        var tibWindowName= "tibit";
        var tibWindowOptions= "height=721,width=640,menubar=no,location=no,resizable=no,status=no";
        // Use initiator params to generate URL, and open in new window
        window.open(this.generateInitiatorURL(), tibWindowName, tibWindowOptions);
    };

    this.getQTY = function(callback, caller){
        var that = this;
        var tibqty = new XMLHttpRequest();
        // generate URL to query, passing in "true" to specify that it is a /getqty/ request
        var initiatorURL = this.generateInitiatorURL(true);
        tibqty.open('GET', initiatorURL, true);

        tibqty.onreadystatechange = function(){
            if (tibqty.readyState === 4 && tibqty.status === 200) {
                that.QTY = JSON.parse(tibqty.response).QTY;
                callback.call(caller);
                console.log(that.QTY);
            }
        };
        tibqty.send();
    };

    return this;
}

function TibParams(obj) {

    this.PAD = "";
    this.SUB = "";
    this.CBK = "";
    this.ASN = "";
    this.DUR = "";
    this.TIB = "";

    for (prop in this) {
        this[prop] = obj[prop];
    }

    return this;
}