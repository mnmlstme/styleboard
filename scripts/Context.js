define( function () {

    var Context = Backbone.Model.extend({

        initialize: function ( attrs ) {
            var model = this,
                doc = model.get('doc');

            attrs && attrs.node || model.set('node', []);
        },

        getType: function () {
            return this.get('doc').getType( this.get('node') );
        },

        getName: function () {
            return this.getAttr( 'name' );
        },

        getAttr: function ( key ) {
            return this.get('doc').getAttr( this.get('node'), key );
        },

        getNodes: function ( constructor ) {
            var model = this,
                doc = model.get('doc');

            constructor = constructor || Context;

            return doc.getNodes( model.get('node') ).map( function (node) {
                return new constructor({ doc: doc, node: node });
            });
        },

        getNodesOfType: function ( type, constructor ) {
            var model = this,
                doc = model.get('doc');

            constructor = constructor || Context;

            return doc.getNodesOfType( model.get('node'), type ).map( function (node) {
                return new constructor({ doc: doc, node: node });
            });
        },

        getDefinition: function ( type, constructor ) {
            var model = this,
                doc = model.get('doc');

            constructor = constructor || Context;

            return new constructor({ doc: doc, node: doc.getDefinition( model.get('node'), type )});
        },

        getText: function () {
            return this.get('doc').getText( this.get('node') );
        },

    });

    return Context;
});
