BOOTSTRAP_VERSION="1.4.0"
JQUERY_VERSION="1.7.1"
RICKSHAW_VERSION="master"

TAG=$(shell git tag | sort --version-sort | tail -n 1)

build: clean deps
	git archive --format=tar --prefix="ntfd-$(TAG)/" "$(TAG)" > "ntfd-$(TAG).tar"
	tar -xf "ntfd-$(TAG).tar"
	rm -f "ntfd-$(TAG).tar"
	cp deps/vendor.css "ntfd-$(TAG)/static/vendor.css"
	cp deps/vendor.js "ntfd-$(TAG)/static/vendor.js"
	tar -czf "ntfd-$(TAG).tgz" "ntfd-$(TAG)/"
	rm -fr "ntfd-$(TAG)"

deps:
	mkdir -p deps
	# get bootstrap
	curl -s http://twitter.github.com/bootstrap/$(BOOTSTRAP_VERSION)/bootstrap.min.css > deps/bootstrap.min.css
	# get d3
	curl https://raw.github.com/mbostock/d3/gh-pages/d3.min.js > deps/d3.min.js
	curl https://raw.github.com/mbostock/d3/gh-pages/d3.layout.min.js > deps/d3.layout.min.js
	# get jquery
	curl http://ajax.googleapis.com/ajax/libs/jquery/$(JQUERY_VERSION)/jquery.min.js > deps/jquery.min.js
	# get rickshaw
	git clone git://github.com/shutterstock/rickshaw.git deps/rickshaw
	cd deps/rickshaw && git checkout $(RICKSHAW_VERSION) && make build
	# build css
	cat deps/rickshaw/rickshaw.min.css > deps/vendor.css
	echo >> deps/vendor.css
	cat deps/bootstrap.min.css >> deps/vendor.css
	# build js
	cat deps/jquery.min.js > deps/vendor.js
	echo >> deps/vendor.js
	cat deps/d3.min.js >> deps/vendor.js
	echo >> deps/vendor.js
	cat deps/d3.layout.min.js >> deps/vendor.js
	echo >> deps/vendor.js
	cat deps/rickshaw/rickshaw.min.js >> deps/vendor.js

dev: deps
	cp deps/vendor.css static/vendor.css
	cp deps/vendor.js static/vendor.js

clean:
	rm -fr deps static/vendor.*

.PHONY: build clean dev
