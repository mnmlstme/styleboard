var QUnit = require('qunitjs');
var _ = require('underscore');
var $ = require('jquery');

var StyleDoc = require('./StyleDoc');
var Context = require('./Context');
var Parser = require('./Parser');


T( 'implicitPattern', function ( t ) {
    var pat = t.getPattern('foo');
    ok( pat );

    var html = pat.getNodesOfType('html');
    equal( html.length, 0 );
});

T( 'implicitPattern', { requireDoc: true }, function ( t ) {
    ok( !t.getPattern('foo') );
});

['implicitDocPattern',
 'explicitPattern',
 'flagPattern',
 'aliasPattern'].forEach( function (id) {
    T( id, function ( t ) {
        var pat = t.getPattern('foo');
        ok( pat );

        var html = pat.getNodesOfType('html');
        equal( html.length, 1 );
        equal( html[0].getText(), '<p>foo.</p>' );
    });
});

T('aliasPattern', function ( t ) {
    var pat = t.getPattern('bar');
    ok( pat );

    var html = pat.getNodesOfType('html');
    equal( html.length, 1 );
    equal( html[0].getText(), '<p>bar.</p>' );
});

T( 'invalidPatternName', function ( t ) {
    ok( !t.getPattern('foo-bar') );

    var html = t.getNodesOfType('html');
    equal( html.length, 1 );
    equal( html[0].getText(), '<p>NOT foo-bar.</p>' );
});

T( 'invalidPatternName', { requireNaming: false }, function ( t ) {
    var pat = t.getPattern('foo-bar');
    ok( pat );

    var html = pat.getNodesOfType('html');
    equal( html.length, 1 );
    equal( html[0].getText(), '<p>NOT foo-bar.</p>' );
});

['explicitInvalidPattern',
 'flagInvalidPattern'].forEach( function (id) {
     T( id, function ( t ) {
         var pat = t.getPattern('foo-bar');
         ok( pat );

         var html = pat.getNodesOfType('html');
         equal( html.length, 1 );
         equal( html[0].getText(), '<p>foo-bar.</p>' );
     });
});

T( 'descriptionBefore', function ( t ) {
    var pat = t.getPattern('foo');
    ok( pat );

    var outside = t.getNodesOfType('html');
    equal( outside.length, 1 );
    equal( outside[0].getText(), '<p>outside foo.</p>' );

    var inside = pat.getNodesOfType('html');
    equal( inside.length, 1 );
    equal( inside[0].getText(), '<p>foo.</p>' );
});

T( 'declarationBefore', function ( t ) {
    var pat = t.getPattern('foo');
    ok( pat );

    var html = pat.getNodesOfType('html');
    equal( html.length, 2 );
    equal( html[0].getText(), '<p>foo.</p>' );
    equal( html[1].getText(), '<p>nice.</p>' );
});

T( 'twoLineParagraph', function (t) {
    var pat = t.getPattern('foo');
    var html = pat.getNodesOfType('html');
    equal( html.length, 1 );
    equal( html[0].getText(), '<p>line 1.\nline 2.</p>' );
});

T( 'twoParagraphs', function (t) {
    var pat = t.getPattern('foo');
    var html = pat.getNodesOfType('html');
    equal( html.length, 2 );
    equal( html[0].getText(), '<p>paragraph 1.</p>' );
    equal( html[1].getText(), '<p>paragraph 2.</p>' );
});

T( 'anExample', function (t) {
    var pat = t.getPattern('foo');
    var xmp = pat.getNodesOfType('example');
    equal( xmp.length, 1 );
    equal( xmp[0].getAttr('title'), 'an example.' );
    equal( xmp[0].getText(), '<xmp>An Example</xmp>' );
});

T( 'modifierNoConvention', {requireNaming: true}, function (t) {
    var pat = t.getPattern('foo');
    var mod = pat.getNodesOfType('modifier');
    equal( mod.length, 0 );
});

T( 'modifierNoConvention', {requireNaming: false}, function (t) {
    var pat = t.getPattern('foo');
    var mod = pat.getNodesOfType('modifier');
    equal( mod.length, 1 );

    var html = mod[0].getNodesOfType('html');
    equal( html.length, 1 );
});

T( 'modifierFlagNoConvention', {requireNaming: true}, function (t) {
    var pat = t.getPattern('foo');
    var mod = pat.getNodesOfType('modifier');
    equal( mod.length, 1 );

    var html = mod[0].getNodesOfType('html');
    equal( html.length, 1 );
});

T( 'modifierNoPattern', function (t) {
    var pat = t.getPattern('foo');
    var html = t.getNodesOfType('html');

    ok( !pat );

    equal( html.length, 1 );
    equal( html[0].getText(), '<p>NOT bar foo.</p>' );
});

[ 'explicitPatternModifier',
  'explicitModifier',
  'explicitModifierContextual',
  'modifierConvention',
  'modifierAfterPattern',
  'modifierWithPseudo' ]
    .forEach( function (id) {
        T( id, function (t) {
            var pat = t.getPattern('foo');
            ok( pat );

            var html = pat.getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>foo.</p>' );

            var mods = pat.getNodesOfType('modifier');
            equal( mods.length, 1 );
            equal( mods[0].getName(), 'bar-' );

            html = mods[0].getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>bar foo.</p>' );
        });
    });

[ 'twoModifiers',
  'doubleModifier' ]
    .forEach( function (id ) {
        T( id, function (t) {
            var pat = t.getPattern('foo');
            ok( pat );

            var mods = pat.getNodesOfType('modifier');
            equal( mods.length, 2 );
            equal( mods[0].getName(), 'bar-' );
            equal( mods[1].getName(), 'another-' );
        });
    });

