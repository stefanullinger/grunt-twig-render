/*
 * grunt-twig-render
 * https://github.com/sullinger/grunt-twig-render
 *
 * Copyright (c) 2014 Stefan Ullinger
 * Licensed under the MIT license.
 */

'use strict';

var chalk = require( 'chalk' );
var merge = require( 'merge' );

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

  var json5 = null;
  try {
    json5 = require( 'json5' );
  } catch(err) {
    grunt.log.ok("json5 not found, using regular json - if needed install with: npm install json5");
  }
  if(json5) {
    var fs = require('fs');
    var path = require('path');
  }


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
    
    if(data) {
      template = Twig.twig({
        path: template,
        async: false
      });
      grunt.file.write(dest, template.render(data));
    }
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
    else if (Array.isArray(data)) {
      var mergedData = {};
      data.forEach(function(item) {
        item = this._getData(item);
        mergedData = merge(mergedData, item);
      }.bind(this));
      return mergedData;
    }
    else if (datatype !== "object") {
      grunt.log.warn("Received data of type '" + datatype + "'. Expected 'object' or 'string'. Use at your own risk!");
    }
    return data;
  };

  /* jshint -W061 */
  GruntTwigRender.prototype._getDataFromFile = function(dataPath) {
    if (/\.json5$/i.test(dataPath)) {
      if (json5) {
        return this._getDataFromJSON5(dataPath);
      } else {
        grunt.log.warn("Reading from a JSON5 but library missing - install it with: npm install json5");
        return null;
      }
    } else if (/\.json?$/i.test(dataPath)) {
      if (json5) {
        return this._getDataFromJSON5(dataPath);
      } else {
        return grunt.file.readJSON(dataPath);
      }
    } else if (/\.yml$/i.test(dataPath) || /\.yaml/i.test(dataPath)) {
      return grunt.file.readYAML(dataPath);
    }
    else {
      grunt.log.warn("Data file does not seem to be JSON or YAML. Trying to evaluate the file's contents into an javascript object. Use at your own risk!");
      return eval( '(' + grunt.file.read(dataPath) + ')' );
    }
  };

  GruntTwigRender.prototype._getDataFromJSON5 = function(dataPath) {
    var dir = process.cwd();
    var filepath = path.resolve(dir, dataPath);
    var data = fs.readFileSync(filepath, 'utf8');
    return json5.parse(data);
  };

  grunt.registerMultiTask('twig_render', 'Render twig templates', function() {
    var renderer = new GruntTwigRender(this.options);
    this.files.forEach(function(fileData) {
      // We want to allow globbing of data OR templates (can't do both),
      // but globbing expands the src parameter only.
      // So we use src as the moving parameter, the other one (data or template)
      // MUST be specified.
      var src = fileData.src;
      if (src && isArray(src)) {src = src[0];}
      if(src && !fileData.template) {fileData.template = src;}
      if(src && !fileData.data) {fileData.data = src;}
      renderer.render(fileData.data, fileData.template, fileData.dest);
      grunt.log.writeln('File ' + chalk.cyan(fileData.dest) + ' created.');
    });

  });

};