JQUERY_VERSION=1.7.1
RICKSHAW_VERSION=3d43dc0fb263c7eee7bfc6020d8b7fd99637c1ab
TAG=$(shell git tag | PATH="/usr/local/opt/coreutils/libexec/gnubin:$(PATH)" sort --version-sort | tail -n 1)

build: clean static_setup
	git archive --format=tar --prefix="ntfserver-$(TAG)/" "$(TAG)" > "ntfserver-$(TAG).tar"
	tar -xf "ntfserver-$(TAG).tar"
	rm -f "ntfserver-$(TAG).tar"
	cp deps/vendor.css "ntfserver-$(TAG)/static/vendor.css"
	cp deps/vendor.js "ntfserver-$(TAG)/static/vendor.js"
	tar -czf "ntfserver-$(TAG).tgz" "ntfserver-$(TAG)/"
	rm -fr "ntfserver-$(TAG)"

static_setup:
	rm -fr deps
	mkdir -p deps
	# get jquery
	curl -s http://ajax.googleapis.com/ajax/libs/jquery/$(JQUERY_VERSION)/jquery.min.js > deps/jquery.min.js
	# get bootstrap
	curl -s http://twitter.github.io/bootstrap/assets/bootstrap.zip -o deps/bootstrap.zip
	cd deps && unzip bootstrap.zip
	# get d3
	curl -s https://raw.github.com/shutterstock/rickshaw/$(RICKSHAW_VERSION)/vendor/d3.min.js > deps/d3.min.js
	curl -s https://raw.github.com/shutterstock/rickshaw/$(RICKSHAW_VERSION)/vendor/d3.layout.min.js > deps/d3.layout.min.js
	# get rickshaw
	git clone git://github.com/shutterstock/rickshaw.git deps/rickshaw
	cd deps/rickshaw && git checkout $(RICKSHAW_VERSION) && make build
	# get swig
	curl -s http://paularmstrong.github.com/swig/js/swig.pack.min.js > deps/swig.min.js
	# build css
	cat deps/rickshaw/rickshaw.min.css > deps/vendor.css
	echo >> deps/vendor.css
	cat deps/bootstrap/css/bootstrap.min.css >> deps/vendor.css
	# build js
	cat deps/jquery.min.js > deps/vendor.js
	echo >> deps/vendor.js
	cat deps/swig.min.js >> deps/vendor.js
	echo >> deps/vendor.js
	cat deps/bootstrap/js/bootstrap.min.js >> deps/vendor.js
	echo >> deps/vendor.js
	cat deps/d3.min.js >> deps/vendor.js
	echo >> deps/vendor.js
	cat deps/d3.layout.min.js >> deps/vendor.js
	echo >> deps/vendor.js
	cat deps/rickshaw/rickshaw.min.js >> deps/vendor.js
	# copy to static
	mkdir -p static
	cp -f deps/vendor.css static/vendor.css
	cp -f deps/vendor.js static/vendor.js

static: static_setup
	rm -fr deps

clean:
	rm -fr deps static/vendor.*

.PHONY: build clean static static_setup
