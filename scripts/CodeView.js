var $ = require('jquery');
var Backbone = require('backbone');

var Context = require('./Context');
var EditableFillerView = require('./EditableFillerView');
var appState = require('./appState');
var Prism = require('../lib/prism/js/prism');

var prismTypes = {
    html: Prism.languages.markup,
    js: Prism.languages.javascript,
    css: Prism.languages.css
};

var CodeView = Backbone.View.extend({

    initialize: function ( options ) {
        var view = this;

        view.doc = options.doc;
        view.filler = options.filler;
        view.pattern = options.pattern;
        view.$pre = view.$el;
    },

    render: function () {
        var view = this,
            doc = view.doc,
            filler = view.filler,
            pattern = view.pattern,
            $pre = view.$pre,
            content = view.model.get('content') || '',
            type = view.model.get('type'),
            html = Prism.highlight( content, prismTypes[type] );

        if ( type === 'html' ) {
            html = filler.replace( html, function (key) {
                return '<span class="styleboard-filler" data-filler-key="' + key + '"></span>';
            });
        }

        // Insert the html
        $pre.html(html).addClass(type + '- code');

        if ( type === 'html' ) {
            // Replace the filler text
            $pre.find('.styleboard-filler')
                .each( function () {
                    var $el = $(this),
                        key = $el.data('filler-key'),
                        subview = new EditableFillerView({
                            model: filler,
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
                        }
                    }
                }
            });
        }
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

module.exports = CodeView;
