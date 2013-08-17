function PatDoc( opts ) {
    var pd = this,
        env = {},
        selectors = [],
        moduleDict = {},
        $modules = $('#modules'),
        $selectors = $('#selectors'),
        regex = {
            module: /^\.?([a-z]+)$/,
            classname: /^\.([a-zA-Z][a-zA-Z0-9-_]+)$/,
            tagname: /^([a-z]+)$/,
            pseudo: /^::?([a-z-]+)$/,
            modifier: /^\.([a-z-]+\-)$/,
            member: /^\.(([a-z]+)\-[a-z]+)$/,
            state: /^(is-[a-z-]+)$/
        };

    $.ajax({ 
        url: opts.cssUrl, 
        dataType: 'text',
        error:  function ( xhr, status, error ) {
            alert("Failed " + status + ": " + error);
        },
        success: function( data, status, xhr ) {
            parse(data);
            selectors.forEach( showSelector );
            selectors.forEach( analyze );
            cleanDictionary();
            _.keys(moduleDict).sort()
                .forEach( function (key) { theModule(key).show( $modules ); } );
        }
    });

    return pd;

    function parse (css) {
        var options = {};
        new less.Parser( options )
            .parse( css, function (err, tree ) {
                if ( err ) {
                    console.warn( err );
                } else {
                    console.log('Read ' + tree.rules.length + " rules.");
                    selectors = _.flatten( tree.rules.map( function (node) {
                        return node.type === 'Ruleset' ? node.selectors : node;
                    }));
                }
            });
    }

    function showSelector ( selector ) {
        var type = selector.type.toLowerCase()
            $li = $selectors.mk('li.' + type);
        switch (type) {
        case 'selector':
            selector.elements.forEach( function (el, i) {
                if (i && el.combinator.value !== '') 
                    $li.mk('code.combinator', el.combinator.value );
                $li.mk('code.element', el.value);
            });
            break;
        default:
            $li.mk( 'code', selector.toCSS(env) );
        }
    }

    function analyze ( selector ) {
        var type = selector.type.toLowerCase(),
            matches;
        switch (type) {
        case 'selector':
            if (( matches = regex.module.exec( selector.elements[0].value ) )) {
                analyzeModule( theModule(matches[1]), selector.elements.slice(0) );
            }
            break;
        default:
            // TODO: analyze other types
        }
    }

    function analyzeModule (module, elements ) {
        var first = elements.shift(),
            isRoot = true,
            current,
            matches;
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
                    module.addRelated( matches[1], theModule(matches[1]) );
            }
        }
    }

    function cleanDictionary () {
        _(moduleDict).each( function (module, name) {
            if ( module.isUndefined() ) {
                delete moduleDict[name];
            } else {
                module.cleanup();
            }
        });
    }

    function theModule ( name ) {
        return moduleDict[name] || (moduleDict[name] = new Module( name ));
    }
}

function Module( name ) {
    var mod = this,
        isClass = false,
        isTag = false,
        modifiers = {},
        members = {},
        helpers = {},
        states = {},
        related = {};

    mod.getName = function () { return name; };
    mod.setClass = function () { isClass = true; };
    mod.setTag = function () { isTag = true; };
    mod.addModifier = function (name) { modifiers[name]++; };
    mod.addState = function (name) { states[name]++; };
    mod.addMember = function (name) { members[name]++; };
    mod.addRelated = function (name, module) { related[name] = module; };

    mod.isUndefined = function () {
        return !isClass && !isTag;
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
        if ( isClass ) {
            $dl.mk(['dt', 'Class'], ['dd', code(name) ]);
        }
        if ( isTag ) {
            $dl.mk(['dt', 'Tag'], ['dd', code('<' + name + '>') ]);
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
