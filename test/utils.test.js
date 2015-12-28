/**
 * Created by nhnent on 2015. 12. 27..
 */
'use strict';

var utils = require('../src/utils');
describe('search', function() {
    var search = utils.search;

    it('found first', function() {
        expect(search([1, 2, 3], 1)).toEqual({
            found: true,
            index: 0
        });
    });
    it('notfound first', function() {
        expect(search([1, 2, 3], -1)).toEqual({
            found: false,
            index: 0
        });
    });
    it('found middle', function() {
        expect(search([1, 2, 3], 2)).toEqual({
            found: true,
            index: 1
        });
    });
    it('notfound middle', function() {
        expect(search([1, 2, 3], 1.5)).toEqual({
            found: false,
            index: 1
        });
    });
    it('found end', function() {
        expect(search([1, 2, 3], 3)).toEqual({
            found: true,
            index: 2
        });
    });
    it('notfound end', function() {
        expect(search([1, 2, 3], 4)).toEqual({
            found: false,
            index: 3
        });
    });
});
