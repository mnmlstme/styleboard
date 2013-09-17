/**
 @filespec Dictionary - Collection of patterns identified by name/selector
 */

define(['Declaration'], function (Declaration) {

    var Dictionary = Backbone.Collection.extend({

        model: Declaration,

        entry: function entry( nameOrSelector ) {
            var dict = this,
                selector = nameOrSelector[0] === '.' ? nameOrSelector : '.' + nameOrSelector,
                result = dict.findBySelector( selector );

            if (!result) {
                result = new Declaration({ name: selector, selectors: [selector]});
                dict.add(result);
            }

            return result;
        },

        findBySelector: function findBySelector( selector ) {
            return this.find( function (entry) {
                return _.find( entry.get('selectors'), function (sel) {
                    return sel.elements[0].value === selector;
                });
            });
        },

        findByName: function findByName( name ) {
            return this.findBySelector( '.' + name );
        },

        comparator: function comparator( dict ) {
            return dict.get('name');
        }

    }); // end of Dictionary collection

    return Dictionary;
});
