require(['Dictionary', 'Analyzer', 'Parser'],
function( Dictionary, Analyzer, Parser ) {

    T( 'implicitPattern', function ( t ) {
        ok( t.findPattern('foo') );
    });

    T( 'invalidPatternName', function ( t ) {
        ok( !t.findPattern('foo-bar') );
    });

    T( 'explicitPattern', function ( t ) {
        ok( t.findPattern('foo') );
    });

    T( 'explicitInvalidPattern', function ( t ) {
        ok( t.findPattern('foo-bar') );
    });

    T( 'descriptionBefore', function ( t ) {
        var pat = t.findPattern('foo'),
            decls = pat.getValues('text');

        ok( pat );
        equal( decls.length, 1 );
        equal( decls[0], 'This is a foo.' );
    });

    T( 'descriptionInside', function ( t ) {
        var pat = t.findPattern('foo'),
            decls = pat.getValues('text');

        ok( pat );
        equal( decls.length, 1 );
        equal( decls[0], 'This is a foo.' );
    });

    T( 'descriptionBeforeAndInside', function ( t ) {
        var pat = t.findPattern('foo'),
            decls = pat.getValues('text');

        ok( pat );
        equal( decls.length, 2 );
        equal( decls[0], 'This is a foo.' );
        equal( decls[1], 'nice.' );
    });

    T( 'twoLineParagraph', function (t) {
        var decls = t.findPattern('foo').getValues('text');

        equal( decls.length, 1 );
        equal( decls[0], 'This is line 1.' + '\n' + 'This is line 2.' );
    });

    T( 'twoParagraphs', function (t) {
        var decls = t.findPattern('foo').getValues('text');

        equal( decls.length, 2 );
        equal( decls[0], 'This is paragraph 1.' );
        equal( decls[1], 'This is paragraph 2.' );
    });

    T( 'anExample', function (t) {
        var decls = t.findPattern('foo').getValues('example');

        equal( decls.length, 1 );
        equal( decls[0].get('title'), 'This is an example.' );
        equal( decls[0].get('html'), '<xmp>An Example</xmp>' );
    });

    T( 'modifierConvention', function (t) {
        var decls = t.findPattern('foo').getValues('modifier');
        equal( decls.length, 1 );
        equal( decls[0].get('name'), 'bar-' );

        var modDecls = decls[0].getValues('text');
        equal( modDecls.length, 1 );
        equal( modDecls[0], 'This is a bar foo.' );
    });

    T( 'modifierNoConvention', function (t) {
        var decls = t.findPattern('foo').getValues('modifier');

        equal( decls.length, 0 );
    });

    T( 'doubleModifier', function (t) {
        var decls = t.findPattern('foo').getValues('modifier');

        equal( decls.length, 1 );
        equal( decls[0].get('name'), 'bar- baz-' );
    });

    T( 'memberConvention', function (t) {
        var decls = t.findPattern('foo').getValues('member');
        equal( decls.length, 1 );
        equal( decls[0].get('name'), 'foo-bar' );

        var memDecls = decls[0].getValues('text');
        equal( memDecls.length, 1 );
        equal( memDecls[0], 'This is a bar of a foo.' );
    });

    T( 'memberNoConvention', function (t) {
        var decls = t.findPattern('foo').getValues('member');

        equal( decls.length, 0 );
    });

    T( 'directMemberConvention', function (t) {
        var decls = t.findPattern('foo').getValues('member');

        equal( decls.length, 1 );
        equal( decls[0].get('name'), 'foo-bar' );
    });

    T( 'deepMemberConvention', function (t) {
        var decls = t.findPattern('foo').getValues('member');

        equal( decls.length, 1 );
        equal( decls[0].get('name'), 'foo-bar' );
    });

    /** Testing function */
    function T( title, /* optional */ opts, testFunction ) {
        if ( ! testFunction && _.isFunction(opts) ) { 
            testFunction = opts;
            opts = {};
        }

        var t = {},
            cssString = $('#' + title).text(),
            dictionary = new Dictionary(),
            analyzer = new Analyzer( dictionary, opts ),
            parser = new Parser();

        console.log("Test #" + title);

        parser.parse( cssString, function(rules) {
            analyzer.analyze(rules);
        });

        t.findPattern = function ( name ) {
            return dictionary.findByName( name );
        }

        test( title, function () {
            testFunction( t );
        })
    }

});
