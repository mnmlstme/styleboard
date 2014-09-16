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
                var $tag = $(this),
                    tagIsPattern = false,
                    $tagToken = $tag.find('.token.tag')
                        .contents()
                        .filter( function () { return this.nodeType === Node.TEXT_NODE; } )
                        .map( function () {
                            var $textnode = $(this),
                                $nametoken = $.mk('span.tagname-.token', $textnode.text() )
                                    .insertBefore($textnode);

                            $textnode.remove();
                            return $nametoken;
                        }),
                    $attrTokens = $tag.find('.token.attr-name'),
                    $classTokens = $tag.find('.token.attr-name')
                        .filter( function () { return $(this).text() === 'class'; })
                        .next()
                        .map( function () {
                            var $token = $(this),
                                $textnode = $token.contents()
                                    .filter( function () { return this.nodeType === Node.TEXT_NODE; }),
                                classlist = $textnode.text().split(/\s+/),
                                $classTokens = $.map(classlist, function (classname, index) {
                                    var $classtoken = $.mk('span.classname-.token', classname)
                                            .insertBefore( $textnode );

                                    if ( index ) {
                                        $(document.createTextNode(' '))
                                            .insertBefore( $classtoken );
                                    }

                                return $classtoken;
                            });

                            $textnode.remove();
                            return $classTokens;
                        });


                function checkForPattern ($token) {
                    var name = $token.text();

                    if ( pattern.getName() === name ) {
                        tagIsPattern = true;
                    }
                }

                function decorate ($token) {
                    var name = $token.text(),
                        defn = pattern.getName() === name ? pattern : pattern.getDefinition( name ),
                        type = defn.isValid() && defn.getType();

                    if ( type ) {
                        if ( tagIsPattern || (type !== 'modifier' && type !== 'state') ) {
                            $token.addClass( type + '-' );
                        };
                    }
                }

                // first see if there is a pattern anywhere in this tag
                [$tagToken, $attrTokens, $classTokens].forEach( function ($tokens) {
                    $tokens.each( function () {
                        checkForPattern( $(this) );
                    });
                });

                // decorate tag names
                // TODO: only decorate if the CSS defn includes an element selector
                $tagToken.each( function () {
                    decorate( $(this) );
                });

                // decorate attribute names
                // TODO: only decorate if the CSS defn includes an attribute selector
                $attrTokens.each( function() {
                    decorate( $(this) );
                });

                // decorate class names
                $classTokens.each( function() {
                    decorate( $(this) );
                });

                return view;
            });

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
