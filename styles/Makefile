# Makefile for LESS files

CSSFILES=reset.css

LESSFILES= \
	util.less \
	css3.less \
	color.less \
	typography.less \
	pane.less \
	frame.less \
	list.less \
	bar.less \
	icon.less \
	swatch.less \
	button.less \
	menu.less \
	dropdown.less \
	code.less \
	rule.less \
	pattern.less

all: styleboard.css

styleboard.css: $(LESSFILES) $(CSSFILES)

%.css: %.less
	lessc $< > $@
