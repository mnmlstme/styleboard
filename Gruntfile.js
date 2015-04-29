'use strict';

module.exports = function(grunt){

    var path = require('path');

    grunt.initConfig({
        clean: {
            prep: ['bower_components/', 'lib/'],
            build: [ 'build/', 'dist/', 'styles/*.css', 'graphics/iconfont/' ]
        },

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

        browserify: {
            options: {
                browserifyOptions: {
                    debug: true
                }
            },
            bundle: {
                src: 'scripts/styleboard.js',
                dest: 'build/bundle.js'
            },
            test: {
                src: 'scripts/test.js',
                dest: 'build/test-bundle.js'
            },
            demo: {
                src: 'scripts/demo.js',
                dest: 'build/demo-bundle.js'
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
                    'build/bundle.js',
                    'build/demo-bundle.js',
                    'graphics/iconfont/*.{eot,svg,ttf,woff}',
                    'graphics/*.svg',
                    'styles/*.css',
                    'styles/*/examples/**',
                    'texts/**'
                ]
            }
        },

        jshint: {
            files: ['scripts/*.js', '!scripts/mkay.js'],
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
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-copy-to');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-webfont');

    grunt.registerTask('prep', ['bower']);
    grunt.registerTask('default', ['less', 'browserify:bundle', 'browserify:demo']);
    grunt.registerTask('check', ['jshint', 'browserify:test','qunit']);
    grunt.registerTask('dist', ['default', 'copyto:dist']);

};
