'use strict';

var grunt = require('grunt');

/*
  ======== A Handy Little Nodeunit Reference ========
  https://github.com/caolan/nodeunit

  Test methods:
    test.expect(numAssertions)
    test.done()
  Test assertions:
    test.ok(value, [message])
    test.equal(actual, expected, [message])
    test.notEqual(actual, expected, [message])
    test.deepEqual(actual, expected, [message])
    test.notDeepEqual(actual, expected, [message])
    test.strictEqual(actual, expected, [message])
    test.notStrictEqual(actual, expected, [message])
    test.throws(block, [error], [message])
    test.doesNotThrow(block, [error], [message])
    test.ifError(value)
*/

exports.twig_render = {
  setUp: function(done) {
    // setup here if necessary
    done();
  },
  json_data_file: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/hello_world_json_data_file.html');
    var expected = grunt.file.read('test/expected/hello_world.html');
    test.equal(actual, expected, 'should render when given json data.');

    test.done();
  },
  yml_data_file: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/hello_world_yml_data_file.html');
    var expected = grunt.file.read('test/expected/hello_world.html');
    test.equal(actual, expected, 'should render when given yml data.');

    test.done();
  },
  pojo_data_file: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/hello_world_pojo_data_file.html');
    var expected = grunt.file.read('test/expected/hello_world.html');
    test.equal(actual, expected, 'should render when given json data.');

    test.done();
  },
  pojo_data: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/hello_world_pojo_data.html');
    var expected = grunt.file.read('test/expected/hello_world.html');
    test.equal(actual, expected, 'should render when given json data.');

    test.done();
  },
  multiple_data: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/hello_planet_multiple_data.html');
    var expected = grunt.file.read('test/expected/hello_planet_multiple_data.html');
    test.equal(actual, expected, 'should render when given array of data items.');

    test.done();
  },
  src_as_data_file: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/hello_world_src_as_data_file.html');
    var expected = grunt.file.read('test/expected/hello_world.html');
    test.equal(actual, expected, 'should render when given src as data.');

    test.done();
  },
  src_as_template_file: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/hello_world_src_as_template_file.html');
    var expected = grunt.file.read('test/expected/hello_world.html');
    test.equal(actual, expected, 'should render when given src as template.');

    test.done();
  },
  twig_filter_extensions: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/twig_filter_extensions.html');
    var expected = grunt.file.read('test/expected/twig_filter_extensions.html');
    test.equal(actual, expected, 'should render when given json data.');

    test.done();
  },
  twig_function_extensions: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/twig_function_extensions.html');
    var expected = grunt.file.read('test/expected/twig_function_extensions.html');
    test.equal(actual, expected, 'should render when given json data.');

    test.done();
  },
  twig_tag_extensions: function(test) {
    test.expect(1);

    var actual = grunt.file.read('tmp/twig_tag_extensions.html');
    var expected = grunt.file.read('test/expected/twig_tag_extensions.html');
    test.equal(actual, expected, 'should render when given json data.');

    test.done();
  }
};
