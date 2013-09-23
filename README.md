ntfserver
=========

ntfserver is a centralized server for collecting and displaying
[ntfd](https://github.com/shutterstock/ntfd) data.

### Requirements

  * [node](http://nodejs.org/)
  * [npm](http://npmjs.org/)
  * [mysql](http://www.mysql.com/)
  * [redis](http://redis.io/)

### Developer Tips & Tricks

 * Store test results

        curl \
            -H 'Content-Type: application/json' \
            -d @./test/assets/suite.json \
            http://127.0.0.1:8000/store

### License

This work is licensed under the MIT License (see the LICENSE file).
