var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

/**
 @filespec SettingsView - a view containing the controls for changing settings
 */
var appState = require('./appState');


var defaultSettings = {
    // TODO: make this configurable from styleboard.config
    "background-color": "transparent",
    "font-size": "14px",
    width: "100%",
    transform: "scale(1)"
};

var SettingsView = Backbone.View.extend({

    initialize: function () {
        var view = this;

        view.settings = defaultSettings;

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
        this.updateSettings();
    },

    updateSettings: function updateSettings() {
        var view = this;

        _(view.settings).each( function ( value, key ) {
            var $selector = view.$('.selector[data-select="' + key + '"]'),
                $button = $selector.find('button'),
                $value = $button.find('.selector-value'),
                $swatch = $button.find('.swatch'),
                $option = $selector.find('[data-option="' + value + '"]');

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
