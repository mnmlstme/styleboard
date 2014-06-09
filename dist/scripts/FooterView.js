define(['appState'], function (appState) {

    var FooterView = Backbone.View.extend({

        initialize: function ( options ) {
            view = this;

            view.$title = view.$el.find('.footer-title');

            view.current = appState.get('example');

            appState.on('change:example', function( appState, example ) {
                view.current = example;
                view.update();
            });
        },

        render: function render() {
            this.update();
        },

        update: function update() {
            var view = this;

            view.$title.text( view.current ? view.current.get('title') : '' );
        }
    });

    return FooterView;
});
