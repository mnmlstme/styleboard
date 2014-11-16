var $ = require('jquery');
var _ = require('underscore');

var StyleDoc = require('./StyleDoc');
var marked = require('../lib/marked/js/marked');
var rework = require('rework');
var slick = require('slick');

// Uses LESS as a CSS parser, but all dependences on LESS should
// be confined to this file.
var regex = {

    classname:      /^([a-zA-Z][a-zA-Z0-9_-]*)$/,
    tagname:        /^([a-z]+)$/,
    pseudo:         /^::?([a-z-]+)$/,
    cmtfirst:       /^\*+\s*/,
    cmtmiddle:      /^\s*\*+\s?/,
    cmtlast:        /\s*\*+$/,
    atcommand:      /^\s*@([a-z-]+)\s*(\[\s*([^\]]*)\s*\])?\s*(.*)\s*$/,
    slug:           /^[a-z][a-z-]*/,
    filename:       /^([_.+a-zA-Z0-9-]+)\.([a-z]+)/,
    path:           /^(.*\/)?([^/])+$/,
    interp:         /%{([a-z]+)}/,
    ateot:          /^\s*(@[a-z-]+.*)?$/,
    empty:          /^\s*$/,
    pattern:        /^([a-z][a-z0-9]*)$/,                // lowercase, no hyphens
    modifier:       /^([a-z][a-z0-9-]*\-)$/,             // trailing hyphen
    member:         /^(([a-z][a-z0-9]*)\-[a-z0-9-]+)$/,  // pattern name '-' member name
    helper:         /^(([a-z][a-z0-9]*)\-[a-z0-9-]+)$/,  // pattern name '-' member name
    state:          /^((is|has)\-[a-z0-9-]+)$/           // 'is-' or 'has-' prefix
};

var options = {
    requireDoc: false,        // if true, only consider rules with documentation
    requireNaming: true,      // if true, only consider classes that follow naming convention
    examplesPath: '%{pattern}/examples'
};

