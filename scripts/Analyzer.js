/**
 @filespec Analyzer - parse CSS and comments and extract patterns
 */

define(['Definition'], function (Definition) {

    var defaults = {
        /* TODO: implement the opposite cases */
        strictSyntax: true,              // ignore comments not beginning with /**
        explicitPatterns: false,         // don't infer patterns, they must be
                                         // documented, either with text or @pattern
        structuralInference: true,       // infer relations by analyzing selectors
        semanticInference: false,        // infer relations by applying naming conventions
        strictConventions: true,         // only infer patterns and relations that
                                         // follow conventions
        warnConventions: true,           // flag violations of naming conventions
                                         // (relations within patterns will still be inferred)
    };

    // global dependences on LESS:
    var Selector = less.tree.Selector,
        Element = less.tree.Element;

    function Analyzer( dictionary, options ) {
        options = _.defaults( options || {}, defaults );
        var anal = this,
            regex = {
                classname:      /^\.([a-zA-Z][a-zA-Z0-9-_]+)$/,
                tagname:        /^([a-z]+)$/,
                pseudo:         /^::?([a-z-]+)$/,
                cmtfirst:       /^\s*\/\*\*\s*/,
                cmtmiddle:      /^(\s*\*+\s?)?/,
                cmtlast:        /\s*\*+\/\s*$/,
                atcommand:      /^\s*@([a-z-]+)\s*(.*)\s*$/,
                ateot:          /^\s*(@[a-z-]+.*)?$/,
                empty:          /^\s*$/,
                // TODO: make convention regexes be configuration options
                pattern:        /^\.([a-z]+)$/,                 // lowercase, no hyphens
                modifier:       /^\.([a-z-]+\-)$/,              // trailing hyphen
                member:         /^\.(([a-z]+)\-[a-z-]+)$/,      // pattern name '-' member name
                helper:         /^\.(([a-z]+)\-[a-z-]+)$/,      // pattern name '-' helper name
                state:          /^\.(is-[a-z-]+)$/              // 'is-' prefix
            };

        anal.analyze = function analyze ( nodes ) {
            var defns = [],
                pending = null,
                pattern = null;
            // Pass 1 - Associate comments with rules, generating Definitions
            nodes.forEach( function (node) {
                pending = pending || new Definition();
                switch ( node.type ) {
                case 'Ruleset':
                    node.selectors.forEach( function ( selector ) {
                        pending.declare('selector', selector);
                    });
                    node.rules.filter( function (rule) {
                        return rule.type === 'Comment';
                    }).map( function (rule) {
                        parseComment( rule.value, pending );
                    });
                    break;
                case 'Comment':
                    parseComment( node.value, pending );
                    break;
                default:
                    // ignore all other nodes
                }
                if ( pending.declares('selector') ) {
                    defns.push( pending );
                    pending = null;
                }
            });
            // Pass 2 - Identify Patterns and add them to the Dictionary
            defns.forEach( function( defn ) {
                var selectors = defn.getValues('selector'),
                    patternSelectors = selectors.filter( function (sel) {
                        return sel.elements.length === 1;
                    }),
                    name;

                if ( !defn.get('type') &&
                     !options.explicitPatterns &&
                     (options.structuralInference || options.semanticInference ) ) {
                    // Pattern inferencing
                    if ( options.structuralInference && options.strictConventions ||
                         options.semanticInference ) {
                        // only allow patterns which match regex
                        patternSelectors = patternSelectors.filter( function (sel) {
                            return regex.pattern.exec( sel.elements[0].value );
                        });
                    }
                    if ( patternSelectors.length ) {
                        defn.set('type', 'pattern');
                        patternSelectors.forEach( function (sel) {
                            defn.declare('selector', createSelector(sel) );
                        });
                    }
                }
                // add patterns to dictionary
                if ( defn.get('type') === 'pattern' ) {
                    name = patternName( patternSelectors[0].toCSS() );
                    defn.set('name', name );
                    dictionary.entry( name ).merge( defn );
                }

            });
            // Pass 3 - Process declarations and infer relations
            defns.forEach( function( defn ) {
                var type = defn.get('type');
                switch (type) {
                case 'pattern':
                    pattern = defn;
                    break;
                case 'modifier':
                case 'member':
                case 'state':
                case 'helper':
                    // explicit definitions
                    if ( pattern ) {
                        pattern.declare( type, defn );
                    }
                    break;
                case undefined:
                    if (options.structuralInference || options.semanticInference) {
                        parseSelectors( defn );
                    }
                    break;
                }
            });
            // Pass 4 - add rules which mention a pattern to the pattern
            nodes.forEach( function( node ) {
                var selectors = node.selectors || [],
                    addedTo = {};
                selectors.forEach( function ( sel ) {
                    sel.elements.forEach( function ( element ) {
                        var matches = regex.classname.exec( element.value ),
                            name, entry;
                        if ( matches &&
                             !addedTo[(name = matches[1])] &&
                             (entry = dictionary.findByName( name )) ){
                            addedTo[name] = true;
                            entry.declare( 'rule', node );
                        }
                    });
                });
            });
        };

        return anal;

        function parseComment( comment, defn ) {
            if ( options.strictSyntax && !regex.cmtfirst.exec( comment )) return;

            var  lines = comment.trim().split('\n')
                    .map( function ( line, i, list ) {
                        if ( i === 0 ) line = line.replace( regex.cmtfirst, '' );
                        if ( i === list.length-1 ) line = line.replace( regex.cmtlast, '' );
                        if ( i > 0 && i <= list.length-1 ) line = line.replace( regex.cmtmiddle, '' );
                        return line;
                    }),
                line, matches;

            while ( lines.length ) {
                line = lines.shift();
                if  (( matches = regex.atcommand.exec( line ) )) {
                    switch ( matches[1] ) {
                    case 'member':
                    case 'modifier':
                    case 'state':
                    case 'helper':
                    case 'pattern':
                        defn.set('type', matches[1]);
                        // TODO: parse comma-separated selector list
                        if ( matches[2] )
                            defn.declare( 'selector', createSelector(matches[2]) );
                        break;
                    case 'example': 
                        defn.declare( 'example', new Backbone.Model({ 
                            title: matches[2],
                            html: contentsOfBlock()
                        }));
                        break;
                    default:
                        console.warn('unrecognized styledoc tag @' + matches[1]);
                    }
                } else if ( ! regex.empty.exec(line) ) {
                    defn.declare( 'text', contentsOfBlock(line) );
                }
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

        function parseSelectors( defn ) {
            var sem = options.semanticInference,
                str = options.structuralInference,
                cnv = options.strictConventions,
                modRegex = cnv ? regex.modifier : regex.classname,
                memRegex = cnv ? regex.member : regex.classname,
                selectors = defn.getValues('selector');

            selectors.forEach( function(selector) {
                var elements = selector.elements.slice(0),
                    root = elements.shift().value,
                    current = root,
                    atRoot = true,
                    pattern = _.isString(root) && dictionary.findByName( patternName(root) ),
                    matches,
                    modifierList = [],
                    isState = false,
                    member,
                    attrs;

                if ( pattern ) {
                    while ( elements.length ) {
                        atRoot = atRoot && elements[0].combinator.value === '';
                        current = elements.shift().value,
                        attrs = defn.toJSON();
                        // TODO: also look for semantic inferences that are not struct
                        if ( str ) {
                            if ( atRoot ) {
                                if ( (matches = modRegex.exec(current)) ) {
                                    modifierList.push( matches[1] );
                                    isState = false;
                                } else if ( (matches = regex.state.exec(current)) ) {
                                    modifierList.push( matches[1] );
                                    isState = true;
                                }
                            } else {
                                if ( (matches = memRegex.exec(current)) &&
                                     (!cnv || dictionary.findByName(matches[2]) === pattern ) ) {
                                    member = matches[1];
                                }
                            }
                        }
                    }

                    if ( member ) {
                        attrs.type = 'member';
                        attrs.name = member;
                        pattern.define( attrs );
                    } 

                    if ( modifierList.length ) {
                        if ( member ) attrs = {};
                        attrs.type = isState ? 'state' : 'modifier';
                        attrs.name = modifierList.join(' ');
                        pattern.define( attrs );
                    }
                }
            });
        }

        function patternName( string ) {
            string = string.trim();
            var matches = regex.classname.exec( string ) ||
                regex.tagname.exec( string );
            return matches ? matches[1] : string;
        }

        function createSelector( string ) {
            // TODO: this only handles single-element selectors
            return new Selector( [ new Element( '', string, 0 ) ] );
        }

    }

    return Analyzer;
});

