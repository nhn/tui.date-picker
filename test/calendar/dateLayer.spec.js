/**
 * @fileoverview Calendar date layer spec
 */
'use strict';

var DateLayer = require('../../src/js/calendar/layerBody/date');

describe('Calendar - date layer', function() {
  var dateLayer;

  it('should have a default value of 0', function() {
    dateLayer = new DateLayer('en');

    expect(dateLayer.weekStartDay).toBe(0);
  });

  it('should change start day of week', function() {
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function(day, index) {
      dateLayer = new DateLayer('en', day);

      expect(dateLayer.weekStartDay).toBe(index);
    });
  });
});
