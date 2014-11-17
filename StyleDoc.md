StyleDoc Syntax
====

StyleDoc declarations are embedded in CSS comments.  
Only those comments that begin with `/** ` are parsed for StyleDoc declarations.  
All declarations within the same comment block are considered
to pertain to the same rule and its CSS selector(s).

A comment not nested within a CSS rule refers to the next rule.  
A comment nested within the `{ ... }` of a rule refers to that rule.  
(Note that when using LESS or Sass to generate CSS, this means StyleDoc
comments should in general occur _inside_ rules, so that they are not
associated with an enclosing scope.)

A comment block may instead reference other selector(s) by naming the
selector(s) after a `@pattern`, `@modifier`, `@state`, `@member`, or `@helper` tag.
This also allows StyleDoc comments to reside in a separate file from the CSS itself.

Any text in a StyleDoc comment which is not part of a StyleDoc tag is considered
Markdown text, which will be converted to HTML and appended to the
description of the current selector.


StyleDoc Tags
====

`@pattern` _selector_

Declare the selector(s) to be a CSS Pattern.  
Also sets this pattern as the current pattern, to which successive declarations may refer.
Without any selectors, declares the current CSS selector as a Pattern.

`@modifier` _selector_

Declare the selector(s) to be a modifier of the current pattern.
A modifier is a class which must be applied to the same element as the pattern class,
and serves to modify or refine the pattern's style.

`@state` _selector_

Declare the selector(s) to be a state.
States are similar to modifiers, but intended for representing dynamic changes to a pattern.

`@member` _selector_

Declare the selector(s) to be a member of the current pattern.
A member is a class applied to a sub-element of a pattern to describe its role within the pattern.

`@helper` _selector_

Declare the selector(s) to be helper classes of the current pattern.
A helper class interacts with the pattern but need not be applied only to sub-elements.
Often a helper class is applied to an ancestor node of the pattern's root element,
to establish a context or scope for the pattern.

`@example` [_filename_, ...] _title_

Add an HTML example to the current declaration.
The lines which follow the `@example` tag, up to the next tag, blank line,
or end of comment block, comprise the example.
Alternatively, the example can be written in a separate file, and the _filename_
given in the list.
Additional Javascript or CSS files required by the example can also be listed
and will be injected into the live example.


Inferred Declarations
====

_Note: The rules used to infer declarations are likely to change in future
releases to make them more adaptable to other Modular CSS conventions._

Many StyleDoc declarations can be inferred from the selectors and class names themselves.
StyleBoard can be configured to make such inferences automatically,
but explicit declarations take precedence over inferred declarations.

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
