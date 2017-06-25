'use strict';

var fs = require('fs');
var https = require('https');
var concat = require('concat-stream');
var bail = require('bail');
var unified = require('unified');
var html = require('rehype-parse');
var selectAll = require('hast-util-select').selectAll;
var toString = require('hast-util-to-string');
var list = require('./');

var proc = unified().use(html);

var count = 0;

function done() {
  count++;

  if (count === 3) {
    fs.writeFile('index.json', JSON.stringify(list.sort(), 0, 2) + '\n', bail);
  }
}

/* Crawl MathMl 1.0. */
https.get('https://www.w3.org/TR/1998/REC-MathML-19980407/appendixF.html', function (res) {
  res.pipe(concat(onconcat)).on('error', bail);

  function onconcat(buf) {
    selectAll('ul ul ul ul a', proc.parse(buf)).forEach(each);

    done();

    function each(node) {
      var data = toString(node.children[0]);

      data = data.slice(data.indexOf('<') + 1, data.indexOf('>'));

      if (data.charAt(data.length - 1) === '/') {
        data = data.slice(0, -1);
      }

      if (list.indexOf(data) === -1) {
        list.push(data);
      }
    }
  }
});

/* Crawl MathMl 2.0. */
https.get('https://www.w3.org/TR/MathML2/appendixl.html', function (res) {
  res.pipe(concat(onconcat)).on('error', bail);

  function onconcat(buf) {
    selectAll('.div1 .div2:first-child dl dt', proc.parse(buf)).forEach(each);

    done();

    function each(node) {
      var data = toString(node);

      if (list.indexOf(data) === -1) {
        list.push(data);
      }
    }
  }
});

/* Crawl MathMl 3.0. */
https.get('https://www.w3.org/TR/MathML3/appendixi.html', function (res) {
  res.pipe(concat(onconcat)).on('error', bail);

  function onconcat(buf) {
    selectAll('.div1 .div2:first-child dl dt', proc.parse(buf)).forEach(each);

    done();

    function each(node) {
      var data = toString(node);

      if (list.indexOf(data) === -1) {
        list.push(data);
      }
    }
  }
});
