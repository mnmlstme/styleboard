define([ 'Example' ], function ( Example ) {

    /**
     * The definition of a pattern or other relation
     *
     * @param attrs.type {String} the type of definition (pattern, modifier, etc.)
     * @param attrs.name {String} the name of defined entity (usually a CSS class)
     * @param attrs.decls {Array} declarations (key/value pairs) about this entity
     */

    var Definition = Backbone.Model.extend({

        initialize: function ( attrs ) {
            attrs && attrs.decls || this.set('decls', []);
        },

        declare: function declare( key, value ) {
            var model = this,
                decls = model.get('decls'),
                decl = {key: key, value: value};

            if ( key === 'text' ||
                 ! _( decls ).contains( decl ) ) {
                decls.push( decl );
            }

            return model;
        },

        define: function define( attrs ) {
            var model = this,
                key = attrs.type,
                name = attrs.name,

                defn = model.getDefinition( key, name );

            if ( !defn ) {
                defn = new Definition( attrs );
                model.declare( key, defn );
            } else {
                defn.merge( new Definition( attrs ) );
            }

            return model;
        },

        isEmpty : function () { return ! this.get('decls').length; },

        getDeclarations : function getDeclarations() {
            return this.get('decls');
        },

        getValues: function getValues( key ) {
            return this.getDeclarations()
                .filter( function (decl) { return decl.key === key; } )
                .map( function (decl) { return decl.value; } );
        },

        getFirst: function getFirst( key ) {
            var pair = _( this.getDeclarations() ).findWhere({ key: key });

            return pair && pair.value;
        },

        getDeepValues: function getDeepValues( key ) {
            var model = this,
                list = [];

            recursiveGetValues( this, {} );
            return list;

            function recursiveGetValues( defn, scope ) {
                scope[ defn.get('type') ] = defn.get('name');
                defn.getDeclarations().forEach( function (decl) {
                    var value = decl.value;
                    switch (decl.key) {
                    case 'member':
                    case 'modifier':
                    case 'state':
                        recursiveGetValues( value, _.clone(scope) );
                        break;
                    default:
                        if ( decl.key === key ) {
                            if ( key === "example" )
                                value = value.clone().set('scope', scope );
                            list.push( value );
                        }
                        break;
                    }
                });
            }
        },

        getDefinition: function getDefinition( keys, name ) {
            if ( !_.isArray(keys) ) {
                keys = [ keys ];
            }
            var keys,
                pair = _( this.getDeclarations() )
                .find( function( decl ) {
                    return _.contains(keys, decl.key) &&
                        decl.value.get('name') === name;
                });

            return pair && pair.value;
        },

        getExamples: function getExamples() {
            // TODO: derive a Pattern model which will handle this
            var pattern = this;
            var examples = pattern.get('cached-examples');
            if ( !examples ) {
                examples = pattern.getDeepValues('example')
                    .map( function (value) {
                        return new Example({
                            code: value.get('html'),
                            scope: value.get('scope')
                        });
                    });
                pattern.set('cached-examples', examples);
            }
            return examples;
        },

        declares: function declares( key ) {
            return !! _(this.getDeclarations()).findWhere({key: key});
        },

        merge: function merge( other ) {
            var model = this;

            model.set('type', model.get('type') || other.get('type'));
            model.set('name', model.get('name') || other.get('name'));
            model.set('decls', _( model.get('decls') ).union( other.get('decls') ));
        },

    });

    return Definition;
});
