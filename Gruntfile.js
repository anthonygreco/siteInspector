module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);
  grunt.initConfig({
    pkg: grunt.file.readJSON('siteInspector.jquery.json'),
    watch: {
      options: {
        atBegin: true
      },
      css: {
        files: ['sass/**/*.scss'],
        tasks: ['compass', 'cssmin']
      },
      js: {
        files: ['src/jquery.siteInspector.js'],
        tasks: ['jshint']
      }
    },
    compass: {
      compile: {
        options: {
          config: 'sass-config.rb'
        }
      }
    },
    cssmin: {
      options: {
        report: 'min'
      },
      minify: {
        expand: true,
        cwd: 'css/',
        src: ['*.css', '!*.min.css'],
        dest: 'css/',
        ext: '.min.css'
      }
    },
    clean: {
      dist: {
        files: [
          {
            src: ['dist/*']
          }
        ]
      }
    },
    meta: {
      banner: '/*\n' +
        ' *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n' +
        ' *  <%= pkg.description %>\n' +
        ' *  <%= pkg.homepage %>\n' +
        ' *\n' +
        ' *  Made by <%= pkg.author.name %>\n' +
        ' *  Under <%= pkg.licenses[0].type %> License\n' +
        ' */\n'
    },
    jshint: {
      files: ['src/jquery.siteInspector.js'],
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      }
    },
    uglify: {
      target: {
        src: ['src/jquery.siteInspector.js'],
        dest: 'dist/jquery.siteInspector.min.js'
      },
      options: {
        banner: '<%= meta.banner %>'
      }
    }
  });
  grunt.registerTask('default', ['watch']);
  grunt.registerTask('build', ['clean', 'jshint', 'uglify']);
};
