function StyleBoard( opts ) {
    var env = {},
        selectors = [],
        $modules = $('#modules'),
        $selectors = $('#selectors'),
        dictionary = new Dictionary();
        analyzer = new Analyzer( dictionary ),
        parser = new Parser();

    parser.load( opts.cssUrl, function (rules) {
        rules.forEach( showRule );
        analyzer.analyze( rules );
        dictionary.each( function (module) {
            module.show( $modules );
        });
    });

    return this;

    // this is just debugging stuff for now; might use it to show the CSS
    function showRule( rule ) {
        var type = rule.type.toLowerCase()
            $li = $selectors.mk('li.' + type);
        switch (type) {
        case 'ruleset':
            rule.selectors.forEach( function (selector) {
                selector.elements.forEach( function (el, i) {
                    if (i && el.combinator.value !== '') 
                        $li.mk('code.combinator', el.combinator.value );
                    $li.mk('code.element', el.value);
                });
            });
            break;
        default:
            $li.mk( 'code', rule.toCSS(env) );
        }
    }
}

function Dictionary() {
    var dict = this,
        modules = {};

    dict.theModule = function ( name ) {
        return modules[name] || (modules[name] = new Module( name ));
    };

    dict.each = function ( fn ) { _(modules).each( fn ); }

    dict.remove = function ( name ) { delete modules[name]; }

    return dict;
}

function Parser( opts ) {
    opts = opts || {};
    var parser = this;

    parser.load = function ( url, done ) {
        $.ajax({ 
            url: url, 
            dataType: 'text',
            error:  function ( xhr, status, error ) {
                alert("Failed " + status + ": " + error);
            },
            success: function( data, status, xhr ) {
                parse(data, done);
            }
        });
    };

    function parse(data, done) {
        new less.Parser( opts )
            .parse( data, function (err, tree ) {
                if ( err ) {
                    console.warn( err );
                } else {
                    console.log('Read ' + tree.rules.length + " rules.");
                    done( tree.rules );
                }
            });
    }

}

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

function Module( name ) {
    var mod = this,
        classed = false,
        tagged = false,
        declared = false,
        descriptions = [],
        examples = [],
        modifiers = {},
        members = {},
        helpers = {},
        states = {},
        related = {};

    mod.getName = function () { return name; };
    mod.setClass = function () { classed = true; };
    mod.isClass = function () { return classed; };
    mod.setTag = function () { tagged = true; };
    mod.isTag = function () { return tagged; };
    mod.setDeclared = function () { declared = true; };
    mod.isDeclared = function () { return declared; };
    mod.addDescription = function ( lines ) { descriptions.push( lines ); }
    mod.addExample = function ( lines ) { examples.push( lines ); }
    mod.addModifier = function (name) { modifiers[name]++; };
    mod.addState = function (name) { states[name]++; };
    mod.addMember = function (name) { members[name]++; };
    mod.addRelated = function (name, module) { related[name] = module; };

    mod.isUndefined = function () {
        return !mod.isClass() && !mod.isTag() && !mod.isDeclared();
    };

    mod.cleanup = function () {
        _(related).each( function (module, name) {
            if ( module.isUndefined() ) delete related[name];
        });
    };

    mod.show = function ( $section ) {
        var $dl, $dd;
        $section.mk('h2', name);
        $dl = $section.mk('dl');
        if ( mod.isClass() ) {
            $dl.mk(['dt', 'Class'], ['dd', code(name) ]);
        }
        if ( mod.isTag() ) {
            $dl.mk(['dt', 'Tag'], ['dd', code('<' + name + '>') ]);
        }
        if ( !_.isEmpty(descriptions) ) {
            $dl.mk('dt', 'Description');
            descriptions.forEach( function (content) {
                $dl.mk('dd', content.join('\n'));
            });
        }
        if ( !_.isEmpty(examples) ) {
            $dl.mk('dt', 'Example');
            examples.forEach( function (content) {
                $dl.mk('dd', ['pre', content.join('\n')] );
            });
        }
        if ( !_.isEmpty(modifiers) ) {
            $dl.mk(['dt', 'Modifiers'], ['dd', _.keys(modifiers).sort().map(code)]);
        }
        if ( !_.isEmpty(states) ) {
            $dl.mk(['dt', 'States'], ['dd', _.keys(states).sort().map(code)]);
        }
        if ( !_.isEmpty(members) ) {
            $dl.mk(['dt', 'Members'], ['dd', _.keys(members).sort().map(code)]);
        }
        if ( !_.isEmpty(related) ) {
            $dl.mk(['dt', 'Related to'], ['dd', _.keys(related).sort().map(code)]);
        }
    };

    return mod;

    function code( text ) {
        return $.mk('code', text);
    }

}
