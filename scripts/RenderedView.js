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

            view.$body = view.$('iframe').contents().find('body');
            view.$title = view.$('h2');

            appState.on('change:example', function( appState, example ) {
                view.setModel( example );
            });
        },

        setModel: function ( example ) {
            var view = this;

            view.model = example;
            view.render();
        },

        render: function () {
            var view = this,
                example = view.model,
                title = example ? example.get('title') : '',
                html = example ? example.get('html') : '';

            view.$title.text( title );
            view.$body.empty().html( html );
        }

    }); // end of view RenderedView

    return RenderedView;
});
