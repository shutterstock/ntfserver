ntfserver
=========

ntfserver is a centralized server for collecting and displaying [ntfd](https://github.com/shutterstock/ntfd) data.

It's part of [ntf](https://github.com/shutterstock/ntf), a network testing framework.

### Requirements

  * [node](http://nodejs.org/)
  * [npm](http://npmjs.org/)
  * [mysql](http://www.mysql.com/)
  * [redis](http://redis.io/)

### Getting Started

* Start mysql/mariadb
* Create an 'ntf' database

    create database 'ntf';

* Create a database user that has create table and select/insert/udpate/delete privileges
* Start redis
* Start ntfserver

    ./bin/ntfserver --mysql-user=ntf-user --mysql-password='password' # see lib/index.js for other command-line options

* Visit the dashboard at [http://127.0.0.1:8000/](http://127.0.0.1:8000/)

### Developer Tips & Tricks

 * Store test results

        curl \
            -H 'Content-Type: application/json' \
            -d @./test/assets/suite.json \
            http://127.0.0.1:8000/store

### License

This work is licensed under the MIT License (see the LICENSE file).
