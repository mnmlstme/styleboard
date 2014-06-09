define( function () {

    var Context = Backbone.Model.extend({

        initialize: function ( attrs ) {
            var model = this,
                doc = model.get('doc');

            attrs && attrs.node || model.set('node', []);
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

        getNodesOfType: function ( type, constructor ) {
            var model = this,
                doc = model.get('doc');

            constructor = constructor || Context;

            return doc.getNodesOfType( model.getNode(), type ).map( function (node) {
                return new constructor({ doc: doc, node: node });
            });
        },

        getDefinition: function ( type, constructor ) {
            var model = this,
                doc = model.get('doc');

            constructor = constructor || Context;

            return new constructor({ doc: doc, node: doc.getDefinition( model.getNode(), type )});
        },

        getText: function () {
            return this.get('doc').getText( this.getNode() );
        },

    });

    return Context;
});
