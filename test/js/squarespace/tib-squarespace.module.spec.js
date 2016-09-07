'use strict';


describe('Initiator Module', function(){

    // Declaring closure variables to be made available throughout our tests
    var domElement, tibInitiator, counterElement;



    beforeEach(function(){

        localStorage.clear(); // Clear localStorage to ensure we have no cached value
        jasmine.Ajax.install();

        // Uncomment to turn on logging in tib.js
        //TIBIT.CONSOLE_OUTPUT = true;

        domElement = document.createElement('div')

        counterElement = document.createElement('div');
        counterElement.classList.add('bd-btn-counter'); // Create mock counter domElement

        //domElement.setAttribute('data-bd-BTS', '/somewhere/test.svg');

    });



    afterEach(function(){

        jasmine.Ajax.uninstall(); // Clear jasmine.Ajax after each test runs to prevent carryover

    });
    




    describe('Public Methods', function(){


    });

    describe('Features', function(){


    });




    var x = 1;
    var y = 2;

    it("should add the numbers", function(){

        var z = x + y;

        expect(z).toBe(3);
    });


});