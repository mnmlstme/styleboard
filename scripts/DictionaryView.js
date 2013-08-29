define(["ModuleView"], function ( ModuleView ) {

    var DictionaryView = Backbone.View.extend({

        initialize: function () {
            var view = this,
                $el = view.$el,
                dict = view.model;

            view.$moduleList = $el.find('.dictionary-list');
            view.$namedTab = $el.find('.frame-tabs > li:eq(1)');
            view.$current = $el.find('.dictionary-entry');

            dict.on('add', view.add, view);
        },

        render: function () {
            var view = this,
                dict = view.model;

            dict.each( function (mod) {
                view.add( mod, dict );
            });

            return view;
        },

        add: function ( mod, dict, options ) {
            var view = this;
            view.$moduleList.mk( 'li', mod.get('name') );
        },

        select: function ( mod ) {
            var view = this,
                dict = view.model;
            
            view.$namedTab.text( mod.get('name') );
            view.$current.empty();
            (new ModuleView({
                el: view.$current,
                model: mod
            })).render();
        },

        selectPane: function ( index ) {
            var view = this;

            activateNth( view.$('.frame-tabs > li'), index );
            activateNth( view.$('.frame-panes > li'), index );
        },

        events: {
            'click .frame-tabs > li': 'uiSelectPane',
            'click .dictionary-list > li': 'uiSelectEntry'
        },

        uiSelectPane: function (event) {
            var view = this,
                $target = $(event.target),
                index = $target.index();

            view.selectPane( index );
        },

        uiSelectEntry: function (event) {
            var view = this,
                dict = view.model,
                $target = $(event.target),
                index = $target.index(),
                mod = dict.at(index);

            view.select( mod );
            view.selectPane( 1 );
        }

    }); // end of DictionaryView view

    function activateNth( $list, index ) {
        $list
            .removeClass('is-active')
          .eq(index)
            .addClass('is-active');
    }

    return DictionaryView;
});
