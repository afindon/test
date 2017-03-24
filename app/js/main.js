// main.js
'use strict';

$(document).ready(function() {

  // comparing with == generates a warning
  if ('testing' === 'testing') {
    console.log($);
  }

});

function add(num1, num2) {
  return num1 + num2;
}
