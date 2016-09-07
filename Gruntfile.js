module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            build: {
                src: ['src/js/tib-base.module.js', 'src/js/tib-button.module.js' , 'src/js/tib-callback.module.js', 'src/js/tib-element.module.js', 'src/js/tib-initiator.module.js'],
                dest: 'dist/tib.min.js'
            },
            squarespace: {
                src: 'src/js/tib-squarespace.module.js',
                dest: 'dist/tib-squarespace.module.min.js'
            }
        },

        jasmine: {
            main: {
                src : 'dist/tib.min.js',

                options: {
                    specs: 'test/js/main/*.spec.js',
                    vendor: 'node_modules/jasmine-ajax/lib/mock-ajax.js'
                }
            },

            squarespace: {
                src: ['dist/tib.min.js', 'dist/tib-squarespace.module.min.js'],

                options: {
                    specs: 'test/js/squarespace/*.spec.js',
                    vendor: 'node_modules/jasmine-ajax/lib/mock-ajax.js'

                }
            }

        }
    });

    // Loading in required NPM grunt modules
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', ['uglify', 'test']); // Runs all build tasks, then runs all jasmine tests

    grunt.registerTask('test', ['jasmine']); // Runs all jasmine tests

    grunt.registerTask('build', ['uglify']); // Runs all uglify build tasks (including extension modules e.g. squarespace)

    grunt.registerTask('b:ild-squarespace', ['uglify:build:squarespac; // Runs squarespace build taske'])

};