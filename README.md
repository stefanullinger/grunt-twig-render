# grunt-twig-render

[![Build Status](https://travis-ci.org/sullinger/grunt-twig-render.png?branch=master)](https://travis-ci.org/sullinger/grunt-twig-render)
[![NPM version](https://badge.fury.io/js/grunt-twig-render.png)](http://badge.fury.io/js/grunt-twig-render)

> Render twig templates

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-twig-render --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-twig-render');
```

## The "twig_render" task

### Overview
In your project's Gruntfile, add a section named `twig_render` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  twig_render: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      options: {
        // Target specific options go here
      },
      files : [
        {
          data: // Path to JSON or YAML file, or POJO, or Array of filepaths and POJO
          template: // Path to template file
          dest: // Path to output destination here
        }
      ]
    },
  },
});
```

**Note:** The `files` parameter _must_ be an array, and _must_ conform to the format specified above. Each object in the file array represents _one_ rendered template.

#### Examples:

```js
files: [
  {
    data: "path/to/data/file.json",
    template: "path/to/template.twig",
    dest: "file/to/output.html"
  }
]
```

```js
files: [
  {
    data: { 
      greeting: "Hello",
      target: "world"
    },
    template: "path/to/template.twig",
    dest: "file/to/output.html"
  }
]
```

### Options

#### options.extensions
Type: `Array`  
Default value: `[]`

Can be an array of functions that extend TwigJS.

##### Example 1: Filter Extension

```js
options:
{
  extensions:
  [
  
    // Usage: {{ [1, 2, 3]|fooJoin(' | ') }}
    // Output: 1 | 2 | 3

    function(Twig)
    {
      Twig.exports.extendFilter( "fooJoin", function(value, params)
      {
        if (value === undefined || value === null)
        {
          return;
        }

        var join_str = "",
            output = [],
            keyset = null;

        if (params && params[0])
        {
          join_str = params[0];
        }
              
        if (value instanceof Array)
        {
          output = value;
        }
        else
        {
          keyset = value._keys || Object.keys(value);
                  
          Twig.forEach(keyset, function(key)
          {
            if (key === "_keys")
            {
              return; // Ignore the _keys property
            }
                    
            if (value.hasOwnProperty(key))
            {
              output.push(value[key]);
            }
          });
        }
              
        return output.join(join_str);
      });
    }
            
  ]
}
```

##### Example 2: Function Extension

```js
options:
{
  extensions:
  [
  
    // Usage:
    //   {% for i in 1..3 %}
    //   {{ fooCycle(['odd', 'even'], i) }}
    //   {% endfor %}
    
    // Output:
    //   even
    //   odd
    //   even

    function(Twig)
    {
      Twig.exports.extendFunction( "fooCycle", function(arr, i)
      {
        var pos = i % arr.length;
        return arr[pos];
      });
    }
            
  ]
}
```

##### Example 3: Tag Extension

```js
options:
{
  extensions:
  [
  
    // Usage:
    //   {% fooSpaceless %}<div>
    //   <b>b</b>   <i>i</i>
    //   </div>{% endFooSpaceless %}
    
    // Output:
    //   <div><b>b</b><i>i</i></div>
    

    function(Twig)
    {
      Twig.exports.extendTag(
      {
        type: "fooSpaceless",
        regex: /^fooSpaceless$/,
        next: [
          "endFooSpaceless"
        ],
        open: true,

        // Parse the html and return it without any spaces between tags
        parse: function (token, context, chain)
        {
          // Parse the output without any filter
          var unfiltered = Twig.parse.apply(this, [token.output, context]),

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

    function(Twig)
    {
      Twig.exports.extendTag(
      {
        type: "endFooSpaceless",
        regex: /^endFooSpaceless$/,
        next: [ ],
        open: false
      });
    }
            
  ]
}
```

##### Example 4: Change TwigJS Settings via an Extension

```js
options:
{
  extensions:
  [

    function(Twig)
    {
      // Although it might not be obvious, you have access to the Twig instance within this function
      // and can configure TwigJS as you like

      // disables caching
      Twig.cache = false;
    }

  ]
}
```

## Release History

__1.1.0__

  * Added support for YAML data files.

__1.0.1__

  * Added debug output when the target file has been written.

__1.0.0__

  * Rechecked code. Seems to be fine – releasing version 1.0.0.

__0.3.1__

  * Updated version string.

__0.3.0__

  * Added option to extend TwigJS functionality (filters, functions, tags).

__0.2.0__

  * Added basic tests.

__0.1.0__

  * Defined twig_render task.