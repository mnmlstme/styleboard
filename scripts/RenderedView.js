define(['appState'], function (appState) {

    var CHECKERBOARD_SIZE = 16;

    var RenderedView = Backbone.View.extend({

        initialize: function ( options ) {
            var view = this,
                styles = options.styles;
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
            doc.write('<html lang="en" style="height: auto">' +
                      '<head>' +
                      '<meta charset="utf-8">' +
                      styles.map( function (url) {
                          return '<link rel="stylesheet" type="text/css" ' +
                              'href="' + url + '">';
                      }).join('\n') +
                      '<link rel="stylesheet" type="text/css" href="styles/styleboard-view.css">' +
                      scripts.map( function (url) {
                          return '<script src="' + url + '"></script>';
                      }).join('\n') +
                      '</head>' +
                      '<body class="styleboard-view">');
            doc.close();

            view.filler.on('change', function () {
                view.render();
            });

            appState.on('change:example', function( appState, example ) {
                view.setModel( example );
            });

            appState.on('change:settings', function( appState, settingsJSON ) {
                view.setSettings( settingsJSON );
            });
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
                example = view.model,
                scope = example ? example.getScope() : {},
                template = example ? example.getText() : '',
                code = template ? view.filler.expand( template, scope ) : '',
                $app = $body;

            if ( $body.length ) {
                $body.empty();
                if ( example ) {
                    if ( view.ngApp ) {
                        $app = $body.mk('div.styleboard-ng-app');
                    }
                    $app.append( $.parseHTML( code || '', view.doc, true ) );
                    if ( view.ngApp ) {
                        view.context.angular.bootstrap($app[0],[view.ngApp]);
                    }
                }
            }
        },

        updateSettings: function updateSettings() {
            if ( !this.$iframe ) { return; }
            var view = this,
                $body = view.$iframe.contents().find('body'),
                defaultHeight = view.$el.offsetParent().height() -
                                    2 * view.$el.position().top,
                iFrameSettings = ['width'],
                sandboxSettings = ['transform'];

            view.$iframe.css( 'height', defaultHeight ); // used if content is height: 100%

            if ( $body.children().length ) {
                $body.css( _(view.settings).omit(iFrameSettings.concat(sandboxSettings)) );
                view.$iframe.css( _(view.settings).pick(iFrameSettings) );
                view.$iframe.css( 'height', $body.outerHeight() );
                view.$el.css( _(view.settings).pick(sandboxSettings) );
                view.updateTransform( view.settings.transform );
            }
        },

        updateTransform: function updateTransform( transform ) {
            transform = transform || "";
            var view = this,
                scaleMatch = transform.match( /^scale\(([0-9.]+)\)$/ ),
                scale = scaleMatch ? 1 * scaleMatch[1] : 1;

            view.$pane.css({ 'background-size': CHECKERBOARD_SIZE * scale + 'px' });
        },

    }); // end of view RenderedView

    return RenderedView;
});
