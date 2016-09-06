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


    describe('TibInitiator Instance', function(){



        describe('Public Methods', function(){



            describe('TibInitiator.isTestNet', function(){

                it('returns true if Initiator\'s PAD is a testmode address', function(){

                    domElement.setAttribute('data-bd-PAD', 'myisWNp7MH4dHtSSy9Wk6JK9QP3YkiGZVz');
                    tibInitiator = new TIBIT.Initiator(domElement);

                    expect(tibInitiator.isTestnet()).toBe(true);

                });

                it('returns false if Initiator\'s PAD is a realmode address', function(){

                    domElement.setAttribute('data-bd-PAD', '1Archive1n2C579dMsAu3iC6tWzuQJz8dN');
                    tibInitiator = new TIBIT.Initiator(domElement);

                    expect(tibInitiator.isTestnet()).toBe(false);

                });

                it('returns false if Initiator\'s PAD is not a bitcoin address', function(){

                    domElement.setAttribute('data-bd-PAD', 'blahdeeblah');
                    tibInitiator = new TIBIT.Initiator(domElement);

                    expect(tibInitiator.isTestnet()).toBe(false);

                });

            });



            describe('TibInitiator.dispatch', function(){

                var tibWindow;

                it('opens a tibbing window', function(){

                    domElement.setAttribute('data-bd-PAD', 'myisWNp7MH4dHtSSy9Wk6JK9QP3YkiGZVz');
                    tibInitiator = new TIBIT.Initiator(domElement);

                    tibWindow = tibInitiator.dispatch();

                    expect(tibWindow.opener).toBeTruthy();

                });

            });

            describe('TibInitiator.updateQty', function(){

                it('returns a value from cache', function(){

                    domElement.setAttribute('data-bd-SUB', 'test');
                    tibInitiator = new TIBIT.Initiator(domElement); // Initialise our Initiator with subref 'test'

                    localStorage.setItem('bd-subref-test-QTY' , '{"QTY":210,"EXP":"2116-09-06T15:30:42.151Z"}'); // Manually set cached QTY to 210

                    expect(tibInitiator.updateQty()).toBe(210);

                });

                it('returns a value from params', function(){
                    tibInitiator = new TIBIT.Initiator(domElement);

                    tibInitiator.params.QTY = 39;
                    expect(tibInitiator.updateQty()).toBe(39);

                });

                it('returns null if no value in params or cache', function(){
                    tibInitiator = new TIBIT.Initiator(domElement);
                    expect(tibInitiator.updateQty()).toBe(null);
                });

            });

        });

        describe('Features', function(){

            it('imports params from data-bd attributes', function(){

                domElement.setAttribute('data-bd-PAD', 'test');
                domElement.setAttribute('data-bd-SUB', 'test');
                domElement.setAttribute('data-bd-CBK', 'test');
                domElement.setAttribute('data-bd-ASN', 'test');
                domElement.setAttribute('data-bd-TIB', 'test');

                tibInitiator = new TIBIT.Initiator(domElement);

                expect(tibInitiator.params.PAD).toBe('test');
                expect(tibInitiator.params.SUB).toBe('test');
                expect(tibInitiator.params.CBK).toBe('test');
                expect(tibInitiator.params.ASN).toBe('test');
                expect(tibInitiator.params.TIB).toBe('test');

            });

        });


    });

    var x = 1;
    var y = 2;

    it("should add the numbers", function(){

        var z = x + y;

        expect(z).toBe(3);
    });


});