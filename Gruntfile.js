'use strict';

module.exports = function(grunt){

    var path = require('path');

    grunt.initConfig({
        clean: [ 'dist/', 'styles/*.css', 'graphics/iconfont/' ],

        bower: {
            install: {
                options: {
                    layout: 'byComponent'
                }
            }
        },

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

        requirejs: {
            dist: {
                options: {
                    baseUrl: './scripts',
                    name: 'styleboard',
                    out: 'dist/scripts/styleboard.js'
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

        copyto: {
            dist: {
                cwd: '.',
                dest: 'dist/',
                src: [
                    'LICENSE.txt',
                    'styleboard.config',
                    '{index,embed}.html',
                    'lib/{requirejs,ng-dummy}/js/*',
                    'graphics/iconfont/*.{eot,svg,ttf,woff}',
                    'graphics/*.svg',
                    'styles/*.css',
                    'wordpress/plugins/*php'
                ]
            }
        },

        jshint: {
            files: ['scripts/*.js', '!scripts/require.js'],
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

    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-copy-to');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-webfont');

    grunt.registerTask('default', ['webfont', 'less']);
    grunt.registerTask('dist', ['default', 'requirejs:dist', 'copyto:dist']);

};
