/**
 @filespec DictionaryView - view of the dictionary of all patterns in styleboard
 */
define(["PatternView", "TabbedFrameView", "appState"],
function ( PatternView, TabbedFrameView, appState ) {

    var DictionaryView = TabbedFrameView.extend({

        initialize: function () {
            var view = this,
                $el = view.$el,
                dict = view.model;

            view.$patternList = $el.find('.dictionary-list');
            view.$namedTab = $el.find('.frame-tabs > li:eq(1)');
            view.$current = $el.find('.dictionary-entry');

            dict.on('add', view.addPattern, view);

            appState.on('change:pattern', function (model, pattern) {
                view.selectPattern( pattern );
            });
        },

        render: function () {
            var view = this,
                dict = view.model;

            dict.sort
            dict.each( function (pat) {
                view.addPattern( pat, dict );
            });

            return view;
        },

        renderPattern: function ( pat ) {
            var view = this,
                dict = view.model;

            view.$namedTab.text( pat.get('name') );
            view.$current.empty();
            (new PatternView({
                el: view.$current,
                model: pat
            })).render();
        },

        addPattern: function ( pat, dict, options ) {
            var view = this,
                name = pat.get('name').replace('.','');
            view.$patternList.mk( 'li', name );
        },

        events: function () {
            return _.extend({}, TabbedFrameView.prototype.events, {
                'click .dictionary-list > li': 'uiSelectEntry'
            });
        },

        uiSelectEntry: function (event) {
            var view = this,
                dict = view.model,
                $target = $(event.target),
                index = $target.index(),
                pat = dict.at(index);
            view.selectPattern( pat );
        },

        selectPattern: function ( pattern ) {
            var view = this;

            view.renderPattern( pattern );
            view.selectPane( 1 );
        },

    }); // end of DictionaryView view

    return DictionaryView;
});
