define(['Example'], function (Example) {

    var Module = Backbone.Model.extend({

        addDescription: function ( lines ) { 
            this.get('descriptions') ||  this.set('descriptions', []);
            this.get('descriptions').push( lines.join('\n') );
        },
        
        addExample: function ( lines, title ) {
            var attrs = { html: lines.join('\n') };
            if ( title ) { attrs.title = title; }

            this.get('examples') ||  this.set('examples', []);
            this.get('examples').push( new Example(attrs) );
        },
        
        addSelector: function (selector) {
            this.get('selectors') || this.set('selectors', {});
            this.get('selectors')[selector]++;
        },

        addModifier: function (name) {
            this.get('modifiers') ||  this.set('modifiers', {});
            this.get('modifiers')[name]++;
        },

        addState: function (name) {
            this.get('states') ||  this.set('states', {});
            this.get('states')[name]++;
        },
        
        addMember: function (name) {
            this.get('members') ||  this.set('members', {});
            this.get('members')[name]++;
        },

        addRelated: function (name, module) {
            this.get('related') ||  this.set('related', {});
            this.get('related')[name] = module;
        },
        
        cleanup: function () {
            var related = this.get('related');
            _(related).each( function (module, name) {
                if ( !module.get('isDocumented') ) delete related[name];
            });
        }

    }); // end of Module model

    return Module;
});
