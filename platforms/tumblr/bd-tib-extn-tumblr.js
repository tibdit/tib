/**
 * Created by nadil on 14/03/16.
 */


BDtibExtension = function(that){

    this.preButtonInit = function(){

        buttonList = document.getElementsByClassName('bd-tib-btn');
        console.log('button list lgnth' + buttonList.length);
        for(i=0; i < buttonList.length; i++){

            post = this.findParentPost(buttonList[i]);

            if(post){
                console.log('post found: ' + post.nodeName);
                txtButtons = post.getElementsByClassName('bd-tib-btn-tumblr-txt');

                for(j=0; j < txtButtons.length; j++){
                    queryParams = this.getTxtBtnQueryParams(txtButtons[i]);
                    console.log(queryParams);
                    SUB = queryParams['SUB'];

                    txtButtons[i].style.display = 'none';

                }

            }

        }
    };

    this.getTxtBtnQueryParams = function(btn){
        var href = '';
        href = txtButtons[i].getAttribute('href');
        href = decodeURIComponent(href);
        href = href.split('z=');
        href = href[1];
        href = URI(href).query(true);

        return href;
    }

    this.findParentPost = function(element){
        //console.log(el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode);
        var el = element;
        for(i = 0; i < 6; i++){
            console.log(i);
            console.log(el.nodeName);


            if(el.parentNode){
                el = el.parentNode;

                if(el.nodeName == "ARTICLE"){
                    return el;
                }

            }
        }
    }


    this.customCounter = function(tibqty, that){
        if (tibqty.readyState === 4 && tibqty.status === 200) {
            var QTY = JSON.parse(tibqty.response).QTY;
            QTY += 20;
            that.writeCounter(tibqty.SUB, QTY);

        }
    }

};


console.log('tumblr extension loaded');