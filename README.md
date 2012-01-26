ntfserver
=========

This is a centralized server for collecting ntfd data.

### Developer Tips & Tricks

Post test suite results

    curl \
        -H 'Content-Type: application/json' \
        -d @./test/assets/suite.json \
        http://127.0.0.1:8000/suite

### License

This work is licensed under the MIT License (see the LICENSE file).
