define ( function () {

    var lorem = [
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
        p:  lorem.slice(0,3).join(' '),
        p1: lorem.slice(0,3).join(' '),
        p2: lorem.slice(3,6).join(' '),
        p3: lorem.slice(6,9).join(' '),
        h:  words(lorem[0], 3, true),
        h1: words(lorem[0], 2, true),
        h2: words(lorem[3], 3, true),
        h3: words(lorem[6], 4, true),
        s:  lorem[0],
        s1: lorem[0],
        s2: lorem[3],
        s3: lorem[6],
        phr:  words(lorem[0], 4),
        phr1: words(lorem[0], 4),
        phr2: words(lorem[3], 5),
        phr3: words(lorem[6], 3),
        w:  words(lorem[0], 1),
        w1: words(lorem[0], 1),
        w2: words(lorem[3], 1),
        w3: words(lorem[6], 1),
        btn: 'Button'
    };

    function words(s, n, titlecase) {
        var w = s.toLowerCase().split(/[^\w]+/).slice(0,n || 0);

        if (titlecase) {
            w = w.map( function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            });
        }

        return w.join(' ');
    }

    var regex = /\{\{\s*([A-Za-z][A-Za-z0-9_.]*)\s*\}\}(?!\})/g

    var Filler = Backbone.Model.extend({

        initialize: function ( attrs ) {
            var model = this;

            _(builtin).each( function (value, key) {
                model.set(key, value);
            });
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
                path = key.split('.'),
                value = model.get(path[0]);

            for ( var i = 1; typeof value === 'object' && i < path.length; i++ ) {
                value = value[path[i]];
            }

            return value;
        },

        setValue: function (key, value) {
            var model = this,
                path = key.split('.'),
                object = model.get(path[0]),
                i = 0;

            if ( typeof object === 'object' ) {
                for ( i = 1; typeof object === 'object' && i < path.length-1; i++ ) {
                    object = object[path[i]];
                }
                object[path[i]] = value;
                model.set(path[0], model.get(path[0]));
            } else {
                model.set(path[0], value);
            }
        }

    });

    return Filler;
});
