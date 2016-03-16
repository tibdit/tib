/**
 * Created by nadil on 14/03/16.
 */


BDtibExtension = function(that){

    this.preButtonInit = function(){

        buttonList = document.getElementsByClassName('bd-tib-btn');
        console.log('button list lgnth' + buttonList.length);
        for(var i=0; i < buttonList.length; i++){
            post = this.findParentPost(buttonList[i]);

            if(post){
                txtButtons = post.getElementsByClassName('bd-tib-btn-tumblr-txt');

                for(j=0; j < txtButtons.length; j++){
                    queryParams = this.getTxtBtnQueryParams(txtButtons[i]);
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

    this.findTextButton = function(currentEl){
        var textButtons = currentEl.getElementsByClassName('bd-tib-btn-tumblr-txt');

        if(textButtons.length == 1){
            console.log('found it');
            return textButtons;
        }
    }

    this.findParentPost = function(element){
        //console.log(el.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode);
        var el = element;
        for(var i = 0; i < 10; i++){

            if(el.parentElement){
                el = el.parentElement;

                if(this.findTextButton(el)){
                    console.log('ARTICLE found');
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