define( function () {

    var EditableFillerView = Backbone.View.extend({

        events: {
            'click': 'uiStartEditing',
            'blur': 'uiStopEditing',
            'keypress': 'uiKeypress'
        },

        initialize: function ( options ) {
            var view = this;

            view.key = options.key;
        },

        render: function () {
            var view = this,
                filler = view.model,
                value = filler.lookup(view.key);

            view.$el.text( value );
        },

        uiStartEditing: function () {
            var view = this,
                $editable = view.$el;

            $editable
                .attr('contenteditable', true)
                .focus();
        },

        uiStopEditing: function () {
            var view = this,
                filler = view.model,
                $editable = view.$el,
                value = $editable.text();

            filler.setValue( view.key, value );
        },

        uiKeypress: function (e) {
            var view = this;

            if (e.which === 13) {
                view.$el.trigger('blur');
            }
        }
    });

    return EditableFillerView;
});
