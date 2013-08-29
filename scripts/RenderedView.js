define(['appState'], function (appState) {

    var RenderedView = Backbone.View.extend({

        initialize: function () {
            var view = this;

            view.$title = view.$('h2');

            appState.on('change:module', function( model, value ) {
                view.renderExample( value );
            });
        },

        render: function () {
            var view = this,
                doc = view.$('iframe')[0].contentWindow.document;

            doc.open();
            doc.write('<html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" type="text/css" href="' +
                      view.options.cssUrl + '"></head><body></body></html>');
            doc.close();

            view.$body = view.$('iframe').contents().find('body');

            return view;
        },

        renderExample: function ( module, index ) {
            index = index || 0;

            var view = this,
                examples = module.get('examples'),
                example = examples && examples[index],
                title = example ? (example.get('title') || 'Example: ' + module.get('name')) : '',
                html = example && example.get('html');

            view.$body.empty().html( html );
            view.$title.text( title );
        }

    }); // end of view RenderedView

    return RenderedView;
});
