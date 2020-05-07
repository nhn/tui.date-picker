import DatePicker, { CalendarType } from 'tui-date-picker';

/**
 * DatePicker
 */

const container =
  document.getElementById('container') || document.createElement('div') || '#container';

const openCloseEvents = {
  open: () => alert('open'),
  close: () => alert('close')
};

const datePicker = new DatePicker('#container', {
  date: new Date(),
  type: 'date',
  language: 'ko',
  timePicker: true,
  calendar: {
    showToday: false
  },
  input: {
    element: '#datepicker-input',
    format: 'yyyy-MM-dd'
  },
  selectableRanges: [
    [1427814000000, 1490972400000],
    [new Date(2013, 7, 1), new Date(2019, 3, 1)]
  ],
  openers: ['.toggle-date-picker'],
  showAlways: true,
  autoClose: false
});

const datePicker2 = new DatePicker(container, {
  date: 1588756193860,
  type: 'month',
  language: 'en',
  timePicker: {
    initialHour: 3,
    initialMinute: 15,
    inputType: 'spinbox',
    showMeridiem: false
  },
  input: {
    element: '#datepicker-input',
    format: 'yyyy-mm-dd'
  },
  openers: ['.toggle-date-picker']
});

const datePicker3 = new DatePicker(container);

DatePicker.localeTexts['Chinese character'] = {
  titles: {
    DD: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    D: ['日', '月', '火', '水', '木', '金', '土'],
    MMM: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    MMMM: [
      '一月',
      '二月',
      '三月',
      '四月',
      '五月',
      '六月',
      '七月',
      '八月',
      '九月',
      '十月',
      '十一月',
      '十二月'
    ]
  },
  titleFormat: 'yyyy年 MMM',
  todayFormat: 'yyyy年 MMM d日 (DD)'
};

datePicker.addCssClass('green');
datePicker.addOpener(document.getElementById('opener') || '#opener');
datePicker.addRange(new Date(2013, 7, 1), new Date(2019, 3, 1));
datePicker.addRange(1427814000000, 1490972400000);
datePicker.changeLanguage('Chinese character');
datePicker.close();
datePicker.disable();
datePicker.drawLowerCalendar();
datePicker.drawLowerCalendar(new Date());
datePicker.drawUpperCalendar();
datePicker.drawUpperCalendar(new Date());
datePicker.enable();
datePicker.findOverlappedRange(new Date(2013, 7, 1), new Date(2019, 3, 1));
datePicker.findOverlappedRange(1427814000000, 1490972400000);
datePicker.getCalendarType();
datePicker.getDate();
datePicker.getDateElements();
datePicker.getLocaleText();
datePicker.getTimePicker();
datePicker.getType();
datePicker.isDisabled();
datePicker.isOpened();
datePicker.isSelectable(new Date(2015, 1, 1));
datePicker.isSelected(new Date(2015, 1, 1));
datePicker.open();
datePicker.removeAllOpeners();
datePicker.removeCssClass('green');
datePicker.removeOpener(document.getElementById('opener') || '#opener');
datePicker.removeRange(new Date(2013, 7, 1), new Date(2019, 3, 1));
datePicker.removeRange(new Date(2013, 7, 1), new Date(2019, 3, 1), 'year');
datePicker.removeRange(1427814000000, 1490972400000, null);
datePicker.setDate(new Date());
datePicker.setDateFormat('yy/MM/dd');
datePicker.setInput(document.getElementById('other-input') || '#other-input', {
  format: 'yyyy-mm-dd',
  syncFromInput: true
});
datePicker.setNull();
datePicker.setRanges([
  [1427814000000, 1490972400000],
  [new Date(2017, 0, 1), new Date(2018, 0, 2)],
  [new Date(2015, 2, 3), new Date(2016, 4, 2)]
]);
datePicker.setType('year');
datePicker.toggle();
datePicker.on('change', function() {
  console.log(`Selected date: ${datePicker.getDate()}`);
});
datePicker.on({
  open: () => alert('open'),
  close: () => alert('close'),
  draw: ({
    date,
    type,
    dateElements
  }: {
    date: Date;
    type: CalendarType;
    dateElements: HTMLElement[];
  }) => {
    console.log(`Draw the ${type} calendar and its date is ${date}.`);
    console.log(dateElements);
  }
});
datePicker.off('change');
datePicker.off(openCloseEvents);
datePicker.off();
datePicker.destroy();

