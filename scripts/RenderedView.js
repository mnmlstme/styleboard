define(['appState'], function (appState) {

    var CHECKERBOARD_SIZE = 16;

    var RenderedView = Backbone.View.extend({

        initialize: function ( options ) {
            var view = this;

            view.styles = options.styles;
            view.scripts = options.scripts;
            view.$pane = view.$el.closest('.pane');
            view.settings = {};

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
                example = view.model,
                iframeHtml = '<iframe src="about:blank">',
                doc;

            view.$el.html( iframeHtml );
            view.$iframe = view.$el.find('iframe');
            view.$iframe.load( function () {
                view.updateSettings();
            });

            if (example) {
                doc = view.$iframe[0].contentWindow.document;
                doc.open();
                doc.write('<html lang="en" style="height: auto">' +
                          '<head>' +
                          '<meta charset="utf-8">' +
                          view.styles.map( function (url) {
                              return '<link rel="stylesheet" type="text/css" ' +
                                  'href="' + url + '">';
                          }).join('\n') +
                          '<link rel="stylesheet" type="text/css" href="styles/styleboard-view.css">' +
                          view.scripts.map( function (url) {
                              return '<script src="' + url + '"></script>';
                          }).join('\n') +
                          '</head>' +
                          '<body class="styleboard-view">' +
                          example.expand() +
                          '</body>' +
                          '</html>');
                doc.close();
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
