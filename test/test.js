// test.js
describe('This test', function() {
  'use strict';
  it('should always return true', function() {
    expect(true).toBe(true);
  });
});

// test.js
describe('Add', function() {
  'use strict';
  it('should add two numbers together', function() {
    // 1 + 2 should = 3
    expect(add(1, 2)).toBe(3);
    // 3 + 6 should = 9
    expect(add(3, 6)).toBe(9);
  });
});
