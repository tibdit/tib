/**
 * Created by nadil on 14/03/16.
 */


BDtibExtension = function(that){

    this.subQty = {};
    this.tibQtyReqs = {};
    this.additionalTibQtyReqs = {};
    this.parentTibHandler = that;

    this.preButtonInit = function(){

        var graphicalButtonList = document.getElementsByClassName('bd-tib-btn');
        for(var i=0; i < graphicalButtonList.length; i++){
        // Cycling through our array of graphical buttons
            var postContainer = this.findPostContainer(graphicalButtonList[i]);
                if(postContainer){
                    var textButton = this.findTextButton(postContainer);
                    var SUB = graphicalButtonList[i].getAttribute('data-bd-SUB');
                    if(textButton) {
                        queryParams = this.getTxtBtnQueryParams(textButton);
                        textButton.style.display = 'none';

                        this.initiateQtyRequest(queryParams, SUB);
                    }
                    else{
                        this.additionalTibQtyReqs[SUB] = false;
                    }
                }

        }
    };

    this.initiateQtyRequest = function(queryParams, primarySUB){
        console.log(queryParams);
        this.additionalTibQtyReqs[primarySUB] = new XMLHttpRequest();

        var tibQtyFetch;

        if (queryParams.ASN && queryParams.TIB) {
            tibQtyFetch = "?TIB=" + queryParams.TIB +  "&ASN=" + queryParams.ASN + (queryParams.SUB ? "&SUB=" + queryParams.SUB : '');
        } else {
            tibQtyFetch = "?PAD=" + queryParams.PAD + (queryParams.TIB ? "&TIB=" + queryParams.TIB : '') + (queryParams.SUB ? "&SUB=" + queryParams.SUB : '') + (queryParams.ASN ? "&ASN=" + queryParams.ASN + "&DSP=TRUE" : '');
        }

        tibQtyFetch= "https://tib.me/getqty/" + tibQtyFetch;

        console.log(tibQtyFetch);

        this.additionalTibQtyReqs[primarySUB].open( 'GET', tibQtyFetch, true);
        this.additionalTibQtyReqs[primarySUB].send();
        this.additionalTibQtyReqs[primarySUB].SUB = queryParams.SUB;
        var that = this;
        this.additionalTibQtyReqs[primarySUB].onreadystatechange = this.additionalCounterHandler;

    }

    this.additionalCounterHandler = function(additionalTibQty){
        additionalTibQty = additionalTibQty.currentTarget;
        var SUB = additionalTibQty.SUB;
        var primaryTibQty = this.tibQtyReqs[SUB];
        if(typeof primaryTibQty != 'undefined') {
            console.log('primary tib qty not initiated yet');
            if (additionalTibQty.readyState === 4 && additionalTibQty.status === 200 && primaryTibQty.readyState === 4 && primaryTibQty.status === 200) {
                console.log(additionalTibQty.QTY)
            }
        }
    }
    this.additionalCounterHandler = this.additionalCounterHandler.bind(this);

    this.getTxtBtnQueryParams = function(btn){
        var href = '';
        href = btn.getAttribute('href');
        href = decodeURIComponent(href);
        href = href.split('z=');
        href = href[1];
        href = URI(href).query(true);

        return href;
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
        var textButton = postContainer.getElementsByClassName('bd-tib-btn-tumblr-txt');
        return textButton[0];
    }


    this.customCounterHandler = function(primaryTibQty, that){
        var SUB = primaryTibQty.SUB;
        var additionalTibQty = this.additionalTibQtyReqs[primaryTibQty.SUB];
        if(additionalTibQty) {
            if (primaryTibQty.readyState === 4 && primaryTibQty.status === 200 && additionalTibQty.readyState === 4 && additionalTibQty.status === 200) {
                var QTY = JSON.parse(primaryTibQty.response).QTY;
                QTY += JSON.parse(this.additionalTibQtyReqs[primaryTibQty.SUB].response).QTY || 0;
                that.writeCounter(primaryTibQty.SUB, QTY);

            }
        }
        else{
            if (primaryTibQty.readyState === 4 && primaryTibQty.status === 200) {
                var QTY = JSON.parse(primaryTibQty.response).QTY;
                that.writeCounter(primaryTibQty.SUB, QTY);
            }
        }
    }

    this.preAckBySubref = function(callback, SUB, QTY){
        var additionalTibQty = this.additionalTibQtyReqs[SUB];
        if(additionalTibQty){
            QTY += JSON.parse(this.additionalTibQtyReqs[SUB].response).QTY;
            callback.call(this.parentTibHandler, SUB, QTY);
        }
        else{
            callback.call(this.parentTibHandler, SUB, QTY);
        }
    }

    this.prePersistAck = function(callback, SUB, ISS, QTY){
        var additionalTibQty = this.additionalTibQtyReqs[SUB];
        if(additionalTibQty){
            QTY += JSON.parse(this.additionalTibQtyReqs[SUB].response).QTY;
            callback.call(this.parentTibHandler, SUB, ISS, QTY);
        }
        else{
            callback.call(this.parentTibHandler, SUB, ISS, QTY);
        }
    }

};


console.log('tumblr extension loaded');