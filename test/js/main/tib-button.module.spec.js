'use strict';


describe('Button Module', function(){

    var element, tibButton;

    beforeEach(function(){
        jasmine.Ajax.install();
        element = document.createElement('div');
        element.setAttribute('data-bd-BTS', '/somewhere/test.svg');
        tibButton = new TIBIT.TibButton(element);
    });

    afterEach(function(){
        jasmine.Ajax.uninstall();
    });

    it("should add the numbers", function(){


        expect(2+3).toBe(5);
    });

    it('should create a tib button', function(){

        console.log(element.innerHTML);

        expect(2+3).toBe(5);
    });


});