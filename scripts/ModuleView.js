define(['appState'], function (appState) {

    var ModuleView = Backbone.View.extend({

        initialize: function () {
            var view = this,
                module = view.model,
                example = module.getDefinition({ type: 'example', index: 0 });

            appState.set('example', example);
        },

        render: function () {
            var view = this,
                mod = view.model,
                name = mod.get('name'),
                selectors = mod.get('selectors'),
                definitions = mod.get('definitions');

            view.$el.mk( 'header',
                         [ 'h2', name] ,
                         ['ul.comma-.module-selectors'].concat( _.keys(selectors).sort().map( function(s) {
                               return ['li', code(s)]; 
                           })) 
                       );

            definitions.forEach( function (defn) {
                var type = defn.get('type'),
                    attrs = { 'class': 'module-' + type };
                switch ( type ) {
                case 'description':
                    view.$el.mk( 'p', defn.get('text') );
                    break;
                case 'example':
                    view.$el.mk( 'div', attrs, defn.get('title') || 'View' )
                        .data( 'example', defn );
                    break;
                default:
                    view.$el.mk( 'section', attrs,
                                 [ 'header',
                                   [ 'label', type]],
                                   [ 'h3', defn.get('name')]
                               );
                }
            });

            return view;
        },

        events: {
            'click .module-example': 'uiSelectExample'
        },

        uiSelectExample: function (event) {
            var view = this,
                $target = $(event.target),
                example = $target.data('example');

            appState.set('example', example);
        },

    });

    function code( text ) {
        return $.mk('code', text);
    }

    return ModuleView;
});
