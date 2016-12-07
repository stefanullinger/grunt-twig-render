# grunt-twig-render

[![Build Status](https://travis-ci.org/stefanullinger/grunt-twig-render.svg?branch=master)](https://travis-ci.org/stefanullinger/grunt-twig-render)
[![npm version](https://badge.fury.io/js/grunt-twig-render.svg)](https://badge.fury.io/js/grunt-twig-render)

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

## The "twigRender" task

### Overview
In your project's Gruntfile, add a section named `twigRender` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  twigRender: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      options: {
        // Target specific options go here
      },
      files : [
        {
          data: // Path to JSON, JSON5 or YAML file, or POJO, or Array of filepaths and POJO
          template: // Path to template file
          dest: // Path to output destination here
        }
      ]
    },
  },
});
```
You can also use [Grunt built-in files syntax](http://gruntjs.com/configuring-tasks#files) for more dynamic lists.
In that case, one of `data` or `template` must be specified, the other one will use the dynamic `src` property.

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

Compile all your templates, with data from a central data file:
```js
grunt.initConfig({
  twigRender: {
    your_target: {
      files : [
        {
          data: 'path/to/datafile.json',
          expand: true,
          cwd: 'path/to/templates/',
          src: ['**/*.twig', '!**/_*.twig'], // Match twig templates but not partials
          dest: 'path/to/output/',
          ext: '.html'   // index.twig + datafile.json => index.html
        }
      ]
    },
  },
});
```

Compile a list of posts, same template but different data files:
```js
grunt.initConfig({
  twigRender: {
    your_target: {
      files : [
        {
          template: 'path/to/template.twig',
          expand: true,
          cwd: 'path/to/data/',
          src: ['post*.json'], // post1.json, post2.json,...
          dest: 'path/to/output/',
          ext: '.html'   // post1.json + template.twig => post1.html
        }
      ]
    },
  },
});
```

### Data parameter

The `data` parameter accepts multiple formats, here is a detailed description of each.

#### filename (string): JSON, JSON5 or YAML
JSON file should end in `.json`, YAML in `.yml`.

[JSON5](http://json5.org/) is an extension to standard JSON, allowing (among other things) comments and multi-line strings.
This is an optional format, to enable it you need to install JSON5:
```sh
npm install json5
```
Then simply set `data` to the path of a json5 file (ending in `.json` or `.json5`).

#### Javascript object
Used as is.

#### Array
Each element of the array can be any of the accepted format, results are merged.
In case of conflicts, last data in the array has priority.


### dataPath
An optional `dataPath` string can be supplied, in dot notation format.
If supplied, renderer will look for it in the loaded data and pass it as `dataPath` property to the template.
This lets you call the same template with different parts of the data tree.
```js
files: [
  {
    data: {
      post: {
        title: "a new post",
        content: "about life"
        info: {
          published: "2014/09/12",
          size: 1234,
          author: "John Doe"
        }
      }
    }
    dataPath: "post.info",
  },
```
Then in template `post.twig` use `{{dataPath.published}}` directly

### Multiple destinations

If the data parameter results in an array
(either through dataPath or as file containing a Javascript array),
then multiple destination files are generated.
Their names are the `destination` parameter with '_(number)' appended to the filename.

For example:
###### data.json
```json
{
  "posts": [
    {
      "title": "first post",
      "content": "Lorem ipsum dolor sit amet, consectetur adipisicing elit."
    },
    {
      "title": "another post",
      "content": "Fugiat enim, at sit natus temporibus maxime repudiandae."
    }
  ]
}
```
###### one_post.twig
```twig
<h1>{{dataPath.title}}</h1>
<p>{{dataPath.content}}</p>
```
###### Gruntfile
```js
grunt.initConfig({
  twigRender: {
    your_target: {
      files : [
        {
          data: "path/to/data/data.json",
          dataPath: "posts",
          template: "path/to/one_post.twig",
          dest: "file/to/post.html"
        }
      ]
    },
  },
});
```
###### Files generated
```
post_0.html
post_1.html

```

### Flattening

If the data parameter results in a tree (that is, an array containing some arrays),
you can use the `flatten` property to reduce this into a list:

#####data.json
```json
{
  "menu": [
    {"label": "action1"},
    {"label": "action2"},
    {
      "label": "sub-menu",
      "actions": [
        {"label": "action3"},
        {"label": "action4"}
      ]
    }
  ]
}
```

#####Gruntfile
```js
files: [
  {
    data: "data.json",
    dataPath: "menu",
    flatten: "actions"
    template: "myTemplate.twig",
    dest: "myDest.html"
  },
```

Will result in 4 files (`myDest_0-3.html`)



### Options

#### options.cache
Type: `Boolean`
Default value: `false`

Indicates if Twig should use a template cache or read template file every time.
Default is set to false to enable template file watch and recompilation.
Set it to true if you need to generate lots of files with an identical template.

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

#### options.functions
Type: `Object`
Default value: `{}`

Object hash defining functions in TwigJS. 

##### Example 1: Add asset function to TwigJS
```js
  options {
    functions: {
      asset: function(arg) { return 'my-asset-location/' + arg; }
    }
  }
```

#### options.filters
Type: `Object`
Default value: `{}`

Object hash defining filters in TwigJS. 

##### Example 1: Add dots filter to TwigJS
```js
  options {
    filters: {
      dots: function(arg) { return arg + '...'; }
    }
  }
```

For a complete list of available params see the [official twigjs documentation](https://github.com/twigjs/twig.js)

## Release History

__1.8.0__

  * Allows to use all available twigjs parameters and provides a more lightweight way to define custom functions and filters.

__1.7.4__

  * Updated twig.js to 0.10.0.

__1.7.3__

  * Updated twig.js to 0.8.8.

__1.7.2__

  * Twig errors now cause grunt task to fail and logs the error.

__1.7.1__

  * bugfix: array of data did not merge objects recursively, now does.

__1.7.0__

  * added `cache` option to enable/disable Twig caching (needed for livereload).

__1.6.0__

  * added `flatten` option to flatten data lists for multi-files generation.

__1.5.0__

  * task renamed to `twigRender` (was `twig_render`), to comply with Javascript conventions and make jshint happy in client codes.

__1.4.1__
  * dataPath returns full data object with additional `dataPath` property, instead of just the data pointed to (allows template to access full context).

__1.4.0__

  * dataPath parameter, to load sub-part of a data structure.
  * data arrays to generate multiple destinations.


__1.3.0__

  * Use src for data or template, allowing globbing and more
  * Allow use of JSON5, if library is present (optional).

__1.2.0__

  * Allowing data to be an array of strings/objects.

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

  * Defined twigRender task.
