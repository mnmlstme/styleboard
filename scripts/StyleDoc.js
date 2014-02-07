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
            return node = this.index['pattern'] && this.index['pattern'][name];
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

        doc.isOpen = function isOpen( type, name ) {
            return _.find( doc.stack, function (x) {
                return doc.getType(x) === type &&
                    doc.getAttr(x, 'name') === name;
            });
        };

        doc.openSection = function openSection( type, attrs ) {
            var opened = doc.getCurrent(type);
            if ( opened ) {
                doc.popToSection( opened );
                if ( doc.getAttr( opened, 'name' ) !== attrs.name ) {
                    doc.popSection();
                    opened = null;
                }
            }
            if ( !opened ) {
                opened = [ type, _.clone(attrs) ];
                insert( opened );
                doc.stack.unshift( opened );
                if ( attrs.name ) {
                    define( type, attrs.name, opened );
                }
            }
            return opened;
        };

        doc.popSection = function popSection() {
            return doc.stack.shift();
        };

        doc.popToSection = function popToSection( node ) {
            var current = doc.stack[0]
            while ( current !== node ) {
                current = doc.stack.shift();
            }
        };

        doc.closeSection = function closeSection( node ) {
            doc.popToSection( node );
            doc.popSection();
        };

        doc.addText = function addText( text ) {
            insert(['p',text]);
        };

        doc.addSection = function addSection( type, attrs, content ) {
            var section = doc.openSection( type, attrs );
            insert( content );
            doc.closeSection( section );
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

        function insert( node ) {
            doc.stack[0].push( node );
        }

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
