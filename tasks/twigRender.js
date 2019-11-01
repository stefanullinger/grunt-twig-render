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
var omit = require('object.omit');

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
    extensions: [],
    functions: {},
    filters: {},
    cache: false,
    async: false,
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

  function getProperty( protertyInDotNotation, object ) {
    var parts = protertyInDotNotation.split( "." ),
    length = parts.length,
    i,
    property = object;
    for ( i = 0; i < length; i++ ) {
      property = property[parts[i]];
    }
    return property;
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

    // apply defined functions
    Object.keys(this.options.functions).forEach(function(name) {
      var fn = this.options.functions[name];
      if (!isFunction(fn)) {
        grunt.fail.fatal('"' + name + '" needs to be a function!');
      }
      Twig.extendFunction(name, fn);
    }.bind(this));

    // apply defined filters
    Object.keys(this.options.filters).forEach(function(name) {
      var fn = this.options.filters[name];
      if (!isFunction(fn)) {
        grunt.fail.fatal('"' + name + '" needs to be a function!');
      }
      Twig.extendFilter(name, fn);
    }.bind(this));

    Twig.cache(this.options.cache);
  }

  GruntTwigRender.prototype.render = function(data, dataPath, template, dest, flatten) {
    var i, len; //loop vars
    var actualData = this._getData(data, dataPath);
    var twigOpts = omit(this.options, ['cache','functions','filters','extensions']);
    var replacer = function(match, filename, extension) {
      return filename+"_"+i+extension;
    };

    if(actualData) {
      if(isArray(actualData.dataPath)) {
        var pathArray = actualData.dataPath;
        // flatten as needed
        if(flatten) {
          pathArray = [];
          for (i = 0, len = actualData.dataPath.length; i < len; i++){
            var elt = actualData.dataPath[i];
            if(elt[flatten]) {
              pathArray = pathArray.concat(elt[flatten]);
            } else {
              pathArray.push(elt);
            }
          }
        }
        for (i = 0, len = pathArray.length; i < len; i++) { 
          var tt = Twig.twig(merge(twigOpts,{path: template}));
          // compute destination path by inserting '_n'
          var destPath = dest.replace(/(.*)(\.[^\.]+)$/, replacer);
          actualData.dataPath = pathArray[i];
          grunt.file.write(destPath, tt.render(actualData));
        }
        actualData.dataPath = pathArray;
      } else {
        var twigTemplate = Twig.twig(merge(twigOpts,{path: template}));
        grunt.file.write(dest, twigTemplate.render(actualData));
      }
    }
  };

  GruntTwigRender.prototype._getData = function(data, dataPath)
  {
    var datatype = typeof data;

    if (datatype === "undefined" || data == null) {
      grunt.fail.fatal("Data can not be undefined or null.");
      return null;
    }

    var rawData = null;
    if (!rawData && datatype === "string") {
      rawData = this._getDataFromFile(data);
    } 
    if (!rawData && Array.isArray(data)) {
      var mergedData = {};
      data.forEach(function(item) {
        item = this._getData(item);
        mergedData = merge.recursive(mergedData, item);
      }.bind(this));
      rawData =  mergedData;
    }
    if(!rawData) {
      rawData = data;
      if (datatype !== "object") {
        grunt.log.warn("Received data of type '" + datatype + "'. Expected 'object' or 'string'. Use at your own risk!");
      }
    }

    if(dataPath) {
      rawData.dataPath = getProperty(dataPath, rawData);
    }

    return rawData;
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
    } else if (/\.json$/i.test(dataPath)) {
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

  grunt.registerMultiTask('twigRender', 'Render twig templates', function() {
    try {
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

        renderer.render(fileData.data, fileData.dataPath, fileData.template, fileData.dest, fileData.flatten);
        grunt.log.writeln('File ' + chalk.cyan(fileData.dest) + ' created.');
      });
    } catch(err) {
      // Fail the build if Twig.Error was thrown
      grunt.fail.fatal(err.type + ' in file "' + err.file + '": ' + err.message );
    }
  });

};
