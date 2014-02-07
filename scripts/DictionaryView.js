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

            dict.each( function (pat) {
                view.addPattern( pat );
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

        addPattern: function ( pat, options ) {
            var view = this,
                name = pat.getName();

            view.$patternList.mk( 'li',
                                  ['a', { href: '#' + name }, name ]);
        },

        selectPattern: function ( pattern ) {
            var view = this;

            view.renderPattern( pattern );
            view.selectPane( 1 );
        },

    }); // end of DictionaryView view

    return DictionaryView;
});