/**
 * Calendar
 */

const calendar = DatePicker.createCalendar('#calendar-wrapper', {
  date: new Date(2018, 0, 2),
  type: 'year',
  language: 'Chinese character',
  showToday: false,
  showJumpButtons: false
});

const calendar2 = datePicker.getCalendar();

const drawEvent = {
  draw: ({
    date,
    type,
    dateElements
  }: {
    date: Date;
    type: CalendarType;
    dateElements: HTMLElement[];
  }) => {
    console.log(`Draw the ${type} calendar and its date is ${date}.`);
    console.log(dateElements);
  }
};

calendar.addCssClass('blue');
calendar.changeLanguage('ko');
calendar.draw({
  date: new Date(),
  type: 'date'
});
calendar.drawNext();
calendar.drawPrev();
calendar.getDate();
calendar.getDateElements();
calendar2.getNextDate();
calendar2.getNextYearDate();
calendar2.getPrevDate();
calendar2.getPrevYearDate();
calendar2.getType();
calendar2.hide();
calendar2.removeCssClass('blue');
calendar2.show();
calendar.on('draw', () => console.log('draw'));
calendar2.on(drawEvent);
calendar.off('draw');
calendar2.off(drawEvent);
calendar2.off();
calendar.destroy();

/**
 * DateRangePicker
 */

const changeEvents = {
  'change:start': () => alert('change:start'),
  'change:end': () => alert('change:end')
};

const rangePicker = DatePicker.createRangePicker({
  startpicker: {
    input: '#start-input',
    container: '#start-container',
    date: 1427814000000
  },
  endpicker: {
    input: '#end-input',
    container: '#end-container',
    date: new Date()
  },
  type: 'date',
  language: 'ko',
  timePicker: true,
  calendar: {
    showToday: false
  },
  format: 'yy-MM-dd',
  selectableRanges: [
    [1427814000000, 1490972400000],
    [new Date(2017, 0, 1), new Date(2018, 0, 2)]
  ],
  showAlways: true,
  autoClose: false
});

const rangePicker2 = DatePicker.createRangePicker({
  startpicker: {
    input: '#start-input2',
    container: '#start-container2'
  },
  endpicker: {
    input: '#end-input2',
    container: '#end-container2'
  }
});

rangePicker.addRange(new Date(2013, 7, 1), new Date(2019, 3, 1));
rangePicker.addRange(1427814000000, 1490972400000);
rangePicker.changeLanguage('Chinese character');
rangePicker.getEndDate();
rangePicker.getStartDate();
rangePicker.removeRange(new Date(2013, 7, 1), new Date(2019, 3, 1));
rangePicker.removeRange(new Date(2013, 7, 1), new Date(2019, 3, 1), 'year');
rangePicker.removeRange(1427814000000, 1490972400000, null);
rangePicker.setEndDate(new Date());
rangePicker.setRanges([
  [1427814000000, 1490972400000],
  [new Date(2017, 0, 1), new Date(2018, 0, 2)]
]);
rangePicker.setStartDate(new Date());
rangePicker.on('change:start', () => console.log('change:start'));
rangePicker.on(changeEvents);
rangePicker.off('change:start');
rangePicker.off(changeEvents);
rangePicker.off();
rangePicker.destroy();

const startPicker = rangePicker.getStartpicker();
const endPicker = rangePicker.getEndpicker();

startPicker.open();
endPicker.close();
