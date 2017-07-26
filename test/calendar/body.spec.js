/**
 * @fileoverview Calendar body spec
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */
'use strict';

var $ = require('jquery');

var Body = require('../../src/js/calendar/body');

describe('Calendar - Body', function() {
    var body;
    var $container = $('<div></div>');

    beforeEach(function() {
        body = new Body($container, {language: 'en'});
    });

    afterEach(function() {
        body.destroy();
    });

    it('"changeLanguage" should change each layer\'s language', function() {
        spyOn(body._dateLayer, 'changeLanguage');
        spyOn(body._monthLayer, 'changeLanguage');
        spyOn(body._yearLayer, 'changeLanguage');

        body.changeLanguage('ko');
        expect(body._dateLayer.changeLanguage).toHaveBeenCalledWith('ko');
        expect(body._monthLayer.changeLanguage).toHaveBeenCalledWith('ko');
        expect(body._yearLayer.changeLanguage).toHaveBeenCalledWith('ko');
    });

    it('"render" should remove prevLayer and render matched layer', function() {
        body.render(new Date(), 'date');

        spyOn(body._dateLayer, 'remove').and.callThrough();
        spyOn(body._monthLayer, 'render').and.callThrough();

        body.render(new Date(), 'month');

        expect(body._dateLayer.remove).toHaveBeenCalled();
        expect(body._monthLayer.render).toHaveBeenCalled();
    });

    it('"getDateElements" should return date jquery elements', function() {
        var $dateElements;

        body.render(new Date(2016, 0), 'month');

        $dateElements = body.getDateElements();

        expect($dateElements.length).toBe(12);
        expect($dateElements.jquery).toBeTruthy();
    });
});
