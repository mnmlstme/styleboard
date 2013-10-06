define(['appState'], function (appState) {

    var ScrubberView = Backbone.View.extend({

        initialize: function ( options ) {
            view = this;

            appState.on('change:pattern', function( appState, pattern ) {
                view.setModel( pattern );
            });

            appState.on('change:example', function( appState, example ) {
                view.setCurrent( example );
            });

            view.examples = [];
        },

        setModel: function setModel( pattern ) {
            var view = this;

            view.model = pattern;
            view.examples = pattern.getExamples();
            view.render();
        },

        setCurrent: function setCurrent( example ) {
            var view = this;

            view.current = example;
            view.updateCurrent();
        },

        render: function render() {
            var view = this;

            view.$el.empty();

            view.examples.forEach( function (example) {
                view.$el.mk( 'li', {}, ['i.icon'] )
                    .data( 'example', example );
            });

            view.updateCurrent();
        },

        updateCurrent: function updateCurrent() {
            var view = this,
                $items = view.$el.children();

            $items.each( function () {
                var $li = $(this),
                    example = $li.data('example');
                $li.toggleClass( 'is-active', view.current === example );
            });
        },

        events : {
            'mousedown' : 'uiScrubStart',
            'mousemove' : 'uiScrub',
            'mouseup' : 'uiScrubEnd',
            'mouseleave' : 'uiScrubEnd'
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
                x = view.coordinates( event ).x,
                cellWidth = view.$el.width() / view.examples.length,
                index = Math.floor( x / cellWidth ),
                example = view.examples[index];

            if ( example !== view.current ) {
                appState.set('example', example);
            }
        },

        uiScrubEnd: function uiScrubEnd( event ) {
            var view = this;

            view.uiScrub( event );
            view.isScrubbing = false;
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

    return ScrubberView;
});
