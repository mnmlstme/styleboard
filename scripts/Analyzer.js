function Analyzer( dictionary ) {
    var anal = this,
        context = null,
        regex = {
            module: /^\.?([a-z]+)$/,
            classname: /^\.([a-zA-Z][a-zA-Z0-9-_]+)$/,
            tagname: /^([a-z]+)$/,
            pseudo: /^::?([a-z-]+)$/,
            modifier: /^\.([a-z-]+\-)$/,
            member: /^\.(([a-z]+)\-[a-z]+)$/,
            state: /^(is-[a-z-]+)$/,
            cmtfirst: /^\/\*+\s*/,
            cmtmiddle: /^\s*\*+\s*/,
            cmtlast:  /\s*\*+\/\s*$/,
            atmodule: /^\s*@module\s*(\S+)/,
            atdescription: /^\s*@description\s*(.*)$/,
            atexample: /^\s*@example\s*(.*)$/,
            ateot: /^\s*(@[a-z]+.)?$/
        };

    anal.analyze = function ( rules ) {
        rules.forEach( function (node) {
            switch (node.type) {
            case 'Ruleset':
                // TODO: pass in the definitions too, if we want to show them later
                node.selectors.forEach( doSelector );
                break;
            case 'Comment':
                doComment( node );
            default:
            }
        });
        cleanDictionary();
    };

    return anal;

    function doSelector( selector ) {
        if (( matches = regex.module.exec( selector.elements[0].value ) )) {
            doModule( dictionary.theModule(matches[1]), selector.elements.slice(0) );
        }
    }

    function doModule( module, elements ) {
        var first = elements.shift(),
            isRoot = true,
            current,
            matches;
        context = module;
        if ( regex.classname.exec( first.value ) ) module.setClass();
        if ( regex.tagname.exec( first.value ) ) module.setTag();
        while ( elements.length ) {
            current = elements.shift();
            isRoot = isRoot && current.combinator.value === '';
            if( isRoot ) {
                if (( matches = regex.modifier.exec( current.value ) )) module.addModifier(matches[1]);
                if (( matches = regex.state.exec( current.value ) )) module.addState(matches[1]);
            } else {
                if ( (matches = regex.member.exec( current.value )) && matches[2] === module.getName() ) 
                    module.addMember(matches[1]);
                if (( matches = regex.module.exec( current.value ) )) 
                    module.addRelated( matches[1], dictionary.theModule(matches[1]) );
            }
        }
    }

    function doComment( comment ) {
        var  lines = comment.value.split('\n').slice(0, -1)
                .map( function ( line, i, list ) {
                    return line.replace( regexForLine(i, list.length), '' );
                }),
            line, matches;

        while ( lines.length ) {
            line = lines.shift();
            if (( matches = regex.atmodule.exec( line ) )) {
                context = dictionary.theModule(matches[1]);
                context.setDeclared();
            } else if (( matches = regex.atdescription.exec( line ) )) {
                if ( context ) context.addDescription( contentsOfBlock() );
            } else if  (( matches = regex.atexample.exec( line ) )) {
                if ( context ) context.addExample( contentsOfBlock() );
            }
        }

        function regexForLine( i, length ) {
            return i == 0 ? regex.cmtfirst : 
                ( i == length-1 ? regex.cmtlast : regex.cmtmiddle );
        }

        function contentsOfBlock() {
            var content = [];
            if ( matches[1] ) content.push( matches[1] );
            //lookahead: may be ended by another tag which we should not consume
            while (( lines.length && !regex.ateot.exec(lines[0]) )) {
                content.push( lines.shift() );
            }
            return content;
        }
    }

    function cleanDictionary () {
        dictionary.each( function ( module, name ) {
            if ( module.isUndefined() ) {
                dictionary.remove(name);
            } else {
                module.cleanup();
            }
        });
    }
}

