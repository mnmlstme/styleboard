define(['StyleDoc'], function (StyleDoc) {

    // Uses LESS as a CSS parser, but all dependences on LESS should
    // be confined to this file.

    var regex = {
        classname:      /^\.([a-zA-Z][a-zA-Z0-9-_]+)$/,
        tagname:        /^([a-z]+)$/,
        pseudo:         /^::?([a-z-]+)$/,
        cmtfirst:       /^\s*\/\*\*\s*/,
        cmtmiddle:      /^(\s*\*+\s?)?/,
        cmtlast:        /\s*\*+\/\s*$/,
        atcommand:      /^\s*@([a-z-]+)\s*(\[([a-z][a-z0-9-]*)\])?(.*)\s*$/,
        ateot:          /^\s*(@[a-z-]+.*)?$/,
        empty:          /^\s*$/,
        pattern:        /^\.([a-z]+)$/,                 // lowercase, no hyphens
        modifier:       /^\.([a-z-]+\-)$/,              // trailing hyphen
        member:         /^\.(([a-z]+)\-[a-z-]+)$/,      // pattern name '-' member name
        helper:         /^\.(([a-z]+)\-[a-z-]+)$/,      // pattern name '-' helper name
        state:          /^\.(is-[a-z-]+)$/              // 'is-' prefix
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
                    parser.parse(data, done);
                }
            });
        };

        parser.parse = function parse(data) {
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
                var comments, identified;
                switch ( node.type ) {
                case 'Comment':
                    parseComment( node.value );
                    break;
                case 'Ruleset':
                    comments = node.rules.filter( function (rule) {
                        return rule.type === 'Comment';
                    });
                    identified = comments.length && identifyPattern( node.selectors );
                    if (identified) {
                        doc.openSection( identified.type, identified );
                    }
                    comments.map( function (rule) {
                        parseComment( rule.value, node );
                    });
                    break;
                default:
                    // ignore all other nodes
                }
            });

            function parseComment ( comment ) {

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
                            doc.openSection( command, {
                                title: data,
                                name: slug || stringToSlug(data)
                            });
                            break;
                        case 'pattern':
                        case 'member':
                        case 'modifier':
                        case 'state':
                        case 'helper':
                            doc.openSection( command, {
                                selector: data,
                                name: selectorToName( data )
                            } );
                            break;
                        case 'example':
                            doc.addSection( command, {
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

            function identifyPattern ( selectors ) {
                var currentPattern = doc.getCurrent('pattern'),
                    patternSelector = currentPattern && doc.getAttr(currentPattern, 'selector'),
                    identified, type, identifiedSelector,
                    selector, elements, root, current,
                    atRoot, inPattern, matches;

                while ( selectors.length && !identified ) {
                    selector = selectors.shift();
                    elements = selector.elements.slice(0);
                    root = elements.shift().value;
                    current = root;
                    atRoot = true;
                    inPattern = _.isString(root) && root === patternSelector;

                    if ( !inPattern && elements.length === 0 &&
                         (matches = regex.pattern.exec(root)) ) {
                        identified = matches[1];
                        identifiedSelector = '.' + identified;
                        type = 'pattern';
                    }

                    if ( inPattern ) {
                        while ( elements.length ) {
                            atRoot = atRoot && elements[0].combinator.value === '';
                            current = elements.shift().value;

                            if ( atRoot && (matches = regex.modifier.exec(current)) ) {
                                identified = matches[1];
                                identifiedSelector = patternSelector + '.' + identified;
                                type = 'modifier';
                            }

                            if ( atRoot && (matches = regex.state.exec(current)) ) {
                                identified = matches[1];
                                identifiedSelector = patternSelector + '.' + identified;
                                type = 'state';
                            }

                            if ( !atRoot && (matches = regex.member.exec(current)) ) {
                                identified = matches[1];
                                identifiedSelector = patternSelector + ' .' + identified;
                                type = 'member';
                            }
                        }
                    }
                }

                return identified && {
                    type: type,
                    name: identified,
                    selector: identifiedSelector
                };
            }

        }
    }

    return Parser;

});

