/**
 @filespec SettingsView - a view containing the controls for changing settings
 */
define(['appState'], function (appState) {

    var defaultSettings = {
        "background-color": "transparent",
        "font-size": "16px",
        "width": "100%",
        "transform": "scale(1)"
    }

    var SettingsView = Backbone.View.extend({

        initialize: function () {
            var view = this;

            view.settings = {};

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
            var view = this,
                settings = _.defaults( view.settings, defaultSettings );

            _(view.settings).each( function ( value, key ) {
                var $selector = view.$('.selector[data-select="' + key + '"]'),
                    $button = $selector.find('button'),
                    $option = $selector.find('[data-option="' + value + '"]'),
                    $swatch = $option.find('.swatch');

                if ( $swatch.length ) {
                    $button.empty().append( $swatch.clone() );
                } else {
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
    
    return SettingsView;
});
