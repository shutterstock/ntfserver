var ntf = require('ntf')
  , test = ntf.http.test(exports, 'https://github.com')

test.get('ntf', '/silas/ntf', function(test, res) {
  test.statusCode(res, 200)
  test.hasContent(res, 'ntf')
  test.done()
})

test.get('ntfd', '/silas/ntfd', function(test, res) {
  test.statusCode(res, 200)
  test.hasContent(res, 'ntfd')
  test.done()
})
