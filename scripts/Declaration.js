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

            attrs.rules || decl.set('rules', []);
            attrs.selectors || decl.set('selectors', []);
            attrs.declarations || decl.set('declarations', new Backbone.Collection());
        },

        addRules: function ( nodelist ) {
            var rules = this.get('rules');
            nodelist.forEach( function ( node ) { rules.push( node ); });
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
            decl.set('rules', decl.get('rules').concat( other.get('rules') ) );

            if( decl.get('text') || other.get('text') ) {
                decl.set('text', (decl.get('text') || '' ) + (other.get('text') || ''));
            }

            return decl;
        },

        define: function ( type, name, attrs ) {
            attrs = attrs || _.isObject(name) && name || {};
            name = !_.isObject(name) ? name : attrs.name;

            var pattern = this,
                index = pattern.get('declarations').where({ type: type }).length,
                prior = pattern.getDeclaration({ type: type, name: name }),
                decl = new Declaration( 
                    _.extend( { type: type, index: index, name: name }, attrs ) 
                );

            if ( attrs.rules ) pattern.addRules( attrs.rules );

            if ( prior ) {
                prior.merge( decl );
            } else {
                pattern.get('declarations').add( decl );
            }
            
            return decl;
        },

        getDeclaration: function ( attrs ) {
            return this.get('declarations').findWhere( attrs );
        },

        getExamples: function getExamples() {
            var list = [];
            getExamplesRecursive( this );
            return list;

            function getExamplesRecursive( decl ) {
                var subdecls = decl.get('declarations');
                if ( subdecls ) {
                    subdecls.each( function (subdecl) {
                        if ( subdecl.get('type') === 'example' ) {
                            list.push(subdecl);
                        } else {
                            getExamplesRecursive( subdecl );
                        }
                    });
                }
            }
       },

    }); // end of Declaration model

    return Declaration;
});
