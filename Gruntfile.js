/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        globals: {
          jQuery: true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['lib/**/*.js', 'test/**/*.js']
      }
    },
    nodeunit: {
      files: ['test/**/*_test.js']
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'nodeunit']
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['jshint', 'nodeunit']);

  // Travis CI task.
  grunt.registerTask('travis', 'lint qunit');
  
  // Npm deploy task.
   grunt.registerMultiTask('publish', 'Publish the latest version of this plugin', function() {
  	var done = this.async(),
			me = this,
			npm = require('npm');
		npm.load({}, function(err) {
			npm.registry.adduser(me.data.username, me.data.password, me.data.email, function(err) {
				if (err) {
					console.log(err);
					done(false);
				} else {
					npm.config.set("email", me.data.email, "user");
					npm.commands.publish([], function(err) {
						console.log(err || "Published to registry");
						done(!err);
					});
				}
			});
		});
	});

};
