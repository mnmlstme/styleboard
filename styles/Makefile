# Makefile for LESS files

LESSFILES=palette.less pane.less lists.less code.less

all: styleboard.css

styleboard.css: $(LESSFILES)

%.css: %.less
	lessc $< > $@
