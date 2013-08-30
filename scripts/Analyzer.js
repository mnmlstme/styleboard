define( function () {

    // TODO: implement the inverse case of these options
    config = {
        strictSyntax: true,              // ignore comments not beginning with /**
        ignoreUndocumented: true,        // ignore modules not preceded by documentation
        inferRelations: true,            // find relate classes by analyzing modules' selectors
        strictNaming: true               // use naming conventions when infering relations
    };

    function Analyzer( dictionary ) {
        var anal = this,
            regex = {
                module: /^\.([a-z]+)$/,
                classname: /^\.([a-zA-Z][a-zA-Z0-9-_]+)$/,
                tagname: /^([a-z]+)$/,
                pseudo: /^::?([a-z-]+)$/,
                modifier: /^\.([a-z-]+\-)$/,
                member: /^\.(([a-z]+)\-[a-z]+)$/,
                state: /^(is-[a-z-]+)$/,
                cmtfirst: /^\/\*+\s*/,
                cmtmiddle: /^(\s*\*+\s?)?/,
                cmtlast:  /\s*\*+\/\s*$/,
                atcommand: /^\s*@([a-z-]+)\s*(.*)\s*$/,
                ateot: /^\s*(@[a-z-]+.*)?$/
            };

        anal.analyze = function ( rules ) {
            var pendingComment = null;
            rules.forEach( function (node) {
                var module,
                    matches;
                switch (node.type) {
                case 'Ruleset':
                    // TODO: handle the case where the first selector is not a classname, but a later one is
                    if (( matches = regex.classname.exec( node.selectors[0].elements[0].value ) )) {
                        module = dictionary.findWhere({ name: matches[1] }) ||
                            (pendingComment || regex.module.exec(matches[0])) && dictionary.theModule(matches[1]);
                        if ( module ) {
                            // TODO: add the definitions from the rule, too
                            node.selectors.forEach( function ( selector ) {
                                doSelector( module, selector );
                            });
                            if ( pendingComment ) {
                                doComment( module, pendingComment );
                                pendingComment = null;
                            }
                        }
                    }
                    break;
                case 'Comment':
                    if (regex.cmtfirst.exec( node.value )) {
                        if (pendingComment) {
                            console.warn('dropping unused styledoc comment: ' + pendingComment);
                        }
                        pendingComment = node.value;
                    }
                default:
                }
            });
            cleanDictionary();
        };
    
        return anal;
    
        function doSelector( selector ) {
            var module;
        }
    
        function doSelector( module, selector ) {
            var elements = selector.elements.slice(0),
                current = elements.shift().value,
                atRoot = true,
                matches;

            if (regex.module.exec( current ) || regex.tagname.exec( current )) {
                module.addSelector( current );
            }

            while ( elements.length ) {
                atRoot = atRoot && elements[0].combinator.value === '';
                current = elements.shift().value;
                if ( atRoot ) {
                    if (( matches = regex.modifier.exec( current) )) module.addModifier(matches[1]);
                    if (( matches = regex.state.exec( current ) )) module.addState(matches[1]);
                } else {
                    if ( (matches = regex.member.exec( current )) && matches[2] === module.get('name') ) 
                        module.addMember(matches[1]);
                    if (( matches = regex.module.exec( current ) )) 
                        module.addRelated( matches[1], dictionary.theModule(matches[1]) );
                }
            }
        }

        function doComment( module, comment ) {
            var  lines = comment.split('\n').slice(0, -1)
                    .map( function ( line, i, list ) {
                        return line.replace( regexForLine(i, list.length), '' );
                    }),
                line, matches;

            module.set('isDocumented', true);

            while ( lines.length ) {
                line = lines.shift();
debugger;
                if  (( matches = regex.atcommand.exec( line ) )) {
                    switch ( matches[1] ) {
                    case 'example': 
                        module.addExample( contentsOfBlock(), matches[2] );
                        break;
                    default:
                        console.warn('unrecognized styledoc tag @' + matches[1]);
                    }
                } else {
                    module.addDescription( contentsOfBlock(line) );
                }
            }
    
            function regexForLine( i, length ) {
                return i == 0 ? regex.cmtfirst : 
                    ( i == length-1 ? regex.cmtlast : regex.cmtmiddle );
            }
    
            function contentsOfBlock( firstLine ) {
                var content = [];
                if ( firstLine ) content.push( firstLine );
                //lookahead: may be ended by another tag which we should not consume
                while (( lines.length && !regex.ateot.exec(lines[0]) )) {
                    content.push( lines.shift() );
                }
                return content;
            }
        }
    
        function cleanDictionary () {
            dictionary.each( function ( module ) {
                if ( !module.get('isDocumented') ) {
                    dictionary.remove( module );
                } else {
                    module.cleanup();
                }
            });
        }
    }

    return Analyzer;
});

