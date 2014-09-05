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
      yml_data_file: {
        files: [
          {
            data: 'test/fixtures/objects/hello_world.yml',
            template: 'test/fixtures/templates/hello_world.twig',
            dest: 'tmp/hello_world_yml_data_file.html'
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
      },
      multiple_data: {
        files: [
          {
            data: [
              'test/fixtures/objects/hello_world.yml',
              {
                reversed_target: "tenalp"
              }
            ],
            template: 'test/fixtures/templates/hello_world.twig',
            dest: 'tmp/hello_planet_multiple_data.html'
          }
        ]
      },
      src_as_data_file: {
        files: [
          {
            src: 'test/fixtures/objects/hello_world.json',
            template: 'test/fixtures/templates/hello_world.twig',
            dest: 'tmp/hello_world_src_as_data_file.html'
          }
        ]
      },
      src_as_template_file: {
        files: [
          {
            data: 'test/fixtures/objects/hello_world.json',
            src: 'test/fixtures/templates/hello_world.twig',
            dest: 'tmp/hello_world_src_as_template_file.html'
          }
        ]
      },
      json5_file: {
        files: [
          {
            data: 'test/fixtures/objects/hello_world.json5',
            template: 'test/fixtures/templates/hello_world.twig',
            dest: 'tmp/hello_world_json5.html'
          }
        ]
      },
      data_path: {
        files: [
          {
            data: 'test/fixtures/objects/hello_world_path.json',
            dataPath: 'path.to.data',
            template: 'test/fixtures/templates/hello_world_path.twig',
            dest: 'tmp/hello_world_path.html'
          }
        ]
      },
      data_multi: {
        files: [
          {
            data: 'test/fixtures/objects/multi.json',
            dataPath: 'list',
            template: 'test/fixtures/templates/greet.twig',
            dest: 'tmp/greeting.html'
          }
        ]
      },

      twig_filter_extensions: {
        options: {
          extensions: [

            function(Twig) {
              Twig.exports.extendFilter( "fooJoin", function(value, params) {
                if (value === undefined || value === null) {
                  return;
                }

                var join_str = "",
                    output = [],
                    keyset = null;

                if (params && params[0]) {
                    join_str = params[0];
                }
              
                if (value instanceof Array) {
                  output = value;
                }
                else {
                  keyset = value._keys || Object.keys(value);
                  
                  Twig.forEach(keyset, function(key) {
                    if (key === "_keys") {
                      return; // Ignore the _keys property
                    }
                    
                    if (value.hasOwnProperty(key)) {
                      output.push(value[key]);
                    }
                  });
                }
              
                return output.join(join_str);
              });
            }
            
          ]
        },

        files: [
          {
            data: {},
            template: 'test/fixtures/templates/twig_filter_extensions.twig',
            dest: 'tmp/twig_filter_extensions.html'
          }
        ]
      },
      twig_function_extensions: {
        options: {
          extensions: [

            function(Twig) {
              Twig.exports.extendFunction( "fooCycle", function(arr, i) {
                var pos = i % arr.length;
                return arr[pos];
              });
            }

          ]
        },

        files: [
          {
            data: {},
            template: 'test/fixtures/templates/twig_function_extensions.twig',
            dest: 'tmp/twig_function_extensions.html'
          }
        ]
      },
      twig_tag_extensions: {
        options: {
          extensions: [

            function(Twig) {
              Twig.exports.extendTag({
              
                type: "fooSpaceless",
                regex: /^fooSpaceless$/,
                next: [
                  "endFooSpaceless"
                ],
                open: true,

                // Parse the html and return it without any spaces between tags
                parse: function (token, context, chain) {

                  var // Parse the output without any filter
                  unfiltered = Twig.parse.apply(this, [token.output, context]),

                  // A regular expression to find closing and opening tags with spaces between them
                  rBetweenTagSpaces = />\s+</g,
                  
                  // Replace all space between closing and opening html tags
                  output = unfiltered.replace(rBetweenTagSpaces,'><').trim();

                  return {
                    chain: chain,
                    output: output
                  };
                }

              });
            },

            function(Twig) {
              Twig.exports.extendTag({
              
                type: "endFooSpaceless",
                regex: /^endFooSpaceless$/,
                next: [ ],
                open: false

              });
            }
          ]
        },

        files: [
          {
            data: {},
            template: 'test/fixtures/templates/twig_tag_extensions.twig',
            dest: 'tmp/twig_tag_extensions.html'
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
