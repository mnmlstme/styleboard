require(['Dictionary', 'Analyzer', 'Parser', 'TabbedFrameView',
         'DictionaryView', 'RenderedView', 'MarkupView', 'RulesView',
         'ScrubberView', 'SettingsView', 'appState'],
function( Dictionary, Analyzer, Parser, TabbedFrameView,
          DictionaryView, RenderedView, MarkupView, RulesView,
          ScrubberView, SettingsView, appState) {

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
        url: '../styleboard.config',
        success: function ( jsonObject ) {
            console.log("Read configuration from styleboard.config");
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
            dictionary = new Dictionary();
            analyzer = new Analyzer( dictionary, config.options ),
            parser = new Parser();

        parser.load( cssUrl, function (rules) {
            _.templateSettings = {
                interpolate : /\{\{\{(\s*\w+?\s*)\}\}\}/g,
                escape : /\{\{(\s*\w+?\s*)\}\}(?!\})/g
            };

            analyzer.analyze( rules );

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
                (new MarkupView({ el: $(this) })).render();
            });

            $('#sources').each( function () {
                (new RulesView({ el: $('#sources') })).render();
            });

            $('#settings').each( function () {
                (new SettingsView({ el: $('#settings') })).render();
            });

            $('#scrubber').each( function () {
                (new ScrubberView({ el: $(this) })).render();
            });

            $('#openInStyleboard').each( function () {
                var $a = $(this);
                appState.on('change:pattern', function (model, pattern) {
                    $a.attr('href', './#' + pattern.get('name'));
                });
            });

            if ( hash )
                appState.set('pattern', dictionary.findByName( hash.slice(1) ) );

            $(window).on('hashchange', function() {
                var hash = window.location.hash;
                appState.set('pattern', dictionary.findByName(hash.slice(1) ) );
            });

        });

        return sb;

    }

});

