require(['Dictionary', 'Analyzer', 'Parser',
         'DictionaryView', 'RenderedView', 'MarkupView', 'RulesView'], 
function( Dictionary, Analyzer, Parser,
          DictionaryView, RenderedView, MarkupView, RulesView ) {

    new StyleBoard( { cssUrl: "styles/styleboard.css" } );

    function StyleBoard( opts ) {
        var sb = this,
        cssUrl = opts.cssUrl || 'samples/home.css',
        $dictionaryView = $('#dictionaryView'),
        $currentPattern = $('#currentPattern'),
        $selectors = $('#selectors'),
        dictionary = new Dictionary();
        analyzer = new Analyzer( dictionary ),
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
        });

        return sb;

    }

});

