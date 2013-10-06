# Makefile for LESS files

CSSFILES=reset.css

LESSFILES= \
	util.less \
	css3.less \
	color.less \
	typography.less \
	pane.less \
	list.less \
	icon.less \
	button.less \
	scrubber.less \
	code.less \
	rule.less \
	pattern.less \
	sandbox.less

all: styleboard.css

styleboard.css: $(LESSFILES) $(CSSFILES)

%.css: %.less
	lessc $< > $@
