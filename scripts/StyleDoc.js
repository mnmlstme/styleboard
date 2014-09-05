/**
 @filespec StyleDoc - A structured document representing the CSS and embedded StyleDoc comments
 */

define( function () {

    function StyleDoc() {
        var doc = this,
            root = ['styledoc',{}], // JSON-ML
            patternIndex = {}, // name -> node
            indexByPattern = {}; // patternName -> { name -> node }

        _.each({
            getRoot: getRoot,
            getPattern: getPattern,
            getPatterns: getPatterns,
            getDefinition: getDefinition,
            getNodes: getNodes,
            getNodesOfType: getNodesOfType,
            getAttr: getAttr,
            getType: getType,
            getText: getText,
            define: define
        }, function (value, key) { doc[key] = value; } );

        function getRoot() {
            return root;
        };

        function getPattern( name ) {
            return patternIndex[name];
        };

        function getDefinition ( name, pattern ) {
            var index = pattern ? indexByPattern[getAttr(pattern, 'name')] : patternIndex;
            return index && index[name];
        };

        function getPatterns() {
            return _.values( patternIndex );
        };

        function getType( node ) {
            return node[0];
        };

        function getAttr( node, key ) {
            var attrs = node[1];
            return _.isObject(attrs) && attrs[key];
        }

        function getNodes( node ) {
            node = node || root;
            var attrs = node[1];
            return node.slice( _.isObject(attrs) ? 2 : 1 );
        }

        function getNodesOfType( parent, type, recursively ) {
            var list = [];

            recursivelyGetNodes( parent );
            return list;

            function recursivelyGetNodes( parent ) {
                getNodes(parent).forEach( function (node) {
                    if ( getType(node) === type ) {
                        list.push( node );
                    } else if ( recursively && _.isArray( node ) ) {
                        recursivelyGetNodes( node );
                    }
                });
            }
        }

        function getText( node ) {
            node = node || root;
            return _.isObject(node[1]) ? node[2] : node[1];
        }

        function define( type, name, node, parent ) {
            var patternName, index;
            if ( type === 'pattern' ) {
                patternIndex[name] = node;
            } else if ( parent ) {
                patternName = getAttr(parent, 'name');
                index = indexByPattern[patternName];
                if ( !index ) {
                    index = indexByPattern[patternName] = {};
                }
                index[name] = node;
            }
        }

    }

    return StyleDoc;
});
