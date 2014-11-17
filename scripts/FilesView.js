/**
 @filespec FilesView - view of all the files for an example
 */
var $ = require('jquery');
var Backbone = require('backbone');

var CodeView = require('./CodeView');
var TabbedFrameView = require('./TabbedFrameView');
var appState = require('./appState');

var FilesView = TabbedFrameView.extend({

    initialize: function ( options ) {
        var view = this,
            $el = view.$el,
            example = view.model;

        view.doc = options.doc;
        view.filler = options.filler;
        view.$tabs = $el.find('.frame-tabs');
        view.$panes = $el.find('.frame-panes');

        appState.on('change:example', function (appState, example) {
            view.selectExample( example, appState.get('pattern') );
        });
    },

    render: function () {
        var view = this,
            example = view.model,
            content = example && example.getText(),
            files = example && example.getAttr('files') || [];

        view.$tabs.empty();
        view.$panes.empty();

        if ( content ) {
            view.renderFile({
                name: 'html',
                type: 'html',
                content: content
            })
        }

        files.forEach( function (attrs) {
            view.renderFile(attrs)
        });

        return view;
    },

    renderFile: function ( attrs ) {
        var view = this,
            $tab = $.mk('li', attrs.name),
            $pre = $.mk('pre'),
            $pane = $.mk('li', ['section.code.dark-.scrollable-.pane', $pre]);

        view.$tabs.append( $tab );
        view.$panes.append( $pane );

        if ( attrs.content ) {
            (new CodeView({
                el: $pre,
                doc: view.doc,
                filler: view.filler,
                pattern: view.pattern,
                model: new Backbone.Model( attrs )
            })).render();
        } else {
            $.ajax({
                url: attrs.url,
                cache: false,
                dataType: 'text',
                error:  function ( xhr, status, error ) {
                    alert("Failed to load " + attrs.url + "\n" +
                        status + ": " + error);
                },
                success: function( data, status, xhr ) {
                    attrs.content = data;
                    (new CodeView({
                        el: $pre,
                        doc: view.doc,
                        filler: view.filler,
                        pattern: view.pattern,
                        model: new Backbone.Model( attrs )
                    })).render();
                }
            });
        }
    },

    selectExample: function ( example, pattern ) {
        var view = this,
            files = example.getAttr( files );

        view.model = example;
        view.pattern = pattern;
        view.render();
        view.selectPane( 0 );
    },

}); // end of FilesView view

module.exports = FilesView;
