// Page with buttons:


// at foot of page
//     var bd= tibHandler( "' . $PAD . '", "' . $CBK .'");
//     bd.eventListeners(); 


// Callback page:
// 



/* CALLBACK HANDLING FUNCTIONS */
// These should probably also go in a closure.




	function bdProcessToken() {

		if ( bdStorageAvailable('localStorage') ) {

			try {

				var token = bdExtractUrlToken( window.location); // token expected in GET params
				
				bdPersistAck( token.SUB, token.ISS);

				// bdSweepOldTibs( bd_DURATION);  Leaving out from here, so duration easily controlled from tib-button page

				bdCloseCallbackWindow();

			}

			catch (e) {
				msg=  document.createElement('p');
				msg.appendChild(document.createTextNode( e.message + "<br>" + e.stack ));
				msg.appendChild(document.createTextNode( "bd: tib callback - tib paid but cannot persist"));
				throw("bd: tib callback - tib paid but cannot persist");
			}
		}
	}




	function bdExtractUrlToken( url){

		// for clarity, steps are individually broken down, reusing a single variable

		var token= new URI(url); 

		token= token.query(true); // retreive the querystring parameters into js object
		token= token.tibtok; // pull out the value of the tibtok= querystring parameter
		token= URI.decode(token); // convert any percent-encoded characters
		token= atob(token); // base64 decode the token
		token= JSON.parse(token); // convert the serialised json token string into js object

		return token;
	}




	function bdPersistAck( SUB, ISS ){

		// localStorage, becauase we want:
		// 1) to persist the tib acknowledgement across sessions, and 
		// 2) sessionStorage is window-specific, so no good for message passing

		// [TODO] fallback to cookie storage

		localStorage.setItem("bd-subref-" + SUB, ISS);

		// SUB is the subreference provided in the tib initiator
		// ISS is the timestamp of when the token for this tib was first issued

		// Removed when no longer required by 
		
	}





	function bdCloseCallbackWindow( ) {

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
	}




	function bdStorageAvailable(type) {

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
	}







/* TIB INITIATION FUNCTIONS */


	function tibHandler( PAD, CBK, ackDuration) {


		var tibWindowName= "tibit";

		var tibWindowOptions= "height=600,width=640,menubar=no,location=no,resizable=no,status=no";



		this.tib= function( SUB, TIB) {

			return function tib(e){

				if ( e.currentTarget.classList.contains('tibbed') ) {
					window.open("https://tib.me/account_overview",tibWindowName,tibWindowOptions);
					return false;
				}
				
				var tibInitiator = "?PAD=" + PAD + "&TIB=" + TIB + "&CBK=" + CBK + "&SUB=" + SUB;

				tibInitiator = "https://tib.me/" + tibInitiator; // + "&ACK=" + ackDuration; // + "&noclose=true";

				var tibWindow= window.open(tibInitiator,tibWindowName,tibWindowOptions);
				return tibWindow;
			};
		};


		this.eventListeners= function( bdButtonClass) {

			// Install button click handlers
			// also adds the bd-subref-[SUB] class to each button

			bdButtonClass= bdButtonClass || "bd-tib-btn";

			var bdElements= document.getElementsByClassName( bdButtonClass);

			for (var i=0, n=bdElements.length; i<n; i++) {
				var e= bdElements[i];
				e.classList.add("bd-subref-" + e.getAttribute("data-bd-SUB"));
				e.addEventListener("click", tib( e.getAttribute("data-bd-SUB"), e.getAttribute("data-bd-TIB")));
			}


			// Install storage event handler

			window.addEventListener('storage', function(e) {

				// fired when localStorage is updated by bdPersistAck
				// e.newValue will be null if a remove event

				if ( e.newValue && e.key.substr(0,10) === "bd-subref-") {
					ackElementsInClass(e.key);
				}
			}); 

		};


		this.sweepOldTibs= function()  {

			// deletes all expired tibs from localStorage
			// nb: all tibs for the domain must have the same acknowledgement duration for this to be reliable

			var expireLimit = Date.now() - (1000 * 60 * 60 * 24 * ackDuration); // (1000ms/s ⨉ 60s/m ⨉ 60 m/h ⨉ 24h/d)
			
			// any tibs with an issue time prior to expireLimit are out of date, and can be removed

			for (var i = 0, n=localStorage.length; i < n; i++) {
				var key= localStorage.key(i);
				if ( key.substr(0,10) === "bd-subref-" ) {

					if ( Date.parse(localStorage.getItem(key)) < expireLimit ) {
						localStorage.removeItem(key);
					}
			    }
			}
		};





		/* ACKNOWLEDGE TIB FUNCTIONS */



		this.ackElementsInClass =function( bdClassName) {
			var bdElements= document.getElementsByClassName( bdClassName);
			for (var i=0, n=bdElements.length; i<n; i++) {
				bdElements[i].classList.add("tibbed");
			}
			return i;
		};



		this.ackByClass =function( bdButtonClass) {

			// alternative approach - use when there are fewer buttons in the DOM than potential ack'd tibs to check

			// starting with the DOM and hunting the persistent storage for matched tib records may be quicker for others
			// requires a class to have been applied to all elements to check.

			bdButtonClass= bdButtonClass || "bd-tib-btn";

			sweepOldTibs( bd_DURATION);

			var bdElements= document.getElementsByClassName( bdButtonClass);

			for (var i=0, n=bdElements.length; i<n; i++) {    // iterate through elements with .bdButtonClass

				var e= bdElements[i];
				if ( localStorage["bd-subref-" + e.getAttribute("data-bd-SUB")] ) {  // is there a matching tib record in localStorage?
					e.classList.add("tibbed");  // add the tibbed class 
				}
			}
		};



		this.ackByStorage= function() {
			
			// iterates through localStorage, adds "tibbed" class to any matched DOM Elements for persisted tibs

			sweepOldTibs( bd_DURATION);

			for (var i=0, n=localStorage.length; i<n; i++) {
				var key= localStorage.key(i);

				if ( key.substr(0,10) === "bd-subref-" ) {
					ackElementsInClass(key);
			    }
		    }
		};



		this.ackBySubref =function( SUB ) {

			// when the specific subref is known

			sweepOldTibs( bd_DURATION);
			
			var key="bd-subref-" + SUB;

			if( localStorage[key] ) {
				ackElementsInClass(key);
			}
		};



	}





	
