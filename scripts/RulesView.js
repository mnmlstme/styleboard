/**
   @filespec RulesView - show CSS source code for a pattern
*/
define( function () {

    var RulesView = Backbone.View.extend({

        initialize: function ( options ) {
            var view = this;

            view.dictionary = options.dictionary;

            appState.on('change:pattern', function( appState, pattern ) {
                view.setModel( pattern );
            });

        },

        setModel: function ( pattern ) {
            var view = this;

            view.model = pattern;
            view.render();
        },

        render: function () {
            var view = this,
                pattern = view.model,
                env = {},
                $list = view.$el,
                keys = ['modifier', 'member', 'state'],
                patterns = [];

            $list.empty();

            if ( pattern ) {
                pattern.getValues('rule').forEach( function (node) {
                    var type = node.type.toLowerCase(),
                        $rule = $list.mk('li.highlight.rule.' + type + '-' ),
                        $selectors = $rule.mk('ul.rule-selectors'),
                        $declarations = $rule.mk('ul.rule-declarations');

                    switch (type) {
                    case 'ruleset':
                        node.selectors.forEach( function (selector, index) {
                            var $selector = $selectors.mk('li');

                            selector.elements.forEach( function (el, i) {
                                var type = 'code.element',
                                    name, pat, type;
                                if (i && el.combinator.value !== '')
                                    $selector.mk('code.combinator',
                                                 el.combinator.value );
                                if ( el.value.charAt(0) === '.' ) {
                                    name = el.value.slice(1);
                                    pat = view.dictionary.findByName( name );
                                    if ( pat ) {
                                        type = type + '.pattern-.hljs-class';
                                        patterns.push( pat );
                                    } else {
                                        type = type + '.hljs-class';
                                    }
                                } else if ( el.value.charAt(0) === ':' ) {
                                    type = type + '.hljs-pseudo';
                                }
                                $selector.mk(type, el.value);
                            });
                        });

                        node.rules.forEach( function (rule) {
                            var type = rule.type.toLowerCase();
                            $declarations.mk('li.rule-' + type, rule.toCSS(env) );
                        });

                        break;
                    default:
                        $rule.text( node.toCSS(env) );
                    }
                });

                // find all classes related to patterns
                $list.find('.hljs-class').each( function () {
                    var $element = $(this),
                        name = $element.text().slice(1);
                    patterns.forEach( function (pat) {
                        var defn = pat.getDefinition(keys, name);
                        if (defn) {
                            $element.addClass(defn.get('type') + '-');
                        }
                    });
                });
            }

            return view;
        }

    });

    return RulesView;
});
