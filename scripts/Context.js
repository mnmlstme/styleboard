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

        getNodes: function () {
            var model = this,
                doc = model.get('doc');

            return doc.getNodes( model.get('node') ).map( function (node) {
                return new Context({ doc: doc, node: node });
            });
        },

        getText: function () {
            return this.get('doc').getText( this.get('node') );
        },

        getExamples: function () {
            // TODO: implement
            return [];
        }

    });

    return Context;
});
