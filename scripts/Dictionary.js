/**
 @filespec Dictionary - Collection of patterns identified by name/selector
 */

define(['Declaration'], function (Declaration) {

    var Dictionary = Backbone.Collection.extend({

        model: Declaration,

        entry: function entry( name ) {
            var dict = this,
                result = dict.findByName( name );

            if (!result) {
                result = new Declaration({ name: name });
                dict.add(result);
            }

            return result;
        },

        findByName: function findByName( name ) {
            return this.findWhere({ 'name': name });
        },

        comparator: function comparator( dict ) {
            return dict.get('name');
        }

    }); // end of Dictionary collection

    return Dictionary;
});
