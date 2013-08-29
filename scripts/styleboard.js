require(["Dictionary", "Analyzer", "Parser", "DictionaryView"], 
function( Dictionary, Analyzer, Parser, DictionaryView ) {

    console.log("loading styleboard.js");

    var sb = new StyleBoard( { cssUrl: "samples/core-styles.css" } );
    sb.loadExample('<button class="primary-">My Awesome Button</button>');

    function StyleBoard( opts ) {
        var sb = this,
        env = {},
        cssUrl = opts.cssUrl || 'samples/home.css',
        $dictionaryView = $('#dictionaryView'),
        $currentModule = $('#currentModule'),
        $selectors = $('#selectors'),
        dictionary = new Dictionary();
        analyzer = new Analyzer( dictionary ),
        parser = new Parser();
    
        parser.load( cssUrl, function (rules) {
            rules.forEach( showRule );
            analyzer.analyze( rules );
            (new DictionaryView({
                el: $dictionaryView,
                model: dictionary
            })).render();
        });
    
        sb.loadExample = function( example ) {
            var doc = $('#sandbox iframe')[0].contentWindow.document;
            doc.open();
            doc.write('<html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" type="text/css" href="' +
                      cssUrl + '"></head><body>' + example + '</body></html>');
            doc.close();
        }
    
        return sb;
    
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

});

