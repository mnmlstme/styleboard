define( function () {

/**
 * @name AppState
 * @constructor
 * @param attrs.pattern {Pattern}   the pattern currently being viewed
 * @param attrs.example {Example}   the example curently being viewed
 */
    appState = new Backbone.Model();

    appState.on('change:pattern', function (model, pattern) {
        model.set('example', pattern.getFirst('example'));
    });

    return appState;
});
