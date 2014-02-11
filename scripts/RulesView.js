/**
   @filespec RulesView - show CSS source code for a pattern
*/
define( function () {

    var RulesView = Backbone.View.extend({

        initialize: function ( options ) {
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
                $list = view.$el;

            $list.empty();

            if ( pattern ) {
                pattern.getNodesOfType( 'rule' )
                    .forEach( function (node) {
                        var $rule = $list.mk('li.highlight.rule',
                                             ['pre.code', node.getText()]);
                    });
            }

            return view;
        }

    });

    return RulesView;
});
