// main.js
$(document).ready(function() {
  'use strict';

  // comparing with == generates a warning
  if ('testing' === 'testing') {
    console.log($);
  }

});

function add(num1, num2) {
  'use strict';
  return num1 + num2;
}
