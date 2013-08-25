define( function () {
    function Parser( opts ) {
        opts = opts || {};
        var parser = this;
    
        parser.load = function ( url, done ) {
            $.ajax({ 
                url: url, 
                dataType: 'text',
                error:  function ( xhr, status, error ) {
                    alert("Failed " + status + ": " + error);
                },
                success: function( data, status, xhr ) {
                    parse(data, done);
                }
            });
        };
    
        function parse(data, done) {
            new less.Parser( opts )
                .parse( data, function (err, tree ) {
                    if ( err ) {
                        console.warn( err );
                    } else {
                        console.log('Read ' + tree.rules.length + " rules.");
                        done( tree.rules );
                    }
                });
        }
    
    }

    return Parser;
});

