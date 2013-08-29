define(["./Module"], function (Module) {

    console.log("Loading Dictionary");

    function Dictionary() {
        var dict = this,
        modules = {};
        
        dict.theModule = function ( name ) {
            return modules[name] || (modules[name] = new Module({ name: name }));
        };
        
        dict.each = function ( fn ) { _(modules).each( fn ); }
        
        dict.remove = function ( name ) { delete modules[name]; }
        
        return dict;
    }

    return Dictionary;
});