T( 'memberNoConvention', { requireNaming: true }, function (t) {
    var pat = t.getPattern('foo');
    ok( pat );

    var html = pat.getNodesOfType('html');
    equal( html.length, 2 );
    equal( html[0].getText(), '<p>foo.</p>' );
    equal( html[1].getText(), '<p>NOT bar of a foo.</p>' );

    equal( pat.getNodesOfType('member'), 0 );
});

['memberNoConvention',
 'flagMemberNoConvention'].forEach( function (id) {
     T( id, { requireNaming: false }, function (t) {
         var pat = t.getPattern('foo');
         ok( pat );

         var html = pat.getNodesOfType('html');
         equal( html.length, 1 );
         equal( html[0].getText(), '<p>foo.</p>' );

         var mems = pat.getNodesOfType('member');
         equal( mems.length, 1 );
         equal( mems[0].getName(), 'bar' );

         html = mems[0].getNodesOfType('html');
     });
});

[ 'explicitPatternMember',
  'explicitMember',
  'explicitMemberContextual',
  'memberConvention',
  'directMemberConvention',
  'deepMemberConvention' ]
    .forEach( function (id ) {
        T( id, { requireNaming: true }, function (t) {
            var pat = t.getPattern('foo');
            ok( pat );

            var html = pat.getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>foo.</p>' );

            var mems = pat.getNodesOfType('member');
            equal( mems.length, 1 );
            equal( mems[0].getName(), 'foo-bar' );

            html = mems[0].getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>bar of a foo.</p>' );
        });
    });

T( 'deepMemberConvention', { requireNaming: false }, function (t) {
    var pat = t.getPattern('foo');
    ok( pat );

    var html = pat.getNodesOfType('html');
    equal( html.length, 1 );
    equal( html[0].getText(), '<p>foo.</p>' );

    var mems = pat.getNodesOfType('member');
    equal( mems.length, 1 );
    equal( mems[0].getName(), 'foo-bar' );

    html = mems[0].getNodesOfType('html');
    equal( html.length, 1 );
    equal( html[0].getText(), '<p>bar of a foo.</p>' );
});

T( 'twoMembers', function ( t ) {
    var pat = t.getPattern('foo');
    ok( pat );

    var mems = pat.getNodesOfType('member');
    equal( mems.length, 2 );
    equal( mems[0].getName(), 'foo-bar' );
    equal( mems[1].getName(), 'foo-something' );
});

T( 'modifierAndMember', function ( t ) {
    var pat = t.getPattern('foo');
    ok( pat );

    var mods = pat.getNodesOfType('modifier');
    equal( mods.length, 1 );
    equal( mods[0].getName(), 'bar-' );

    var mems = pat.getNodesOfType('member');
    equal( mems.length, 1 );
    equal( mems[0].getName(), 'foo-bar' );
});

T( 'twoPatterns', function ( t ) {
    var pat = t.getPattern('foo');
    ok( pat );

    var html = pat.getNodesOfType('html');
    equal( html.length, 1 );
    equal( html[0].getText(), '<p>foo.</p>' );

    pat = t.getPattern('bar');
    ok( pat );

    html = pat.getNodesOfType('html');
    equal( html.length, 1 );
    equal( html[0].getText(), '<p>bar.</p>' );
});

[ 'closeTwoLevels',
  'explicitReopenPattern',
  'implicitReopenPattern' ]
    .forEach( function (id) {
        T( id, function ( t ) {
            var pat = t.getPattern('foo');
            ok( pat );

            var html = pat.getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>foo.</p>' );

            var mems = pat.getNodesOfType('member');
            equal( mems.length, 1 );
            equal( mems[0].getName(), 'foo-bar' );

            html = mems[0].getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>bar of a foo.</p>' );

            pat = t.getPattern('bar');
            ok( pat );

            html = pat.getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>bar.</p>' );

            equal( pat.getNodesOfType('member').length, 0 );
        });
    });

[ 'explicitReopenPatternForModifier',
  'implicitReopenPatternForModifier' ].forEach( function (id) {
      T( id , function(t) {
          var pat = t.getPattern('foo');
          ok( pat );

          var mods = pat.getNodesOfType('modifier');
          equal( mods.length, 1 );
          equal( mods[0].getName(), 'bar-' );

          var html = mods[0].getNodesOfType('html');
          equal( html.length, 1 );
          equal( html[0].getText(), '<p>bar foo.</p>' );

          pat = t.getPattern('bar');
          ok( pat );
          equal( pat.getNodesOfType('modifier').length, 0 );
      });
  });

[ 'explicitlyInterleaved', 'implicitlyInterleaved' ]
    .forEach( function (id) {
        T( id, function ( t ) {
            var pat = t.getPattern('foo');
            ok( pat );

            var html = pat.getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>foo.</p>' );

            var mems = pat.getNodesOfType('member');
            equal( mems.length, 1 );
            equal( mems[0].getName(), 'foo-bar' );

            html = mems[0].getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>bar of a foo.</p>' );

            equal( pat.getNodesOfType('modifier').length, 0 );

            pat = t.getPattern('bar');
            ok( pat );


            html = pat.getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>bar.</p>' );

            var mods = pat.getNodesOfType('modifier');
            equal( mods.length, 1 );
            equal( mods[0].getName(), 'foo-' );

            html = mods[0].getNodesOfType('html');
            equal( html.length, 1 );
            equal( html[0].getText(), '<p>foo bar.</p>' );

            equal( pat.getNodesOfType('member').length, 0 );
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
        t = new Context({ doc: doc, node: doc.getRoot() });

    QUnit.test( title, function () {
        testFunction( t );
    });
}
