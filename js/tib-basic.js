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
               bd.initButtons(obj, 'bd-tib-btn');
            });
        }
        else{
            bd.initButtons( obj, 'bd-tib-btn' );
        }

        return bd;

    });
}

function TibHandler(obj){
    this.tibParams = new TibInitiator({}, obj);

    this.initButtons = function(){
        var that = this;
        this.sweepOldTibs();

        var buttons = document.getElementsByClassName('bd-tib-btn');
        var pageSUBs = [];

        for(var i = 0, n = buttons.length; i < n; i++){
            // Save current button to e for simpler reference
            var e = buttons[i];

            // Create and populate our localParams object from data-bd attributes
            var localParams = {};
            localParams.TIB = e.getAttribute("data-bd-TIB");
            localParams.SUB = e.getAttribute("data-bd-SUB");
            localParams.CBK = e.getAttribute("data-bd-CBK");
            localParams.ASN = e.getAttribute("data-bd-ASN");
            localParams.PAD = e.getAttribute("data-bd-PAD");

            // Generate TibInitiator for button, feeding in global/default params + local params
            e.tibInitiator = new TibInitiator(localParams, this.tibParams);
            // Add subref class for easier reference later
            e.classList.add("bd-subref-" + e.tibInitiator.SUB);

            if ( localStorage["bd-subref-" + e.tibInitiator.SUB] && JSON.parse(localStorage.getItem('bd-subref-' + e.tibInitiator.SUB)).ISS ){
                e.classList.add("tibbed");  // add the tibbed class
            }

            // Watch for button clicks and initiate tib
            e.addEventListener("click", this.tib(e.tibInitiator));

            // Attempt to grab counter
            var c = e.getElementsByClassName('bd-btn-counter')[0];

            // If the button has a counter, either send a new QTY
            if(c){
                // indexOf returns -1 if the item is not found in array
                if( pageSUBs.indexOf(e.tibInitiator.SUB) === -1){
                    pageSUBs.push(e.tibInitiator.SUB);
                    // Initiate counter request for given SUB
                    this.getCounter(e.tibInitiator);
                }
                // Marks counter to be updated when counter request comes back
                e.classList.add('bd-qty-pending');
            }

        }

        // Localstorage event listener - watches for changes to bd-subref-x items in localStorage
        window.addEventListener('storage', function(e){
           if(e.newValue && e.key.substr(0,10) === "bd-subref-"){
               that.ackElementsInClass(e.key);
           }
        });
    };

    this.tib = function(initiator){
        var that = this;

        // Sweep localStorage for old tibs and open tib window
        return function tib(e){
            if ( e.currentTarget.classList.contains('tibbed') ) {
                return false;
            }
            that.sweepOldTibs();
            var tibWindowName= "tibit";
            var tibWindowOptions= "height=721,width=640,menubar=no,location=no,resizable=no,status=no";
            // Use initiator params to generate URL, and open in new window
            return window.open(initiator.generateInitiatorURL(), tibWindowName, tibWindowOptions);
        }
    };

    this.getCounter = function(initiator){
        var that = this;

        var tibqty = new XMLHttpRequest();
        // generate URL to query, passing in "true" to specify that it is a /getqty/ request
        var initiatorURL = initiator.generateInitiatorURL(true);

        tibqty.open('GET', initiatorURL, true);

        tibqty.onreadystatechange = function(){
            if (tibqty.readyState === 4 && tibqty.status === 200) {
                var QTY = JSON.parse(tibqty.response).QTY;
                that.writeCounters(initiator, QTY)
            }
        };
        tibqty.send();
    };

    this.writeCounters = function(initiator, QTY){
        // Grab buttons matching the passed initiator's subref
        var buttons = document.getElementsByClassName("bd-subref-" + initiator.SUB);
        for(var l = 0, p = buttons.length; l < p; l++){
            var e = buttons[l];
            var c = e.getElementsByClassName('bd-btn-counter')[0];
            // If the button has a counter and the counter has been marked pending, replace
            // the counter content with the retrieved QTY
            if(c && e.classList.contains('bd-qty-pending')){
                c.textContent = QTY;
                e.classList.remove('bd-qty-pending')
            }
        }
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
        var expireLimit = Date.now() - this.tibParams.DUR;
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

function TibInitiator(localParams, globalParams){
    this.PAD = localParams.PAD || globalParams.PAD;
    this.TIB = localParams.TIB || globalParams.TIB;
    this.SUB = localParams.SUB || globalParams.SUB;
    this.CBK = globalParams.CBK;
    this.ASN = localParams.ASN || globalParams.ASN;

    // If no SUB is provided, generate SHA256 hash, truncate to 10 chars, and use this for the SUB.
    if(!this.SUB){
        // Remove protocol + www.
        this.SUB = this.TIB.replace(/.*?:\/\//g, '');
        this.SUB = this.SUB.replace('www.', '');
        this.SUB = Crypto.SHA256(this.SUB);
        this.SUB = this.SUB.substr(0, 10);
        this.SUB = "TIB-SHA256-" + this.SUB;
    }

    this.DUR = 86400000; // ( 1000ms/s ⨉ 60s/m x ⨉ 60 m/h ⨉ 24h/d )

    // build initiator URL with generated params
    this.generateInitiatorURL = function(getQty){
        var initiator =  "?PAD=" + this.PAD + (this.TIB ? "&TIB=" + this.TIB : '')
            + (this.CBK ? "&CBK=" + this.CBK : '') + (this.SUB ? "&SUB=" + this.SUB : '')
            + (this.ASN ? "&ASN=" + this.ASN + "&DSP=TRUE" : '');
        initiator = "https://tib.me/" + (getQty === true ? 'getqty/' : '') + initiator;
        return initiator;
    };

    return this;
}