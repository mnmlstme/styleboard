require(['Parser', 'Context', 'Example',
         'TabbedFrameView', 'DictionaryView', 'RenderedView', 'MarkupView', 'RulesView',
         'FooterView', 'SettingsView', 'appState'],
function( Parser, Context, Example,
          TabbedFrameView, DictionaryView, RenderedView, MarkupView, RulesView,
          FooterView, SettingsView, appState) {

    // copy this JSON into ../styleboard.config to configure styleboard.
    var configs = {
        'default': 'styleboard',
        'styleboard': {
            'cssUrl': 'styles/styleboard.css',
            'options': {}
        }
    };

    $.ajax({
        dataType: 'json',
        cache: false,
        url: '../styleboard.config',
        success: function ( jsonObject ) {
            configs = jsonObject;
        },
        error: function ( jqxhr, status, error ) {
            console.warn( "No configuration: " + status + "(" + error + ")" );
        },
        complete: function () {
            var config = configs['default'];

            if ( !_.isObject(config) ) {
                // then it's the name of the default config
                config = configs[config];
            }

            new StyleBoard( config, window.location.hash );

        }
    });

    function StyleBoard( config, hash ) {
        var sb = this,
            cssUrl = config.cssUrl || 'samples/home.css',
            parser = new Parser();

        parser.load( cssUrl, function (doc) {

            sb.doc = doc;

            var patterns = doc.getAllOfType('pattern').map( function (node) {
                return new Context({ doc: doc, node: node });
            });
            var dictionary = new Backbone.Collection( patterns );

            // initialize each view, if it exists in the markup

            $('#dictionaryView').each( function () {
                (new DictionaryView({ el: $(this), model: dictionary })).render();
            });

            $('#tabbedView').each( function () {
                (new TabbedFrameView({ el: $(this) })).render();
            });

            $('#sandbox').each( function () {
                (new RenderedView({ el: $(this), cssUrl: cssUrl })).render();
            });

            $('#example').each( function () {
                (new MarkupView({ el: $(this), doc: doc })).render();
            });

            $('#sources').each( function () {
                (new RulesView({ el: $('#sources'), doc: doc })).render();
            });

            $('#settings').each( function () {
                (new SettingsView({ el: $('#settings') })).render();
            });

            $('#embedFooter').each( function () {
                (new FooterView({ el: $(this) })).render();
            });

            $('#openInStyleboard').each( function () {
                var $a = $(this);
                appState.on('change', function () {
                    var pattern = appState.get('pattern'),
                        example = appState.get('example'),
                        href = './#' + pattern.get('name');
                    if ( example ) {
                        href = href + '/' + (example.get('slug') || example.get('index') || '');
                    }
                    $a.attr('href', href);
                });
            });

            if ( hash ) {
                route( hash.slice(1) );
            }

            $(window).on('hashchange', function() {
                var hash = window.location.hash;
                route( hash.slice(1) );
            });

        });

        return sb;

        // Load the state of the app from a string (usually the URL hash)
        // Possible routes:
        //    <pattern>              go to pattern, show first example
        //    <pattern>/<N>          go to example N of pattern
        //    <pattern>/<slug>       find example by slug for the pattern
        function route( string ) {
            var path = string.split('/'),
                pattern,
                examples,
                index,
                example;

            if ( path.length ) {
                pattern = new Context({ doc: sb.doc, node: sb.doc.findByName( path[0] ) });
                examples = pattern.getNodesOfType('example', Example);

                if ( path.length > 1 ) {
                    if ( path[1].match( /^\d+$/ ) ) {
                        // example number
                        index = parseInt( path[1] );
                        if ( index < examples.length ) {
                            example = examples[index];
                        }
                    } else {
                        // example slug
                        example = _(examples).find( function (xmp) {
                            return xmp.getName() === path[1];
                        });
                    }
                } else if ( examples.length ) {
                    // first example
                    example = examples[0];
                }
            }

            appState.set('pattern', pattern || new Context({doc: sb.doc}) );
            appState.set('example', example || new Example({doc: sb.doc}) );
        }

    }

});

