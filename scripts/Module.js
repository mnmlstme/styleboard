define( function () {

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
                    $dl.mk('dd', ['pre.example', content.join('\n')] );
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

    return Module;
});
