# grunt-twig-render

> Render twig templates

## Getting Started
This plugin requires Grunt `~0.4.2`

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
          data: // Path to JSON file, or POJO
          template: // Path to template file
          dest: // Path to output destination here
        }
      ]
    },
  },
});
```

**Note:** The `files` parameter _must_ be an array, and _must_ conform to the format specified above. Each object in the file array represents _one_ rendered template.

### Options

No options yet.

## Release History

**Note:** Still under active development with no official release, use at your own risk.

__0.1.0__

  * Defined twig_render task.