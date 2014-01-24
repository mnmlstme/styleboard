define( function () {

    var highlight = hljs.highlight;

    var MarkupView = Backbone.View.extend({

        initialize: function ( options ) {
            var view = this;

            view.dictionary = options.dictionary;
            view.$pre = view.$el;

            appState.on('change:example', function( appState, example ) {
                view.setModel( example );
            });

        },

        setModel: function ( example ) {
            var view = this;

            view.model = example;
            view.render();
        },

        render: function () {
            var view = this,
                example = view.model,
                keys = ['modifier', 'member', 'state'],
                patterns = [];

            view.$pre
                .html( example ? highlight( 'xml', example.expand() ).value : '' )
              // TODO: make this less tied to highlight.js
              .find(".hljs-attribute:contains('class') + .hljs-value")
                // First find all the patterns used in the example:
                .each( function () {
                    var $atv = $(this),
                        // TODO: assumes quotes are in the value
                        value = $atv.text().slice(1,-1),
                        classes = value.split( /\s+/ );
                    $atv.empty();
                    $atv.append('"');
                    classes.forEach( function (name, index ) {
                        var pat = view.dictionary.findByName( name );
                        if ( index ) {
                            $atv.append(' ');
                        }
                        if ( pat ) {
                            $atv.mk('span.pattern-.hljs-class', name);
                            patterns.push( pat );
                        } else {
                            $atv.mk('span.hljs-class', name);
                        }
                    });
                    $atv.append('"');
                });

            // Then search those patterns for other classes used
            view.$pre.find('.hljs-class')
                .each( function () {
                    var $class = $(this),
                        name = $class.text();
                    if (name.charAt(0) === '.' ) {
                        name = name.slice(1);
                    }
                    patterns.forEach( function (pat) {
                        var defn = pat.getDefinition(keys, name);
                        if ( defn ) {
                            $class.addClass(defn.get('type') + '-');
                        } else if ( name === pat.get('name') ) {
                            $class.addClass('pattern-');
                        }
                    });
                });

            return view;
        }
    });

    return MarkupView;
});
