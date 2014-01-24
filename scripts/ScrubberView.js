define(['appState'], function (appState) {

    var KEY_PREVIOUS = 80,  // p
        KEY_NEXT = 78;      // n

    var ScrubberView = Backbone.View.extend({

        initialize: function ( options ) {
            view = this;

            view.$selector = view.$el.find('.scrubber-selector');
            view.$title = view.$el.find('.scrubber-title');

            appState.on('change:pattern', function( appState, pattern ) {
                view.setModel( pattern );
            });

            appState.on('change:example', function( appState, example ) {
                view.setCurrent( example );
            });

            // TODO: we need to remove this when the view is detached
            $(document).keydown( function (event) {
                view.uiKeydown(event);
            });
        },

        setModel: function setModel( pattern ) {
            var view = this;

            view.model = pattern;
            view.render();
        },

        setCurrent: function setCurrent( example ) {
            var view = this;

            view.current = example;
            view.updateCurrent();
        },

        render: function render() {
            var view = this,
                model = view.model,
                examples = model ? model.getExamples() : [];

            view.$selector.empty();

            if ( examples.length > 1 ) {
                examples.forEach( function (example) {
                    view.$selector.mk( 'li', {}, ['i.icon'] )
                        .data( 'example', example );
                });
            }

            view.updateCurrent();
        },

        updateCurrent: function updateCurrent() {
            var view = this,
                $items = view.$selector.children();

            view.$title.text( view.current ? view.current.get('title') : '' );

            $items.each( function () {
                var $li = $(this),
                    example = $li.data('example');
                $li.toggleClass( 'is-active', view.current === example );
            });
        },

        events : {
            'mousedown .scrubber-selector'  : 'uiScrubStart',
            'mousemove .scrubber-selector'  : 'uiScrub',
            'mouseup .scrubber-selector'    : 'uiScrubEnd',
            'mouseleave .scrubber-selector' : 'uiScrubEnd'
        },

        uiScrubStart: function uiScrubStart( event ) {
            var view = this;

            event.preventDefault();
            event.stopPropagation();
            view.isScrubbing = true;
            view.uiScrub( event );
        },

        uiScrub: function uiScrub( event ) {
            if ( !this.isScrubbing ) return;
            var view = this,
                examples = view.model.getExamples();
                x = view.coordinates( event ).x,
                cellWidth = view.$selector.width() / examples.length,
                index = Math.floor( x / cellWidth ),
                example = examples[index];

            if ( example && example !== view.current ) {
                appState.set('example', example);
            }
        },

        uiScrubEnd: function uiScrubEnd( event ) {
            var view = this;

            view.uiScrub( event );
            view.isScrubbing = false;
        },

        uiKeydown: function uiKeydown(event) {
            var view = this,
                examples = view.model.getExamples(),
                index = examples.indexOf( appState.get('example') ),
                original = index,
                length = examples.length;

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
                appState.set('example', examples[index] );
            }
        },

        coordinates: function coordinates( e ) {
            var view = this,
                viewOffset = view.$selector.offset(),
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

    return ScrubberView;
});
