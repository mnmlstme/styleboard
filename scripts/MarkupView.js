define( function () {

    var MarkupView = Backbone.View.extend({

        initialize: function () {
            var view = this;

            view.$pre = view.$el;

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
                example = view.model;

            view.$pre.text( example ? _.template( example.get('html'), example.get('scope') ) : '' );

            return view;
        }
    });

    return MarkupView;
});
