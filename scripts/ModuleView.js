define( function () {

    var ModuleView = Backbone.View.extend({

        render: function () {
            var view = this,
                mod = view.model,
                name = mod.get('name'),
                descriptions = mod.get('descriptions'),
                examples = mod.get('examples'),
                modifiers = mod.get('modifiers'),
                states = mod.get('states'),
                members = mod.get('members'),
                related = mod.get('related'),
                $dl;

            view.$el.mk('h2', name);
            $dl = view.$el.mk('dl');
            if ( mod.isClass() ) {
                $dl.mk(['dt', 'Class'], ['dd', code(name) ]);
            }
            if ( mod.isElement() ) {
                $dl.mk(['dt', 'Tag'], ['dd', code('<' + name + '>') ]);
            }
            if ( descriptions ) {
                $dl.mk('dt', 'Description');
                descriptions.forEach( function (content) {
                    $dl.mk('dd', content.join('\n'));
                });
            }
            if ( examples ) {
                $dl.mk('dt', 'Example');
                examples.forEach( function (content) {
                    $dl.mk('dd', ['pre.example', content.join('\n')] );
                });
            }
            if ( modifiers ) {
                $dl.mk(['dt', 'Modifiers'], ['dd', _.keys(modifiers).sort().map(code)]);
            }
            if ( states ) {
                $dl.mk(['dt', 'States'], ['dd', _.keys(states).sort().map(code)]);
            }
            if ( members ) {
                $dl.mk(['dt', 'Members'], ['dd', _.keys(members).sort().map(code)]);
            }
            if ( related ) {
                $dl.mk(['dt', 'Related to'], ['dd', _.keys(related).sort().map(code)]);
            }

            return view;
        }
    }); // end of ModuleView view

    function code( text ) {
        return $.mk('code', text);
    }

    return ModuleView;
});
