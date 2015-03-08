var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var appState = require('./appState');

var CHECKERBOARD_SIZE = 16;

var RenderedView = Backbone.View.extend({

    initialize: function ( options ) {
        var view = this,
            styles = options.styles,
            scripts = options.scripts,
            $iframe = view.$iframe = view.$el.find('iframe'),
            context = view.context = view.$iframe[0].contentWindow,
            doc = view.doc = context.document;

        view.filler = options.filler;
        view.$pane = view.$el.closest('.pane');
        view.ngApp = options.ngApp || options['ng-app'];
        view.settings = {};

        $iframe.load( function () {
            view.render();
            view.updateSettings();
        });

        doc.open();
        doc.write('<html lang="en" style="height: 100%">' +
                  '<head>' +
                  '<meta charset="utf-8">' +
                  styles.map( function (url) {
                      return '<link rel="stylesheet" type="text/css" ' +
                          'href="' + url + '">';
                  }).join('\n') +
                  '<style>\n' +
                  'body{background-color:transparent;margin:0;font-size:100%}' +
                  '.styleboard-view{height:100%}\n' +
                  '.styleboard-content{float:left;position:relative;top:50%;left:50%;max-height:100%;' +
                  '-ms-transform:translate(-50%,-50%);' +
                  '-moz-transform:translate(-50%,-50%);' +
                  '-webkit-transform:translate(-50%,-50%);' +
                  'transform:translate(-50%,-50%)}\n' +
                  '.styleboard-content::after,.styleboard-view::after{display:block;content:"";clear:both}\n' +
                  '</style>\n' +
                  scripts.map( function (url) {
                      return '<script src="' + url + '"></script>';
                  }).join('\n') +
                  '</head>' +
                  '<body>' +
                  '<div class="styleboard-view"></div>' +
                  '</body>');
        doc.close();

        view.filler.on('change', view.render, view );

        appState.on('change:example', function( appState, example ) {
            view.setModel( example );
        });

        appState.on('change:settings', function( appState, settingsJSON ) {
            view.setSettings( settingsJSON );
        });

        $(window).on("resize", function () { view.updateSettings(); } );
    },

    setModel: function setModel ( example ) {
        var view = this;

        view.model = example;
        view.render();
    },

    setSettings: function setSettings ( settingsJSON ) {
        var view = this;
        // TODO: should settings be a Model?
        view.settings = JSON.parse(settingsJSON);
        view.updateSettings();
    },

    render: function render () {
        var view = this,
            doc = view.doc,
            $body = $(doc.body),
            $view = $(doc.body).find('.styleboard-view').first(),
            example = view.model,
            template = example && example.getText(),
            scope = example && example.getScope(),
            files = example && example.getAttr('files') || [],
            firstHtml = _.findWhere(files, {type: 'html'}),
            url = firstHtml && firstHtml.url;

        if ( $view.length ) {
            $view.empty();
            if ( example ) {
                if ( template ) {
                    renderTemplate();
                } else if ( url ) {
                    $.ajax({
                        url: url,
                        cache: false,
                        dataType: 'text',
                        error:  function ( xhr, status, error ) {
                            alert("Failed to load " + url + "\n" + status + ": " + error);
                        },
                        success: function( data, status, xhr ) {
                            example.addText( template = data );
                            renderTemplate();
                        }
                    });
                }
            }
        }

        function renderTemplate() {
            var code = template ? view.filler.expand( template, scope ) : '',
                scripts = [],
                $content;

            $content = $view.mk('div#styleboard-content.styleboard-content')
                .append( $.parseHTML( code || '', view.doc, true ) );

            if ( files ) {
                files.forEach( function (attrs) {
                    switch ( attrs.type ) {
                    case 'js':
                        scripts.push( attrs );
                        injectScript( attrs.url, bootstrap );
                        break;
                    case 'css':
                        injectStyle( attrs.url );
                        break;
                    }
                });
            }

            if ( !scripts.length ) {
                bootstrap();
            }
        }

        function injectScript( url, onload ) {
            // We have to create the script tag using the iframe's document,
            // so it's easiest to use plain Javascript.
            var script = doc.createElement('script');
            script.type = 'text/javascript';
            if ( onload ) {
                script.onload = onload
            }
            doc.body.appendChild(script);
            // Setting 'src' initiates the request
            if ( url ) {
                script.src = url;
            }

        }

        function injectStyle( url ) {
            // We have to create the script tag using the iframe's document,
            // so it's easiest to use plain Javascript.
            var link = doc.createElement('link');
            link.ref = 'stylesheet';
            link.type = 'text/css';
            link.href = url;
            doc.body.appendChild(link);
        }

        function bootstrap() {
            var content = doc.getElementById('styleboard-content');
            // TODO: make this wait for N>1 scripts to load
            // TODO: any other frameworks require bootstrapping?

            if ( view.ngApp ) {
                view.context.angular.bootstrap(content,[view.ngApp]);
            }

            view.updateSettings();
        }

    },

    updateSettings: function updateSettings() {
        if ( !this.$iframe ) { return; }
        var view = this,
            $sandbox = view.$el,
            $iframe = view.$iframe,
            $body = $iframe.contents().find('body'),
            $content = $body.children(),
            iFrameSettings = ['width'],
            sandboxSettings = ['transform'],
            transform = view.settings.transform || "",
            scaleMatch = transform.match( /^scale\(([0-9.]+)\)$/ ),
            scale = scaleMatch ? 1 * scaleMatch[1] : 1,
            position = { position: 'relative', top: 0, left: 0 },
            applyTo = {
                transform: $sandbox,
                width:  $iframe,
                'background-color': $body,
                'font-size': $body
            };

        $iframe.removeAttr('style');

        if ( $content.length ) {
            $content.removeAttr('style');

            // Apply all the user-controlled view settings.
            // TODO: animate the transitions
            _(applyTo).each( function ($where, key) {
                $where.css( key, view.settings[key] );
            });

            // Make adjustments for scale.
            view.$el.css({ width: (100 / scale) + '%', height: (100 / scale) + '%' });
            view.$pane.css({ 'background-size': CHECKERBOARD_SIZE * scale + 'px' });
        }
    }

}); // end of view RenderedView

module.exports = RenderedView;
