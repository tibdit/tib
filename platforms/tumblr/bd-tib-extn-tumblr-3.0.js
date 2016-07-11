/* tumblr extension version 0.2 */

BDTibExtension = function( PAD, DUR, CBK, ASN, PLT, params){


    this.primaryTibQtyReqs = {}; /* TODO: consolidate primary and additional tibQtyReqs under single object */
    this.additionalTibQtyReqs = {};
    that = this;

    this.extensionInit = function(){
        /* Our functions to be executed once the extension has initialised */

        var graphicalButtonList = document.getElementsByClassName('bd-tib-btn'); /* Grabbing our primary buttons
         based on class */
        for(var i=0; i < graphicalButtonList.length; i++){ /* Cycling through the button list */
            // Cycling through our array of graphical buttons
            var postContainer = this.findPostContainer(graphicalButtonList[i]); /* Attempting to retrieve the
             containing post of the current grpahical button */
            if(postContainer){ /* Continue executing if we successfully found the container */
                var textButton = this.findTextButton(postContainer); /* Attempting to pull a text button within
                 the current post */
                var SUB = graphicalButtonList[i].getAttribute('data-bd-SUB'); /* Grabbing the SUB of
                 the button, which will be set from the snippet we insert into peoples themes */
                if(textButton) { /* If we found a text button, we want to initiate a QTY request so that we can
                 add this value to the primary buttons counter */
                    queryParams = this.getTxtBtnQueryParams(textButton); /* Pulling the GET parameters from the
                     URL of the text tib button */
                    textButton.style.display = 'none';

                    this.initiateQtyRequest(queryParams, SUB);
                }
                else{
                    this.additionalTibQtyReqs[SUB] = false;
                    /* If we didn't find a text tib button, we set the value of the corresponding SUB within
                     additionalTibQtyReqs to false to signify the absense of a text button */
                }
            }

        }
    };

    this.initiateQtyRequest = function(queryParams, primarySUB){
        /* initiating a tibqty request, using the params of the additional button, and the SUB of the primary button
         with which we want to associate this counter with */

        this.additionalTibQtyReqs[primarySUB] = new XMLHttpRequest();
        var tibQtyFetchURL; /* Our string to make our request to */

        /* Constructing a string of GET params to use in our URL, based on the GET params of the original text button */
        tibQtyFetchURL = "?PAD=" + queryParams.PAD + (queryParams.TIB ? "&TIB=" + queryParams.TIB : '') + (queryParams.SUB ? "&SUB=" + queryParams.SUB : '') + (queryParams.ASN ? "&ASN=" + queryParams.ASN + "&DSP=TRUE" : '');

        tibQtyFetchURL = "https://tib.me/getqty/" + tibQtyFetchURL; /* Appending our GET params to the tib.me/getqty/
         base URL */

        this.additionalTibQtyReqs[primarySUB].open( 'GET', tibQtyFetchURL, true);
        this.additionalTibQtyReqs[primarySUB].send();
        this.additionalTibQtyReqs[primarySUB].SUB = primarySUB;
        var that = this;
        this.additionalTibQtyReqs[primarySUB].onreadystatechange = this.additionalCounterHandler;
        /* Setting additionalCounterHandler as the onreadystatechange handler for this request */

    }

    this.counterHandler = function(primaryTibQty, that){
        /* onreadystatechange handler for our primary QTY request. This is set from tib.js - a function is called
         onreadystatechange that executes and returns the product of running customCounterHandler, feeding the
         tibqty and tibHandler objects in as parameters */

        var SUB = primaryTibQty.SUB; /* Storing primaryTibQty in the SUB variable for more concise usage */
        var additionalTibQty = that.additionalTibQtyReqs[SUB]; /* Pulling in any HTTPRequest objects in the
         additionalTibQtyReqs of the extension object  */
        if(additionalTibQty) { /* If we have an additionalTibQty for this subref, we want to wait for both the
         additional quantity request AND the primary quantity request to return before writing the counter */
            if (this.checkXMLReqCompletion(primaryTibQty) && this.checkXMLReqCompletion(additionalTibQty)) {
                var QTY = JSON.parse(primaryTibQty.response).QTY;
                var additionalQTY = JSON.parse(additionalTibQty.response).QTY;

                this.primaryTibQtyReqs[SUB] = { completed: true, QTY: QTY }; /* Removing and re-setting primary and
                 additional tibQty reqs to simple objects containing the actual QTY value themselves */
                this.additionalTibQtyReqs[SUB] = { completed: true, QTY: additionalQTY };
                QTY += additionalQTY || 0; /* Parse the
                 response from additionalTibQty and add this QTY to our primary QTY if present, otherwise add nothing */
                that.writeCounter(SUB, QTY);
                /* At this point, our custom handling is complete and we can call tibHandler.writeCounter with our
                 new values to proceed through tib.js as usual */
            }
        }
        else{ /* As additionalTibQtys are initiated before getCounter, and thusly before customCounterHandler, if we
         have no HTTP request set for a given SUB, we can simply check the status of the primaryTibQty and proceed
         accordingly */
            if (this.checkXMLReqCompletion(primaryTibQty)) {
                var QTY = JSON.parse(primaryTibQty.response).QTY;
                primaryTibQty = { completed: true, QTY: QTY };
                that.writeCounter(SUB, QTY);
                /* We have no additional counter to combine with our primary counter, so we call
                 tibHandler.writeCounter and proceed with the flow of tib.js as usual */
            }
        }
    }

    this.checkXMLReqCompletion = function(XMLReq){
        if(XMLReq.__proto__ == new XMLHttpRequest().__proto__){
            if(XMLReq.readyState === 4 && XMLReq.status === 200){
                return true;
            }
            else{
                return false;
            }
        }
        else if(typeof XMLReq === 'object' && XMLReq !== null){
            if (XMLReq.completed === true){
                return true;
            }
        }
        return false;
    }

    this.additionalCounterHandler = function(additionalTibQtyReq){
        additionalTibQtyReq = additionalTibQtyReq.currentTarget; /* Setting additionalTibQtyReq from the calling
         event to the XMLHttpRequest object that is the target of the event */
        var SUB = additionalTibQtyReq.SUB; /* Setting SUB to the subref of the button with which we want to
         associate our additional counter with */
        var primaryTibQty = this.primaryTibQtyReqs[SUB]; /* Grabbing the primary QTY XMLHttpRequest from
         ext.primaryTibQtyReqs */
        if(typeof primaryTibQty === 'undefined') { /* If the primary QTY request hasn't been created, we want to
         return and wait for it */
            return;
        }
        else if (this.checkXMLReqCompletion(additionalTibQtyReq) && this.checkXMLReqCompletion(primaryTibQty)) {
            /* In the unlikely case that the additionalCounter request comes back before the primary, we want to add the
             QTY values of these together and call tibHandler.writeCounter */
            var QTY = JSON.parse(primaryTibQty.response).QTY;
            var additionalQTY = JSON.parse(additionalTibQtyReq.response).QTY;
            this.primaryTibQtyReqs[SUB] = { completed: true, QTY: QTY };
            this.additionalTibQtyReqs[SUB] = { completed: true, QTY: additionalQTY};
            QTY += additionalQTY || 0;
            that.writeCounter(SUB, QTY);
        }
    }
    this.additionalCounterHandler = this.additionalCounterHandler.bind(this);
    /* Binding our additionalCounterHandler method to the BDTibExtension object, so that the extension object is
     accessible within the event handler (would otherwise be the XMLHttpRequest object */

    this.getTxtBtnQueryParams = function(btn){
        /* Taking our text button, grabbing the href from the tumblr redirect, extracting the GET params, and returning
         the query params as a URI object  */
        var href = '';
        href = btn.getAttribute('href');
        href = decodeURIComponent(href);
        href = href.split('z='); /* Pulling the part of the href string that tumblr is redirecting to */
        href = href[1];
        var queryParams = URI(href).query(true);

        return queryParams;
    }

    this.findPostContainer = function(el, counter){
        /* Search upwards through the element's parents to find the containing post element */
        counter = counter || 0; /* Initialising the counter at 0 if not set */

        selectors = ['article', '.post', '#post', '.posts', '.postcontent']; /* The array of selectors that we want
         to compare with */
        while(counter < 10){
            /* Iterating 10 elements upwards in the DOM hierarchy */
            if(!el.parentNode){ return false; } /* If the element has no parent, give up */
            el = el.parentNode;

            for(var k = 0; k < selectors.length; k++){ /* Iterating through our selector list */
                if(!el.parentNode){ return false; }

                if(selectors[k].substring(0, 1) === '.'){ /* Class selector block */
                    if(el.classList.contains(selectors[k].substring(1)) && el.getElementsByClassName(selectors[k].substring(1)).length === 0){
                        return el;
                    }
                }
                else if(selectors[k].substring(0, 1) === '#'){ /* ID selector block */
                    if(el.getAttribute('id') === selectors[k].substring(1) && el.getElementsByClassName(selectors[k].substring(1)).length === 0){
                        return el;
                    }
                }
                else{ /* Tagname selector block */
                    if(el.tagName.toLowerCase() === selectors[k] && el.getElementsByTagName(selectors[k]).length === 0){
                        return el
                    }

                }
            }
            this.findPostContainer(el, counter + 1);
            /* Calling our function again, with an incremented counter and the new element (at this point one level
             up in the DOM hierarchy */
        }
    }

    this.findTextButton = function(postContainer){
        /* Simply searches the element provided for the text button class, and returns the first result */
        var textButton = postContainer.getElementsByClassName('bd-tib-btn-tumblr-txt');
        return textButton[0];
    }

    var originalAckBySubref = this.ackBySubref;
    this.ackBySubref = function(SUB, QTY){
        /* Runs in place of preAckBySubref - adds the additional QTY attached to the provided subref if present, and
         runs ackBySubref using Function.prototype.call to ensure the function runs in the context of the tibHandler
         rather than the BDTibExtension object */
        var additionalTibQty = this.additionalTibQtyReqs[SUB];
        if(additionalTibQty){
            QTY += additionalTibQty.QTY || 0;
        }

        originalAckBySubref.call(this, SUB, QTY);
    }

    var originalPersistAck = this.persistAck;
    this.prePersistAck = function(SUB, ISS, QTY){
        /* Runs in place of tibHandler.persistAck, adding the additionalTibQty if present to the QTY provided, and
         then running persistAck with this new value, passing the tibHandler object via Function.protoype.call */
        var additionalTibQty = this.additionalTibQtyReqs[SUB];
        if(additionalTibQty){
            QTY += additionalTibQty.QTY || 0;

        }
        originalPersistAck.call(this, SUB, ISS, QTY);
    }


}