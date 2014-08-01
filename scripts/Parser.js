define(['StyleDoc'], function (StyleDoc) {

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
        state:          /^\.((is|has)\-[a-z0-9-]+)$/           // 'is-' or 'has-' prefix
    };

    var options = {
        requireDoc: false,        // if true, only consider rules with documentation
        requireNaming: false,     // if true, only consider classes that follow naming convention
    };

    function Parser( opts ) {
        opts = opts || {};
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
            new less.Parser( opts )
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
                    context = (comments.length || !options.requireDoc) &&
                        identifyContext( node.selectors );
                    if (context) {
                        doc.openContext( context );
                    }
                    comments.map( function (rule) {
                        parseComment( rule.value );
                    });
                    break;
                default:
                    // ignore all other nodes
                }
            });

            function convertToCss(node) {
                var code = node.toCSS({});
                code = code.replace(/^\s+/,'');
                return code;
            }
            function parseComment ( comment ) {

                if ( !regex.cmtfirst.exec( comment ) ) { return; }

                var  lines = comment.trim().split('\n')
                    .map( function ( line, i, list ) {
                        if ( i === 0 ) line = line.replace( regex.cmtfirst, '' );
                        if ( i === list.length-1 ) line = line.replace( regex.cmtlast, '' );
                        if ( i > 0 && i <= list.length-1 ) line = line.replace( regex.cmtmiddle, '' );
                        return line;
                    }),
                line, matches, command, slug, data, context;

                while ( lines.length ) {
                    line = lines.shift();
                    if  (( matches = regex.atcommand.exec( line ) )) {
                        command = matches[1];
                        slug = matches[3];
                        data = matches[4];
                        switch ( command ) {
                        case 'section':
                            doc.openContext({
                                type: 'section',
                                title: data,
                                name: slug || stringToSlug(data)
                            });
                            break;
                        case 'modifier':
                        case 'member':
                        case 'pattern':
                        case 'state':
                            context = identifyContext(data, command);
                            if ( context ) {
                                doc.openContext( context );
                            }
                            break;
                        case 'example':
                            doc.insertNode( command, {
                                title: data,
                                name: slug || stringToSlug(data)
                            }, contentsOfBlock() );
                            break;
                        default:
                            console.warn('unrecognized StyleDoc tag @' + command);
                        }
                    } else if ( ! regex.empty.exec(line) ) {
                        doc.addText( contentsOfBlock(line) );
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

            function identifyContext ( selectors, expectedType ) {
                var identified,
                    selector, elements, root, atRoot,
                    patternIdentified, matches;
                if ( _.isString( selectors ) ) {
                    // TODO: our own neutral format for selectors
                    //       instead of duck-typing to LESS's
                    elements = _.flatten( selectors.split(/\s+/).map( function (level, index) {
                        var list = level.slice(1).split('.').map( function( cls ) {
                            return { combinator: {value: ''}, value: '.' + cls };
                        });
                        if ( index ) {
                            list[0].combinator.value = ' ';
                        }
                        return list;
                    }));
                    selectors = [ { elements: elements } ];
                } else {
                    selectors = selectors.slice(0);
                }

                while ( selectors.length && !identified ) {
                    selector = selectors.shift();
                    elements = selector.elements.slice(0);
                    root = elements.shift().value;
                    atRoot = true;
                    patternIdentified = null;

                    if ( (expectedType === 'pattern' ||
                          !expectedType && !options.requireNaming) &&
                         (matches = regex.classname.exec(root)) ||
                         (matches = regex.pattern.exec(root)) ) {
                        patternIdentified = {
                            name: matches[1],
                            selector: root,
                            type: 'pattern'
                        };
                        if ( elements.length === 0 || expectedType === 'pattern' ) {
                            identified = [ patternIdentified ];
                        }
                    }

                    if ( patternIdentified ) {
                        while ( elements.length ) {
                            atRoot = atRoot && elements[0].combinator.value === '';
                            current = elements.shift().value;
                            if ( atRoot ) {
                                if ( (expectedType === 'modifier' ||
                                      !expectedType && !options.requireNaming) &&
                                     (matches = regex.classname.exec(current)) ||
                                     (matches = regex.modifier.exec(current)) ) {
                                    identified = [ patternIdentified, {
                                        name: matches[1],
                                        selector: patternIdentified.selector + '.' + matches[1],
                                        type: 'modifier'
                                    } ];
                                }
                                if ( expectedType === 'state' &&
                                     (matches = regex.classname.exec(current)) ||
                                     (matches = regex.state.exec(current)) ) {
                                    identified = [ patternIdentified, {
                                        name: matches[1],
                                        selector: patternIdentified.selector + '.' + matches[1],
                                        type : 'state'
                                    } ];
                                }
                            } else {
                                if ( (expectedType === 'member' ||
                                      !expectedType && !options.requireNaming) &&
                                     (matches = regex.classname.exec(current)) ||
                                     (matches = regex.member.exec(current)) ) {
                                    identified = [ patternIdentified, {
                                        name: matches[1],
                                        selector: patternIdentified.selector + ' .' + matches[1],
                                        type: 'member'
                                    } ];
                                }
                            }
                        }
                    }
                }

                return identified;
            }

        }
    }

    return Parser;

});

