/**
 @filespec PatternView - the view which depicts a Pattern in the styleboard
 */
define(['appState'], function (appState) {

    var PatternView = Backbone.View.extend({

        initialize: function () {
            var view = this,
                pattern = view.model,
                example = pattern.getDeclaration({ type: 'example', index: 0 });

            appState.set('example', example);
        },

        render: function () {
            var view = this,
                pat = view.model,
                name = pat.get('name').replace('.',''),
                selectors = pat.get('selectors'),
                declarations = pat.get('declarations');

            view.$el.mk( 'header',
                         [ 'h2', name] ,
                         ['ul.comma-.pattern-selectors'].concat( selectors.map( function(s) {
                               return ['li', code( s.toCSS() )]; 
                           })) 
                       );

            view.renderDeclarations( declarations );

            return view;
        },

        renderDeclarations: function ( declarations, $parent ) {
            var view = this;
            $parent = $parent || view.$el;
            declarations.forEach( function (defn) {
                var type = defn.get('type'),
                    attrs = { 'class': 'pattern-' + type };
                switch ( type ) {
                case 'description':
                    $parent.mk( 'p', defn.get('text') );
                    break;
                case 'example':
                    $parent.mk( 'div', attrs, defn.get('title') || 'View' )
                        .data( 'example', defn );
                    break;
                default:
                    view.renderDeclarations( 
                        defn.get('declarations'),
                        $parent.mk( 'section', attrs,
                                     [ 'header',
                                       [ 'label', type],
                                       [ 'h3', defn.get('name')]] )
                    );
                }
            });

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
