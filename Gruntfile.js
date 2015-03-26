'use strict';

module.exports = function (grunt) {
	
  // Loading tasks Manually
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');

  grunt.loadNpmTasks('grunt-contrib-handlebars');

  grunt.loadNpmTasks('grunt-browserify');

  grunt.loadNpmTasks('grunt-sftp-deploy');

	// Configurable paths
  var config = {
    app: 'app',
    dist: 'dist',
    build: 'build.js',
    jsfolder: '/js',
    sassfolder: '/styles/sass',
    cssfolder: '/styles/css'
  };

  grunt.initConfig({

  	// Referencing globally defined configurable paths
  	config: config,


    'sftp-deploy': {
      dev: {
        auth: {
          host: '<~ hostname ~>',
          port: 22,
          authKey: 'key1'

          // "key1" refers to a key set in the .ftppass file.
          // This is ignored by git (for security reasons) so will have to be created in the format of the below

          /* ./.ftppass 
            {
              "key1": {
                "username": "<~ username ~>",
                "password": "<~ password ~>"
              }
            }
          */

        },
        src: '<%= config.dist %>',
        dest: '<~ Project root on server ~>',
        exclusions: [
          '<%= config.dist %>/**/.DS_Store'
        ],
        serverSep: '/',
        concurrency: 4,
        progress: true
      }
    },

  	watch: {

  		js: {
  			// files: ['<%= config.app %><% config.jsfolder %>/{,*/}*.js'],
        files: ['<%= config.app %><% config.jsfolder %>/**/*.js'],
  			tasks: ['browserify:server', 'jshint'],
  			options: {
  				livereload: true
  			}
  		},

  		sass: {
  			// files: ['<%= config.app %><% config.sassfolder %>/{,*/}*.{scss,sass}'],
  			files: ['<%= config.app %>/styles/**/*.{scss,sass}'],
  			tasks: ['sass:server']
  		},

  		css: {
        files: ['<%= config.app %><% config.cssfolder %>/**/*.css'],
  			// files: ['<%= config.app %>/styles/**/*.css'],
  			options: {
  				livereload: true
  			}
  		},

  		gruntfile: {
  			files: ['gruntfile.js']
  		},

      // html: {
      //   files: ['<%= config.app %>/html/**/*.html'],
      //   tasks: ['concat:html']
      // },

      hbs: {
        // files: ['<%= config.app %>/scripts/{,*/}*.hbs','<%= config.app %>/scripts/**/*.hbs'],
        files: [
          '<%= config.app %><% config.jsfolder %>/**/*.hbs', 
          '<%= config.app %><% config.jsfolder %>/{,*/}*.handlebars'
        ],
        tasks: ['handlebars', 'concat:templates']
      },

  		livereload: {
  			options: {
  				livereload: '<%= connect.options.livereload %>'
  			},
  			files: [
  				'<%= config.app %>/{,*/}*.html',
	        '.tmp/styles/{,*/}*.css',
	        '<%= config.app %>/images/{,*/}*'
  			]
  		}
  	}, // watch end

  	connect: {
  		options: {
  			port: 9000,
  			open: true,
  			livereload: 35729,
  			base: 'app',
  			hostname: 'localhost'
  		},
      livereload: {
        options: {
        }
      },
  		dist: {
  			options: {
  				base: '<%= config.dist %>',
  				livereload: false
  			}
  		}

  	}, // end connect (server)

  	// Empties folders to start fresh
	  clean: {
	    dist: {
	      files: [{
	        dot: true,
	        src: [
	          '.tmp',
	          '<%= config.dist %>/*',
	          '!<%= config.dist %>/.git*'
	        ]
	      }]
	    },
	    server: '.tmp'
	  },

  	jshint: {
  		options: {
  			jshintrc: '.jshintrc',
  			reporter: require('jshint-stylish')
  		},
  		all: [
  			'gruntfile.js',
  			'<%= config.app %>/js/**/*.js',
        '<%= config.app %>/js/{,*/}*.js',
        '!<%= config.app %>/js/vendor/**/*.*',
        '!<%= config.app %>/js/bundle.js',
        '!<%= config.app %>/js/blog-post-stubs.js',
        '!<%= config.app %>/js/templates.js'
        
  		]
  	}, 
  	// lint end

  	sass: {
  		dist: {
  			files: [{
  				expand: true,
  				cwd: '<%= config.app %><%= config.sassfolder %>',
  				src: ['*.{scss,sass}'],
  				dest: '.tmp/styles',
  				ext: '.css'
  			}]
  		},
  		server: {
  			files: [{
  				expand: true,
          cwd: '<%= config.app %><%= config.sassfolder %>',
  				src: ['{,*/}*.{scss,sass}'],
  				dest: '<%= config.app %><%= config.cssfolder %>',
  				ext: '.css'
  			}]
  		},
  		export: {
        options: {
          sourcemap: 'none'
        },
  			files: [{
  				expand: true,
  				cwd: '<%= config.app %><%= config.sassfolder %>',
  				src: ['*.{scss,sass}'],
  				dest: '<%= config.dist %><%= config.cssfolder %>',
  				ext: '.css'
  			}]
  		}
  	}, // sass end

    handlebars: {
        all: {
          options: {
            processName: function(filePath) {
              return filePath.replace('app/js/', '').replace('templates/', '').replace('modules/', '').replace('.hbs', '');
            },
            // wrapped: false
          },
          files: {
            '<%= config.app %>/js/templates.js': ['app/js/**/*.hbs']
          } 
        }
    }, // handlbars end

    concat: {
      templates: {
        files: {

          // '<%= config.app %>/js/templates.js': ['<%= config.app %>/js/test/templates/templates.js'],
          '<%= config.app %>/js/templates.js': ['<%= config.app %>/js/templates.js'],
        },
        options: {
            // relative path is rubbish - but will do until porting over to gulp
          banner: 'var exports = (function () { \n\n var Handlebars = window.Handlebars; \n\n',
          footer: '\n return this[\'JST\'];\n})();\n\nmodule.exports = exports;'
        }
        // dist: {
        //   src: ['<%= config.app %>/scripts/templates/templates.js'],
        //   dest: '<%= config.app %>/scripts/templates.js',
          
        // }
      }
    },

    shell: {
      buildjs: {
        command: 'r.js -o <%= config.buildjs %>'
      },
      pushBuilt: {
        command: (function(message){ 
          if (typeof message === 'undefined') {
            return 'cd ../spenuk.github.io && git add . && git commit -am "Auto build update @ '+ new Date().toLocaleString() +'" && git push -u origin master';
          } else {
            return 'cd ../spenuk.github.io && git add . && git commit -am "Auto build update: ' + message + '" && git push -u origin master';
          }
        })()
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,jpg,txt}',
            '{,*/}*.html',
            '!html/**/*.*',
            // 'js/**/*.js',
            'js/vendor/*.js',
            'js/bundle.js',
            'styles/**/*.css',
            'styles/fonts/{,*/}*.*'
          ]}
        ]
      }
    },

    browserify: {
      server: {
        options: {
          browserifyOptions: {
             debug: true
          }
        },
        files: {
          '<%= config.app %>/js/bundle.js': ['<%= config.app %>/js/main.js'],
        }
      },
      dist: {
        files: {
          '<%= config.dist %>/js/bundle.js': ['<%= config.app %>/js/main.js'],
        }
      }
    }

  });

	grunt.registerTask('serve', 'Start the front-end server', function(target){
  	if (target === 'dist') {
  		return grunt.task.run(['build', 'connect:dist:keepalive']);
  	}

  	grunt.task.run([
  		'clean:server',
  		'sass:server',
  		'jshint',
  		'connect:livereload',
  		'watch'
  	]);
  }); // serve task end

  grunt.registerTask('build', [
  	'clean:dist',
  	'cssmin',
  	'uglify',
  	'copy:dist'
  ]);

	grunt.registerTask('export', [
    'clean:dist',
    'sass:export',
		'copy:dist'
	]);

  grunt.registerTask('devpush', [
    'export',
    'sftp-deploy:dev'
  ]);

  grunt.registerTask('default', [
    'serve'
  ]);

};