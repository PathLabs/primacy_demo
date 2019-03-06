.PHONY: all install start clean

all: install

install:
	npm install

start:
	npm start

clean:
	rm -rf node_modules/
