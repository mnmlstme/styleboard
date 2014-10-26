var $ = require('jquery');

/**
 @filespec DictionaryView - view of the dictionary of all patterns in styleboard
 */
var PatternView = require('./PatternView');
var TabbedFrameView = require('./TabbedFrameView');
var appState = require('./appState');


var title = 'StyleBoard';

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
        dict
            .sortBy( function (pat) { return pat.getName(); } )
            .forEach( function (pat) { view.addPattern( pat ); });

        return view;
    },

    renderPattern: function ( pat ) {
        var view = this,
            dict = view.model,
            patternName = pat.getName();

        if ( view.currentPattern &&
             view.currentPattern.getNode() === pat.getNode() ) {
            return;
        }

        view.currentPattern = pat;
        view.$namedTab.text( patternName );
        $('title').text( patternName + ' — ' + title );
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

    clearPattern: function () {
        var view = this;

        view.$namedTab.empty();
        view.$current.empty();

        $('title').text( title );
    },

    selectPattern: function ( pattern ) {
        var view = this,
            name = pattern.getName();

        if ( name ) {
            view.renderPattern( pattern );
        } else {
            view.clearPattern();
        }
        view.selectPane( name ? 1 : 0 );
    },

}); // end of DictionaryView view

module.exports = DictionaryView;
