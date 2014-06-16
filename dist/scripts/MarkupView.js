define(['Context'], function (Context) {

    var highlight = hljs.highlight;

    var MarkupView = Backbone.View.extend({

        initialize: function ( options ) {
            var view = this;

            view.doc = options.doc;
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
                patterns = [],
                code = example ? highlight( 'xml', example.getText() || '' ).value : '';

            view.$pre.html( code )
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
                        var pat = new Context({
                            doc: view.doc,
                            node: view.doc.findByName( name )
                        });
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
                        var defn = pat.getDefinition(name);
                        if ( defn ) {
                            $class.addClass(defn.get('type') + '-');
                        } else if ( name === pat.getName() ) {
                            $class.addClass('pattern-');
                        }
                    });
                });

            // Look for artifacts that aren't really part of the example, so we can hide them w/CSS
            view.$pre.find('.hljs-tag')
                .filter( function () {
                    return $(this).find('.hljs-class').text() === 'styleboard-layout';
                }).addClass('hidden-');

            return view;
        }
    });

    return MarkupView;
});
