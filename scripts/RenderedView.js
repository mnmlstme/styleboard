define(['appState'], function (appState) {

    var CHECKERBOARD_SIZE = 16;

    var RenderedView = Backbone.View.extend({

        initialize: function ( options ) {
            var view = this;

            view.cssUrl = options.cssUrl;
            view.$iframe = view.$('iframe');
            view.$pane = view.$el.closest('.pane');
            view.settings = {};

            view.$iframe.load( function () {
                view.updateSettings();
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
                doc = view.$iframe[0].contentWindow.document,
                example = view.model;

            if (example) {

                doc.open();
                doc.write('<html lang="en" style="height: auto">' +
                          '<head>' +
                          '<meta charset="utf-8">' +
                          '<link rel="stylesheet" type="text/css" href="' + view.cssUrl + '">' +
                          '</head>' +
                          '<body style="background: #fff; font-size: 100%; height: auto; overflow:auto">' +
                          example.expand() +
                          '</body>' +
                          '</html>');
                doc.close();
            }
        },

        updateSettings: function updateSettings() {
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
