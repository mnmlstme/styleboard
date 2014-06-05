# StyleBoard

**StyleBoard** is a single-page web application which analyzes the CSS
of your site and generates an interactive styleguide which documents
and tests your CSS.

Using modular CSS conventions (such as [SMACSS](http://smacss.com)),
**StyleBoard** will find patterns in the CSS and build a styleguide
for those patterns,
including live HTML examples of the patterns.
Documentation, examples, and other directives are added to the
CSS using [StyleDoc](StyleDoc.md) comments.
The styleguide is maintained entirely in the CSS file(s), so there is no
external documentation to keep in sync.

## Try It Now!

Just clone the git repo and open `index.html` in your browser.  With the default
configuration, **StyleBoard** builds a styleguide for its own CSS.

## Feature Roadmap

The intent is that the styleguide will be interactive, allowing for
rapid in-browser experimentation.

* Examples will be editable, so you can substitute your own text to see
  how it will look within the context of the pattern.
* If **StyleBoard** finds CSS classes which modify the style of a pattern,
  it will create controls to let you cycle through viewing the variations.

