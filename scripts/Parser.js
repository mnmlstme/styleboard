define(['StyleDoc', '../lib/marked/js/marked'], function (StyleDoc, marked) {

    // Uses LESS as a CSS parser, but all dependences on LESS should
    // be confined to this file.

    var regex = {
        classname:      /^\.([a-zA-Z][a-zA-Z0-9_-]*)$/,
        tagname:        /^([a-z]+)$/,
        pseudo:         /^::?([a-z-]+)$/,
        cmtfirst:       /^\s*\/\*\*\s*/,
        cmtmiddle:      /^(\s*\*+\s?)?/,
        cmtlast:        /\s*\*+\/\s*$/,
        atcommand:      /^\s*@([a-z-]+)\s*(\[([a-z][a-z0-9-]*)\])?(.*)\s*$/,
        ateot:          /^\s*(@[a-z-]+.*)?$/,
        empty:          /^\s*$/,
        pattern:        /^\.([a-z][a-z0-9]*)$/,                // lowercase, no hyphens
        modifier:       /^\.([a-z][a-z0-9-]*\-)$/,             // trailing hyphen
        member:         /^\.(([a-z][a-z0-9]*)\-[a-z0-9-]+)$/,  // pattern name '-' member name
        helper:         /^\.(([a-z][a-z0-9]*)\-[a-z0-9-]+)$/,  // pattern name '-' member name
        state:          /^\.((is|has)\-[a-z0-9-]+)$/           // 'is-' or 'has-' prefix
    };

    var options = {
        requireDoc: false,        // if true, only consider rules with documentation
        requireNaming: true       // if true, only consider classes that follow naming convention
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
                    alert("Failed " + status + ": " + error);
                },
                success: function( data, status, xhr ) {
                    var doc = parser.parse(data);
                    done( doc );
                }
            });
        };

        parser.parse = function parse( data ) {
            var doc = new StyleDoc();
            new less.Parser()
                .parse( data, function (err, css ) {
                    if ( err ) {
                        alert( "Failed to parse CSS: " + err );
                    } else {
                        buildDoc( doc, css.rules );
                    }
                });
            return doc;
        };

        return parser;

        function buildDoc( doc, nodes ) {
            var stack = [ doc.getRoot() ];

            nodes.forEach( function (node) {
                var comments, context, code;
                switch ( node.type ) {
                case 'Comment':
                    parseComment( node.value );
                    break;
                case 'Ruleset':
                    comments = node.rules.filter( function (rule) {
                        return rule.type === 'Comment';
                    });
                    context = (comments.length || !opts.requireDoc) &&
                        identifyContext( node.selectors );
                    if (context) {
                        openContext( context );
                    }
                    comments.map( function (rule) {
                        parseComment( rule.value, node.selectors );
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
            };

            function findContext( context ) {
                var pattern = context.type !== 'pattern' && getCurrent('pattern');

                if ( pattern ) {
                    return doc.getDefinition(context.name, pattern);
                } else {
                    return doc.getPattern(context.name);
                }
            };

            function addText( text ) {
                var html = marked(text).trim();
                insert(['html',html]);
            }

            function insertNode( type, attrs, content ) {
                var node =  [ type, _.clone(attrs) ];
                insert(node);
                if ( content ) {
                    insert( content, node );
                }
                return node;
            };

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
            };

            function isOpen( node ) {
                return _(stack).contains( node );
            };

            function popContext() {
                return stack.pop();
            };

            function popToContext( node ) {
                while ( stack[stack.length-1] !== node ) {
                    stack.pop();
                }
            };

            function closeContext( node ) {
                popToContext( node );
                popContext();
            };

            function insert( node, parent ) {
                parent = parent || stack[stack.length-1];
                parent.push( node );
            };

            function parseComment ( comment, selectors ) {
                var selector = selectors && selectors.length && selectors[0].toCSS() || '';

                if ( !regex.cmtfirst.exec( comment ) ) { return; }

                var  lines = comment.trim().split('\n')
                    .map( function ( line, i, list ) {
                        if ( i === 0 ) line = line.replace( regex.cmtfirst, '' );
                        if ( i === list.length-1 ) line = line.replace( regex.cmtlast, '' );
                        if ( i > 0 && i <= list.length-1 ) line = line.replace( regex.cmtmiddle, '' );
                        return line;
                    }),
                line, matches, command, slug, data;

                while ( lines.length ) {
                    line = lines.shift();
                    if  (( matches = regex.atcommand.exec( line ) )) {
                        command = matches[1];
                        slug = matches[3];
                        data = matches[4];
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
                                name: slug || stringToSlug(data)
                            }, contentsOfBlock() );
                            break;
                        default:
                            console.warn('unrecognized StyleDoc tag @' + command);
                        }
                    } else if ( ! regex.empty.exec(line) ) {
                        addText( contentsOfBlock(line) );
                    }
                }

                function selectorToName( string ) {
                    var trailingClass = /\.([a-zA-Z][a-zA-Z0-9-_]+)$/,
                        matches = trailingClass.exec( string );
                    return matches ? matches[1] : string;
                }

                function stringToSlug( string ) {
                    return string.toLowerCase().replace(/[^a-z0-9]+/g,'-');
                }

                function contentsOfBlock( firstLine ) {
                    var content = [],
                        leader = Infinity;
                    if ( firstLine ) content.push( firstLine );
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
                var context,
                    selector, elements, token, atRoot,
                    patternContext, matches,
                    patternRegex = ( opts.requireNaming ? regex.pattern : regex.classname ),
                    helperRegex = ( opts.requireNaming ? regex.helper : regex.classname ),
                    memberRegex = ( opts.requireNaming ? regex.member : regex.classname ),
                    modifierRegex = ( opts.requireNaming ? regex.modifier : regex.classname ),
                    stateRegex = ( opts.requireNaming ? regex.state : regex.classname );

                for ( var i = 0; i < selectors.length && !context; i++ ){
                    selector = selectors[i];
                    elements = selector.elements.slice(0);
                    atRoot = true;
                    patternContext = null;
                    token = elements.shift().value;

                    if ( (matches = patternRegex.exec( token )) ) {
                        patternContext = {
                            name: matches[1],
                            selector: token,
                            type: 'pattern'
                        };
                    }

                    if ( patternContext ) {
                        if ( !doc.getPattern( patternContext.name ) ) {
                            // if it's not already a pattern, it must be solo
                            for ( var i = 0; patternContext && i < elements.length && elements[i].combinator.value === ''; i++ ) {
                                if ( patternRegex.exec( token ) ) {
                                    // Another potential pattern, don't consider either
                                    patternContext = null;
                                }
                            }
                        }
                    }

                    if ( patternContext ) {
                        context = [ patternContext ];
                        while ( patternContext && elements.length ) {
                            atRoot = atRoot && elements[0].combinator.value === '';
                            token = elements.shift().value;
                            if ( atRoot ) {
                                if ( (matches = modifierRegex.exec( token )) ) {
                                    context.push({
                                        name: matches[1],
                                        selector: patternContext.selector + '.' + matches[1],
                                        type: 'modifier'
                                    });
                                } else if ( (matches = stateRegex.exec( token ))  ) {
                                    context.push({
                                        name: matches[1],
                                        selector: patternContext.selector + '.' + matches[1],
                                        type : 'state'
                                    });
                                }
                            } else {
                                if ( (matches = memberRegex.exec( token )) ) {
                                    context.push({
                                        name: matches[1],
                                        selector: patternContext.selector + ' .' + matches[1],
                                        type: 'member'
                                    });
                                }
                            }
                        }
                    }
                }

                return context;
            }

        }
    }

    return Parser;

});

