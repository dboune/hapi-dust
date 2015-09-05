var assert = require('assert')

var dust = require('../index')

var options = {baseDir: "test/templates"}

function registerPartial(name, path) {
  var fs = require('fs')
  var file = fs.readFileSync(path, { encoding: 'utf8' })
  dust.module.registerPartial(name, file)
}

registerPartial('_include', __dirname+'/templates/_include.dust')
registerPartial('_layout', __dirname+'/templates/_layout.dust')

assert(dust.module, 'module does not exist')
assert(dust.module.compile, 'compile does not exist')
assert.equal(dust.compileMode, 'async', 'compileMode not properly set')

dust.module.compile('hello {x}!', {}, function(err, fn) {
  assert(!err, 'compile resulted in error')
  assert.equal(typeof fn, 'function', 'compile result not a function')

  fn({ x: 'world' }, {}, function(err, str) {
    assert(!err, 'render resulted in error')
    assert.equal(str, 'hello world!', 'unexpected render result')
  })
})

// partials
dust.module.compile('hello {x}!{>_include /}', options, function(err, fn) {
  assert(!err, 'compile resulted in error')
  assert.equal(typeof fn, 'function', 'compile result not a function')

  fn({ x: 'world' }, {}, function(err, str) {
    assert(!err, 'render resulted in error')
    assert.equal(str, 'hello world!I am an include.', 'unexpected partial render result: ' + str)
  })
})

// layouts
dust.module.compile('{>_layout /}{<content}hello {x}!{/content}', options, function(err, fn) {
  assert(!err, 'compile resulted in error')
  assert.equal(typeof fn, 'function', 'compile result not a function')

  fn({ x: 'world' }, {}, function(err, str) {
    assert(!err, 'render resulted in error')
    assert.equal(str, 'I am a layout.hello world!', 'unexpected layout render result: ' + str)
  })
})

// stream
dust.module.compile('hello {x}!', {name: 'stream'}, function(err, fn) {
  assert(!err, 'compile resulted in error')
  assert.equal(typeof fn, 'function', 'compile result not a function')

  fn({ x: 'world' }, {stream: true, name: 'stream'}, function(err, str) {
    assert(!err, 'render resulted in error')
    var buf = '', finished
    str.on('data', function(data) {
      buf += data
    }).on('end', function() {
      if (!finished)
        assert.equal(buf, 'hello world!', 'unexpected render result')
      finished = true
    }).on('error', function(err) {
      finished = true
      throw err
    })
  })
})

// stream partials
dust.module.compile('hello {x}!{>_include /}', {baseDir: options.baseDir, name: 'include'}, function(err, fn) {
  assert(!err, 'compile resulted in error')
  assert.equal(typeof fn, 'function', 'compile result not a function')

  fn({ x: 'world' }, {stream: true, name: 'include'}, function(err, str) {
    assert(!err, 'render resulted in error')
    var buf = '', finished
    str.on('data', function(data) {
      buf += data
    }).on('end', function() {
      if (!finished)
        assert.equal(buf, 'hello world!I am an include.', 'unexpected partial render result: ' + buf)
      finished = true
    }).on('error', function(err) {
      finished = true
      throw err
    })
  })
})

// stream layouts
dust.module.compile('{>_layout /}{<content}hello {x}!{/content}', {baseDir: options.baseDir, name: 'layout'}, function(err, fn) {
  assert(!err, 'compile resulted in error')
  assert.equal(typeof fn, 'function', 'compile result not a function')

  fn({ x: 'world' }, {stream: true, name: 'layout'}, function(err, str) {
    assert(!err, 'render resulted in error')
    var buf = '', finished
    str.on('data', function(data) {
      buf += data
    }).on('end', function() {
      if (!finished)
        assert.equal(buf, 'I am a layout.hello world!', 'unexpected layout render result: ' + buf)
      finished = true
    }).on('error', function(err) {
      finished = true
      throw err
    })
  })
})
