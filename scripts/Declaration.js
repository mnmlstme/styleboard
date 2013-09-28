/**
 @filespec Declaration - Pattern declaration extracted from CSS
 */

define(['Definition'], function (Definition) {

    // global dependences on LESS:
    var Selector = less.tree.Selector,
        Element = less.tree.Element;

    var Declaration = Backbone.Model.extend({

        initialize: function ( attrs ) {
            var decl = this;

            attrs = attrs || {};

            attrs.selectors || decl.set('selectors', []);
            attrs.declarations || decl.set('declarations', new Backbone.Collection());
        },

        addSelector: function (selector) {
            var decl = this;
            if ( !_.isObject(selector) ) {
                // TODO: this only handles single-element selectors
                selector = new Selector( [ new Element( '', selector, 0 ) ] );
            }

            decl.get('selectors').push(selector);
            return decl;
        },

        merge: function (other) {
            var decl = this;

            decl.set('selectors', decl.get('selectors') || other.get('selectors') );

            decl.get('declarations').add( other.get('declarations').models );

            if( decl.get('text') || other.get('text') ) {
                decl.set('text', (decl.get('text') || '' ) + (other.get('text') || ''));
            }

            return decl;
        },

        define: function ( type, name, attrs ) {
            attrs = attrs || _.isObject(name) && name || {};
            name = !_.isObject(name) ? name : attrs.name;

            var decl = this,
                index = decl.get('declarations').where({ type: type }).length,
                prior = decl.getDeclaration({ type: type, name: name }),
                subdecl = new Declaration( 
                    _.extend( { type: type, index: index, name: name }, attrs ) 
                );

            if ( prior ) {
                prior.merge( subdecl );
            } else {
                decl.get('declarations').add( subdecl );
            }
            
            return decl;
        },

        getDeclaration: function ( attrs ) {
            return this.get('declarations').findWhere( attrs );
        },

    }); // end of Declaration model

    return Declaration;
});
