module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            build: {
                src: ['src/js/tib-base.module.js', 'src/js/tib-button.module.js' , 'src/js/tib-callback.module.js', 'src/js/tib-element.module.js', 'src/js/tib-initiator.module.js'],
                dest: 'dist/tib.min.js'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['uglify'], function(){
        grunt.log.write('Compiled tib.min.js ').ok();
    });

};