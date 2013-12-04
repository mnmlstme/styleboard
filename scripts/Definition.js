define( function () {

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

        getValues: function getEach( key ) {
            return this.getDeclarations()
                .filter( function (decl) { return decl.key === key; } )
                .map( function (decl) { return decl.value; } );
        },

        getFirst: function getFirst( key ) {
            var pair = _( this.getDeclarations() ).findWhere({ key: key });

            return pair && pair.value;
        },

        getDefinition: function getDefinition( key, name ) {
            var pair = _( this.getDeclarations() )
                .find( function( decl ) {
                    return decl.key === key &&
                        decl.value.get('name') === name;
                });

            return pair && pair.value;
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
