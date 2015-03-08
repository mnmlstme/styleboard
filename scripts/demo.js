var $ = require('jquery');
window.$ = $;

var _ = require('underscore');
var Backbone = require('backbone'); Backbone.$ = $;
var TabbedFrameView = require('./TabbedFrameView');

// export to window so demo scripts can utilize them

window.TabbedFrameView = TabbedFrameView;
