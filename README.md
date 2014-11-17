# StyleBoard

**StyleBoard** is a single-page web application which analyzes the CSS
of your site and generates an interactive styleguide to document
and test your CSS.

Using modular CSS conventions (such as [SMACSS](http://smacss.com)),
**StyleBoard** will find patterns in the CSS and build a styleguide
for those patterns.
Additional documentation and live examples can added to the
CSS using [StyleDoc](StyleDoc.md) comments.

**StyleBoard** can read the same (un-minified) CSS file that
your site is using, so it will always be up-to-date.
There is no separate task to build the styleguide, because **Styleboard**
runs in the browser.

Because it reads the generated CSS, **Styleboard** is pre-processor agnostic.  
You can use any pre-processor, though if StyleDoc is used, the pre-processor
will need to pass comments through to the output.

Javascript components, and examples written in Javascript, are also supported.
Although **Styleboard** is written in Backbone, your components can be written
in any framework, including AngularJS.

## Try It Now!

Just clone the git repo and open `dist/index.html` in your browser.
With the default
configuration, **StyleBoard** builds a styleguide for its own CSS.
