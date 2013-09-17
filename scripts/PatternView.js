/**
 @filespec PatternView - the view which depicts a Pattern in the styleboard
 */
define(['appState'], function (appState) {

    var PatternView = Backbone.View.extend({

        initialize: function () {
            var view = this,
                pattern = view.model,
                example = pattern.getDefinition({ type: 'example', index: 0 });

            appState.set('example', example);
        },

        render: function () {
            var view = this,
                pat = view.model,
                name = pat.get('name').replace('.',''),
                selectors = pat.get('selectors'),
                definitions = pat.get('definitions');

            view.$el.mk( 'header',
                         [ 'h2', name] ,
                         ['ul.comma-.pattern-selectors'].concat( selectors.map( function(s) {
                               return ['li', code( s.toCSS() )]; 
                           })) 
                       );

            definitions.forEach( function (defn) {
                var type = defn.get('type'),
                    attrs = { 'class': 'pattern-' + type };
                switch ( type ) {
                case 'description':
                    view.$el.mk( 'p', defn.get('text') );
                    break;
                case 'example':
                    view.$el.mk( 'div', attrs, defn.get('title') || 'View' )
                        .data( 'example', defn );
                    break;
                default:
                    view.$el.mk( 'section', attrs,
                                 [ 'header',
                                   [ 'label', type],
                                   [ 'h3', defn.get('name')]]
                               );
                }
            });

            return view;
        },

        events: {
            'click .pattern-example': 'uiSelectExample'
        },

        uiSelectExample: function (event) {
            var view = this,
                $target = $(event.target),
                example = $target.data('example');

            appState.set('example', example);
        },

    });

    function code( text ) {
        return $.mk('code', text);
    }

    return PatternView;
});
