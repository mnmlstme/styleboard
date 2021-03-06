/**
 * Styleboard 0.2.4 - extract a styleguide from your site's CSS.
 * Copyright (c) 2013-14, Ken Kubiak (BSD Licensed)
 * https://github.com/mnmlstme/styleboard
 */

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone'); Backbone.$ = $;
require('./mkay');

var Parser = require('./Parser');
var Context = require('./Context');
var Filler = require('./Filler');
var DictionaryView = require('./DictionaryView');
var RenderedView = require('./RenderedView');
var FilesView = require('./FilesView');
var TabbedFrameView = require('./TabbedFrameView');
var FooterView = require('./FooterView');
var SettingsView = require('./SettingsView');
var appState = require('./appState');


// URL to fetch the configuration from, relative to index.html.
var configUrl = 'styleboard.config';

// Default configuration. Edit in styleboard.config.
var configs = {
    'default': {
        'styles': 'styles/styleboard.css',
        'content': 'texts/lorem.json',
        'options': {}
    }
};

var defaultControls = {
    "filler-text": {
        "lorem": "texts/lorem.json",
        "dickens": "texts/dickens.json",
        "kafka": "texts/kafka.json"
    },
    "transform": {
        "50%": "scale(.5)",
        "100%": "scale(1)",
        "200%": "scale(2)"
    },
    "width": {
        "100%": "100%",
        "----" : "",
        "320px": "320px",
        "600px": "600px",
        "1024px": "1024px"
    },
    "font-size": {
        "12px": "12px",
        "16px": "16px",
        "24px": "24px"
    },
    "background-color": {
        "None": "transparent",
        "----": "",
        "White": "#ffffff",
        "Black": "#000000"
    }
};

var defaultSettings = {
    "background-color": "#ffffff",
    "font-size": "16px",
    "width": "100%",
    "transform": "scale(1)",
    "filler-text": "texts/lorem.json"
};

$.ajax({
    dataType: 'json',
    cache: false,
    url: configUrl,
    success: function ( jsonObject ) {
        configs = jsonObject;
    },
    error: function ( jqxhr, status, error ) {
        console.warn( "Failed to load configuration file " + configUrl + "\n" +
                      "Error: " + status + "(" + error + ")\n");
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
        styles = config.styles,
        content = config.content,
        scripts = _.isArray(config.scripts) ? config.scripts :
            ( config.scripts ? [config.scripts] : [] ),
        texts = config.texts || { 'lorem': 'texts/lorem.json' },
        fillerText = config.options.fillerText || _(texts).keys()[0],
        rules = config.options.rules || {},
        parser = new Parser(rules);

    // TODO: allow loading of more than one stylesheet URL
    parser.load( styles, function (doc) {

        sb.doc = doc;

        var patterns = doc.getPatterns().map( function (node) {
            return new Context({ doc: doc, node: node });
        });

        var dictionary = new Backbone.Collection( patterns );

        var filler = new Filler({
            templating: config.options.templating
        });

        var controls = config.controls || {};
        _.defaults( controls, defaultControls );

        var settings = config.defaults || {};
        _.defaults( settings, defaultSettings);

        // initialize each view, if it exists in the markup

        $('#dictionaryView').each( function () {
            (new DictionaryView({ el: $(this), model: dictionary })).render();
        });

        $('#sandbox').each( function () {
                (new RenderedView({
                    el: $(this),
                    doc: doc,
                    filler: filler,
                    styles: [styles],
                    scripts: scripts,
                    ngApp: config.ngApp || config['ng-app']
                })).render();
        });

        $('#filesView').each( function () {
            (new FilesView({ el: $(this), doc: doc, filler: filler })).render();
        });

        $('#settings').each( function () {
            (new SettingsView({
                el: $('#settings'),
                controls: controls,
                defaults: settings
            })).render();
        });

        $('#embedFooter').each( function () {
            (new FooterView({ el: $(this) })).render();
        });

        $('#openInStyleboard').each( function () {
            var $a = $(this);
            appState.on('change', function () {
                var pattern = appState.get('pattern'),
                    example = appState.get('example'),
                    href = './#' + pattern.getName();
                if ( example ) {
                    href = href + '/' + example.getName();
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
            examples = [],
            index,
            example;

        if ( path.length ) {
            pattern = new Context({
                doc: sb.doc,
                node: sb.doc.getPattern( path[0] )
            });

            if ( pattern.isValid() ) {
                examples = pattern.getAllNodesOfType('example');
            }

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
        appState.set('example', example || new Context({doc: sb.doc}) );
    }

}
