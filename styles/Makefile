# Makefile for LESS files

CSSFILES=reset.css

LESSFILES= \
	util.less \
	color.less \
	typography.less \
	pane.less \
	frame.less \
	list.less \
	icon.less \
	button.less \
	code.less \
	rule.less \
	pattern.less

all: styleboard.css

styleboard.css: $(LESSFILES) $(CSSFILES)

%.css: %.less
	lessc $< > $@
