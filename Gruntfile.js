module.exports = function(grunt) {

  grunt.initConfig({
    concat: {
      js: {
        src: ['src/*.js'],
        dest: 'build/query.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat:js']);
};