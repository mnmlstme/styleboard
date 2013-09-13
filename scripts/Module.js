define(['Definition'], function (Definition) {

    var Module = Backbone.Model.extend({

        initialize: function () {
            var mod = this;

            mod.set('selectors', []);
            mod.set('definitions', new Backbone.Collection());
        },

        addSelector: function (selector) {
            this.get('selectors')[selector]++;
        },

        define: function ( type, nameOrAttrs, addlAttrs ) {
            var mod = this,
                named = !_.isObject( nameOrAttrs ),
                name = named ? nameOrAttrs: undefined,
                index = mod.get('definitions').where({ type: type }).length;
                attrs = _.extend( { type: type, index: index },
                              named ? {name: name} : nameOrAttrs,
                                      addlAttrs ),
                prior = named && mod.getDefinition({type: type, name: name});

            if ( prior ) {
                prior.merge( attrs );
            } else {
                mod.get('definitions').add( new Definition(attrs) );
            }
        },

        getDefinition: function ( attrs ) {
            return this.get('definitions').findWhere( attrs );
        },

        cleanup: function () {
            var related = this.get('related');
            _(related).each( function (module, name) {
                if ( !module.get('isDocumented') ) delete related[name];
            });
        }

    }); // end of Module model

    return Module;
});
