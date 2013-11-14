/**
   @filespec RulesView - show CSS source code for a pattern
*/
define( function () {

    var RulesView = Backbone.View.extend({

        initialize: function () {
            var view = this;

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
                $list = view.$el;

            $list.empty();

            if ( pattern ) {
                pattern.getValues('rule').forEach( function (node) {
                    var type = node.type.toLowerCase(),
                        $rule = $list.mk('li.rule.' + type + '-' ),
                        $selectors = $rule.mk('ul.rule-selectors'),
                        $declarations = $rule.mk('ul.rule-declarations');

                    switch (type) {
                    case 'ruleset':
                        node.selectors.forEach( function (selector, index) {
                            var $selector = $selectors.mk('li');

                            selector.elements.forEach( function (el, i) {
                                if (i && el.combinator.value !== '') 
                                    $selector.mk('code.combinator',
                                                 el.combinator.value );
                                $selector.mk('code.element', el.value);
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
            }

            return view;
        }

    });

    return RulesView;
});
