/**
* Customized version of mocha xunit reporter.
* Based on original mocha xunit reporter and xunit-file reporter.
* Needs better documentation, licence, further customization options, etc.
* initial version
*/
 
  var fs = require('fs')
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
 
  var tests = [],
      passes = 0,
      failures = 0;
 
  runner.on('pass', function(test){
    test.state = 'passed';
    passes++;
    tests.push(test);
    test.number = tests.length;
  });
 
  runner.on('fail', function(test){
    test.state = 'failed';
    failures++;
    tests.push(test);
    test.number = tests.length;
  });
 
  runner.on('end', function(){
    console.log();
    console.log('testsuite: Mocha Tests'
              + ', tests: ' + tests.length
              + ', failures: ' + failures
              + ', errors: ' + failures
              + ', skipped: ' + (tests.length - failures - passes)
              + ', time: ' + 0
              );

    appendLine(tag('testsuite', {
        name: 'Mocha Tests'
      , tests: tests.length
      , failures: failures
      , errors: failures
      , skipped: tests.length - failures - passes
      , timestamp: (new Date).toUTCString()
      , time: 0
    }, false));
 
    tests.forEach(test);
    appendLine('</testsuite>');
    fs.closeSync(fd);
    process.exit(failures);  
  });
}
 
/**
* Output tag for the given `test.`
*/
 
function test(test) {
  var attrs = {
      classname: test.fullTitle()
 
    , name: test.title
    , time: test.duration ? (test.duration / 1000) : 0
  };
 
  if ('failed' == test.state) {
    var err = test.err;
    attrs.message = escape(err.message);
    toConsole( test.number, test.title, 'FAIL', err.stack);
    appendLine(tag('testcase', attrs, false, tag('failure', { message: escape(err.message) }, false, cdata(err.stack))));
  } else if (test.pending) {
    toConsole( test.number, test.title, 'SKIPPED', false);
    appendLine(tag('testcase', attrs, false, tag('skipped', {}, true)));
  } else {
    toConsole( test.number, test.title, 'OK', false);
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
* Output to console
*/

function toConsole(number, name, state, content){
  console.log(number + ') ' + state + ' ' + name);
  if (content) {
    console.log('\t' + content);
  }
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

function escape(html){
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

