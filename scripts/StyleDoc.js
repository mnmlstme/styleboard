/**
 @filespec StyleDoc - A structured document representing the CSS and embedded StyleDoc comments
 */

define( function () {

    function StyleDoc() {
        var doc = this;

        doc.tree = ['styledoc',{}]; // JSON-ML
        doc.stack = [ doc.tree ];
        doc.index = {};
        doc.patterns = [];

        doc.findByName = function findByName( name ) {
            return doc.findContext({type: 'pattern', name: name });
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

        doc.findContext = function findContext( context ) {
            var index = this.index[context.type];
            return index && index[context.name];
        }

        doc.openContext = function openContext( list ) {
            if ( !_.isArray( list ) ) { list = [ list ]; }
            var context, target, old;
            while ( list.length ) {
                context = list.shift();
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
            doc.insert(['p',text]);
        };

        doc.insertNode = function insertNode( type, attrs, content ) {
            var node =  [ type, _.clone(attrs) ];
            doc.insert(node);
            if ( content ) {
                doc.insert( content, node );
            }
            return node;
        };

        doc.getType = function ( node ) {
            return node[0];
        }

        doc.getAttr = function ( node, key ) {
            var attrs = node[1];
            return _.isObject(attrs) && attrs[key];
        }

        doc.getNodes = function ( node ) {
            node = node || doc.tree;
            var attrs = node[1];
            return node.slice( _.isObject(attrs) ? 2 : 1 );
        }

        // private

        function define( type, name, node ) {
            var table = doc.index[type];
            if ( !table ) {
                table = doc.index[type] = {};
            }
            table[name] = node;
        }

    }

    return StyleDoc;
});
