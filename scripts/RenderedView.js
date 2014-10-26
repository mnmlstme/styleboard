var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var appState = require('./appState');

var CHECKERBOARD_SIZE = 16;

var RenderedView = Backbone.View.extend({

    initialize: function ( options ) {
        var view = this,
            styles = options.styles,
            scripts = options.scripts,
            $iframe = view.$iframe = view.$el.find('iframe'),
            context = view.context = view.$iframe[0].contentWindow,
            doc = view.doc = context.document;

        view.filler = options.filler;
        view.$pane = view.$el.closest('.pane');
        view.ngApp = options.ngApp || options['ng-app'];
        view.settings = {};

        $iframe.load( function () {
            view.render();
            view.updateSettings();
        });

        doc.open();
        doc.write('<html lang="en" style="height: 100%">' +
                  '<head>' +
                  '<meta charset="utf-8">' +
                  styles.map( function (url) {
                      return '<link rel="stylesheet" type="text/css" ' +
                          'href="' + url + '">';
                  }).join('\n') +
                  '<style>\n' +
                  '.styleboard-view{background:transparent;margin:0;font-size:100%;overflow:hidden}\n' +
                  '.styleboard-content::after{display:block;content:"";clear:both}\n' +
                  '</style>\n' +
                  scripts.map( function (url) {
                      return '<script src="' + url + '"></script>';
                  }).join('\n') +
                  '</head>' +
                  '<body class="styleboard-view">');
        doc.close();

        view.filler.on('change', view.render, view );

        appState.on('change:example', function( appState, example ) {
            view.setModel( example );
        });

        appState.on('change:settings', function( appState, settingsJSON ) {
            view.setSettings( settingsJSON );
        });

        $(window).on("resize", function () { view.updateSettings(); } );
    },

    setModel: function setModel ( example ) {
        var view = this;

        view.model = example;
        view.render();
    },

    setSettings: function setSettings ( settingsJSON ) {
        var view = this;
        // TODO: should settings be a Model?
        view.settings = JSON.parse(settingsJSON);
        view.updateSettings();
    },

    render: function render () {
        var view = this,
            doc = view.doc,
            $body = $(doc.body),
            example = view.model,
            scope = example ? example.getScope() : {},
            template = example ? example.getText() : '',
            code = template ? view.filler.expand( template, scope ) : '',
            $app = $body,
            $content;

        if ( $body.length ) {
            $body.empty();
            if ( example ) {
                $content = $body.mk('div.styleboard-content')
                    .append( $.parseHTML( code || '', view.doc, true ) );

                if ( view.ngApp ) {
                    $content.toggleClass('styleboard-ng-app', view.ngApp);
                    view.context.angular.bootstrap($content[0],[view.ngApp]);
                }

                view.updateSettings();
            }
        }
    },

    updateSettings: function updateSettings() {
        if ( !this.$iframe ) { return; }
        var view = this,
            $sandbox = view.$el,
            $iframe = view.$iframe,
            $body = $iframe.contents().find('body'),
            $content = $body.children(),
            iFrameSettings = ['width'],
            sandboxSettings = ['transform'],
            transform = view.settings.transform || "",
            scaleMatch = transform.match( /^scale\(([0-9.]+)\)$/ ),
            scale = scaleMatch ? 1 * scaleMatch[1] : 1,
            bw, bh, cw, ch,
            position = { position: 'relative', top: 0, left: 0 },
            applyTo = {
                transform: $sandbox,
                width:  $iframe,
                'background-color': $body,
                'font-size': $body
            };

        $iframe.removeAttr('style');

        if ( $content.length ) {
            $content.removeAttr('style');

            // Apply all the user-controlled view settings.
            // TODO: animate the transitions
            _(applyTo).each( function ($where, key) {
                $where.css( key, view.settings[key] );
            });

            // Make adjustments for scale.
            view.$el.css({ width: (100 / scale) + '%', height: (100 / scale) + '%' });
            view.$pane.css({ 'background-size': CHECKERBOARD_SIZE * scale + 'px' });

            bw = $body.width(); // don't include padding
            bh = $body.height();
            cw = $content.outerWidth(); // include padding
            ch = $content.outerHeight();

            if ( cw === bw && ch === bh ) {
                // Content is width: 100%, height: 100%
                view.$pane.addClass('full-bleed-');
            } else {
                // Try to format at natural size and center in the pane
                view.$pane.removeClass('full-bleed-');

                // Float the content to determine its natural size.
                $content.css('float', 'left');
                cw = $content.outerWidth(); // include padding
                ch = $content.outerHeight();

                // Extend the iframe's height to fit content, if necessary.
                if ( ch && ch > bh ) {
                    if ( cw && cw > bw ) {
                        ch += 15; // account for horizontal scrollbar
                    }
                    $iframe.height( Math.ceil(ch) );
                }

                // Let the content flow itself within this size, remove the float
                $content.removeAttr('style');

                // Position appropriately based on natural size.
                if ( cw && cw < bw ) {
                    position.width = Math.ceil(cw);
                    position.left = Math.floor((bw - cw) / 2 );
                }
                if ( ch && ch < bh ) {
                    position.top = Math.floor((bh - ch) / 2 );
                }
                if ( position.top || position.left ) {
                    $content.css(position);
                }
            }

        }
    }

}); // end of view RenderedView

module.exports = RenderedView;
