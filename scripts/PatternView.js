/**
 @filespec PatternView - the view which depicts a Pattern in the styleboard
 */
define(['appState'], function (appState) {

    var PatternView = Backbone.View.extend({

        initialize: function () {
            var view = this;

            appState.on('change:example', view.updateExampleIsActive, view);
        },

        render: function () {
            var view = this,
                pat = view.model,
                name = pat.getName();

            view.$el.mk( 'header', [ 'h1', name] );

            view.renderNodes();

            return view;
        },

        renderNodes: function () {
            var view = this,
                pat = view.model,
                patternName = pat.getName(),
                examples = pat.getAllNodesOfType('example'),
                exampleIndex = 0;

            recursivelyRenderNodes( pat, view.$el );

            function recursivelyRenderNodes ( parent, $parent ) {
                var children = parent.getNodes(),
                    scope = { pattern: patternName },
                    $section;
                scope[ parent.getType() ] = parent.getName();
                children.forEach( function (node) {
                    var key = node.getType(),
                        attrs = { 'class': 'pattern-' + key },
                        example;
                    switch ( key ) {
                    case 'p':
                        $parent.mk( 'p', node.getText() );
                        break;
                    case 'html':
                        $(node.getText()).appendTo($parent);
                        break;
                    case 'example':
                        // TODO: this relies on order of traversal
                        example = examples[exampleIndex];
                        attrs.href = '#' + pat.getName() + '/' +
                            (example.getAttr('name') || exampleIndex);
                        $parent.mk( 'a.button', attrs,
                            example.getAttr('title') || "Example" )
                            .data( 'example', example );
                        exampleIndex++;
                        break;
                    case 'modifier':
                    case 'state':
                    case 'member':
                    case 'helper':
                        $section = $parent.mk(
                            'section', attrs,
                            [ 'header',
                              [ 'h4', node.getType()],
                              [ 'h3', node.getName()]
                            ]);
                        recursivelyRenderNodes( node, $section );
                        break;
                    default:
                        // ignore
                        break;
                    }
                });
            }
        },

        updateExampleIsActive: function () {
            var view = this,
                example = appState.get('example'),
                scope = appState.get('scope'),
                $examples = view.$('.pattern-example'),
                viewOffset = view.$el.offset(),
                $pane = view.$el.closest('.pane'),
                $active = $examples.filter( function () {
                    return $(this).data('example').getNode() === example.getNode();
                }),
                activeOffset = $active.offset(),
                relativeOffset = activeOffset ?
                    ( activeOffset.top - viewOffset.top - $pane.outerHeight()/2 ) : 0;

            $examples.removeClass('is-active');
            $active.addClass('is-active');

            // scroll to current example
            $pane.animate({
                scrollTop: relativeOffset
            }, 200 );
        }

    });

    function code( text ) {
        return $.mk('code', text);
    }

    return PatternView;
});
