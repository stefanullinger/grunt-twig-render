/*
 * grunt-twig-render
 * https://github.com/sullinger/grunt-twig-render
 *
 * Copyright (c) 2014 Stefan Ullinger
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  var Twig = require("twig"),

  DEFAULT_OPTIONS = {
    // nothing here yet
  };

  function GruntTwigRender(options) {
    this.options = options(DEFAULT_OPTIONS);
  }

  GruntTwigRender.prototype.render = function(data, template, dest) {
    var data = this._getData(data);
    
    template = Twig.twig({
      path: template,
      async: false
    });

    grunt.file.write(dest, template.render(data));
  }

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
  }

  GruntTwigRender.prototype._getDataFromFile = function(dataPath) {
    if (/\.json/i.test(dataPath)) {
      return grunt.file.readJSON(dataPath);
    }
    else {
      grunt.log.warn("Data file does not seem to be JSON. Trying to evaluate the file's contents into an javascript object. Use at your own risk!");
      return eval( '(' + grunt.file.read(dataPath) + ')' );
    }
  }


  grunt.registerMultiTask('twig_render', 'Render twig templates', function() {
    
    var renderer = new GruntTwigRender(this.options);

    this.files.forEach(function(fileData) {
      renderer.render(fileData.data, fileData.template, fileData.dest);
    });

  });

};