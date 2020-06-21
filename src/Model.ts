import moment from 'moment';

export interface ICalculationPart {

}

export enum CalculatorTimeFormat {
    HoursAndMinutes,
    HoursMinutesAndSeconds
}

export class TimeValue implements ICalculationPart {
    private _timeFormat: CalculatorTimeFormat;
    public value: moment.Duration;

    constructor(value: moment.Duration | string, timeFormat: CalculatorTimeFormat) {
        this._timeFormat = timeFormat;

        if (typeof value === "string") {
            this.value = this.parseDurationFromString(value);
        } else {
            this.value = value;
        }
    }

    private parseDurationFromString(displayValue: string): moment.Duration {
        var hours, minutes, secods: number = 0;
        var isNegative: boolean = (displayValue !== "" && displayValue !== undefined && displayValue.substr(0, 1) === "-");

        if (displayValue !== undefined && displayValue !== "") {
            if (isNegative) displayValue = displayValue.substr(1);  // Parse only positive values

            if (displayValue.indexOf(":") !== -1) {
                var parts = displayValue.split(":");

                if (this._timeFormat === CalculatorTimeFormat.HoursAndMinutes) {
                    hours = parseInt(parts[0]);

                    if (parts[1] !== undefined && parts[1] !== "") {
                        minutes = parseInt(parts[1]);
                    }
                } else {
                    if (parts.length === 2) {
                        minutes = parseInt(parts[0]);

                        if (parts[1] !== undefined && parts[1] !== "") {
                            secods = parseInt(parts[1]);
                        }
                    } else if (parts.length === 3) {
                        hours = parseInt(parts[0]);

                        if (parts[1] !== undefined && parts[1] !== "") {
                            minutes = parseInt(parts[1]);
                        }

                        if (parts[2] !== undefined && parts[2] !== "") {
                            secods = parseInt(parts[2]);
                        }
                    }
                }
            } else {
                // no : separator
                if (this._timeFormat === CalculatorTimeFormat.HoursAndMinutes) {
                    minutes = parseInt(displayValue);
                } else {
                    secods = parseInt(displayValue);
                }
            }
        }

        var value = moment.duration(hours, "h").add(minutes, "m").add(secods, "s");
        return (isNegative ? moment.duration(value.asMilliseconds() * -1, "ms") : moment.duration(value.asMilliseconds()));
    }

    public changeTimeFormat(timeFormat: CalculatorTimeFormat) {
        this._timeFormat = timeFormat;

        if (timeFormat === CalculatorTimeFormat.HoursAndMinutes) {
            this.value = moment.duration(this.value.hours(), 'h').add(this.value.minutes(), 'm');
        }
    }
}

export enum Operations {
    add = 1,
    substract = 2,
    eq = 3
}

export class Operator implements ICalculationPart {
    public op: Operations;

    constructor(op: Operations | string) {
        if (typeof op === "string") {
            this.op = this.parseOperationFromString(op);
        } else {
            this.op = op;
        }
    }

    private parseOperationFromString(op: string): Operations {
        switch(op) {
            case '+':
                return Operations.add;
            case '-':
                return Operations.substract;
            default:
                throw `Operator '${op}' not supported.`;
        }
    }
}