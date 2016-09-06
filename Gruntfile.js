module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            build: {
                src: ['src/js/tib-base.module.js', 'src/js/tib-button.module.js' , 'src/js/tib-callback.module.js', 'src/js/tib-element.module.js', 'src/js/tib-initiator.module.js'],
                dest: 'dist/tib.min.js'
            }
        },

        jasmine: {

            options: {
                vendor: 'node_modules/jasmine-ajax/lib/mock-ajax.js'
            },

            baseSpec: {
                src : 'dist/tib.min.js',
                options : {
                    specs : 'test/js/tib-base.module.spec.js'
                }
            },

            buttonSpec: {
                src : 'dist/tib.min.js',
                options : {
                    specs : 'test/js/tib-button.module.spec.js'
                }
            },

            callbackSpec: {
                src : 'dist/tib.min.js',
                options : {
                    specs : 'test/js/tib-callback.module.spec.js'
                }
            },

            elementSpec: {
                src : 'dist/tib.min.js',
                options : {
                    specs : 'test/js/tib-element.module.spec.js'
                }
            },

            initiatorSpec: {
                src : 'dist/tib.min.js',
                options : {
                    specs : 'test/js/tib-initiator.module.spec.js'
                }
            }


        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', ['uglify', 'test']);

    grunt.registerTask('test', ['jasmine']);

    grunt.registerTask('build', ['uglify']);

};