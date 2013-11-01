require(['Dictionary', 'Analyzer', 'Parser',
         'DictionaryView', 'RenderedView', 'MarkupView', 'RulesView',
         'SettingsView'],
function( Dictionary, Analyzer, Parser,
          DictionaryView, RenderedView, MarkupView, RulesView,
          SettingsView ) {

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

            new StyleBoard( config );
        }
    });

    function StyleBoard( config ) {
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
        });

        return sb;

    }

});

