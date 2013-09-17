/**
 @filespec Declaration - Pattern declaration extracted from CSS
 */

define(['Definition'], function (Definition) {

    // global dependences on LESS:
    var Selector = less.tree.Selector,
        Element = less.tree.Element;

    var Declaration = Backbone.Model.extend({

        initialize: function () {
            var decl = this;

            decl.set('selectors', []);
            decl.set('definitions', new Backbone.Collection());
        },

        addSelector: function (selector) {
            if ( !_.isObject(selector) ) {
                // TODO: this only handles single-element selectors
                selector = new Selector( [ new Element( '', selector, 0 ) ] );
            }
            this.get('selectors').push(selector);
        },

        merge: function (other) {
            var decl = this,
                selectors = decl.get('selectors');
            
            other.get('selectors').forEach( function (candidate) {
                var exists = _(selectors).find( function (existing) {
                        return existing.toCSS() === candidate.toCSS();
                    });
                if (!exists) selectors.push( candidate );
            });
            decl.get('definitions').add( other.get('definitions').models );
        },

        define: function ( type, nameOrAttrs, addlAttrs ) {
            var decl = this,
                named = !_.isObject( nameOrAttrs ),
                name = named ? nameOrAttrs: undefined,
                index = decl.get('definitions').where({ type: type }).length;
                attrs = _.extend( { type: type, index: index },
                              named ? {name: name} : nameOrAttrs,
                                      addlAttrs ),
                prior = named && decl.getDefinition({type: type, name: name});

            if ( prior ) {
                prior.merge( attrs );
            } else {
                decl.get('definitions').add( new Definition(attrs) );
            }
        },

        getDefinition: function ( attrs ) {
            return this.get('definitions').findWhere( attrs );
        },

    }); // end of Declaration model

    return Declaration;
});
