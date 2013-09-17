# Makefile for LESS files

CSSFILES=reset.css

LESSFILES= \
	code.less \
	list.less \
	pattern.less \
	palette.less \
	pane.less \
	typography.less \
	util.less

all: styleboard.css

styleboard.css: $(LESSFILES) $(CSSFILES)

%.css: %.less
	lessc $< > $@
