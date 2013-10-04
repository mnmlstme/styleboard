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
            appState.on('change:example', view.updateExampleIsActive, view);
        },

        render: function () {
            var view = this,
                pat = view.model,
                name = pat.get('name').replace('.',''),
                selectors = pat.get('selectors').map( function(s) {
                       return ['li', code( s.toCSS() )];
                }),
                declarations = pat.get('declarations');

            view.$el.mk( 'header',
                         [ 'h2', name] ,
                         ['ul.comma-.pattern-selectors'].concat( selectors )
                       );

            view.renderDeclarations( declarations );

            return view;
        },

        renderDeclarations: function ( declarations, $parent ) {
            var view = this;
            $parent = $parent || view.$el;
            declarations.forEach( function (defn) {
                var type = defn.get('type'),
                    selectors = defn.get('selectors').map( function(s) {
                        return ['li', code( s.toCSS() )];
                    }),
                    attrs = { 'class': 'pattern-' + type };
                switch ( type ) {
                case 'description':
                    $parent.mk( 'p', defn.get('text') );
                    break;
                case 'example':
                    $parent.mk( 'button.iconic-', attrs, 
                                ['i.presentation-.icon', 'Present Example'],
                                ['span', defn.get('title') || 'Example' ] )
                        .data( 'example', defn );
                    break;
                default:
                    view.renderDeclarations( 
                        defn.get('declarations'),
                        $parent.mk( 'section', attrs,
                                     [ 'header',
                                       [ 'p.pattern-role', type],
                                       [ 'h3', defn.get('name')]
                                     ])
                    );
                }
            });
            view.updateExampleIsActive();
        },

        updateExampleIsActive: function () {
            var view = this,
                example = appState.get('example'),
                $examples = view.$('.pattern-example'),
                $active = $examples.filter( function () {
                    return $(this).data('example') === example;
                }),
                viewOffset = view.$el.offset(),
                activeOffset = $active.offset(),
                relativeOffset = activeOffset.top - viewOffset.top - $active.outerWidth()/2;

            $examples.removeClass('is-active');
            $active.addClass('is-active');

            // scroll to current example
            view.$el.animate({
                scrollTop: relativeOffset - view.$el.outerWidth()/2 
            }, 200 );
        },

        events: {
            'click .pattern-example': 'uiClickExample'
        },

        uiClickExample: function uiClickExample(event) {
            var view = this,
                $target = $(event.currentTarget),
                example = $target.data('example');

            appState.set('example', example);
        },

    });

    function code( text ) {
        return $.mk('code', text);
    }

    return PatternView;
});
