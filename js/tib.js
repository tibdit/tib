// Page with buttons:
// at foot of page
//     var bd= new tibHandler( $PAD, $CBK, $ACK);   $ACK is number of days, or minutes if $PAD is testnet
//     bd.initButtons( url-to-buttons-svg-parent, all-buttons-class); 


// Callback page:
// 		var bd= new tibCallback()
//		bd.processToken( url-containing-token-in-querystring); typically window.location




/* CALLBACK HANDLING FUNCTIONS */
// These should probably also go in a closure.



function tibCallback() {

	this.processToken= function( url) {

		if ( this.storageAvailable('localStorage') ) {

			try {

				var token = this.extractUrlToken( url); // token expected in GET params
				
				this.persistAck( token.SUB, token.ISS);

				this.closeWindow();
			}

			catch (e) {
				msg=  document.createElement('p');
				msg.appendChild(document.createTextNode( e.message + "<br>" + e.stack ));
				msg.appendChild(document.createTextNode( "bd: tib callback - tib paid but cannot persist"));
				throw("bd: tib callback - tib paid but cannot persist");
			}
		}
	};



	this.extractUrlToken= function( url){

		// for clarity, steps are individually broken down, reusing a single variable

		var token= new URI(url); 

		token= token.query(true); // retreive the querystring parameters into js object
		token= token.tibtok; // pull out the value of the tibtok= querystring parameter
		token= URI.decode(token); // convert any percent-encoded characters
		token= atob(token); // base64 decode the token
		token= JSON.parse(token); // convert the serialised json token string into js object

		return token;
	};



	this.persistAck= function( SUB, ISS ){

		// localStorage, becauase we want:
		// 1) to persist the tib acknowledgement across sessions, and 
		// 2) sessionStorage is window-specific, so no good for message passing

		// [TODO] fallback to cookie storage

		localStorage.setItem("bd-subref-" + SUB, ISS);

		// SUB is the subreference provided in the tib initiator
		// ISS is the timestamp of when the token for this tib was first issued

		// Removed when no longer required by 
		
	};



	this.closeWindow= function( ) {

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



	this.storageAvailable= function(type) {

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


}






/* TIB INITIATION FUNCTIONS */

// var bd= new tibHandler(...)


function tibHandler( PAD, CBK, ackDuration) {

	var tibWindowName= "tibit";

	var tibWindowOptions= "height=600,width=640,menubar=no,location=no,resizable=no,status=no";

	var testnet= false;

	if ( "mn2".search(PAD.substr(0,1)) != "-1" ) {  
		// testnet bitcoin address, DUR is minutes
		ackDuration= Math.min( 5, ackDuration); // minimum 5 minutes
		ackDuration*=  60000; // ( 1000ms/s ⨉ 60s/m ) 
		testnet= true;
	} 
	else { 
		// not a testnet bitcoin address, DUR is days
		ackDuration= Math.min( 1, ackDuration); // minimum 24 hours
		ackDuration*=  86400000; // ( 1000ms/s ⨉ 60s/m x ⨉ 60 m/h ⨉ 24h/d ) 
	}

	this.tib= function( SUB, TIB) {

		// construct tib initiator and open tibit popup

		return function tib(e){

			if ( e.currentTarget.classList.contains('tibbed') ) {
				window.open("https://tib.me/account_overview",tibWindowName,tibWindowOptions);
				return false;
			}
			
			var tibInitiator = "?PAD=" + PAD + (TIB ? ("&TIB=" + TIB) : '')+ (CBK ? ("&CBK=" + CBK) : '') + (SUB ? ("&SUB=" + SUB) : '');

			tibInitiator= "https://tib.me/" + tibInitiator; // + "&noclose=true";

			var tibWindow= window.open(tibInitiator,tibWindowName,tibWindowOptions);
			return tibWindow;
		};
	};



	this.initButtons= function( parentUrl, buttonClass) {

		// install button click handlers 
		// adds the bd-subref-[SUB] class to each button
		// adds the bt-tib-btn-[btnName] class to each button
		// install storage event handler
		// loads inline button SVG into DOM

		var that=this;

		buttonClass= buttonClass || "bd-tib-btn";


		this.sweepOldTibs();

		var buttons= document.getElementsByClassName( buttonClass);
		var buttonNames= [];



		for (var i=0, n=buttons.length; i<n; i++) {
			var e= buttons[i];
			
			e.classList.add("bd-subref-" + e.getAttribute("data-bd-SUB"));
			e.classList.add( buttonClass + "-" + e.getAttribute("data-bd-btn-name"));

			if ( localStorage["bd-subref-" + e.getAttribute("data-bd-SUB")] ) {  
				e.classList.add("tibbed");  // add the tibbed class 
			}

			if (testnet) {
				e.classList.add("testnet");
			}


			e.addEventListener("click", this.tib( e.getAttribute("data-bd-SUB"), e.getAttribute("data-bd-TIB")));
			buttonNames.push( e.getAttribute("data-bd-btn-name"));
		}

		// Install storage event handler

		window.addEventListener('storage', function(e) {

			// fired when localStorage is updated by persistAck
			// e.newValue will be null if a remove event

			if ( e.newValue && e.key.substr(0,10) === "bd-subref-") {
				that.ackElementsInClass(e.key);
			}
		});

		// load inline button SVG into DOM
		buttonNames= buttonNames.filter(function (v, i, a) { return a.indexOf (v) == i; });
		for (var j=0, m=buttonNames.length; j<m; j++) {
			this.loadButton( parentUrl, buttonNames[j]);
		}
	};



	this.sweepOldTibs= function()  {

		// deletes all expired tibs from localStorage
		// nb: all tibs for the domain must have the same acknowledgement duration for this to be reliable

		expireLimit = Date.now() - ackDuration;

		// any tibs with an issue time prior to expireLimit are out of date, and can be removed

		for (var i=0, n=localStorage.length; i<n; i++) {
			var key= localStorage.key(i);
			if ( key.substr(0,10) === "bd-subref-" ) {

				if ( Date.parse(localStorage.getItem(key)) < expireLimit ) {
					localStorage.removeItem(key);
				}
		    }
		}
	};



	this.loadButton= function( parentUrl, buttonName){

		// cache-friendly load button SVG and inline it inside the DOM <buttons>
		// svg loaded from [parentUrl]/bd-tib-btn-[buttonName].svg

		buttonName= buttonName || "default";

		var tibbtn= new XMLHttpRequest();
		tibbtn.open("GET", parentUrl + "/bd-tib-btn-" + buttonName + ".svg", true);
		tibbtn.send();

		tibbtn.onreadystatechange= function( ) {
			if (tibbtn.readyState == 4 && tibbtn.status == 200) {
	    		writeButtons( );
			}
		};

	    function writeButtons( ){
	    	
	    	var buttons= document.getElementsByClassName( "bd-tib-btn-" + buttonName);

			for (var i=0, n=buttons.length; i<n; i++) {
				var e= buttons[i];
				e.innerHTML=tibbtn.responseText;
			}
	    }
	};




	/* ACKNOWLEDGE TIB FUNCTIONS */



	this.ackElementsInClass= function( classToAck) {

		// add 'tibbed' class to all buttons with classToAck

		var buttons= document.getElementsByClassName( classToAck);
		for (var i=0, n=buttons.length; i<n; i++) {
			buttons[i].classList.add("tibbed");
		}
		return i;
	};



	this.ackByClass= function( buttonClass) {

		// alternative approach - use when there are fewer buttons in the DOM than potential ack'd tibs to check

		// starting with the DOM and hunting the persistent storage for matched tib records may be quicker for others
		// requires a class to have been applied to all elements to check.

		buttonClass= buttonClass || "bd-tib-btn";

		this.sweepOldTibs( ackDuration);

		var buttons= document.getElementsByClassName( buttonClass);

		for (var i=0, n=buttons.length; i<n; i++) {    // iterate through elements with .buttonClass
			var e= buttons[i];
			// for each button, is there a matching tib record in localStorage?
			if ( localStorage["bd-subref-" + e.getAttribute("data-bd-SUB")] ) {  
				e.classList.add("tibbed");  // add the tibbed class 
			}
		}
	};



	this.ackByStorage= function() {
		
		// iterates through localStorage, 
		// acks class for localStorage entries with bd-subref- prefix

		this.sweepOldTibs( ackDuration);

		for (var i=0, n=localStorage.length; i<n; i++) {
			var key= localStorage.key(i);

			if ( key.substr(0,10) === "bd-subref-" ) {
				this.ackElementsInClass(key);
		    }
	    }
	};



	this.ackBySubref= function( SUB ) {

		// when the specific subref is known, just derive class
		// and ack that class

		this.sweepOldTibs( ackDuration);
		
		var key="bd-subref-" + SUB;

		if( localStorage[key] ) {
			this.ackElementsInClass(key);
		}
	};


}


