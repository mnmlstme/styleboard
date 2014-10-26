var Backbone = require('backbone');

/**
 * @name AppState
 * @constructor
 * @param attrs.pattern {Context}   the pattern currently being viewed
 * @param attrs.example {Context}   the example curently being viewed
 */
appState = new Backbone.Model();

module.exports = appState;
