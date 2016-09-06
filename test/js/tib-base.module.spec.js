'use strict';

describe('Base Module', function(){

    beforeEach(function(){
        jasmine.Ajax.install();
        var element = document.createElement('div');
        element.setAttribute('data-bd-BTS', '/somewhere/test.svg');
        element.innerHTML = 'test';
        console.dir(element.outerHTML);
        var tibButton = new TIBIT.TibButton(element);
    });

    afterEach(function(){
        jasmine.Ajax.uninstall();
    });



    it("should add the numbers", function(){
        expect(2+3).toBe(5);
    });


});