ntfserver
=========

ntfserver is a centralized server for collecting and displaying
[ntfd](https://github.com/silas/ntfd) data.

### Requirements

  * [node](http://nodejs.org/) >= 0.4
  * [npm](http://npmjs.org/)
  * [mysql](http://www.mysql.com/) >= 5.0.77
  * [redis](http://redis.io/) >= 2.2.12

### Developer Tips & Tricks

Post test suite results

    curl \
        -H 'Content-Type: application/json' \
        -d @./test/assets/suite.json \
        http://127.0.0.1:8000/suite/result

### License

This work is licensed under the MIT License (see the LICENSE file).
