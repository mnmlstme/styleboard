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

        render: function render() {
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
            view.updateContentHeight();

            return view;
        },

        updateContentHeight: function updateContentHeight() {
            var view = this,
                scrollTop = view.$el.scrollTop(),
                paneHeight = view.$el.outerHeight();
                $last = view.$el.children().last(),
                offset = $last.position().top + scrollTop,
                height = $last.outerHeight(),
                minContentHeight = paneHeight * 1.5;

            view.paddedContentHeight =
                view.contentHeight = offset + height;

            if( view.contentHeight < minContentHeight ) {
                view.$el.mk('footer')
                    .height(minContentHeight - view.contentHeight);
                view.paddedContentHeight = minContentHeight;
            }
        },

        renderDeclarations: function renderDeclarations( declarations, $parent ) {
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
                example = appState.get('example');

            view.$('.pattern-example').each( function() {
                var $example = $(this);

                $example.toggleClass( 'is-active',
                                      $example.data('example') === example );
            });
        },

        events: {
            'click .pattern-example': 'uiClickExample',
            'scroll': 'uiTrackScrolling'
        },

        uiClickExample: function uiClickExample(event) {
            var view = this,
                $target = $(event.currentTarget),
                example = $target.data('example');

            appState.set('example', example);
        },

        uiTrackScrolling: function uiTrackScrolling(event) {
            var view = this,
                scrollTop = this.$el.scrollTop(),
                paneHeight = this.$el.outerHeight(),
                trackPoint = view.contentHeight * scrollTop /
                    (view.paddedContentHeight-paneHeight),
                $examples = view.$('.pattern-example'),
                $current;

            $examples.each( function () {
                var $xmp = $(this),
                    offset = $xmp.position().top + scrollTop;
                if ( offset >= trackPoint ) {
                    $current = $xmp;
                    return false;
                }
            });
            
            $current = $current || $examples.last();
            appState.set('example', $current.data('example'));
        }

    });

    function code( text ) {
        return $.mk('code', text);
    }

    return PatternView;
});
