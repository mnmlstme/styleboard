var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

var appState = require('./appState');

var nullString = '(null)';

var Filler = Backbone.Model.extend({

    initialize: function ( attrs ) {
        var model = this,
            pat = {
                // Default is mustache templating
                open: '\\{\\{',
                // Expression is a.b or a[b]
                expr: '([A-Za-z_]\\w*)(\\.\\w+|\\[\\w+\\])*',
                close: '\\}\\}'
            };

        if ( attrs.templating === 'ejs' ) {
            // since we run this over HTML, it may be escaped
            pat.open = '(?:<|&lt;?)%=';
            pat.close = '%>';
        }

        // the regex to use to find template expressions
        model.regex = new RegExp( pat.open + '\\s*(' + pat.expr + ')\\s*' + pat.close, 'g' );

        model.cache = {};

        if ( attrs.url ) {
            model.read( model.url = url );
        }

        appState.on('change:settings', function( appState, settingsJSON ) {
            var settings = JSON.parse(settingsJSON),
                url = settings['filler-text'];

            if ( url !== model.url ) {
                model.read( model.url = url );
            }
        });
    },

    read: function ( url ) {
        var model = this,
            cached = model.cache[url];

        if ( cached ) {
            model.load( cached );
            return;
        }

        $.ajax({
            dataType: 'json',
            cache: false,
            url: url,
            success: function ( jsonObject ) {
                model.cache[url] = jsonObject;
                model.load( jsonObject );
            },
            error: function ( jqxhr, status, error ) {
                console.warn( "Failed to load strings file " + url + "\n" +
                              "Error: " + status + "(" + error + ")\n");
            }
        });
    },

    load: function ( data ) {
        var model = this;

        model.clear();

        // Build the dictionary
        _(data).each( function (value, key) {
            model.set(key, value);
        });
    },

    replace: function ( template, f ) {
        var regex = this.regex;

        return template.replace( regex, function (match, key) {
            return f(key);
        });
    },

    expand: function ( template, scope, filter ) {
        if ( !template ) { return ''; }
        var model = this;

        // TODO: need to push scope here

        return model.replace( template, function (key) {
            var value = model.lookup(key) || '';

            value = _.escape( value.toString() );

            if (filter) {
                value = filter( value, key );
            }

            return value;
        });
    },

    lookup: function ( key ) {
        var model = this,
            path = keyToPath(key),
            k = path[0],
            hash = {},
            i;

        hash[k] = model.get(k);
        return recurse( hash, path );

        function recurse( hash, path ) {
            var k = path.length ? path.shift() : 0;
            // TODO: optimize tail recursion
            if ( !_.isObject(hash) ) {
                return hash;
            }

            return recurse(hash[k], path);
        }
    },

    setValue: function (key, value) {
        var model = this,
            path = keyToPath(key),
            k = path[0],
            oldValue = model.get(k),
            hash = {};

        if ( value === model.lookup(key) ) {
            return;
        }

        hash[k] = oldValue;
        recurse( hash, path, value );
        model.set( k, hash[k] );
        if ( _.isObject(oldValue) ) {
            // because Backbone doesn't check for changes within a hash value
            model.trigger('change change:' + k);
        }

        function recurse( object, path, value ) {
            // TODO: optimize tail recursion
            var k = path.shift(),
                hash = object[k];
            if ( !path.length && !_.isObject(hash)) {
                object[k] = value;
            } else {
                if ( !_.isObject(hash) ) {
                    object[k] = { 0: hash };
                }
                if ( !path.length ) {
                    path = [0];
                }
                recurse( hash, path.length ? path : 0, value );
            }
        }

    }

});

function keyToPath(key) {
    return key.split(/\W/).filter( function(s) { return s !== ''; } );
}

module.exports = Filler;
