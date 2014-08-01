define( function () {

    var Context = Backbone.Model.extend({

        initialize: function ( attrs ) {
            var model = this,
                doc = model.get('doc');

            if ( attrs && !attrs.node ) {
                model.set( 'node', [] );
            }
        },

        findByName: function ( name ) {
            var model = this,
                doc = model.get('doc'),
                node = doc.findByName(name);

            return node ? new Context({ doc: doc, node: node }) : null;
        },

        getNode: function () {
            return this.get('node');
        },

        getType: function () {
            return this.get('doc').getType( this.getNode() );
        },

        getName: function () {
            return this.getAttr( 'name' );
        },

        getAttr: function ( key ) {
            return this.get('doc').getAttr( this.getNode(), key );
        },

        getNodes: function ( constructor ) {
            var model = this,
                doc = model.get('doc');

            constructor = constructor || Context;

            return doc.getNodes( model.getNode() ).map( function (node) {
                return new constructor({ doc: doc, node: node });
            });
        },

        getNodesOfType: function ( type, recursively ) {

            var model = this,
                doc = model.get('doc');

            return doc.getNodesOfType( model.getNode(), type, recursively )
                .map( function (node) {
                    return new Context({ doc: doc, node: node });
                });
        },

        getAllNodesOfType: function ( type ) {
            return this.getNodesOfType( type, true );
        },

        getDefinition: function ( name ) {
            var model = this,
                doc = model.get('doc');

            return new Context({ doc: doc, node: doc.getDefinition( model.getNode(), name )});
        },

        getScope: function () {
            return {};
        },

        getText: function () {
            return this.get('doc').getText( this.getNode() );
        }

    });

    return Context;
});
