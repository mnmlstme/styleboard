require(['StyleDoc', 'Parser'],
function( StyleDoc, Parser ) {

    T( 'implicitPattern', function ( t ) {
        var pat = t.findPattern('foo'),
            nodes = t.getNodes(pat);

        ok( pat );
        equal( nodes.length, 1 );
        deepEqual( nodes[0], ['p', 'This is a foo.'] );
    });

    T( 'invalidPatternName', function ( t ) {
        var nodes = t.getNodes();

        ok( !t.findPattern('foo-bar') );
        equal( nodes.length, 1 );
        deepEqual( nodes[0], ['p', 'This is NOT a foo-bar.'] );
    });

    T( 'explicitPattern', function ( t ) {
        var pat = t.findPattern('foo'),
            nodes = t.getNodes(pat);
        ok( pat );
        equal( nodes.length, 1 );
        deepEqual( nodes[0], ['p', 'This is a foo.'] );
    });

    T( 'explicitInvalidPattern', function ( t ) {
        var pat = t.findPattern('foo-bar'),
            nodes = t.getNodes(pat);

        ok( pat );
        equal( nodes.length, 1 );
        deepEqual( nodes[0], ['p', 'This is a foo-bar.'] );
    });

    T( 'descriptionBefore', function ( t ) {
        var pat = t.findPattern('foo'),
            outside = t.getNodes(),
            inside = t.getNodes( pat );

        ok( pat );
        equal( outside.length, 2 );
        deepEqual( outside[0], ['p', 'This is outside foo.'] );
        equal( outside[1], pat );
        equal( inside.length, 1 );
        deepEqual( inside[0], ['p', 'This is a foo.'] );
    });

    T( 'declarationBefore', function ( t ) {
        var pat = t.findPattern('foo'),
            nodes = t.getNodes(pat);

        ok( pat );
        equal( nodes.length, 2 );
        deepEqual( nodes[0], ['p', 'This is a foo.'] );
        deepEqual( nodes[1], ['p', 'nice.'] );
    });

    T( 'twoLineParagraph', function (t) {
        var nodes = t.getNodes( t.findPattern('foo') );

        equal( nodes.length, 1 );
        deepEqual( nodes[0], ['p', 'This is line 1.' + '\n' + 'This is line 2.'] );
    });

    T( 'twoParagraphs', function (t) {
        var nodes = t.getNodes( t.findPattern('foo') );

        equal( nodes.length, 2 );
        deepEqual( nodes[0], ['p', 'This is paragraph 1.'] );
        deepEqual( nodes[1], ['p', 'This is paragraph 2.'] );
    });

    T( 'anExample', function (t) {
        var nodes = t.getNodes( t.findPattern('foo') );

        equal( nodes.length, 1 );
        equal( t.getType(nodes[0]), 'example' );
        equal( t.getAttr(nodes[0], 'title'), 'This is an example.' );
        equal( t.getNodes(nodes[0])[0], '<xmp>An Example</xmp>' );
    });

    T( 'modifierNoConvention', function (t) {
        var nodes = t.getNodes( t.findPattern('foo') );

        equal( nodes.length, 1 );
        deepEqual( nodes[0], ['p', 'This is NOT a bar foo.'] );
    });

    T( 'modifierNoPattern', function (t) {
        var nodes = t.getNodes();

        equal( nodes.length, 1 );
        deepEqual( nodes[0], ['p', 'This is NOT a bar foo.'] );
    });

    [ 'explicitModifier', 'modifierConvention', 'modifierAfterPattern', 'doubleModifier' ]
        .forEach( function (id) {
            T( id, function (t) {
                var nodes = t.getNodes( t.findPattern('foo') );
                equal( nodes.length, 2 );
                equal( t.getType(nodes[1]), 'modifier' );
                equal( t.getAttr(nodes[1], 'name'), 'bar-' );

                var modNodes = t.getNodes(nodes[1]);
                equal( modNodes.length, 1 );
                deepEqual( modNodes[0], ['p', 'This is a bar foo.'] );
            });
        });

    T( 'memberConvention', function (t) {
        var nodes = t.getNodes( t.findPattern('foo') );

        equal( nodes.length, 2 );
        deepEqual( nodes[0], ['p', 'This is a foo.'] );
        equal( t.getType(nodes[1]), 'member' );
        equal( t.getAttr(nodes[1], 'name'), 'foo-bar' );

        var modNodes = t.getNodes(nodes[1]);
        equal( modNodes.length, 1 );
        deepEqual( modNodes[0], ['p', 'This is a bar of a foo.'] );
    });

    T( 'memberNoConvention', function (t) {
        var nodes = t.getNodes( t.findPattern('foo') );

        equal( nodes.length, 2 );
        deepEqual( nodes[0], ['p', 'This is a foo.'] );
        deepEqual( nodes[1], ['p', 'This is NOT a bar of a foo.'] );
    });

    T( 'directMemberConvention', function (t) {
        var nodes = t.getNodes( t.findPattern('foo') );

        equal( nodes.length, 2 );
        deepEqual( nodes[0], ['p', 'This is a foo.'] );
        equal( t.getType(nodes[1]), 'member' );
        equal( t.getAttr(nodes[1], 'name'), 'foo-bar' );

        var modNodes = t.getNodes(nodes[1]);
        equal( modNodes.length, 1 );
        deepEqual( modNodes[0], ['p', 'This is a bar of a foo.'] );
    });

    T( 'deepMemberConvention', function (t) {
        var nodes = t.getNodes( t.findPattern('foo') );

        equal( nodes.length, 2 );
        deepEqual( nodes[0], ['p', 'This is a foo.'] );
        equal( t.getType(nodes[1]), 'member' );
        equal( t.getAttr(nodes[1], 'name'), 'foo-bar' );

        var modNodes = t.getNodes(nodes[1]);
        equal( modNodes.length, 1 );
        deepEqual( modNodes[0], ['p', 'This is a bar of a foo.'] );
    });

    T( 'twoModifiers', function ( t ) {
        var pat = t.findPattern('foo'),
            nodes = t.getNodes(pat);

        ok( pat );
        equal( nodes.length, 2 );
        equal( t.getType( nodes[0] ), 'modifier' );
        equal( t.getAttr( nodes[0], 'name' ), 'another-' );
        equal( t.getType( nodes[1] ), 'modifier' );
        equal( t.getAttr( nodes[1], 'name' ), 'bar-' );
    });

    T( 'twoMembers', function ( t ) {
        var pat = t.findPattern('foo'),
            nodes = t.getNodes(pat);

        ok( pat );
        equal( nodes.length, 2 );
        equal( t.getType( nodes[0] ), 'member' );
        equal( t.getAttr( nodes[0], 'name' ), 'foo-something' );
        equal( t.getType( nodes[1] ), 'member' );
        equal( t.getAttr( nodes[1], 'name' ), 'foo-bar' );
    });

    T( 'modifierAndMember', function ( t ) {
        var pat = t.findPattern('foo'),
            nodes = t.getNodes(pat);

        ok( pat );
        equal( nodes.length, 2 );
        equal( t.getType( nodes[0] ), 'modifier' );
        equal( t.getAttr( nodes[0], 'name' ), 'bar-' );
        equal( t.getType( nodes[1] ), 'member' );
        equal( t.getAttr( nodes[1], 'name' ), 'foo-bar' );
    });

    T( 'twoPatterns', function ( t ) {
        var pat = t.findPattern('foo'),
            nodes = t.getNodes(pat);

        ok( pat );
        equal( nodes.length, 1 );
        deepEqual( nodes[0], ['p', 'This is a foo.'] );

        pat = t.findPattern('bar');
        nodes = t.getNodes(pat);

        ok( pat );
        equal( nodes.length, 1 );
        deepEqual( nodes[0], ['p', 'This is a bar.'] );
    });

    T( 'closeTwoLevels', function ( t ) {
        var nodes = t.getNodes();

        equal( nodes.length, 2 );
        equal( nodes[1], t.findPattern('bar') );
    });

    [ 'explicitReopenPattern', 'implicitReopenPattern' ]
        .forEach( function (id) {
            T( id, function ( t ) {
                var tree = t.getNodes(),
                pat = t.findPattern('foo'),
                nodes = t.getNodes(pat);

                equal( tree.length, 2 );
                equal( tree[0], pat );

                equal( nodes.length, 1 );
                equal( t.getType(nodes[0]), 'member' );
                equal( t.getAttr(nodes[0], 'name'), 'foo-bar' );

                var modNodes = t.getNodes(nodes[0]);
                equal( modNodes.length, 1 );
                deepEqual( modNodes[0], ['p', 'This is a bar of a foo.'] );
            });
        });

    [ 'explicitlyInterleaved', 'implicitlyInterleaved' ]
        .forEach( function (id) {
            T( id, function ( t ) {
                var foo = t.findPattern('foo'),
                    bar = t.findPattern('bar'),
                    fooNodes = t.getNodes(foo),
                    barNodes = t.getNodes(bar);

                equal( t.getNodes().length, 2 );

                equal( fooNodes.length, 2 );
                equal( t.getType(fooNodes[1]), 'member' );
                equal( t.getAttr(fooNodes[1], 'name'), 'foo-bar' );

                equal( barNodes.length, 2 );
                equal( t.getType(barNodes[1]), 'modifier' );
                equal( t.getAttr(barNodes[1], 'name'), 'foo-' );
            });
        });

    /** Testing function */
    function T( title, /* optional */ opts, testFunction ) {
        if ( ! testFunction && _.isFunction(opts) ) {
            testFunction = opts;
            opts = {};
        }

        console.log("Test #" + title);

        var cssString = $('#' + title).text(),
            parser = new Parser( opts ),
            doc = parser.parse( cssString ),
            t = { doc: doc };

        t.findPattern = function ( name ) {
            return doc.findByName( name );
        };

        t.getType = function ( node ) {
            return doc.getType( node );
        };

        t.getAttr = function ( node, key ) {
            return doc.getAttr( node, key );
        };

        t.getNodes = function ( node ) {
            return doc.getNodes( node );
        }

        test( title, function () {
            testFunction( t );
        })
    }

});
