import moment from 'moment';

export interface CalculationPart {
    dumb(): void;
}

export enum CalculatorTimeFormat {
    HoursAndMinutes,
    HoursMinutesAndSeconds
}

export class TimeValue implements CalculationPart {
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
        let hours = 0, minutes = 0, seconds = 0;
        const isNegative: boolean = (displayValue !== "" && displayValue !== undefined && displayValue.substr(0, 1) === "-");

        if (displayValue !== undefined && displayValue !== "") {
            if (isNegative) displayValue = displayValue.substr(1);  // Parse only positive values

            if (displayValue.indexOf(":") !== -1) {
                const parts = displayValue.split(":");

                if (this._timeFormat === CalculatorTimeFormat.HoursAndMinutes) {
                    hours = parseInt(parts[0]);

                    if (parts[1] !== undefined && parts[1] !== "") {
                        minutes = parseInt(parts[1]);
                    }
                } else {
                    if (parts.length === 2) {
                        minutes = parseInt(parts[0]);

                        if (parts[1] !== undefined && parts[1] !== "") {
                            seconds = parseInt(parts[1]);
                        }
                    } else if (parts.length === 3) {
                        hours = parseInt(parts[0]);

                        if (parts[1] !== undefined && parts[1] !== "") {
                            minutes = parseInt(parts[1]);
                        }

                        if (parts[2] !== undefined && parts[2] !== "") {
                            seconds = parseInt(parts[2]);
                        }
                    }
                }
            } else {
                // no : separator
                if (this._timeFormat === CalculatorTimeFormat.HoursAndMinutes) {
                    minutes = parseInt(displayValue);
                } else {
                    seconds = parseInt(displayValue);
                }
            }
        }

        const value = moment.duration(hours, "h").add(minutes, "m").add(seconds, "s");
        return (isNegative ? moment.duration(value.asMilliseconds() * -1, "ms") : moment.duration(value.asMilliseconds()));
    }

    public changeTimeFormat(timeFormat: CalculatorTimeFormat) {
        this._timeFormat = timeFormat;

        if (timeFormat === CalculatorTimeFormat.HoursAndMinutes) {
            this.value = moment.duration(this.value.hours(), 'h').add(this.value.minutes(), 'm');
        }
    }

    public dumb(): void {
        console.log('');
    }
}

export enum Operations {
    add = 1,
    substract = 2,
    eq = 3
}

export class Operator implements CalculationPart {
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

    public dumb(): void {
        console.log('');
    }
}

export class Calculation extends Array<CalculationPart> {
    public calculate(): moment.Duration {
        let currentValue = moment.duration(0, 's');
        let currentOp: Operations | undefined;

        for(const part of this) {
            if (part instanceof Operator) {
                currentOp = part.op;
            } else if (part instanceof TimeValue) {
                if (currentOp === undefined) {
                    currentValue = part.value;
                } else {
                    currentValue = this.calculateInternal(currentValue, currentOp, part.value);
                    currentOp = undefined;
                }
            }
        }

        return currentValue;
    }

    private calculateInternal(left: moment.Duration, op: Operations, right: moment.Duration): moment.Duration {
        switch(op) {
            case Operations.add:
                return left.add(right);
            case Operations.substract:
                return left.subtract(right);
        }

        throw `Operation '${op}' not supported.`;
    }

    public changeTimeFormat(timeFormat: CalculatorTimeFormat): void {
        for(const part of this) {
            if (part instanceof TimeValue) {
                part.changeTimeFormat(timeFormat);
            }
        }
    }
}