# StyleBoard

> This initial version of **StyleBoard** is a work in progress.

**StyleBoard** is a single-page web application which analyzes the CSS
of your site and generates an interactive styleguide which documents
and tests your CSS.

Using modular CSS conventions (such as [SMACSS](http://smacss.com)),
**StyleBoard** will find patterns in the CSS and build a styleguide for those patterns,
including live HTML examples of the patterns.
Additional documentation and examples can be explicitly declared in the
CSS comments using `@` tags.
The styleguide is maintained entirely in the CSS file(s), so there is no
external documentation to keep in sync.

The styleguide is interactive. Examples are editable, so 
you can substitute your own text to see how it will look within the context of the
pattern.
If **StyleBoard** finds CSS classes which modify the style of a pattern,
it creates controls to let you cycle through viewing the variations.
Affordances are also made to allow viewing the examples at different screen sizes,
or within different styling contexts (background, fonts, constrained width).

