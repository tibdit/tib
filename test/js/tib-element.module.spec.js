'use strict';


describe('TibElement Module', function(){

    // Declaring closure variables to be made available throughout our tests
    var domElement, tibElement, counterElement;



    beforeEach(function(){
        localStorage.clear(); // Clear localStorage to ensure we have no cached value
        jasmine.Ajax.install();

        domElement = document.createElement('div')

        counterElement = document.createElement('div');
        counterElement.classList.add('bd-btn-counter'); // Create mock counter domElement

        //domElement.setAttribute('data-bd-BTS', '/somewhere/test.svg');

    });



    afterEach(function(){

        jasmine.Ajax.uninstall(); // Clear jasmine.Ajax after each test runs to prevent carryover

    });



    describe('TibElement Instance', function(){



        describe('Public Methods', function(){



            describe('TibElement.writeCounter', function() {

                beforeEach(function() {

                    domElement.appendChild(counterElement);
                    tibElement = new TIBIT.TibElement(domElement); // Instantiate our tibElement
                    counterElement.innerHTML = '40'; // set counterElement to a predetermined control value

                });

                it("should write to counterElement, given a positive integer", function () {

                    tibElement.writeCounter(25);

                    expect(counterElement.innerHTML).toBe('25');

                });

                it("should write to counterElement, given a string representation of a positive integer", function () {

                    tibElement.writeCounter('25');

                    expect(counterElement.innerHTML).toBe('25');

                });

                it("should abort, given a non-integer string", function () {

                    tibElement.writeCounter('i am not an integer');

                    expect(counterElement.innerHTML).toBe('40'); // should be unmodified from our control value set above

                });

                it("should abort, given a negative integer", function () {

                    tibElement.writeCounter(-42);

                    expect(counterElement.innerHTML).toBe('40'); // should be unmodified from our control value set above

                });

                it("should abort, given a string representation of a negative integer", function () {

                    tibElement.writeCounter('-42');

                    expect(counterElement.innerHTML).toBe('40'); // should be unmodified from our control value set above

                });

                it('should abort, given an array', function(){
                    tibElement.writeCounter(['hello', 'world']);
                    expect(counterElement.innerHTML).toBe('40');
                });

            });



            describe('TibElement.getCounterElement', function(){



                beforeEach(function(){

                    domElement.appendChild(counterElement);
                    counterElement.classList.add('original-counter-element'); // Add a class to counterElement to compare against
                    tibElement = new TIBIT.TibElement(domElement); // Instantiate our tibElement

                });



                it("gets a new counter element when present", function(){
                    var newCounterElement = document.createElement('div');
                    newCounterElement.classList.add('bd-btn-counter');

                    domElement.removeChild(counterElement);
                    domElement.appendChild(newCounterElement); // Swap original counter element with new one

                    expect(tibElement.getCounterElement().classList.contains('original-counter-element')).toBe(false);
                });



                it("returns null if no counter present", function(){
                    domElement.removeChild(counterElement);
                    expect(tibElement.getCounterElement()).toBe(null);
                });



            });



        });



        describe('Features', function(){

            it("should populate counter element with QTY queried from tib.me/getqty/", function(){

                domElement.appendChild(counterElement);

                tibElement = new TIBIT.TibElement(domElement); // Instantiate our tibElement

                // Intercept tib.me/getqty/ request and send mock response
                var qtyReq = jasmine.Ajax.requests.mostRecent();
                qtyReq.respondWith({
                    "status": 200,
                    "responseText": '{"QTY": "20"}'
                });

                expect(counterElement.innerHTML).toBe('20'); // Check counterElement is populated with correct value

            });



        });


    });


});