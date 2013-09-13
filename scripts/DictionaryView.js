define(["ModuleView", "appState"], function ( ModuleView, appState ) {

    var DictionaryView = Backbone.View.extend({

        initialize: function () {
            var view = this,
                $el = view.$el,
                dict = view.model;

            view.$moduleList = $el.find('.dictionary-list');
            view.$namedTab = $el.find('.frame-tabs > li:eq(1)');
            view.$current = $el.find('.dictionary-entry');

            dict.on('add', view.addModule, view);

            appState.on('change:module', function (model, value) {
                view.renderModule( value );
            });
        },

        render: function () {
            var view = this,
                dict = view.model;

            dict.sort
            dict.each( function (mod) {
                view.addModule( mod, dict );
            });

            return view;
        },

        renderModule: function ( mod ) {
            var view = this,
                dict = view.model;
            
            view.$namedTab.text( mod.get('name') );
            view.$current.empty();
            (new ModuleView({
                el: view.$current,
                model: mod
            })).render();
        },

        addModule: function ( mod, dict, options ) {
            var view = this;
            view.$moduleList.mk( 'li', mod.get('name') );
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

            appState.set('module', mod);
            view.selectPane( 1 );
        },

        selectPane: function ( index ) {
            var view = this;

            activateNth( view.$('.frame-tabs > li'), index );
            activateNth( view.$('.frame-panes > li'), index );
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
