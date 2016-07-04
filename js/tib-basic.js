// Takes a JS object as a parameter
function tibInit(obj){
    var bd;
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
}

function TibHandler(obj){
    this.params = new tibParams;
    this.params.PAD = obj.PAD;
    this.params.TIB = obj.TIB;
    this.params.ASN = obj.ASN;
    this.params.CBK = obj.CBK;
    var tibWindowName= "tibit";
    var tibWindowOptions= "height=721,width=640,menubar=no,location=no,resizable=no,status=no";

    this.initButtons = function(){
        var that = this;
        this.sweepOldTibs();

        var buttons = document.getElementsByClassName('bd-tib-btn');
        var pageSUBs = [];

        for(var i = 0, n = buttons.length; i < n; i++){
            var e = buttons[i];
            e.tibParams = new tibParams();
            e.tibParams.SUB = e.getAttribute("data-bd-SUB") || "blank";
            e.classList.add("bd-subref-" + e.tibParams.SUB);
            e.tibParams.TIB = e.getAttribute("data-bd-TIB") || this.params.TIB || (window.location.hostname + window.location.pathname);
            e.tibParams.CBK = e.getAttribute("data-bd-CBK") || this.params.CBK;
            e.tibParams.ASN = e.getAttribute("data-bd-ASN") || this.params.ASN;
            e.tibParams.PAD = e.getAttribute("data-bd-PAD") || this.params.PAD;

            if ( localStorage["bd-subref-" + e.tibParams.SUB] && JSON.parse(localStorage.getItem('bd-subref-' + e.tibParams.SUB)).ISS ){
                e.classList.add("tibbed");  // add the tibbed class
            }

            e.addEventListener("click", this.tib(e.tibParams));

            console.log(e.tibParams);
        }

        window.addEventListener('storage', function(e){
           if(e.newValue && e.key.substr(0,10) === "bd-subref-"){
               that.ackElementsInClass(e.key);
           }
        });
    };

    this.tib = function(obj){
        var that = this;

        return function tib(e){
            that.sweepOldTibs();

            var tibInitiator = that.generateInitiator(obj);
            var tibWindow = window.open(tibInitiator, tibWindowName, tibWindowOptions);
            return tibWindow;

        }
    };

    this.generateInitiator = function(obj){
        var initiator = '?';
        for(key in obj){
            if(obj[key]){
                initiator += key;
                initiator += '=';
                initiator += obj[key];
                initiator += '&';
            }
        }

        initiator = "https://tib.me/" + initiator;
        return initiator;
    };

    this.ackElementsInClass = function(classToAck){
        var buttons = document.getElementsByClassName(classToAck);
        for (var j = 0, m = buttons.length; j < m; j++){
            var e = buttons[j];
            e.classList.add("tibbed");
        }
    };

    this.sweepOldTibs = function(){
        console.log('sweepOldTibs running');
        var expireLimit = Date.now() - this.params.DUR;
        var keysToRemove = [];

        if(localStorage.length){
            for(var k = 0, o = localStorage.length; k < o; k++){
                var key = localStorage.key(k);
                var ISS;
                if(key.substr(0,10) === "bd-subref-" ){
                    var localStorageJSON;
                    try{
                        localStorageJSON = JSON.parse(localStorage.getItem(key));
                        ISS = localStorageJSON.ISS;
                    }
                    catch(err){
                        console.log(err);
                        /* If localStorage value is not a JSON string, convert it to one and continue */
                        localStorageJSON = localStorage.getItem(key); /* Get raw date string from localstorage */
                        localStorageJSON = {'ISS' : localStorageJSON}; /* Convert string to JS object */
                        localStorageJSON = JSON.stringify(localStorageJSON); /* Convert JS object to JSON string */
                        ISS = localStorageJSON.ISS; /* Save ISS to variable for later usage */
                        localStorage.setItem(key, localStorageJSON); /* Re-set localstorage value to JSON string */
                    }
                }
                if(Date.parse(ISS) < expireLimit){
                    keysToRemove.push(key);
                }
            }
        }
        if(keysToRemove.length){
            for(var i= 0, n = keysToRemove.length; i < n; i++){
                localStorage.removeItem(keysToRemove[i]);
            }
        }

    }

}

function tibParams(){
    this.PAD = null;
    this.SUB = null;
    this.TIB = null;
    this.CBK = null;
    this.ASN = null;
    this.DUR = 86400000; // ( 1000ms/s ⨉ 60s/m x ⨉ 60 m/h ⨉ 24h/d )

    return this;
}