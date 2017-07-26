/**
 * @fileoverview Default locale texts
 * @author NHN Ent. FE Development Lab <dl_javascript@nhnent.com>
 */

'use strict';

module.exports = {
    en: {
        titles: {
            DD: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            D: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            MMM: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            MMMM: ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']
        },
        titleFormat: 'MMMM yyyy',
        todayFormat: 'To\\d\\ay: DD, MMMM d, yyyy',
        time: 'Time',
        date: 'Date'
    },
    ko: {
        titles: {
            DD: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
            D: ['일', '월', '화', '수', '목', '금', '토'],
            MMM: ['1월', '2월', '3월', '4월', '5월', '6월',
                '7월', '8월', '9월', '10월', '11월', '12월'],
            MMMM: ['1월', '2월', '3월', '4월', '5월', '6월',
                '7월', '8월', '9월', '10월', '11월', '12월']
        },
        titleFormat: 'yyyy.MM',
        todayFormat: '오늘: yyyy.MM.dd (D)',
        date: '날짜',
        time: '시간'
    }
};
