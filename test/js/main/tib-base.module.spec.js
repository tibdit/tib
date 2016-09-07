'use strict';

describe('Base Module', function(){

    var domElement, counterElement;

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



       describe('TIBIT.copyParams', function(){

           it('should return an object identical to input object', function(){

               var source = {test: 'test', test2: 'test2'};

               expect(TIBIT.cloneObj(source)).toEqual(source);

           });

           it('source object should be unchanged if clone is modified', function(){

               var source = {test: 'test', test2: 'test2'};
               var clone = TIBIT.cloneObj(source);
               clone.test = 'new value';

               expect(source).toEqual({test: 'test', test2: 'test2'});

           });



       });



    });

});