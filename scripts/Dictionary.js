/**
 @filespec Dictionary - Collection of pattern definitions identified by name/selector
 */

define(['Definition'], function (Definition) {

    var Dictionary = Backbone.Collection.extend({

        model: Definition,

        entry: function entry( name ) {
            var dict = this,
                result = dict.findByName( name );

            if (!result) {
                result = new Definition({ name: name });
                dict.add(result);
            }

            return result;
        },

        findByName: function findByName( name ) {
            return this.findWhere({ 'name': name });
        },

        comparator: function comparator( defn ) {
            return defn.get('name');
        }

    }); // end of Dictionary collection

    return Dictionary;
});
