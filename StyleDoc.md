StyleDoc Syntax
====

StyleDoc declarations are embedded in CSS comments.  Only those comments that begin with `/** ` are parsed for StyleDoc declarations.

All declarations within the same comment block are considered to pertain to the same subject CSS selector (or comma-separated list of selectors).  Unless a comment block includes a `@selector` tag, it will be attached to the next CSS selector in the file.

Any text in a StyleDoc comment which is not part of a StyleDoc tag is considered descriptive text and will be appended to the description of the current pattern.


StyleDoc Tags
====

`@section`  _title_ [, _subtitle_]*

Declare a section within which successive patterns will be grouped.  Nested subsections are created by specifying a comma-separated path of titles.  Section titles are case-sensitive and can contain whitespace and special characters (other than commas).

`@pattern` [_selector_ [, _selector_]*]

Declare the selector(s) to be a CSS Pattern.  Also sets this pattern as the current pattern, to which successive declarations may refer. If no _selector_ is given the next selector in the CSS input stream is used.


`@modifier` [_selector_ [, _selector_]*]

Declare the selector(s) to be a modifier of the current pattern.  A modifier is a class which must be applied to the same element as the pattern class, and serves to modify or refine the pattern's style.  If no _selector_ is given, one is derived from next selector in the CSS input stream. 

`@state` [_selector_ [, _selector_]*]

Declare the selector(s) to be a state.  States are similar to modifiers, but intended for representing dynamic changes to a pattern.  If no _selector_ is given, one is derived from the next selector in the CSS input stream. 

`@member` [_selector_ [, _selector_]*]

Declare the selector(s) to be a member of the current pattern.  A member is a class applied to a sub-element of a pattern to describe its role within the pattern.  If no _selector_ is given, one is derived from the next selector in the CSS input stream. 

`@helper` [_selector_ [, _selector_]*]

Declare the selector(s) to be helper classes of the current pattern.  A helper class interacts with the pattern but need not be applied only to sub-elements.   Often a helper class is applied to an ancestor node of the pattern's root element, to establish a context or scope for the pattern. If no _selector_ is given the next selector in the CSS input stream is used. 

`@example` [ _title_ ]

Add an HTML example to the current declaration.  The lines which follow the `@example` tag, up to the next tag or end of comment block comprise the example.  If no _title is given, one will be derived from an excerpt of the markup near where the pattern is first invoked.


Inferred Declarations
====

Many StyleDoc declarations can be inferred from the selectors and class names themselves.  StyleBoard can be configured to make such inferences automatically, but explicit declarations take precedence over inferred declarations.

Inferencing is based on two complementary mechanisms, which may be enabled independently.  _Structural Inferencing_ looks at the relationships between classes as they occur in selectors to determine the intent of the selectors.  _Semantic Inferencing_ utilizes a naming convention (configurable) to detect relationships between classes.

A `@pattern` can be semantically inferred when selector occurs which uses a valid pattern classname at the global (non-nested) context.  Given the selector

    .dialog {  ...   }
    
structural and semantic inferencing both will derive the declaration

    /**
     @pattern .dialog
     */    

A `@modifier` can be inferred when a selector contains a valid pattern classname and a valid modifier classname on the same element.  Given the selector

    .modal-.dialog {   ...   }

semantic inferencing (default conventions) will derive the declarations

    /**
      @pattern .dialog
      @modifier .modal- 
     */
    
Using structural inferencing requires that `.dialog` already be declared (or otherwise derived) to be a pattern, and does not rely on any naming conventions.  Given a pattern `.dialog` and the selector

    .dialog.modal { ... }
    
structural inferencing will derive the declaration 

    /**
      @modifier .modal
     */
        
A  `@member` can be inferred when a selector contains a classname or tag name within the context of a pattern class.  Given the selector

    .dialog .dialog-title { ... }

semantic inferencing will derive the declarations

    /**
      @pattern .dialog
      @member .dialog-title
    */
    
And given a known pattern `.dialog` and the selector

    .dialog .title { ... }
    
structural inferencing will derive the declaration

    /**
      @member .title
     */    

A `@member` can also be inferred for tag names used as a descendant of a pattern.  Given

    .breadcrumbs li {
        ...
    }
    
semantic inferencing (and structural inferencing, if `.breadcrumbs` is a pattern) will derive
    
    /**
      @pattern .breadcrumbs
      @member > li
     */

A `@helper` can be inferred when a selector contains a classname at the global context which is derived from a pattern class name.  For example, if `.dialog` is found to be a pattern, then given

    .dialog-context {
       ...
    }

we infer

    /**
      @helper .dialog-context
    */
   
If no selectors are found which involve the helper and the pattern, it can only be inferred semantically (based on the class name prefix).  If however, a class is used in a selector as an antecedent of a (known) pattern, the helper declaration will be derived.  Given a pattern `.dialog` and the selector

    .context .dialog {
    }
    
structural inferencing will derive

    /**
      @helper .context
      */
      
When used together, structural and semantic inferencing may generate different sets of relationships.  This may be a sign that naming conventions are not being adhered to strictly.  *StyleBoard* can be configured to flag these situations in the interface. 



