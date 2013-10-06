/**
* Customized version of mocha xunit reporter based on originam mocha xunti reporter 
* xunit-file reporter. 
* Needs better documentation etc. 
*/
 
/**
* Module dependencies.
*/
 
var Base = require('./base')
  , utils = require('../utils')
  , escape = utils.escape
  //ZH-PRIDANE
  , fs = require('fs')
  , filePath = process.cwd() + '/xunit.xml'
  , fd = fs.openSync(filePath, 'w', 0755);
 
/**
* Save timer references to avoid Sinon interfering (see GH-237).
*/
 
var Date = global.Date
  , setTimeout = global.setTimeout
  , setInterval = global.setInterval
  , clearTimeout = global.clearTimeout
  , clearInterval = global.clearInterval;
 
/**
* Expose `XUnitZH`.
*/
 
exports = module.exports = XUnitZH;
 
/**
* Initialize a new `XUnitZH` reporter.
*
* @param {Runner} runner
* @api public
*/
 
function XUnitZH(runner) {
  Base.call(this, runner);
 
  var stats = this.stats
    , tests = []
    , self = this;
 
  runner.on('pass', function(test){
    test.state = 'passed';
    tests.push(test);
  });
 
  runner.on('fail', function(test){
    test.state = 'failed';
    tests.push(test);
  });
 
  runner.on('end', function(){
    console.log(tag('testsuite', {
        name: 'Mocha Tests'
      , tests: stats.tests
      , failures: stats.failures
      , errors: stats.failures
      , skipped: stats.tests - stats.failures - stats.passes
      , timestamp: (new Date).toUTCString()
      , time: stats.duration / 1000
    }, false));
 
    appendLine(tag('testsuite', {
        name: 'Mocha Tests'
      , tests: stats.tests
      , failures: stats.failures
      , errors: stats.failures
      , skip: stats.tests - stats.failures - stats.passes
      , timestamp: (new Date).toUTCString()
      , time: stats.duration / 1000
    }, false));
 
    tests.forEach(test);
    console.log('</testsuite>');
    appendLine('</testsuite>');
    fs.closeSync(fd);  
  });
}
 
/**
* Inherit from `Base.prototype`.
*/
 
XUnitZH.prototype.__proto__ = Base.prototype;
 
/**
* Output tag for the given `test.`
*/
 
function test(test) {
  //(ZH:1)
  var attrs = {
      classname: test.fullTitle()
 
    , name: test.title
    , time: test.duration / 1000
  };
 
  if ('failed' == test.state) {
    var err = test.err;
    attrs.message = escape(err.message);
    console.log(tag('testcase', attrs, false, tag('failure', attrs, false, cdata(err.stack))));
    appendLine(tag('testcase', attrs, false, tag('failure', { message: escape(err.message) }, false, cdata(err.stack))));
  } else if (test.pending) {
    console.log(tag('testcase', attrs, false, tag('skipped', {}, true)));
    appendLine(tag('testcase', attrs, false, tag('skipped', {}, true)));
  } else {
    console.log(tag('testcase', attrs, true) );
    appendLine(tag('testcase', attrs, true) );
  }
}
 
/**
* HTML tag helper.
*/
 
function tag(name, attrs, close, content) {
  var end = close ? '/>' : '>'
    , pairs = []
    , tag;
 
  for (var key in attrs) {
    pairs.push(key + '="' + escape(attrs[key]) + '"');
  }
 
  tag = '<' + name + (pairs.length ? ' ' + pairs.join(' ') : '') + end;
  if (content) tag += content + '</' + name + end;
  return tag;
}
 
/**
* Return cdata escaped CDATA `str`.
*/
 
function cdata(str) {
  return '<![CDATA[' + escape(str) + ']]>';
}
 
function appendLine(line) {
    fs.writeSync(fd, line + "\n", null, 'utf8');
}