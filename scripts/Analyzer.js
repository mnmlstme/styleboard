/**
 @filespec Analyzer - parse CSS and comments and extract patterns
 */

define(['Declaration'], function (Declaration) {

    options = {
        /* TODO: implement the opposite cases */
        strictSyntax: true,              // ignore comments not beginning with /**
        structuralInference: true,       // infer relations by analyzing selectors
        semanticInference: true,         // infer relations by applying naming conventions
        warnNaming: true,                // flag apparent violations of naming conventions
        explicitPatterns: false          // don't infer patterns, they must be documented
                                         // (relations within patterns will still be inferred)
    };

    function Analyzer( dictionary ) {
        var anal = this,
            regex = {
                classname: /^\.([a-zA-Z][a-zA-Z0-9-_]+)$/,
                tagname: /^([a-z]+)$/,
                pseudo: /^::?([a-z-]+)$/,
                // TODO: make some of these regexes be configuration options
                pattern: /^\.([a-z]+)$/,            // lowercase, no hyphens
                modifier: /^\.([a-z-]+\-)$/,        // trailing hyphen
                member: /^\.(([a-z]+)\-[a-z-]+)$/,  //  pattern name '-' member name
                helper: /^\.(([a-z]+)\-[a-z-]+)$/,  //  pattern name '-' helper name
                state: /^\.(is-[a-z-]+)$/,            // 'is-' prefix
                cmtfirst: /^\s*\/\*\*\s*/,
                cmtmiddle: /^(\s*\*+\s?)?/,
                cmtlast:  /\s*\*+\/\s*$/,
                atcommand: /^\s*@([a-z-]+)\s*(.*)\s*$/,
                ateot: /^\s*(@[a-z-]+.*)?$/
            };

        anal.analyze = function analyze ( nodes ) {
            var decls = [],
                pending = null,
                pattern = null;
            // Pass 1 - Associate comments with rules, generating Declarations
            nodes.forEach( function (node) {
                switch ( node.type ) {
                case 'Ruleset':
                    pending = pending || new Declaration({ rules: [node] });
                    // parse comments nested within the ruleset
                    node.rules.filter( function (node) {
                        return node.type === 'Comment' &&
                            regex.cmtfirst.exec( node.value );
                    }).map( function (node) {
                        pending = pending || new Declaration();
                        parseTags( node.value, pending );
                    });
                    node.selectors.forEach( function ( selector ) {
                        pending.addSelector( selector );
                    });
                    decls.push( pending );
                    pending = null;
                    break;
                case 'Comment':
                    if (regex.cmtfirst.exec( node.value )) {
                        pending = pending || new Declaration();
                        parseTags( node.value, pending );
                    }
                    break;
                default:
                    // ignore all other nodes
                }
                if ( pending && pending.get('selectors').length ) {
                    decls.push( pending );
                    pending = null;
                }
            });
            // Pass 2 - Identify Patterns and add them to the Dictionary
            decls.forEach( function( decl ) {
                var selectors = decl.get('selectors'),
                    patternSelectors = selectors.filter( function (sel) {
                        return sel.elements.length === 1 && 
                            (!options.semanticInference || 
                             regex.pattern.exec( sel.elements[0].value ));
                    });
                // Pattern inferencing
                if ( !decl.get('type') &&
                     patternSelectors.length &&
                     !options.explicitPatterns && 
                     (options.structuralInference || options.semanticInference ) ) {
                    decl.set('type', 'pattern');
                    decl.set('selectors', patternSelectors);
                }
                // add patterns to dictionary
                if ( decl.get('type') === 'pattern' ) {
                    patternSelectors.forEach( function (selector) {
                        var name = patternName( selector.elements[0].value );
                        dictionary.entry( name )
                            .merge( decl )
                            .set( 'selectors', [selector] );
                    });
                }
            });
            // Pass 3 - Process declarations and infer relations
            decls.forEach( function( decl ) {
                var type = decl.get('type');
                switch (type) {
                case 'pattern':
                    pattern = decl;
                    break;
                case 'modifier':
                case 'member':
                case 'state':
                case 'helper':
                    if ( pattern ) {
                        pattern.define(type, decl.get('name'), decl);
                    }
                    break;
                case undefined:
                    if (options.structuralInference || options.semanticInference) {
                        parseSelectors( decl );
                    }
                    break;
                }
            });
        };

        return anal;

        function parseTags( comment, decl ) {
            var  lines = comment.split('\n').slice(0, -1)
                    .map( function ( line, i, list ) {
                        if ( i === 0 ) line = line.replace( regex.cmtfirst, '' );
                        if ( i === list.length-1 ) line = line.replace( regex.cmtlast, '' );
                        if ( i > 0 && i < list.length-1 ) line = line.replace( regex.cmtmiddle, '' );
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
                        decl.set('type', matches[1]);
                        // TODO: parse comma-separated selector list
                        if ( matches[2] ) decl.addSelector( matches[2] );
                        break;
                    case 'example': 
                        decl.define('example', { html: contentsOfBlock(), title: matches[2] });
                        break;
                    default:
                        console.warn('unrecognized styledoc tag @' + matches[1]);
                    }
                } else {
                    decl.define('description', { text: contentsOfBlock(line) });
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
    
        function parseSelectors( decl ) {
            var sem = options.semanticInference,
                str = options.structuralInference,
                selectors = decl.get('selectors');

            selectors.forEach( function(selector) {
                var elements = selector.elements.slice(0),
                    root = elements.shift().value,
                    current = root,
                    atRoot = true,
                    pattern = dictionary.findByName( patternName(root) ),
                    matches,
                    modifierList = [],
                    isState = false,
                    member,
                    attrs;

                if ( pattern ) {
                    while ( elements.length ) {
                        atRoot = atRoot && elements[0].combinator.value === '';
                        current = elements.shift().value,
                        attrs = decl.toJSON();
                        // TODO: also look for semantic inferences that are not struct
                        if ( sem && atRoot &&
                             ( matches = regex.modifier.exec(current) )) {
                            modifierList.unshift( matches[1] );
                            isState = false;
                        } else if ( sem && atRoot &&
                                    ( matches = regex.state.exec(current) )) {
                            modifierList.unshift( matches[1] );
                            isState = true;
                        } else if ( sem && !atRoot &&
                                    ( matches = regex.member.exec(current) ) &&
                                    dictionary.findByName(matches[2]) === pattern ){
                            member = matches[1];
                        } else if ( str && !sem && pattern &&
                                    ( matches = regex.classname.exec(current) )) {
                            if (atRoot) {
                                modifierList.unshift(matches[1]);
                                isState = false;
                            } else {
                                member = matches[1];
                            }
                        }
                    }
                    if ( member ) {
                        pattern.define( 'member', member, attrs );
                    } 
                    if ( modifierList.length ) {
                        pattern.define( isState ? 'state' : 'modifier', 
                                        modifierList.join(' '), 
                                        member ? {} : attrs );
                    }
                }
            });
        }

        function patternName( string ) {
            var matches = regex.classname.exec( string ) ||
                regex.tagname.exec( string );
            return matches ? matches[1] : string;
        }
    }

    return Analyzer;
});

