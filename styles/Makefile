# Makefile for LESS files

CSSFILES=reset.css
LESSFILES=palette.less pane.less lists.less code.less

all: styleboard.css

styleboard.css: $(LESSFILES) $(CSSFILES)

%.css: %.less
	lessc $< > $@
