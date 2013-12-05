require(['Dictionary', 'Analyzer', 'Parser',
         'DictionaryView', 'RenderedView', 'MarkupView', 'RulesView',
         'SettingsView', 'appState'],
function( Dictionary, Analyzer, Parser,
          DictionaryView, RenderedView, MarkupView, RulesView,
          SettingsView, appState) {

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
            $dictionaryView = $('#dictionaryView'),
            $currentPattern = $('#currentPattern'),
            $selectors = $('#selectors'),
            dictionary = new Dictionary();
            analyzer = new Analyzer( dictionary, config.options ),
            parser = new Parser();

        parser.load( cssUrl, function (rules) {
            analyzer.analyze( rules );

            (new DictionaryView({
                el: $('#dictionaryView'),
                model: dictionary
            })).render();
            (new RenderedView({
                el: $('#sandbox'),
                cssUrl: cssUrl
            })).render();
            (new MarkupView({
                el: $('#example')
            })).render();
            (new RulesView({
                el: $('#sources')
            })).render();
            (new SettingsView({
                el: $('#settings')
            })).render();

            if ( hash )
                appState.set( 'pattern', dictionary.findByName( hash.slice(1) ) );

        });

        return sb;

    }

});

