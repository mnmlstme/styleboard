define(['Context'], function (Context) {

    /**
     * A code example.
     */

    var templateSettings = {
        // use something more like Mustache than PHP:
        interpolate : /\{\{\{([^{}]*)\}\}\}/g,
        escape : /\{\{([^{}]*)\}\}(?!\})/g
    };

    var loremData = _.map(
        [ "Lorem ipsum dolor sit amet, consectetur adipiscing elit. In in metus pharetra lorem fermentum auctor. Proin nec mollis eros. Ut quam urna, faucibus eget lectus at, bibendum ultrices nulla. Nullam sed ligula blandit, viverra nibh a, bibendum nisl. Aliquam urna mi, pharetra a est at, gravida posuere tellus. Sed eu diam vitae augue rhoncus mattis. Integer eget adipiscing risus, sit amet accumsan libero. Etiam a risus cursus, commodo dui sit amet, ornare elit. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Maecenas malesuada odio vitae fringilla interdum. Fusce scelerisque vestibulum blandit. Duis tincidunt erat ac consequat congue. Praesent ultrices semper accumsan.",
          "Ut rutrum a lorem quis ullamcorper. Pellentesque sollicitudin purus vitae arcu cursus, at accumsan est bibendum. Integer faucibus, purus nec lacinia mattis, orci eros volutpat lacus, at tempus nisl enim et nunc. Duis consectetur porta nisl, at semper nisi luctus ac. Etiam volutpat diam sapien, quis blandit lectus bibendum non. Proin pulvinar enim id nunc placerat, ac fringilla tortor tincidunt. Donec tempus eu leo consequat lobortis. Donec imperdiet venenatis ante vestibulum aliquam. Maecenas sed nibh sed nibh varius mattis et sit amet tortor.",
          "Integer consequat sit amet augue ac tristique. Etiam et sollicitudin tellus, sed venenatis purus. Nullam ornare rhoncus pulvinar. Nulla vel ullamcorper nisl. Donec mauris diam, gravida sed volutpat lacinia, elementum sed purus. Suspendisse eu placerat diam. Mauris at libero lacus. Sed dui ipsum, blandit quis augue vitae, bibendum vulputate sapien. Proin quis libero molestie, tristique justo eget, rutrum arcu. In facilisis ultrices lacinia. Cras sed velit eu ante egestas bibendum eu eu massa. Curabitur rutrum tincidunt risus ut tincidunt.",
          "Duis tincidunt mattis mi, quis viverra sapien tristique eu. Nam malesuada facilisis est sed tincidunt. Praesent pulvinar interdum sagittis. Integer nec porttitor lectus. Nam dui quam, pretium ut urna vitae, vestibulum consectetur mi. Proin volutpat, velit quis mollis blandit, justo dolor consequat diam, id porttitor dui lectus varius leo. Vestibulum volutpat dignissim justo vitae fringilla. Suspendisse potenti. Phasellus pulvinar pretium mollis.",
          "Maecenas sit amet erat ullamcorper, scelerisque dui vitae, tempor nibh. Morbi non est eget lectus pretium tincidunt eget non purus. Quisque in consectetur ante. Pellentesque in nulla rutrum, iaculis nisl ut, faucibus leo. Maecenas suscipit tellus elit, nec scelerisque quam accumsan sed. Sed consequat ultrices lorem eu bibendum. Aliquam elementum dui vitae ante tempus vehicula. Nulla imperdiet dapibus justo, fringilla gravida ante. Aenean libero turpis, mattis quis gravida sed, facilisis ac nibh. Vivamus sit amet dictum magna. Pellentesque cursus pharetra enim eu convallis. Fusce augue felis, consectetur ac fringilla non, consectetur ac quam."],
        function (text) { return text.split(' '); });

    var predefined = {
        br: '<hr class="styleboard-layout">',
        table: '<table class="styleboard-layout"><tr class="styleboard-layout"><td class="styleboard-layout">',
        row: '<tr class="styleboard-layout">',
        col: '<td class="styleboard-layout">',
        lorem: function lorem( para, count, offset ) {
            offset = offset || 0;
            para = para || 0;
            var words = loremData[para % loremData.length];
            if ( count ) {
                words = words.slice( offset, offset+count );
            } else if ( offset ) {
                words = words.slice( offset );
            }
            return words.join(' ');
        }
    };

    var Example = Context.extend({

        expand: function expand( moreScope ) {
            var model = this,
                code = model.get('code') || '',
                scope = model.get('scope') || {},
                bindings = _.extend( {}, predefined, scope, moreScope || {} );
            return code ? _.template( code, bindings, templateSettings ) : '';
        },

    });

    return Example;
});
