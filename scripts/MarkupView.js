define(['Context', 'EditableFillerView', 'appState', '../lib/prism/js/prism'],
    function (Context, EditableFillerView, appState) {

    var MarkupView = Backbone.View.extend({

        initialize: function ( options ) {
            var view = this;

            view.doc = options.doc;
            view.filler = options.filler;
            view.$pre = view.$el;

            appState.on('change:example', function( appState, example ) {
                view.setModel( example, appState.get('pattern') );
            });
        },

        setModel: function ( example, pattern ) {
            var view = this;

            view.model = example;
            view.pattern = pattern;
            view.render();
        },

        render: function () {
            var view = this,
                doc = view.doc,
                $pre = view.$pre,
                example = view.model,
                pattern = view.pattern,
                template = example ? example.getText() : '',
                code = template ? Prism.highlight( template, Prism.languages.markup ) : '',
                html = code ? view.filler.replace( code, function (key) {
                    return '<span class="styleboard-filler" data-filler-key="' + key + '"></span>';
                } ) : '';

            // Insert the html
            $pre.html(html);

            // Replace the filler text
            $pre.find('.styleboard-filler')
                .each( function () {
                    var $el = $(this),
                        key = $el.data('filler-key'),
                        subview = new EditableFillerView({
                            model: view.filler,
                            key: key,
                            el: $el[0]
                        });
                    subview.render();
                });

            // Highlight the tags that contain pattern names
            $pre.find('.token.tag').each( function () {
                var $tag = $(this);

                function decorate ($token) {
                    var name = $token.text(),
                        defn = doc.getPattern( name ),
                        type = defn && doc.getType(defn),
                        highlight = false;

                    if ( pattern ) {
                        if ( pattern.getName() === name ) {
                            highlight = true;
                        } else {
                            defn = pattern.getDefinition( name );
                            if ( defn.isValid() ) {
                                type = defn.getType();
                                highlight = true;
                            }
                        }
                    }

                    if ( type ) {
                        $token.addClass( type + '-' );
                        if ( highlight ) {
                            $token.addClass('highlight-');
                            $tag.addClass('highlight-');
                        }
                    }
                }

                // decorate tag names
                // TODO: only decorate if the defn includes an element selector
                $tag.find('.token.tag')
                    .contents()
                    .filter( function () { return this.nodeType === Node.TEXT_NODE; } )
                    .each( function () {
                        var $textnode = $(this),
                            $nametoken = $.mk('span.tagname-.token', $textnode.text() )
                                .insertBefore($textnode);

                        decorate( $nametoken );
                        $textnode.remove();
                    });

                // decorate attribute names
                // TODO: only decorate if the defn includes an attribute selector
                $tag.find('.token.attr-name')
                    .each( function() { decorate( $(this) ); } );

                // decorate class names
                $tag.find('.token.attr-name')
                    .filter( function () { return $(this).text() === 'class'; })
                    .next()
                    .each( function () {
                        var $token = $(this),
                            $textnode = $token.contents()
                                .filter( function () { return this.nodeType === Node.TEXT_NODE; }),
                            classlist = $textnode.text().split(/\s+/);

                        classlist.forEach( function (classname, index) {
                            var modifiers = [],
                                highlight = false,
                                $classtoken = $.mk('span.classname-.token', classname)
                                    .insertBefore( $textnode );

                            decorate( $classtoken );

                            if ( index ) {
                                $(document.createTextNode(' ')).insertBefore( $classtoken );
                            }
                        });

                        $textnode.remove();
                    });
                });

            return view;
        }
    });

    // Customizations to Prism (markup highlighter)

    if (Prism.languages.markup) {

        // detect templating for both ERB and mustache
        Prism.languages.insertBefore('markup', 'tag', {
            'erb': {
                pattern: /<%[\W\w]*?%>/ig
            },
            'mustache': {
                pattern: /\{\{[\W\w]*?\}\}/ig
            }
        });

        // detect scripts that are really HTML templates
        Prism.languages.insertBefore('markup', 'script', {
            'template': {
                pattern: /<script[\w\W]*?type=['"]text\/(html|ng-template)['"][\w\W]*?>[\w\W]*?<\/script>/ig,
                inside: {
                    'tag': {
                        pattern: /<script[^>]*>|<\/script>/ig,
                        inside: Prism.languages.markup.tag.inside
                    },
                    rest: Prism.languages.markup
                }
            },
        });

    }

    return MarkupView;
});
