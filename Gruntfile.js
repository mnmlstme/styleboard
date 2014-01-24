'use strict';

module.exports = function(grunt){

    var path = require('path');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        less: {
            options: {
                sourceMap: true,
                relativeUrls: true
            },
            build: {
                files : {
                    "styles/styleboard.css": "styles/styleboard.less"
                }
            }
        },

        webfont: {
            iconfont: {
                src: 'graphics/icons/*.svg',
                dest: 'graphics/iconfont',
                options: {
                    font: 'iconfont',
                    stylesheet: 'less',
                    template: 'graphics/webfont/template.css',
                    htmlDemoTemplate: 'graphics/webfont/template.html'
                }
            }
        },

        jshint: {
            files: ['scripts/*.js'],
            options: {
                globals: {
                    jQuery: true
                }
            }
        },

        qunit: {
            files: ['test.html']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-webfont');

    grunt.registerTask('default', ['webfont', 'less']);

};
