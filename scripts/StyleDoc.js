/**
 @filespec StyleDoc - A structured document representing the CSS and embedded StyleDoc comments
 */

define( ['../lib/marked/js/marked'], function ( marked ) {

    function StyleDoc() {
        var doc = this;

        doc.tree = ['styledoc',{}]; // JSON-ML
        doc.stack = [ doc.tree ];

        doc.patternIndex = {}; // name -> node
        doc.indexByPattern = {}; // patternName -> { name -> node }

        doc.findByName = function findByName( name, type ) {
            type = type || 'pattern';
            return doc.findContext({type: type, name: name });
        };

        doc.findContext = function findContext( context ) {
            var pattern = context.type !== 'pattern' && doc.getCurrent('pattern');

            if ( pattern ) {
                console.log('Current pattern: ' + doc.getAttr(pattern,'name'));
                return doc.getDefinition(pattern, context.name);
            } else {
                return doc.patternIndex[context.name];
            }
        };

        doc.getDefinition = function ( pattern, name ) {
            var patternName = doc.getAttr(pattern, 'name'),
                index = doc.indexByPattern[patternName];
            return index && index[name];
        };

        doc.getPatterns = function getPatterns() {
            return _.values( doc.patternIndex );
        };

        doc.getCurrent = function getCurrent( type ) {
            if (type) {
                return _.find( doc.stack, function (x) {
                    return doc.getType(x) === type;
                });
            } else {
                return doc.stack[0];
            }
        };

        doc.isOpen = function isOpen( node ) {
            return _(doc.stack).contains( node );
        };

        doc.openContext = function openContext( list ) {
            if ( !_.isArray( list ) ) { list = [ list ]; }
            var context, target, old;
            while ( list.length ) {
                context = list.shift();
                console.log('openContext ' + context.type + ': ' + context.name);
                target = doc.findContext( context );
                if ( target && doc.isOpen( target ) ) {
                    doc.popToContext( target );
                } else {
                    old = doc.getCurrent( context.type );
                    if ( old ) {
                        doc.closeContext( old );
                    }
                    if ( !target ) {
                        target = doc.insertNode( context.type, context );
                        if ( context.name ) {
                            define( context.type, context.name, target );
                        }
                    }
                    doc.stack.unshift( target );
                }
            }
            return target;
        };

        doc.popContext = function popContext() {
            return doc.stack.shift();
        };

        doc.popToContext = function popToContext( node ) {
            while ( doc.stack[0] !== node ) {
                doc.stack.shift();
            }
        };

        doc.closeContext = function closeContext( node ) {
            doc.popToContext( node );
            doc.popContext();
        };

        doc.insert = function insert( node, parent ) {
            parent = parent || doc.stack[0];
            parent.push( node );
        };

        doc.addText = function addText( text ) {
            var html = marked(text).trim();
            doc.insert(['html',html]);
        };

        doc.insertNode = function insertNode( type, attrs, content ) {
            var node =  [ type, _.clone(attrs) ];
            doc.insert(node);
            if ( content ) {
                doc.insert( content, node );
            }
            return node;
        };

        doc.getRoot = function () {
            return doc.tree;
        };

        doc.getType = function ( node ) {
            return node[0];
        };

        doc.getAttr = function ( node, key ) {
            var attrs = node[1];
            return _.isObject(attrs) && attrs[key];
        };

        doc.getNodes = function ( node ) {
            node = node || doc.tree;
            var attrs = node[1];
            return node.slice( _.isObject(attrs) ? 2 : 1 );
        };

        doc.getNodesOfType = function ( parent, type, recursively ) {
            var list = [];

            recursivelyGetNodes( parent );
            return list;

            function recursivelyGetNodes( parent ) {
                doc.getNodes(parent).forEach( function (node) {
                    if ( doc.getType(node) === type ) {
                        list.push( node );
                    } else if ( recursively && _.isArray( node ) ) {
                        recursivelyGetNodes( node );
                    }
                });
            }
        };

        doc.getText = function ( node ) {
            node = node || doc.tree;
            return _.isObject(node[1]) ? node[2] : node[1];
        };

        // private

        function define( type, name, node ) {
            var pattern = doc.getCurrent('pattern'),
                patternName, index;
            if ( type === 'pattern' ) {
                doc.patternIndex[name] = node;
            } else if ( pattern ) {
                patternName = doc.getAttr(pattern, 'name');
                index = doc.indexByPattern[patternName];
                if ( !index ) {
                    index = doc.indexByPattern[patternName] = {};
                }
                index[name] = node;
            }
        }

    }

    return StyleDoc;
});
