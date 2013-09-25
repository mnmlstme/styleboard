define( function () {

    /**
     * @name Definition
     * @param attrs.type                the type of definition (modifier, state, example, description)
     * @param attrs.name                the name of defined entity (usually a CSS class)
     * @param attrs                     other type-specific attributes
     */

    var Definition = Backbone.Model.extend({

        merge: function( attrs ) {
            this.set( attrs );
        }
    });

    return Definition;
});
