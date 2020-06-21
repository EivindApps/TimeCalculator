import moment from 'moment';
import { CalculatorTimeFormat, Calculation, Operations, TimeValue, Operator } from "./Model";
import { threadId } from 'worker_threads';

export class CalculatorViewModel {
    private _overwriteDisplay: boolean = false;
    private _hasPressedNumber: boolean = false;
    private _separatorSetExplicitly: boolean = false;

    public CalculatorType: CalculatorTimeFormat = CalculatorTimeFormat.HoursAndMinutes;

    private _currentCalculation: Calculation = new Calculation();
    public get CurrentCalculation(): string { return this._currentCalculation.toString(); }

    public CalculatorDisplay: string = '';

    private changeTimeFormat(timeFormat: CalculatorTimeFormat): void {
        this.CalculatorType = timeFormat;
        this._currentCalculation.changeTimeFormat(timeFormat);

        if (this.CalculatorDisplay !== '') {
            if (timeFormat === CalculatorTimeFormat.HoursAndMinutes) {
                // Remove seconds part of the current display
                const parts = this.CalculatorDisplay.split(':');

                if (parts.length === 3) {
                    this.CalculatorDisplay = this.CalculatorDisplay.substr(0, this.CalculatorDisplay.lastIndexOf(':'));
                }
            } else {
                if (this._overwriteDisplay === true) {
                    // Add seconds part to the current display
                    this.CalculatorDisplay += ':00';
                }
            }
        }
    }

    private numberPressed(value: number): void {
        if (this._overwriteDisplay === true) {
            this.CalculatorDisplay = '';
            this._overwriteDisplay = false;
        }

        if (this.CalculatorDisplay !== '') {
            const isNegated = this.CalculatorDisplay.startsWith('-');

            if (this.CalculatorType === CalculatorTimeFormat.HoursAndMinutes) {
                this.numberPressedInHoursAndMinutesMode(isNegated, value);
            } else {
                this.numberPressedInSecondsMode(isNegated, value);
            }
        } else {
            this.CalculatorDisplay = value.toString();
        }

        this._hasPressedNumber = true;
    }

    private numberPressedInHoursAndMinutesMode(isNegated: boolean, value: number): void {
        if (this._separatorSetExplicitly === true) {
            const parts = this.CalculatorDisplay.split(':');

            if (parts.length === 2 && parts[1].length >= 2) {
                return;  // Cannot have more than two digits representing minutes
            }

            this.CalculatorDisplay += value.toString();
        } else {
            let temp = this.CalculatorDisplay.replace(':', '') + value.toString();
            temp = temp.replace('-', '');
            let hoursPart = '', minutesPart = '';

            if (temp.length > 2) {
                hoursPart = temp.substr(0, temp.length - 2);
                minutesPart = temp.substr(temp.length - 2);
            } else {
                minutesPart = temp;
            }

            if (isNegated === true) {
                temp = '-';
            } else {
                temp = '';
            }

            if (hoursPart !== '') {
                temp += hoursPart + ':' + minutesPart;
            } else {
                temp += minutesPart;
            }

            this.CalculatorDisplay = temp;
        }
    }

    private numberPressedInSecondsMode(isNegated: boolean, value: number): void {
        if (this._separatorSetExplicitly === true) {
            const parts = this.CalculatorDisplay.split(':');

            if (parts.length === 3 && parts[2].length >= 2) {
                return;  // Cannot have more than two digits representing seconds
            } else if (parts.length === 2 && parts[1].length >= 2) {
                let temp = parts[0] + ':' + parts[1].substr(0, 2) + ':';

                if (parts[1].length > 2) {
                    temp += parts[1].substr(2);
                }

                temp += value.toString();
                this.CalculatorDisplay = temp;
            } else if (parts.length === 1 && parts[0].length >= 2) {
                let temp = parts[0].substr(0, 2) + ':';

                if (parts[0].length > 2) {
                    temp += parts[0].substr(2);
                }

                temp += value.toString();
                this.CalculatorDisplay = temp;
            } else {
                this.CalculatorDisplay += value.toString();
            }
        } else {
            let temp = this.CalculatorDisplay.replace(':', '') + value.toString();
            temp = temp.replace('-', '');
            let hoursPart =  '', minutesPart = '', secondsPart = '';

            if (temp.length > 4) {
                hoursPart = temp.substr(0, temp.length - 4);
                minutesPart = temp.substr(temp.length - 4, 2);
                secondsPart = temp.substr(temp.length - 2);
            } else if (temp.length > 2) {
                minutesPart = temp.substr(0, temp.length - 2);
                secondsPart = temp.substr(temp.length - 2);
            } else {
                secondsPart = temp;
            }

            if (isNegated === true) {
                temp = '-';
            } else {
                temp = '';
            }

            if (hoursPart !== '') {
                temp += hoursPart + ':' + minutesPart + ':' + secondsPart;
            } else if (minutesPart !== '') {
                temp += minutesPart + ':' + secondsPart;
            } else {
                temp += secondsPart;
            }

            this.CalculatorDisplay = temp;
        }
    }

