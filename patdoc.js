function PatDoc( opts ) {
    var pd = this,
        env = {},
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

    return pd;

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
            state: /^(is-[a-z-]+)$/
        };

    anal.analyze = function ( rules ) {
        rules.forEach( function (node) {
            switch (node.type) {
            case 'Ruleset':
                // TODO: pass in the definitions too, if we want to show them later
                node.selectors.forEach( doSelector );
                break;
            default:
            }
        });
        cleanDictionary();
    };

    function doSelector( selector ) {
        if (( matches = regex.module.exec( selector.elements[0].value ) )) {
            doModule( dictionary.theModule(matches[1]), selector.elements.slice(0) );
        }
    }

    function doModule(module, elements ) {
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

    function cleanDictionary () {
        dictionary.each( function (module, name) {
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
    mod.addModifier = function (name) { modifiers[name]++; };
    mod.addState = function (name) { states[name]++; };
    mod.addMember = function (name) { members[name]++; };
    mod.addRelated = function (name, module) { related[name] = module; };

    mod.isUndefined = function () {
        return mod.isClass() && !mod.isTag();
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
