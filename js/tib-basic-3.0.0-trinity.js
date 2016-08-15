var TIBIT = (function( settings) {

	// Ed25519 crypto-signature validation commented out as probably not appropriate.

	if (typeof settings === 'undefined') settings= {};

	var params = {
		PAD : settings.PAD || "mytibs9YhLYtrVhQkmTdbDS51H54WyrxTx",  // Payment Address - Bitcoin address tib value will be sent to mytibs... is a demo 'testnet' address 
		SUB : settings.SUB || 'TRINITY-MANCHESTER-SCHOOLS-' + window.location.pathname.substring(window.location.pathname.lastIndexOf('/')+1),   // Subreference - Identifies the specific item being tibbed for any counter
		CBK : settings.CBK || window.location.origin,  // Callback - the users browser will be redirected here qith the tib token in the querystring once the tib is confirmed
		ASN : "",  // Assignee - 3rd party that tib value will be sent to.  Only valid if PAD not specified
		TIB : settings.TIB || window.location.hostname  // URL used to retreive the snippet telling the user what they are tibbing
	};


	// var publicKey="e8snUZzmQ8H9jeSzcQdJw9nXyPMPZm+IMgANTeU2UaY=";  // TODO, verify exists at tibit.com via HTTP request
	var pollInterval;  //    initiatorHash= sha1(this.querystring()).substr(0,10);
	

	function initiate( localCallback) {

		// opens the tibit popup window, watches for tib.me callback
		// triggers dynamic async load of NaCl for later tib token validation

		var tibWindowName= "tibit", 
			tibWindowOptions= "height=721,width=640,menubar=no,location=no,resizable=no,status=no";

		var tibUrl= document.createElement('a');
		tibUrl.href= "///"; // initialise element location 
		tibUrl.hostname= "tib.me";
		tibUrl.protocol= "https";

		// $script('https://cdnjs.cloudflare.com/ajax/libs/tweetnacl/0.14.3/nacl.min.js|sha384-bOP0pHRviZwosKjwWv7JBiF0Z6HgeNkLr5ssOm+zO7R2DCnjgRTES0LLTZeocLrF', 'nacl');

		tibUrl.search = "?";
		for ( var param in params ) {
				tibUrl.search += param;
				tibUrl.search += "=";
				tibUrl.search += encodeURIComponent(this.params[param]);
				tibUrl.search += "&";
		}
		tibUrl.search= tibUrl.search.substr(0,tibUrl.search.length-1);  // remove trailing ampersand

		// tibUrl.search += "&noclose"; // testing

		tibWindow= window.open( tibUrl.href, tibWindowName, tibWindowOptions);
		tibWindow.initialHref= tibWindow.location.href;  // we reuse existing popup if not closed, need to skip early callbackDone() cycles till redirected 

		pollInterval= setInterval( function() {
			callbackHandler( tibWindow, localCallback);
			// console.log("waiting", pollInterval);
		}, 100);
	}



	function callbackHandler( tibWindow, localCallback) {

		// checks popup window state, extacts and verifies token if available
		// called periodically via pollInterval

		if (callbackDone( tibWindow)) {
			token= extractTibToken( tibWindow.location.search);
			closeWindow( tibWindow);  // noclose querystring parameter is buggy - comment out this line to keep popup window open
			if (validateTibToken( token)) {
				localCallback( token);
				}
			else {
				throw( "invalid tib token received");
			}
		}
	}



	function extractTibToken( querystring) {

		// extract the token and signature from the callback querystring

		var token, tokenObj, signature;

		var reTok= "[^\?]*\?(.*&)?tibtok=([^&]*)"; 
		token= querystring.match(reTok)[2]; // extract the value of the tibtok= querystring parameter
		token= decodeURIComponent(token); // convert any percent-encoded characters
		token= atob(token); // base64 decode the token
		tokenObj= JSON.parse(token); // convert the serialised json token string into js object

		// var reSig= "[^\?]*\?(.*&)?tibsig=([^&]*)"; 
		// signature= querystring.match(reSig)[2]; // extract the value of the tibsig= querystring parameter
		// signature= decodeURIComponent(signature); // convert any percent-encoded characters (leave as base64)

		// TODO add error checking and error return 	 e.g. badly formed callback href ??

		return {
			json: token,
			// signature: signature,
			obj: tokenObj
		};  
	}



	function validateTibToken( token, localCallback) {

		// check the returned data represents a valid tib

		var ok= false;  	

		token.timestamp= new Date(token.obj.SEN || token.obj.ISS);
		token.offset= Date.now() - token.timestamp.getTime();

		if (token.offset > (5 * 60 * 1000) || token.offset < -(20 * 1000)) {
			// tib token issued more than five minutes ago
			// or more than 20 seconds into the future
			return false;
		}

		// $script.ready('nacl', function() {   // wait till NaCl.js loaded if needed
		// 	try {
		// 		if ( nacl.sign.detached.verify( token.json.toBytes(), token.signature.toBytes64(), publicKey.toBytes64()) ) {
		// 			localCallback( true);
		// 		}
		// 		else {
		// 			localCallback( false);
		// 		}
		// 	}

		// 	catch(ex) { 
		// 		localCallback( false);
		// 	}

			// TODO validate the tib initiator hash (token.INI)
			// TODO persist the tib for 24 hrs in localStorage
		// });

		return true;
	}




	function callbackDone( tibWindow){

		// examines popup window location, and returns true if callback occured 
		// cancels polling where appropriate

		try {
			if (tibWindow.closed) { 
				clearInterval(pollInterval);  // window closed externally, no callback with token
				return false;
			}
			domain= tibWindow.location.hostname; // Should throw e.SECURITY_ERR if on different origin
		}

		catch(ex) {
			if (ex.code === ex.SECURITY_ERR) return false;  // tib window is still on another domain (i.e. //tib.me) - keep waiting 
			else {  
				clearInterval(pollInterval);  // some unexpected error - abort polling - leave tib window open
				throw ex;
			}
		}

		if (tibWindow.initialHref === tibWindow.location.href || domain.length === 0) return false;  // window is accessible, but probably still initialising - keep waiting
		if (domain.substr(domain.length-6) === "tib.me") return false; // insecure browser lets us see cross domain - keep waiting

		clearInterval(pollInterval);    // tib window is done - token expected
		return true;
	}



	function closeWindow( tibWindow) {

		// close the popup window once the tib callback has been processed

		var re= "[^\?]*\?(.*&)?noclose($|[=&])";  // add noclose querystring parameter to initiator (buggy - not always included in callback)
		if ( tibWindow.location.search.search(re) !== -1 ) return false;  // to prevent popup window from being automatically closed

		try {
			tibWindow.close();
		}
		catch(ex) { console.error( "attempt to automatically close callback window failed"); }

		return false; // function should never return, since window is gone
	}


	
	return {
		initiate: initiate,
		params: params
	};



}( ));



