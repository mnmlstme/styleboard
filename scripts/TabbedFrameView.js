/**
 @filespec TabbedFrameView - view of a tabbed frame, with pane switching
 */

var $ = require('jquery');
var Backbone = require('backbone');

var TabbedFrameView = Backbone.View.extend({

    events: {
        'click .frame-tabs > li': 'uiSelectPane',
    },

    uiSelectPane: function (event) {
        var view = this,
            $target = $(event.target),
            index = $target.index();
        view.selectPane( index );
    },

    selectPane: function ( index ) {
        var view = this;

        activateNth( view.$('.frame-tabs > li'), index );
        activateNth( view.$('.frame-panes > li'), index );
    }

});

function activateNth( $list, index ) {
    $list
        .removeClass('is-active')
      .eq(index)
        .addClass('is-active');
}

module.exports = TabbedFrameView;
