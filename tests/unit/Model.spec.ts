import * as assert from 'chai';
import moment from 'moment';
import { TimeValue, CalculatorTimeFormat, Operations, Operator, Calculation } from '../../src/Model';

describe('TimeValue', () => {
    const duration0 = moment.duration(0, 'ms');
    const duration1sec = moment.duration(1, 's');
    const duration1min = moment.duration(1, 'm');
    const timeValueHoursMinutes = (displayValue: string) => new TimeValue(displayValue, CalculatorTimeFormat.HoursAndMinutes);
    const timeValueWithSeconds = (displayValue: string) => new TimeValue(displayValue, CalculatorTimeFormat.HoursMinutesAndSeconds);
    const assertStringEqual = (actual: TimeValue, expected: moment.Duration) => assert.expect(actual.value.toISOString()).to.equal(expected.toISOString());
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
    describe('changeTimeFormat to HoursMinutesAndSeconds', () => {
        it('should keep value for both hours and minutes', () => {
            const existingValue = new TimeValue('20:50', CalculatorTimeFormat.HoursAndMinutes);
            const expectedResult = moment.duration(20, 'h').add(50, 'm');
            existingValue.changeTimeFormat(CalculatorTimeFormat.HoursMinutesAndSeconds);
            assertStringEqual(existingValue, expectedResult);
        });
    });
    describe('changeTimeFormat to HourAndMinutes', () => {
        it('should keep value for both hours and minutes', () => {
            const existingValue = new TimeValue('20:50:00', CalculatorTimeFormat.HoursMinutesAndSeconds);
            const expectedResult = moment.duration(20, 'h').add(50, 'm');
            existingValue.changeTimeFormat(CalculatorTimeFormat.HoursAndMinutes);
            assertStringEqual(existingValue, expectedResult);
        });
        it('should drop seconds but keep hours and minutes', () => {
            const existingValue = new TimeValue('20:50:10', CalculatorTimeFormat.HoursMinutesAndSeconds);
            const expectedResult = moment.duration(20, 'h').add(50, 'm');
            existingValue.changeTimeFormat(CalculatorTimeFormat.HoursAndMinutes);
            assertStringEqual(existingValue, expectedResult);
        })
    });
});

describe('Operator', () => {
    describe('constructor for string should parse to Operations', () => {
        it('should parse "+" to add', () => {
            assert.expect(new Operator('+').op).to.equal(Operations.add);
        });
        it('should parse "-" to subtract', () => {
            assert.expect(new Operator('-').op).to.equal(Operations.substract);
        })
        it('should throw Operator {op} not supported on any other string', () => {
            assert.expect(() => new Operator('=')).to.throw("Operator '=' not supported.");
        });
    });
});

describe('Calculation', () => {
    const createCalculationHoursAndMinutes = (parts: Array<string>) => {
        const calc = new Calculation();
        for(let partIndex = 0; partIndex < parts.length; partIndex++) {
            if (partIndex % 2 === 1) {
                calc.push(new Operator(parts[partIndex]));
            } else {
                calc.push(new TimeValue(parts[partIndex], CalculatorTimeFormat.HoursAndMinutes));
            }
        }
        return calc;
    };
    const assertStringEqual = (actual: string, expected: moment.Duration) => assert.expect(actual).to.equal(expected.toISOString());
    describe('calculate for add operations', () => {
        it('should add two minute values like "05 + 06 = 11"', () => {
            const expected = moment.duration(11, 'm');
            const calculation = createCalculationHoursAndMinutes(['05', '+', '06']);
            const actual = calculation.calculate();
            assertStringEqual(actual, expected);
        });
        it('should add two hour and minute values like "10:20 + 10:40 = 21:00"', () => {
            const expected = moment.duration(21, 'h');
            const calculation = createCalculationHoursAndMinutes(['10:20', '+', '10:40']);
            const actual = calculation.calculate();
            assertStringEqual(actual, expected);
        });
        it('should add three values like "10:15 + 15 + 20:00 = 30:30"', () => {
            const expected = moment.duration(30, 'h').add(30, 'm');
            const calculation = createCalculationHoursAndMinutes(['10:15', '+', '15', '+', '20:00']);
            const actual = calculation.calculate();
            assertStringEqual(actual, expected);
        });
    });
    describe('calculate for subtract operations', () => {
        it('should subtract to minute values like "11 - 05 = 6"', () => {
            const expected = moment.duration(6, 'm');
            const calculation = createCalculationHoursAndMinutes(['11', '-', '05']);
            const actual = calculation.calculate();
            assertStringEqual(actual, expected);
        });
        it('should subtract two hour and minute values like "21:00 - 10:20 = 10:40"', () => {
            const expected = moment.duration(10, 'h').add(40, 'm');
            const calculation = createCalculationHoursAndMinutes(['21:00', '-', '10:20']);
            const actual = calculation.calculate();
            assertStringEqual(actual, expected);
        });
        it('should subtract three values like "30:30 - 10:15 - 15 = 20:00"', () => {
            const expected = moment.duration(20, 'h');
            const calculation = createCalculationHoursAndMinutes(['30:30', '-', '10:15', '-', '15']);
            const actual = calculation.calculate();
            assertStringEqual(actual, expected);
        });
    });
});