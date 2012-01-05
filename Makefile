JQUERY_VERSION="1.7.1"
RICKSHAW_VERSION="master"

TAG=$(shell git tag | sort --version-sort | tail -n 1)

build: clean deps
	git archive --format=tar --prefix="ntfd-$(TAG)/" "$(TAG)" > "ntfd-$(TAG).tar"
	tar -xf "ntfd-$(TAG).tar"
	rm -f "ntfd-$(TAG).tar"
	cp deps/rickshaw/rickshaw.min.css "ntfd-$(TAG)/static/"
	cp deps/rickshaw/rickshaw.min.js "ntfd-$(TAG)/static/"
	cp deps/jquery.min.js "ntfd-$(TAG)/static/"
	tar -czf "ntfd-$(TAG).tgz" "ntfd-$(TAG)/"
	rm -fr "ntfd-$(TAG)"

deps:
	mkdir -p deps
	# rickshaw
	git clone git://github.com/shutterstock/rickshaw.git deps/rickshaw
	cd deps/rickshaw && git checkout $(RICKSHAW_VERSION) && make build
	# jquery
	curl http://ajax.googleapis.com/ajax/libs/jquery/$(JQUERY_VERSION)/jquery.min.js > deps/jquery.min.js

dev: deps
	cp -f deps/rickshaw/rickshaw.min.css static/
	cp -f deps/rickshaw/rickshaw.min.js static/
	cp -f deps/jquery.min.js static/

clean:
	rm -fr deps static/*.min.*

.PHONY: build clean dev
