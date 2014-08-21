define ( function () {

    var corpus = [
        // TODO: provide alternative corpuses
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'In sit amet lorem ipsum. Suspendisse nisl enim, iaculis a blandit et, lobortis ut turpis.',
        'Sed eu velit vel augue ultricies ullamcorper sed ut nulla.',
        'Proin semper tellus sit amet diam fringilla mattis.',
        'Suspendisse elementum congue dolor sit amet posuere.',
        'In sed nunc viverra, pretium erat mattis, semper odio.',
        'Maecenas rutrum nulla felis.',
        'Donec id lorem non eros blandit viverra.',
        'Maecenas adipiscing velit ac urna feugiat, ullamcorper tincidunt ipsum auctor.',
        'Nulla hendrerit tempus condimentum.',
        'Proin ac massa et purus vestibulum interdum vitae sed mauris.',
        'Cras vulputate iaculis velit sed tincidunt.',
        'Integer porta libero non tellus euismod fermentum.',
        'Aenean magna diam, fermentum eu libero sagittis, feugiat venenatis neque.',
        'Fusce facilisis vehicula enim id consectetur.',
        'In feugiat auctor quam eget scelerisque.',
        'Donec est lorem, dignissim sit amet velit sed, fringilla tincidunt orci.',
        'Ut a eleifend dolor.',
        'Nam non scelerisque odio.',
        'Integer sit amet justo vel massa luctus hendrerit.',
        'Vivamus elementum mollis nisl vitae euismod.',
        'Aliquam erat volutpat.',
        'Mauris suscipit tempus eros, in elementum nisl cursus sed.',
        'Sed tincidunt semper nunc, id pellentesque quam egestas at.',
        'Integer a placerat augue.',
        'Nam urna tellus, consectetur at aliquam et, gravida eu odio.',
        'Nam scelerisque, tortor a molestie blandit, risus mauris malesuada urna, eget tempor turpis tortor id lorem.',
        'Morbi eget ornare leo.',
        'Nulla luctus pellentesque magna, ac ultrices nunc semper ut.'
    ];

    var builtin = {
        // Strings not taken from corpus
        btn: 'Button'
    };

    function sentences(list, start, n) {
        var sentences = [];

        for( var j=0; j < n; j++ ) {
            sentences.push( list[(start + n*j)%list.length] );
        }
        return sentences.join(' ');
    }

    function words(s, n, titlecase) {
        var w = s.toLowerCase().split(/[^\w]+/).slice(0,n || 0);

        if (titlecase) {
            // TODO: handle prepositions and articles properly
            w = w.map( function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            });
        }

        return w.join(' ');
    }

    // Matches token{.token}* or token{[token]}*
    var regex = /\{\{\s*(([A-Za-z_]\w*)(\.\w+|\[\w+\])*)\s*\}\}(?!\})/g;

    function keyToPath(key) {
        return key.split(/\W/).filter( function(s) { return s !== ''; } );
    }

    var nullString = '(null)';

    var Filler = Backbone.Model.extend({

        initialize: function ( attrs ) {
            var model = this;

            // Build the dictionary
            _(builtin).each( function (value, key) {
                model.set(key, value);
            });

            // s: Sentences are taken directly from the corpus.
            model.set('s', corpus.slice(0));

            // p: Paragraphs are 3 sentences long.
            model.set('p', corpus.map( function (s, i, list) {
                return sentences( list, i, 3 );
            }));

            // h: Headers are 2-3 words, title case.
            model.set('h', corpus.map( function (s, i) {
                return words( s, 2 + (i%2), true );
            }));

            // w: Single words
            model.set('w', corpus.map( function (s) {
                return words( s, 1 );
            }));

            // phr: Phrases are 3-6 words.
            model.set('phr', corpus.map( function (s, i) {
                return words( s, 3 + (i%4), true );
            }));
        },

        replace: function ( template, f ) {
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
                hash = {};

            hash[k] = model.get(k);
            recurse( hash, path, value );
            model.set( k, hash[k] );
            if ( _.isObject(hash[k]) ) {
                // because Backbone doesn't check for deep changes
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

    return Filler;
});
