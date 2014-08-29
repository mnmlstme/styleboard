define ( function () {

    var standard = {
        // Strings not taken from corpus
        btn: 'Button'
    };

    var nullString = '(null)';

    var Filler = Backbone.Model.extend({

        initialize: function ( attrs ) {
            var model = this,
                corpus = texts[attrs.fillerText || 'lorem'],
                pat = {
                    // Default is mustache templating
                    open: '\\{\\{',
                    // Expression is a.b or a[b]
                    expr: '([A-Za-z_]\\w*)(\\.\\w+|\\[\\w+\\])*',
                    close: '\\}\\}'
                };

            if ( attrs.templating === 'erb' ) {
                pat.open = '<%=';
                pat.close = '%>';
            }

            model.regex = new RegExp( pat.open + '\\s*(' + pat.expr + ')\\s*' + pat.close, 'g' );

            // Build the dictionary
            _(standard).each( function (value, key) {
                model.set(key, value);
            });

            // s: Sentences are taken directly from the corpus.
            model.set('s', corpus.slice(0));

            // p: Paragraphs are 3 sentences long.
            model.set('p', corpus.map( function (s, i, list) {
                return sentences( list, i, 3 );
            }));

            // h: Headers are 2-3 words, title case.
            model.set('h', corpus.map( function (s, i) {
                return words( s, 2 + (i%2), true );
            }));

            // w: Single words
            // TODO: filter for "interesting" words.
            model.set('w', corpus.map( function (s) {
                return words( s, 1 );
            }));

            // phr: Phrases are 3-6 words.
            model.set('phr', corpus.map( function (s, i) {
                return words( s, 3 + (i%4) );
            }));
        },

        replace: function ( template, f ) {
            var regex = this.regex;

            return template.replace( regex, function (match, key) {
                return f(key);
            });
        },

        expand: function ( template, scope, filter ) {
            if ( !template ) { return ''; }
            var model = this;

            // TODO: need to push scope here

            return model.replace( template, function (key) {
                var value = model.lookup(key) || '';

                value = _.escape( value.toString() );

                if (filter) {
                    value = filter( value, key );
                }

                return value;
            });
        },

        lookup: function ( key ) {
            var model = this,
                path = keyToPath(key),
                k = path[0],
                hash = {},
                i;

            hash[k] = model.get(k);
            return recurse( hash, path );

            function recurse( hash, path ) {
                var k = path.length ? path.shift() : 0;
                // TODO: optimize tail recursion
                if ( !_.isObject(hash) ) {
                    return hash;
                }

                return recurse(hash[k], path);
            }
        },

        setValue: function (key, value) {
            var model = this,
                path = keyToPath(key),
                k = path[0],
                oldValue = model.get(k),
                hash = {};

            if ( value === model.lookup(key) ) {
                return;
            }

            hash[k] = oldValue;
            recurse( hash, path, value );
            model.set( k, hash[k] );
            if ( _.isObject(oldValue) ) {
                // because Backbone doesn't check for changes within a hash value
                model.trigger('change change:' + k);
            }

            function recurse( object, path, value ) {
                // TODO: optimize tail recursion
                var k = path.shift(),
                    hash = object[k];
                if ( !path.length && !_.isObject(hash)) {
                    object[k] = value;
                } else {
                    if ( !_.isObject(hash) ) {
                        object[k] = { 0: hash };
                    }
                    if ( !path.length ) {
                        path = [0];
                    }
                    recurse( hash, path.length ? path : 0, value );
                }
            }

        }

    });

    function sentences(list, start, n) {
        var sentences = [];

        for( var j=0; j < n; j++ ) {
            sentences.push( list[(start + n*j)%list.length] );
        }
        return sentences.join(' ');
    }

    function words(s, n, titlecase) {
        var w = s.toLowerCase().split(/[^\w'’]+/).slice(0,n || 0);

        if (titlecase) {
            // TODO: handle prepositions and articles properly
            w = w.map( function (string) {
                return string.charAt(0).toUpperCase() + string.slice(1);
            });
        }

        return w.join(' ');
    }

    function keyToPath(key) {
        return key.split(/\W/).filter( function(s) { return s !== ''; } );
    }

    var texts = {
        lorem: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
            'In sit amet lorem ipsum. Suspendisse nisl enim, iaculis a blandit et, lobortis ut turpis.',
            'Sed eu velit vel augue ultricies ullamcorper sed ut nulla.',
            'Proin semper tellus sit amet diam fringilla mattis.',
            'Suspendisse elementum congue dolor sit amet posuere.',
            'In sed nunc viverra, pretium erat mattis, semper odio.',
            'Maecenas rutrum nulla felis.',
            'Donec id lorem non eros blandit viverra.',
            'Maecenas adipiscing velit ac urna feugiat, ullamcorper tincidunt ipsum auctor.',
            'Nulla hendrerit tempus condimentum.',
            'Proin ac massa et purus vestibulum interdum vitae sed mauris.',
            'Cras vulputate iaculis velit sed tincidunt.',
            'Integer porta libero non tellus euismod fermentum.',
            'Aenean magna diam, fermentum eu libero sagittis, feugiat venenatis neque.',
            'Fusce facilisis vehicula enim id consectetur.',
            'In feugiat auctor quam eget scelerisque.',
            'Donec est lorem, dignissim sit amet velit sed, fringilla tincidunt orci.',
            'Ut a eleifend dolor.',
            'Nam non scelerisque odio.',
            'Integer sit amet justo vel massa luctus hendrerit.',
            'Vivamus elementum mollis nisl vitae euismod.',
            'Aliquam erat volutpat.',
            'Mauris suscipit tempus eros, in elementum nisl cursus sed.',
            'Sed tincidunt semper nunc, id pellentesque quam egestas at.',
            'Integer a placerat augue.',
            'Nam urna tellus, consectetur at aliquam et, gravida eu odio.',
            'Nam scelerisque, tortor a molestie blandit, risus mauris malesuada urna, eget tempor turpis tortor id lorem.',
            'Morbi eget ornare leo.',
            'Nulla luctus pellentesque magna, ac ultrices nunc semper ut.'
        ],
        dickens: [
            'Marley was dead: to begin with.',
            'There is no doubt whatever about that.',
            'The register of his burial was signed by the clergyman, the clerk, the undertaker, and the chief mourner.',
            'Scrooge signed it: and Scrooge’s name was good upon ’Change, for anything he chose to put his hand to.',
            'Old Marley was as dead as a door-nail.',
            'Mind! I don’t mean to say that I know, of my own knowledge, what there is particularly dead about a door-nail.',
            'I might have been inclined, myself, to regard a coffin-nail as the deadest piece of ironmongery in the trade.',
            'But the wisdom of our ancestors is in the simile; and my unhallowed hands shall not disturb it, or the Country’s done for.',
            'You will therefore permit me to repeat, emphatically, that Marley was as dead as a door-nail.',
            'Scrooge knew he was dead?',
            'Of course he did.',
            'How could it be otherwise?',
            'Scrooge and he were partners for I don’t know how many years.',
            'Scrooge was his sole executor, his sole administrator, his sole assign, his sole residuary legatee, his sole friend, and sole mourner.',
            'And even Scrooge was not so dreadfully cut up by the sad event, but that he was an excellent man of business on the very day of the funeral, and solemnised it with an undoubted bargain.',
            'The mention of Marley’s funeral brings me back to the point I started from.',
            'There is no doubt that Marley was dead.',
            'This must be distinctly understood, or nothing wonderful can come of the story I am going to relate.',
            'If we were not perfectly convinced that Hamlet’s Father died before the play began, there would be nothing more remarkable in his taking a stroll at night, in an easterly wind, upon his own ramparts, than there would be in any other middle-aged gentleman rashly turning out after dark in a breezy spot—say Saint Paul’s Churchyard for instance—literally to astonish his son’s weak mind.',
            'Scrooge never painted out Old Marley’s name.',
            'There it stood, years afterwards, above the warehouse door: Scrooge and Marley.',
            'The firm was known as Scrooge and Marley.',
            'Sometimes people new to the business called Scrooge Scrooge, and sometimes Marley, but he answered to both names.',
            'It was all the same to him.',
            'Oh! But he was a tight-fisted hand at the grindstone, Scrooge! a squeezing, wrenching, grasping, scraping, clutching, covetous, old sinner!',
            'Hard and sharp as flint, from which no steel had ever struck out generous fire; secret, and self-contained, and solitary as an oyster.',
            'The cold within him froze his old features, nipped his pointed nose, shrivelled his cheek, stiffened his gait; made his eyes red, his thin lips blue; and spoke out shrewdly in his grating voice.',
            'A frosty rime was on his head, and on his eyebrows, and his wiry chin.',
            'He carried his own low temperature always about with him; he iced his office in the dog-days; and didn’t thaw it one degree at Christmas.',
            'External heat and cold had little influence on Scrooge.',
            'No warmth could warm, no wintry weather chill him.',
            'No wind that blew was bitterer than he, no falling snow was more intent upon its purpose, no pelting rain less open to entreaty.',
            'Foul weather didn’t know where to have him.',
            'The heaviest rain, and snow, and hail, and sleet, could boast of the advantage over him in only one respect.',
            'They often “came down” handsomely, and Scrooge never did.'
        ],
        kafka: [
'One morning, when Gregor Samsa woke from troubled dreams, he found himself transformed in his bed into a horrible vermin.',
            'He lay on his armour-like back, and if he lifted his head a little he could see his brown belly, slightly domed and divided by arches into stiff sections.',
            'The bedding was hardly able to cover it and seemed ready to slide off any moment.',
            'His many legs, pitifully thin compared with the size of the rest of him, waved about helplessly as he looked.',
            '"What’s happened to me?" he thought.',
            'It wasn’t a dream.  His room, a proper human room although a little too small, lay peacefully between its four familiar walls.',
            'A collection of textile samples lay spread out on the table—Samsa was a travelling salesman—and above it there hung a picture that he had recently cut out of an illustrated magazine and housed in a nice, gilded frame.',
            'It showed a lady fitted out with a fur hat and fur boa who sat upright, raising a heavy fur muff that covered the whole of her lower arm towards the viewer.',
            'Gregor then turned to look out the window at the dull weather. Drops of rain could be heard hitting the pane, which made him feel quite sad.',
            '"How about if I sleep a little bit longer and forget all this nonsense", he thought, but that was something he was unable to do because he was used to sleeping on his right, and in his present state couldn’t get into that position.',
            'However hard he threw himself onto his right, he always rolled back to where he was.',
            'He must have tried it a hundred times, shut his eyes so that he wouldn’t have to look at the floundering legs, and only stopped when he began to feel a mild, dull pain there that he had never felt before.',
            '"Oh, God", he thought, "what a strenuous career it is that I’ve chosen!"',
            'Travelling day in and day out.',
            'Doing business like this takes much more effort than doing your own business at home, and on top of that there’s the curse of travelling, worries about making train connections, bad and irregular food, contact with different people all the time so that you can never get to know anyone or become friendly with them.',
            'It can all go to Hell!',
            'He felt a slight itch up on his belly; pushed himself slowly up on his back towards the headboard so that he could lift his head better; found where the itch was, and saw that it was covered with lots of little white spots which he didn’t know what to make of; and when he tried to feel the place with one of his legs he drew it quickly back because as soon as he touched it he was overcome by a cold shudder.'
        ],
        tolstoy: [
            'Happy families are all alike; every unhappy family is unhappy in its own way.',
            'Everything was in confusion in the Oblonskys’ house.',
            'The wife had discovered that the husband was carrying on an intrigue with a French girl, who had been a governess in their family, and she had announced to her husband that she could not go on living in the same house with him.',
            'This position of affairs had now lasted three days, and not only the husband and wife themselves, but all the members of their family and household, were painfully conscious of it.',
            'Every person in the house felt that there was no sense in their living together, and that the stray people brought together by chance in any inn had more in common with one another than they, the members of the family and household of the Oblonskys.',
            'The wife did not leave her own room, the husband had not been at home for three days. The children ran wild all over the house; the English governess quarreled with the housekeeper, and wrote to a friend asking her to look out for a new situation for her; the man-cook had walked off the day before just at dinner time; the kitchen-maid, and the coachman had given warning.',
            'Three days after the quarrel, Prince Stepan Arkadyevitch Oblonsky—Stiva, as he was called in the fashionable world—woke up at his usual hour, that is, at eight o’clock in the morning, not in his wife’s bedroom, but on the leather-covered sofa in his study. He turned over his stout, well-cared-for person on the springy sofa, as though he would sink into a long sleep again; he vigorously embraced the pillow on the other side and buried his face in it; but all at once he jumped up, sat up on the sofa, and opened his eyes.',
            '"Yes, yes, how was it now?" he thought, going over his dream.',
            '"Now, how was it?',
            'To be sure!',
            'Alabin was giving a dinner at Darmstadt; no, not Darmstadt, but something American.',
            'Yes, but then, Darmstadt was in America.',
            'Yes, Alabin was giving a dinner on glass tables, and the tables sang, _Il mio tesoro_—not _Il mio tesoro_ though, but something better, and there were some sort of little decanters on the table, and they were women, too," he remembered.'
        ],
        lingo: [
            'Perhaps a re-engineering of your current world view will re-energize your online nomenclature to enable a new holistic interactive enterprise internet communication solution.',
            'Upscaling the resurgent networking exchange solutions, achieving a breakaway systemic electronic data interchange system synchronization, thereby exploiting technical environments for mission critical broad based capacity constrained systems.',
             'Fundamentally transforming well designed actionable information whose semantic content is virtually null.',
             'To more fully clarify the current exchange, a few aggregate issues will require addressing to facilitate this distributed communication venue.',
             'In integrating non-aligned structures into existing legacy systems, a holistic gateway blueprint is a backward compatible packaging tangible of immeasurable strategic value in right-sizing conceptual frameworks when thinking outside the box.',
             'This being said, the ownership issues inherent in dominant thematic implementations cannot be understated vis-a vis document distribution on a real operating system consisting primarily of elements regarded as outdated and therefore impelling as a integrated out sourcing avenue to facilitate multi-level name value pairing in static components.',
             'In order to properly merge and articulate these core assets, an acquisition statement outlining the information architecture, leading to a racheting up of convergence across the organic platform is an opportunity without precedent in current applicability transactional modeling.',
             'Implementing these goals requires a careful examination to encompass an increasing complex out sourcing disbursement to ensure the extant parameters are not exceeded while focusing on infrastructure cohesion.',
             'Dynamic demand forecasting indicates that a mainstream approach may establish a basis for leading-edge information processing to insure the diversity of granularity in encompassing expansion of content provided within the multimedia framework under examination.',
             'Empowerment in information design literacy demands the immediate and complete disregard of the entire contents of this cyberspace communication.'
        ],
        pomo: [
            'If one examines postcultural discourse, one is faced with a choice: either reject Sartreist existentialism or conclude that discourse must come from communication.',
            'The subject is interpolated into a rationalism that includes consciousness as a totality.',
            'Therefore, Batailleist `powerful communication’ suggests that the significance of the participant is deconstruction, but only if the premise of Sartreist existentialism is valid.',
            'In the works of Eco, a predominant concept is the concept of textual language.',
            'A number of deconstructions concerning not, in fact, discourse, but neodiscourse may be revealed.',
            'In a sense, Bailey states that we have to choose between the semantic paradigm of expression and the dialectic paradigm of expression.',
            'Several materialisms concerning rationalism exist.',
            'However, in Foucault’s Pendulum, Eco denies the semantic paradigm of expression; in The Aesthetics of Thomas Aquinas, although, he examines precapitalist semiotic theory.',
            'Sartre uses the term ‘the semantic paradigm of expression’ to denote the economy of subcultural sexual identity.',
            'It could be said that if rationalism holds, the works of Eco are an example of textual libertarianism.',
            'An abundance of discourses concerning the difference between class and sexual identity may be found.',
            'However, von Ludwig implies that we have to choose between postdialectic deappropriation and cultural Marxism.',
            'Many discourses concerning rationalism exist.',
            'Thus, if precapitalist desublimation holds, we have to choose between Sartreist existentialism and textual rationalism.',
            'If one examines Sartreist existentialism, one is faced with a choice: either accept rationalism or conclude that reality may be used to disempower the underprivileged.',
            'Postcultural modern theory states that narrative is a product of the masses, given that language is distinct from reality.',
            'Therefore, the characteristic theme of Buxton’s model of rationalism is the role of the reader as poet.',
            'The primary theme of the works of Smith is a self-fulfilling whole.',
            'Von Junz implies that we have to choose between Sartreist existentialism and dialectic narrative.',
            'In a sense, the premise of postsemantic textual theory states that consciousness is used to entrench hierarchy.',
            '“Art is meaningless,” says Derrida; however, according to Dietrich, it is not so much art that is meaningless, but rather the collapse, and thus the meaninglessness, of art.',
            'The characteristic theme of Tilton’s analysis of rationalism is the bridge between society and class.',
            'It could be said that if structuralist postcapitalist theory holds, we have to choose between Sartreist existentialism and textual materialism.',
            'Debord’s critique of preconceptualist objectivism holds that the task of the observer is significant form.',
            'However, Hubbard implies that we have to choose between rationalism and capitalist narrative.',
            'The primary theme of the works of Joyce is the role of the reader as observer.',
            'Thus, Baudrillard uses the term ‘subcultural structural theory’ to denote the genre, and eventually the failure, of neosemanticist society.',
            'Dialectic discourse states that consciousness may be used to marginalize minorities.',
            'Therefore, the main theme of Buxton’s model of subtextual deconstruction is not narrative as such, but postnarrative.',
            'Lyotard uses the term ‘rationalism’ to denote the difference between sexual identity and society.',
            'However, if Sartreist existentialism holds, we have to choose between capitalist nihilism and the neotextual paradigm of narrative.'
        ],
    };

    return Filler;
});
