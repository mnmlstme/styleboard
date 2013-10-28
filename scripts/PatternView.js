/**
 @filespec PatternView - the view which depicts a Pattern in the styleboard
 */
define(['appState'], function (appState) {

    var KEY_PREVIOUS = 80,  // p
        KEY_NEXT = 78;      // n

    var PatternView = Backbone.View.extend({

        initialize: function () {
            var view = this,
                pattern = view.model,
                example = pattern.getFirst('example');

            view.examples = [];

            appState.set('example', example);
            appState.on('change:example', view.updateExampleIsActive, view);

            // TODO: we need to remove this when the view is detached
            $(document).keydown( function (event) {
                view.uiKeydown(event);
            });
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

            return view;
        },

        renderDeclarations: function ( definition, $parent ) {
            var view = this,
                declarations = definition.getDeclarations(),
                $section;

            $parent = $parent || view.$el;
            declarations.forEach( function (decl) {
                var key = decl.key,
                    value = decl.value,
                    attrs = { 'class': 'pattern-' + key };
                switch ( key ) {
                case 'text':
                    $parent.mk( 'p', value );
                    break;
                case 'example':
                    view.examples.push( value );
                    $parent.mk(
                        'button', attrs,
                        ['strong', "View:"],
                        ' ',
                        ['span', value.title || "Example"] )
                        .data( 'example', value );
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
            view.updateExampleIsActive();
        },

        updateExampleIsActive: function () {
            var view = this,
                example = appState.get('example'),
                $examples = view.$('.pattern-example'),
                viewOffset = view.$el.offset(),
                $active = $examples.filter( function () {
                    return $(this).data('example') === example;
                }),
                activeOffset = $active.offset(),
                relativeOffset = activeOffset ?
                    ( activeOffset.top - viewOffset.top -
                      $active.outerWidth()/2 - view.$el.outerWidth()/2 ) : 0;

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
                $target = $(event.currentTarget),
                example = $target.data('example');

            appState.set('example', example);
        },

        uiKeydown: function uiKeydown(event) {
            var view = this,
                pattern = view.model,
                index = view.examples.indexOf( appState.get('example') ),
                original = index,
                length = view.examples.length;

            if ( !length ) return;

            switch ( event.which ) { 
            case KEY_PREVIOUS:
                index = index - 1;
                break;
            case KEY_NEXT:
                index = index + 1;
                break;
            }

            if ( index < 0 ) index = 0;
            if ( index >= length ) index = length - 1;
            if ( index !== original ) {
                appState.set('example', view.examples[index] );
            }
        }

    });

    function code( text ) {
        return $.mk('code', text);
    }

    return PatternView;
});
