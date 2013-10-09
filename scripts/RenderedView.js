define(['appState'], function (appState) {

    var RenderedView = Backbone.View.extend({

        initialize: function ( options ) {
            var view = this,
                doc = view.$('iframe')[0].contentWindow.document;

            doc.open();
            doc.write('<html lang="en"><head><meta charset="utf-8">' + 
                      '<link rel="stylesheet" type="text/css" href="' + options.cssUrl + '">' +
                      '</head><body></body></html>');
            doc.close();

            view.$iframe = view.$('iframe');
            view.$body = view.$iframe.contents().find('body');
            view.$title = view.$('h2');

            view.settings = {};
            
            // TODO: make the default context configurable
            // view.context = 'typography';

            appState.on('change:example', function( appState, example ) {
                view.setModel( example );
            });

            appState.on('change:context', function( appState, context ) {
                view.setContext( context );
            });

            appState.on('change:settings', function( appState, settingsJSON ) {
                view.setSettings( settingsJSON );
            });
        },

        setContext: function setContext( classes ) {
            var view = this;
            view.context = classes;
            view.updateContext();
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
                title = example ? example.get('title') : '',
                html = example ? example.get('html') : '';

            view.$title.text( title );
            view.$body.empty().html( html );
            view.updateContext();
            view.updateSettings();
        },

        updateContext: function updateContext() {
            var view = this;
            view.$body.attr('class', view.context);
        },

        updateSettings: function updateSettings() {
            var view = this,
                iFrameSettings = ['width', 'height'];

            view.$body.css( _(view.settings).omit(iFrameSettings) );
            view.$iframe.css( _(view.settings).pick(iFrameSettings) );
        }


    }); // end of view RenderedView

    return RenderedView;
});
