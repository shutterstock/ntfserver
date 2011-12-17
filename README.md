ntfd
====

ntfd is daemon for continuously running [ntf](https://github.com/silas/ntf)
tests.

### Requirements

  * [node](http://nodejs.org/)
  * [npm](http://npmjs.org/)
  * [redis](http://redis.io/)

### Usage

    # install library
    npm install -g ntfd

    # create config file
    cat << EOF > ntfd.conf
    [http]
    port = 8000
    secret = changeme

    [test]
    module = ntfd
    timeout = 60
    EOF

    # run daemon
    ntfd -c ntfd.conf

Open [localhost:8000/test](http://localhost:8000/test) in your browser.

### License

This work is licensed under the MIT License (see the LICENSE file).
