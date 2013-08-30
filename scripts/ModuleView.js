define( function () {

    var ModuleView = Backbone.View.extend({

        render: function () {
            var view = this,
                mod = view.model,
                name = mod.get('name'),
                descriptions = mod.get('descriptions'),
                selectors = mod.get('selectors'),
                examples = mod.get('examples'),
                modifiers = mod.get('modifiers'),
                states = mod.get('states'),
                members = mod.get('members'),
                related = mod.get('related'),
                $dl;

            view.$el.mk('h2', name);
            $dl = view.$el.mk('dl');
            if ( selectors ) {
                $dl.mk(['dt', 'Selectors'], ['dd'].concat(_.keys(selectors).sort().map(code)) );
            }
            if ( descriptions ) {
                $dl.mk('dt', 'Description');
                descriptions.forEach( function (content) {
                    $dl.mk('dd', content);
                });
            }
            if ( examples ) {
                examples.forEach( function (example) {
                    var content = example.get('html'),
                        title = example.get('title');
                    $dl.mk('dt', 'Example' + (title ? ': ' + title : ''));
                    $dl.mk('dd', ['pre.example', content] );
                });
            }
            if ( modifiers ) {
                $dl.mk(['dt', 'Modifiers'], ['dd'].concat(_.keys(modifiers).sort().map(code)) );
            }
            if ( states ) {
                $dl.mk(['dt', 'States'], ['dd'].concat(_.keys(states).sort().map(code)) );
            }
            if ( members ) {
                $dl.mk(['dt', 'Members'], ['dd'].concat(_.keys(members).sort().map(code)) );
            }
            if ( related ) {
                $dl.mk(['dt', 'Related to'], ['dd'].concat(_.keys(related).sort().map(code)) );
            }

            return view;
        }
    }); // end of ModuleView view

    function code( text ) {
        return $.mk('code', text);
    }

    return ModuleView;
});
