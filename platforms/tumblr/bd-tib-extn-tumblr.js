/**
 * Created by nadil on 14/03/16.
 */


BDtibExtension = function(that){

    this.additionalSubQty = {};

    this.preButtonInit = function(){

        var graphicalButtonList = document.getElementsByClassName('bd-tib-btn');
        console.log('button list lgnth' + graphicalButtonList.length);
        for(var i=0; i < graphicalButtonList.length; i++){
        // Cycling through our array of graphical buttons
            var postContainer = this.findPostContainer(graphicalButtonList[i]);
                if(postContainer){
                    var textButton = this.findTextButton(postContainer);
                    if(textButton) {
                        queryParams = this.getTxtBtnQueryParams(textButton);
                        textButton.style.display = 'none';
                        var SUB = graphicalButtonList[i].getAttribute('data-bd-SUB');
                        this.additionalSubQty[SUB] = 20;

                    }
                }

        }
    };


    this.getTxtBtnQueryParams = function(btn){
        var href = '';
        href = btn.getAttribute('href');
        href = decodeURIComponent(href);
        href = href.split('z=');
        href = href[1];
        href = URI(href).query(true);

        return href;
    }

    this.findPostContainer = function(el){
        var el;
        selectors = ['article', '.post', '#post', '.posts', '.postcontent'];
        for(var l = 0; l < 10; l++){
            if(el.parentNode){
                el = el.parentNode;
                    for(var k = 0; k < selectors.length; k++){
                        if(el.parentNode){
                            if(el.parentNode.querySelector(selectors[k]) == el){
                                return el;
                            }
                        }
                        else{
                            return false;
                        }
                    }
                }
        }
    }

    this.findTextButton = function(postContainer){
        var textButton = postContainer.getElementsByClassName('bd-tib-btn-tumblr-txt');
        console.log(textButton);
        return textButton[0];
    }


    this.customCounter = function(tibqty, that){


        if (tibqty.readyState === 4 && tibqty.status === 200) {
            var QTY = JSON.parse(tibqty.response).QTY;
            additionalQTY = this.additionalSubQty[tibqty.SUB];
            QTY += additionalQTY || 0;
            that.writeCounter(tibqty.SUB, QTY);

        }
    }

};


console.log('tumblr extension loaded');