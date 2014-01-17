/**
 @filespec PatternView - the view which depicts a Pattern in the styleboard
 */
define(['appState', 'Example'], function (appState, Example) {

    var PatternView = Backbone.View.extend({

        initialize: function () {
            var view = this,
                pattern = view.model;

            view.examples = [];

            appState.on('change:example', view.updateExampleIsActive, view);

        },

        render: function () {
            var view = this,
                pat = view.model,
                name = pat.get('name').replace('.',''),
                selectors = pat.getValues('selector').map( function(s) {
                       return ['li', code( s.toCSS() )];
                });

            view.$el.mk( 'header',
                         [ 'h2', name] ,
                         ['ul.comma-.pattern-selectors'].concat( selectors )
                       );

            view.renderDeclarations( pat );

            appState.set('example', view.examples.length ? view.examples[0] : new Example() );

            return view;
        },

        renderDeclarations: function ( definition, $parent ) {
            var view = this,
                pat = view.model,
                declarations = definition.getDeclarations(),
                scope = { pattern: pat.get('name') },
                $section;

            $parent = $parent || view.$el;
            scope[definition.get('type')] = definition.get('name');

            declarations.forEach( function (decl) {
                var key = decl.key,
                    value = decl.value,
                    attrs = { 'class': 'pattern-' + key },
                    example;
                switch ( key ) {
                case 'text':
                    $parent.mk( 'p', value );
                    break;
                case 'example':
                    example = new Example({ code: value.get('html'), scope: scope });
                    view.examples.push( example );
                    $parent.mk(
                        'button', attrs,
                        value.get('title') || "Example" )
                        .data( 'example', example );
                    break;
                case 'modifier':
                case 'state':
                case 'member':
                case 'helper':
                    $section = $parent.mk(
                        'section', attrs,
                        [ 'header',
                          [ 'p.pattern-role', value.get('type')],
                          [ 'h3', value.get('name')]
                        ]);
                    view.renderDeclarations( value, $section );
                    break;
                default:
                    // ignore
                    break;
                }
            });
        },

        updateExampleIsActive: function () {
            var view = this,
                example = appState.get('example'),
                scope = appState.get('scope'),
                $examples = view.$('.pattern-example'),
                viewOffset = view.$el.offset(),
                $active = $examples.filter( function () {
                    return $(this).data('example') === example;
                }),
                activeOffset = $active.offset(),
                relativeOffset = activeOffset ?
                    ( activeOffset.top - viewOffset.top -
                      $active.outerHeight()/2 - view.$el.outerHeight()/2 ) : 0;

            $examples.removeClass('is-active');
            $active.addClass('is-active');

            // scroll to current example
            view.$el.animate({
                scrollTop: relativeOffset
            }, 200 );
        },

        events: {
            'click .pattern-example': 'uiClickExample'
        },

        uiClickExample: function uiClickExample(event) {
            var view = this,
                $target = $(event.currentTarget);

            appState.set('example', $target.data('example'));
        }

    });

    function code( text ) {
        return $.mk('code', text);
    }

    return PatternView;
});
