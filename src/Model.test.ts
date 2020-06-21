import * as assert from 'assert';
import moment from 'moment';
import { TimeValue, CalculatorTimeFormat } from './Model';

describe('TimeValue', () => {
    const duration0 = moment.duration(0, 'ms');
    const duration1sec = moment.duration(1, 's');
    const duration1min = moment.duration(1, 'm');
    const timeValueHoursMinutes = (displayValue: string) => new TimeValue(displayValue, CalculatorTimeFormat.HoursAndMinutes);
    const timeValueWithSeconds = (displayValue: string) => new TimeValue(displayValue, CalculatorTimeFormat.HoursMinutesAndSeconds);
    const assertStringEqual = (actual: TimeValue, expected: moment.Duration) => assert.equal(actual.value.toISOString(), expected.toISOString());
    describe('constructor for hours and minutes', () => {
        it('should parse blank display to duration 0', () => {
            assertStringEqual(timeValueHoursMinutes(''), duration0);
        });
        it('should parse "01" as one minute', () => {
            assertStringEqual(timeValueHoursMinutes('01'), duration1min);
        })
        it('should parse "1" as one minute', () => {
            assertStringEqual(timeValueHoursMinutes('1'), duration1min);
        });
        it('should parse "01:01" as one hour and one minute', () => {
            assertStringEqual(timeValueHoursMinutes('01:01'), moment.duration(1, "h").add(1, "m"));
        });
        it('should parse "60" as 1 hour', () => {
            assertStringEqual(timeValueHoursMinutes('60'), moment.duration(1, 'h'));
        });
        it('should parse "24:00" as 24 hours', () => {
            assertStringEqual(timeValueHoursMinutes('24:00'),  moment.duration(24, 'h'));
        });
        it('should parse "24:10" as 24 hours and ten minutes', () => {
            assertStringEqual(timeValueHoursMinutes('24:10'),  moment.duration(24, 'h').add(10, 'm'));
        });
        it('should parse "124:10" as 124 hours and ten minutes', () => {
            assertStringEqual(timeValueHoursMinutes('124:10'),  moment.duration(124, 'h').add(10, 'm'));
        });
    });
    describe('constructor for hours, minutes and seconds', () => {
        it('should parse blank display to duration 0', () => {
            assertStringEqual(timeValueWithSeconds(''), duration0);
        });
        it('should parse "01" as one second', () => {
            assertStringEqual(timeValueWithSeconds('01'), duration1sec);
        });
        it('should parse "1" as one second', () => {
            assertStringEqual(timeValueWithSeconds('1'), duration1sec);
        });
        it('should parse "01:01" as one minute and one second', () => {
            assertStringEqual(timeValueWithSeconds('01:01'), moment.duration(1, 'm').add(1, 's'));
        });
        it('should parse "60:00" as 1 hour', () => {
            assertStringEqual(timeValueWithSeconds('60:00'), moment.duration(1, 'h'));
        });
        it('should parse "120:10" as two hours and ten seconds', () => {
            assertStringEqual(timeValueWithSeconds('120:10'), moment.duration(2, 'h').add(10, 's'));
        });
        it('should parse "24:60:60" as 25 hours and one minute', () => {
            assertStringEqual(timeValueWithSeconds('24:60:60'), moment.duration(25, 'h').add(1, 'm'));
        });
        it('should parse "20:04:34" as 20 hours, four minutes and 34 seconds', () => {
            assertStringEqual(timeValueWithSeconds('20:04:34'), moment.duration(20, 'h').add(4, 'm').add(34, 's'));
        });
    });
});
