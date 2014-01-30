/*
 * grunt-twig-render
 * https://github.com/sullinger/grunt-twig-render
 *
 * Copyright (c) 2014 Stefan Ullinger
 * Licensed under the MIT license.
 */

'use strict';

// http://stackoverflow.com/questions/5999998/how-can-i-check-if-a-javascript-variable-is-function-type
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function isArray(variableToCheck) {
  return Object.prototype.toString.call(variableToCheck) === '[object Array]';
}

function isPlainObject(variableToCheck) {
  return Object(variableToCheck) === variableToCheck && Object.getPrototypeOf(variableToCheck) === Object.prototype;
}

module.exports = function(grunt) {

  var Twig = require("twig"),

  DEFAULT_OPTIONS = {
    extensions: []
  };

  function GruntTwigRender(options) {
    this.options = options(DEFAULT_OPTIONS);

    // validate type of extensions
    if (false === isArray(this.options.extensions)) {
      grunt.fail.fatal("extensions has to be an array of functions!");
    }

    // apply defined extensions
    this.options.extensions.forEach(function(fn) {
      Twig.extend(fn);
    });
  }

  GruntTwigRender.prototype.render = function(data, template, dest) {
    data = this._getData(data);
    
    template = Twig.twig({
      path: template,
      async: false
    });

    grunt.file.write(dest, template.render(data));
  };

  GruntTwigRender.prototype._getData = function(data)
  {
    var datatype = typeof data;

    if (datatype === "undefined" || data == null) {
      grunt.fail.fatal("Data can not be undefined or null.");
    }
    else if (datatype === "string") {
      return this._getDataFromFile(data);
    }
    else if (datatype !== "object") {
      grunt.log.warn("Received data of type '" + datatype + "'. Expected 'object' or 'string'. Use at your own risk!");
    }

    return data;
  };

  GruntTwigRender.prototype._getDataFromFile = function(dataPath) {
    if (/\.json/i.test(dataPath)) {
      return grunt.file.readJSON(dataPath);
    }
    else {
      grunt.log.warn("Data file does not seem to be JSON. Trying to evaluate the file's contents into an javascript object. Use at your own risk!");
      return eval( '(' + grunt.file.read(dataPath) + ')' );
    }
  };


  grunt.registerMultiTask('twig_render', 'Render twig templates', function() {

    var renderer = new GruntTwigRender(this.options);

    this.files.forEach(function(fileData) {
      renderer.render(fileData.data, fileData.template, fileData.dest);
    });

  });

};