/*
 * grunt-twig-render
 * https://github.com/sullinger/grunt-twig-render
 *
 * Copyright (c) 2014 Stefan Ullinger
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    // Configuration to be run (and then tested).
    twig_render: {
      json_data_file: {
        files: [
          {
            data: 'test/fixtures/objects/hello_world.json',
            template: 'test/fixtures/templates/hello_world.twig',
            dest: 'tmp/hello_world_json_data_file.html'
          }
        ]
      },
      pojo_data_file: {
        files: [
          {
            data: 'test/fixtures/objects/hello_world.pojo.txt',
            template: 'test/fixtures/templates/hello_world.twig',
            dest: 'tmp/hello_world_pojo_data_file.html'
          }
        ]
      },
      pojo_data: {
        files: [
          {
            data: {
              greeting: "Hello",
              reversed_target: "dlrow"
            },
            template: 'test/fixtures/templates/hello_world.twig',
            dest: 'tmp/hello_world_pojo_data.html'
          }
        ]
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'twig_render', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
