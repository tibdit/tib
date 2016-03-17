/**
 * Created by nadil on 14/03/16.
 */


BDtibExtension = function(that){

    this.additionalSubQty = {};
    this.subQty = {};
    this.tibQtyReqs = {};
    this.additionalTibQtyReqs = {};

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
        /* Search upwards through parent nodes. The element we are looking for matches one of the selectors
          * we have specified, AND does not have a descendant that also matches the query */
        counter = counter || 0;

        selectors = ['article', '.post', '#post', '.posts', '.postcontent'];
        while(counter < 10){
            if(!el.parentNode){ return false; }
            el = el.parentNode;

            for(var k = 0; k < selectors.length; k++){
                if(!el.parentNode){ return false; }
                if(el.parentNode.querySelector(selectors[k]) == el && !el.querySelector(selectors[k])){
                    return el;
                }
            }
            this.findPostContainer(el, counter + 1);
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
                console.log('test');
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

};


console.log('tumblr extension loaded');