function Parser( opts ) {
    opts = _.extend( options, opts || {} );
    var parser = this;

    parser.load = function load ( url, done ) {
        $.ajax({
            url: url,
            cache: false,
            dataType: 'text',
            error:  function ( xhr, status, error ) {
                alert("Failed to load " + url + "\n" + status + ": " + error);
            },
            success: function( data, status, xhr ) {
                var doc = parser.parse(data, url);
                done( doc );
            }
        });
    };

    parser.parse = function parse( data, url ) {
        var doc = new StyleDoc();

        rework( data )
            .use( function ( stylesheet, rework ) {
                buildDoc( doc, stylesheet.rules, url );
            });
        return doc;
    };

    return parser;

    function buildDoc( doc, nodes, url ) {
        var stack = [ doc.getRoot() ];
            urlMatches = regex.path.exec(url),
            urlPath = urlMatches ? urlMatches[1] : '';

        nodes.forEach( function (node) {
            var comments, context, code;
            switch ( node.type ) {
            case 'comment':
                parseComment( node.comment );
                break;
            case 'rule':
                comments = node.declarations.filter( function (node) {
                    return node.type === 'comment';
                });
                context = (comments.length || !opts.requireDoc) &&
                    identifyContext( node.selectors );
                if (context.length) {
                    openContext( context );
                }
                comments.map( function (comment) {
                    parseComment( comment.comment, node.selectors );
                });
                break;
            default:
                // ignore all other nodes
            }
        });

        function openContext( list ) {
            if ( !_.isArray( list ) ) { list = [ list ]; }
            var context, target, old;
            while ( list.length ) {
                context = list.shift();
                target = findContext( context );
                if ( target && isOpen( target ) ) {
                    popToContext( target );
                } else {
                    old = getCurrent( context.type );
                    if ( old ) {
                        closeContext( old );
                    }
                    if ( !target ) {
                        target = insertNode( context.type, context );
                        if ( context.name ) {
                            doc.define( context.type, context.name, target,
                                        getCurrent('pattern') );
                        }
                    }
                    stack.push( target );
                }
            }
            return target;
        }

        function findContext( context ) {
            var pattern = context.type !== 'pattern' && getCurrent('pattern');

            if ( pattern ) {
                return doc.getDefinition(context.name, pattern);
            } else {
                return doc.getPattern(context.name);
            }
        }

        function addText( line, lines ) {
            if ( !regex.empty.exec(line) ) {
                var text = contentsOfBlock(line, lines),
                    html = marked(text).trim();

                insert(['html',html]);
            }
        }

        function insertNode( type, attrs, content ) {
            var node =  [ type, _.clone(attrs) ];
            insert(node);
            if ( content ) {
                insert( content, node );
            }
            return node;
        }

        function getCurrent( type ) {
            if (type) {
                for ( var i = stack.length-1; i >= 0; i-- ) {
                    var x = stack[i];
                    if ( doc.getType(x) === type ) {
                        return x;
                    }
                }
            } else {
                return stack[stack.length-1];
            }
            return undefined;
        }

        function isOpen( node ) {
            return _(stack).contains( node );
        }

        function popContext() {
            return stack.pop();
        }

        function popToContext( node ) {
            while ( stack[stack.length-1] !== node ) {
                stack.pop();
            }
        }

        function closeContext( node ) {
            popToContext( node );
            popContext();
        }

        function insert( node, parent ) {
            parent = parent || stack[stack.length-1];
            parent.push( node );
        }

        function parseComment ( comment, selectors ) {
            var selector = selectors && selectors.length && selectors[0] || '';

            if ( !regex.cmtfirst.exec( comment ) ) { return; }

            var lines = comment.split('\n')
                .map( function ( line, i, list ) {
                    if ( i === 0 ) line = line.replace( regex.cmtfirst, '' );
                    if ( i === list.length-1 ) line = line.replace( regex.cmtlast, '' );
                    if ( i > 0 && i <= list.length-1 ) line = line.replace( regex.cmtmiddle, '' );
                    return line;
                }),
                line;

            while ( lines.length ) {
                line = lines.shift();
                processCommand( line, lines ) || addText( line, lines );
            }
        }

        function processCommand( line, lines ) {
            var matches = regex.atcommand.exec( line );
            if ( matches ) {
                var command = matches[1],
                    brackets = matches[3] || '',
                    data = matches[4],
                    slug = brackets && (matches = regex.slug.exec(brackets)) ?
                        matches[0] : false,
                    filelist = brackets && regex.filename.exec(brackets) ?
                        brackets.split(/\s*,\s*/) : [];


                switch ( command ) {
                case 'section':
                    openContext({
                        type: 'section',
                        title: data,
                        name: slug || stringToSlug(data)
                    });
                    break;
                case 'helper':
                case 'modifier':
                case 'member':
                case 'pattern':
                case 'state':
                    openContext( createContext(data || selector, command) );
                    break;
                case 'example':
                    insertNode( command, {
                        title: data,
                        name: slug || stringToSlug(data),
                        files: exampleFiles( filelist )
                    }, contentsOfBlock('', lines) );
                    break;
                default:
                    console.warn('unrecognized StyleDoc tag @' + command);
                }
            }
            return !!matches;
        }

        function selectorToName( string ) {
            var trailingClass = /\.([a-zA-Z][a-zA-Z0-9-_]+)$/,
                matches = trailingClass.exec( string );
            return matches ? matches[1] : string;
        }

        function stringToSlug( string ) {
            return string.toLowerCase().replace(/[^a-z0-9]+/g,'-');
        }

        function exampleFiles( filelist ) {
            var hash = {};

            filelist.forEach( function (filename) {
                var matches = regex.filename.exec(filename),
                    type = matches[2];

                hash[type] = hash[type] || [];
                hash[type].push( filePath(filename, opts.examplesPath) );
            });

            return hash;
        }

        function filePath( filename, searchPath ) {
            var path = searchPath.replace( regex.interp, pathInterpolation );

            if ( path && path[path.length-1] !== '/' ) {
                path = path + '/';
            }

            return urlPath + path + filename;
        }

        function pathInterpolation( match, token ) {
            var node = getCurrent( token );

            return node ? doc.getAttr(node, 'name') : token;
        }

        function contentsOfBlock( line, lines ) {
            var content = [],
                leader = Infinity;

            if ( line ) content.push( line );
            //lookahead: may be ended by another tag which we should not consume
            while (( lines.length && !regex.ateot.exec(lines[0]) )) {
                content.push( lines.shift() );
            }
            content.forEach( function (s) {
                var leadingWS = /^(\s*)/,
                matches = leadingWS.exec( s ),
                length = matches ? matches[1].length : 0;
                if ( length < leader ) leader = length;
            });
            content = content.map( function (s) { return s.substr(leader); } );
            return content.join('\n');
        }

        function createContext( selector, type ) {
            var names = selector.split(/[^A-Za-z0-9_-]+/)
                    .filter(function (s) { return s.length; }),
                pattern = names[0],
                context = [];

            if ( type === 'pattern' || names.length > 1 ) {
                context.push({
                    name: pattern,
                    selector: selector,
                    type: 'pattern'
                });
            }

            if ( type !== 'pattern' ) {
                context.push({
                    name: names[names.length-1],
                    selector: selector,
                    type: type
                });
            }

            return context;
        }

        function identifyContext ( selectors ) {
            var context = [],
                selector, levels, first, last, classes, i,
                patternRegex = ( opts.requireNaming ? regex.pattern : regex.classname ),
                helperRegex = ( opts.requireNaming ? regex.helper : regex.classname ),
                memberRegex = ( opts.requireNaming ? regex.member : regex.classname ),
                modifierRegex = ( opts.requireNaming ? regex.modifier : regex.classname ),
                stateRegex = ( opts.requireNaming ? regex.state : regex.classname );

            function patternMatch ( name ) {
                return name.match( patternRegex );
            }

            function isPattern ( name ) {
                return !!doc.getPattern( name );
            }

            function isNotPattern ( name ) {
                return !doc.getPattern( name );
            }

            function isNotContext( name ) {
                var found = false;
                for ( var i = 0; !found && i < context.length; i++ ) {
                    if ( context[i].name === name )
                        found = true;
                }
                return !found;
            }

            function pushPattern ( name ) {
                context.push({
                    name: name,
                    type: 'pattern'
                });
            }

            function modStateMatch ( name ) {
                // TODO: remember which matched
                return name.match( modifierRegex ) || name.match( stateRegex );
            }

            function pushModifier ( name ) {
                context.push({
                    name: name,
                    type: ( opts.requireNaming && name.match( stateRegex ) ? 'state' : 'modifier' )
                });
            }

            function memberMatch ( name ) {
                // TODO: check for the pattern name in the member name per convention
                return name.match( memberRegex );
            }

            function pushMember ( name ) {
                context.push({
                    name: name,
                    type: 'member'
                });
            }

            for ( i = 0; i < selectors.length && !context.length; i++ ){
                selector = selectors[i];
                levels = slick.parse( selector )[0];
                atRoot = true;
                first = levels[0];
                last = levels[levels.length - 1];

                // NOTE: slick reverses the classList from the order they
                // appear, and this algorithm depends on order, so we reverse back.
                // TODO: make this algorithm not depend on the order of the classes.

                classes = (first.classList || []).slice(0);
                classes.reverse();

                names = classes.filter( patternMatch );

                if ( names.length > 1 ) {
                    // Only consider already-identified patterns
                    names = names.filter( isPattern );
                }

                if ( names.length ) {
                    // Only take the first one (ambiguous 2 patterns or modifier?)
                    pushPattern( names[0] );
                }

                if ( context.length ) {
                    // We have a pattern, now look for modifiers/states
                    classes = (first.classList || []).slice(0);
                    classes.reverse()
                        .filter( modStateMatch )
                        .filter( isNotPattern )
                        .filter( isNotContext )
                        .forEach( pushModifier );

                    // If there is more than one level, look for members on the last level
                    if ( levels.length > 1 ) {
                        classes = (last.classList || []).slice(0);
                        classes.reverse()
                            .filter( memberMatch )
                            .forEach( pushMember );
                    }
                }
            }

            return context;
        }

    }
}

module.exports = Parser;
