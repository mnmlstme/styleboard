define(['Context', 'EditableFillerView', 'appState', '../lib/prism/js/prism'],
    function (Context, EditableFillerView, appState) {

    var highlight = function (text) {
        return Prism.highlight( text, Prism.languages.markup );
    };

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
                $pre = view.$pre,
                example = view.model,
                pattern = view.pattern,
                template = example ? example.getText() : '',
                code = template ? highlight( template ) : '',
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

                $tag.find('.token.attr-name')
                    .filter( function () { return $(this).text() === 'class'; })
                    .next()
                    .each( function () {
                        var $token = $(this),
                            $textnode = $token.contents().filter( function () {
                                return this.nodeType === Node.TEXT_NODE;
                            }),
                            classlist = $textnode.text().split(/\s+/);

                        classlist.forEach( function (classname, index) {
                            var type = '';

                            if ( pattern ) {
                                if ( pattern.getName() === classname ) {
                                    type = 'pattern';
                                } else {
                                    type = pattern.getDefinition( classname ).getType();
                                }
                                if ( type ) {
                                    type = '.' + type + '-';
                                    // also highlight the token
                                    // type += '.highlight-';
                                    $tag.addClass('highlight-');
                                }
                            }

                            if ( index ) {
                                $(document.createTextNode(' ')).insertBefore( $textnode );
                            }

                            $.mk('span' + type + '.classname-.token', classname )
                                .insertBefore( $textnode );
                        });

                        $textnode.remove();
                    });
                });

            return view;
        }
    });

    return MarkupView;
});
