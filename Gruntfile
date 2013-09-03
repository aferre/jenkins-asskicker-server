/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\n" : "" %>' +
        ' * <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
        ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
        ' */'
    },
    concat: {
      dist: {
        src: ['<banner:meta.banner>', '<file_strip_banner:src/<%= pkg.name %>.js>'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist.dest>'],
        dest: 'dist/<%= pkg.name %>.min.js'
      }
    },
    qunit: {
      files: ['test/**/*.html']
    },
    lint: {
      files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint qunit'
    },
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
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'lint qunit concat min');

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