    private separatorPressed(): void {
        if (this.CalculatorDisplay === '' || this._overwriteDisplay === true) {
            this.CalculatorDisplay = '0:';
        } else {
            if (this.CalculatorType === CalculatorTimeFormat.HoursAndMinutes) {
                this.CalculatorDisplay = this.CalculatorDisplay.replace(':', '') + ':';
            } else {
                const parts = this.CalculatorDisplay.split(':');

                if (parts.length === 1) {
                    this.CalculatorDisplay = parts[0] + ':';
                } else if (parts.length === 2) {
                    let temp = parts[0] + ':';

                    if (parts[1].length < 2) {
                        temp += '0' + parts[1];
                    } else {
                        temp += parts[1];
                    }

                    temp += ':';
                    this.CalculatorDisplay = temp;
                }
            }
        }

        this._separatorSetExplicitly = true;
        this._overwriteDisplay = false;
    }

    private calculate(op: Operations): void {
        if (op === Operations.add || op === Operations.substract) {
            this._currentCalculation.push(new TimeValue(this.CalculatorDisplay, this.CalculatorType));
            this._currentCalculation.push(new Operator(op));
            this.performCalculation();
        } else {
            if (this._hasPressedNumber === true) {
                this._currentCalculation.push(new TimeValue(this.CalculatorDisplay, this.CalculatorType));
            }

            this.performCalculation();
            this._currentCalculation = new Calculation();
        }

        this._hasPressedNumber = false;
    }

    private performCalculation(): void {
        const result = this._currentCalculation.calculate();
        this.CalculatorDisplay = this.formatCalculation(result);
        this._overwriteDisplay = true;
        this._separatorSetExplicitly = false;
    }

    private formatCalculation(value: moment.Duration): string {
        const isNeagtive = value.asMilliseconds() < 0;

        if (isNeagtive === true) {
            value = moment.duration(value.asMilliseconds() * -1);
        }

        function formatAsTwoDigits(str: string): string {
            if(str.length > 1) {
                return str;
            }

            return '0' + str;
        }

        if (this.CalculatorType === CalculatorTimeFormat.HoursAndMinutes) {
            return (isNeagtive ? '-' : '') + formatAsTwoDigits(value.asHours.toString()) + ':' + formatAsTwoDigits(value.minutes.toString());
        }

        return (isNeagtive ? '-' : '') + formatAsTwoDigits(value.asHours.toString()) + ':' + formatAsTwoDigits(value.minutes.toString() + ':' + formatAsTwoDigits(value.seconds.toString()));
    }

    //#region Keypad
    public num0(): void {
        this.numberPressed(0);
    }
    public num1(): void {
        this.numberPressed(1);
    }
    public num2(): void {
        this.numberPressed(2);
    }
    public num3(): void {
        this.numberPressed(3);
    }
    public num4(): void {
        this.numberPressed(4);
    }
    public num5(): void {
        this.numberPressed(5);
    }
    public num6(): void {
        this.numberPressed(6);
    }
    public num7(): void {
        this.numberPressed(7);
    }
    public num8(): void {
        this.numberPressed(8);
    }
    public num9(): void {
        this.numberPressed(9);
    }
    public separator(): void {
        this.separatorPressed();
    }
    public clearDisplay(): void {
        this.CalculatorDisplay = '';
        this._hasPressedNumber = false;
        this._overwriteDisplay = false;
        this._separatorSetExplicitly = false;
    }
    public clearAll(): void {
        this._currentCalculation = new Calculation();
        this.CalculatorDisplay = '';
        this._hasPressedNumber = false;
        this._overwriteDisplay = false;
        this._separatorSetExplicitly = false;
    }
    public backspace(): void {
        let temp = this.CalculatorDisplay;

        if (temp !== '') {
            if (temp.lastIndexOf(':') == (temp.length - 1)) {
                this._separatorSetExplicitly = false;
            }

            temp = temp.substr(0, temp.length - 1);

            // Don't leave a separator at the end
            if (temp.length > 0 && temp.lastIndexOf(':') == (temp.le - 1)) {
                this._separatorSetExplicitly = false;
                temp = temp.substr(0, temp.length - 1);
            }

            this.CalculatorDisplay = temp;
            this._overwriteDisplay = false;

            if (this.CalculatorDisplay === '') {
                this._hasPressedNumber = false;
            }
        }
    }
    public negate(): void {
        let temp = this.CalculatorDisplay;

        if (temp !== '') {
            if (temp.startsWith('-')) {
                temp = temp.substr(1);
            } else {
                temp = '-' + temp;
            }
        } else {
            temp = '-';
        }

        this.CalculatorDisplay = temp;
        this._overwriteDisplay = false;
        this._hasPressedNumber = true;
    }
    public plus(): void {
        this.calculate(Operations.add);
    }
    public minus(): void {
        this.calculate(Operations.substract);
    }
    public equal(): void {
        this.calculate(Operations.eq);
    }
    //#endregion
}