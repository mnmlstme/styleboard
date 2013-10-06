/**
 @filespec PatternView - the view which depicts a Pattern in the styleboard
 */
define(['appState'], function (appState) {

    var PatternView = Backbone.View.extend({

        initialize: function () {
            var view = this,
                pattern = view.model,
                example = pattern.getDeclaration({ type: 'example', index: 0 }),
                $pane = view.$el.closest('.pane');

            appState.set('example', example);
            appState.on('change:example', view.updateExampleIsActive, view);

            view.$scrollmark = $pane.find('.pane-scrollmark');
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

            view.$scrollmargin = view.$el.mk( '.pane-scrollmargin' );

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
                example = appState.get('example');

            view.$('.pattern-example').each( function() {
                var $example = $(this);

                $example.toggleClass( 'is-active',
                                      $example.data('example') === example );
            });
        },

        events: {
            'click .pattern-example': 'uiClickExample',
            'click .pane-scrollmargin': 'uiStartScrolling',
            'mousemove .pane-scrollmargin': 'uiScroll',
            'mouseleave .pane-scrollmargin': 'uiStopScrolling'
        },

        uiClickExample: function uiClickExample( event ) {
            var view = this,
                $target = $(event.currentTarget),
                example = $target.data('example');

            appState.set('example', example);
        },

        uiStartScrolling: function uiStartScrolling( event ) {
            var view = this;

            event.stopPropagation();
            view.isScrolling = true;
            view.$scrollmark
                .addClass('is-visible');
            view.uiScroll( event );
        },

        uiScroll: function uiScroll( event ) {
            if ( !this.isScrolling ) return;
            var view = this,
                scrollTop = this.$el.scrollTop(),
                trackPoint = view.coordinates( event ).y,
                $examples = view.$('.pattern-example'),
                $current;

            view.$scrollmark
                .addClass('is-active')
                .css({ top: trackPoint + 'px' });

           $examples.each( function () {
               var $xmp = $(this),
                   offset = $xmp.position().top + scrollTop;
               // find the last example above trackPoint
               if ( offset < trackPoint ) {
                   $current = $xmp;
               }
               if ( offset >= trackPoint ) {
                   return false;
               }
           });

           $current = $current || $examples.last();
           appState.set('example', $current.data('example'));

        },

        uiStopScrolling: function uiStartScrolling( event ) {
            var view = this;

            view.isScrolling = false;
            view.uiScroll( event );
            view.$scrollmark
                .removeClass('is-active');
        },

        coordinates: function coordinates( e ) {
           var view = this,
               viewOffset = view.$el.offset(),
               pos = {};
           // after http://www.quirksmode.org/js/events_properties.html#position
           // TODO: is all this still necessary w/ modern browsers?
           if (e.pageX || e.pageY) {
               pos = { x:e.pageX, y:e.pageY };
           } else if (e.clientX || e.clientY) {
               pos = {
                   x:e.clientX + document.body.scrollLeft + 
                       document.documentElement.scrollLeft,
                   y:e.clientY + document.body.scrollTop +
                       document.documentElement.scrollTop
               };
           }
           return { 
               x: pos.x - viewOffset.left,
               y: pos.y - viewOffset.top
           };
       }

    });

    function code( text ) {
        return $.mk('code', text);
    }

    return PatternView;
});
