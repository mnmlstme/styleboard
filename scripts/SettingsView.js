var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

/**
 @filespec SettingsView - a view containing the controls for changing settings
 */
var appState = require('./appState');



var SettingsView = Backbone.View.extend({

    initialize: function ( options ) {
        var view = this;

        view.controls = options.controls;
        view.settings = options.defaults;

        appState.set( 'settings', JSON.stringify(view.settings) );
        appState.on( 'change:settings', function( appState, settingsJSON ) {
            view.setSettings( settingsJSON );
        });
    },

    setSettings: function setSettings ( settingsJSON ) {
        var view = this;
        // TODO: should settings be a Model?
        view.settings = JSON.parse(settingsJSON);
        view.updateSettings();
    },

    render: function () {
        // Populate the settings controls
        var view = this,
            controls = view.controls;

        _(controls).each( function ( options, control ) {
            var $selector = view.$('.selector[data-select="' + control + '"]'),
                $list = $selector.find('.menu');

            _(options).each( function ( value, key ) {
                var divider = /^-+$/.test(key),
                    $li = divider ? $list.mk('li.menu-divider')
                        : $list.mk('li', {'data-option': value}, ['span', key ] );

                if ( !divider && control === 'background-color' ) {
                    $li.mk('i.swatch', {'style': control + ':' + value});
                }
            });
        });

        view.updateSettings();
    },

    updateSettings: function updateSettings() {
        var view = this;

        _(view.settings).each( function ( value, key ) {
            var $selector = view.$('.selector[data-select="' + key + '"]'),
                $button = $selector.find('button'),
                $value = $button.find('.selector-value'),
                $swatch = $button.find('.swatch'),
                $current = $selector.find('.menu > li.is-selected'),
                $option = $selector.find('[data-option="' + value + '"]');

            if ( $current[0] !== $option[0] ) {
                $current.removeClass('is-selected');
                $option.addClass('is-selected');
            }

            if ( $swatch.length ) {
                $swatch.replaceWith( $option.find('.swatch').clone() );
            }

            if ( $value.length ) {
                $value.text( $option.text() );
            }

            if ( !$swatch.length && !value.length ) {
                $button.text( $option.text() );
            }
        });
    },

    events: {
        "click .tool-.bar > *": "uiClickTool",
        "click .menu > li":     "uiSelectOption"
    },

    uiClickTool: function uiClickTool ( event ) {
        var $tool = $( event.currentTarget );

        event.stopPropagation();
        $tool.find('.dropdown')
            .toggleClass('is-active');
    },

    uiSelectOption: function uiSelectOption ( event ) {
        var view = this,
            $option = $( event.currentTarget ),
            $selector = $option.closest('.selector'),
            key = $selector.data('select'),
            value = $option.data('option');

        view.settings[key] = value;
        appState.set('settings', JSON.stringify(view.settings) );
    }

});

module.exports = SettingsView;
