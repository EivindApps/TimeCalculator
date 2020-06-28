<template>
  <div class="calculator" v-on:keyup="keyUp($event)">
      <div class="calculator-display-container">
        <input type="text" class="current-calculation" disabled v-model="this.currentCalculationDisplay" />
        <input type="text" class="calculator-display" disabled v-model="this.calculatorDisplay" />
      </div>
      <div class="calculator-pad">
        <div class="calculator-button" v-on:click="clearDisplay">CE</div>
        <div class="calculator-button" v-on:click="clearAll">C</div>
        <div class="calculator-button" v-on:click="backspace">&#x21A4;</div>
        <div class="no-calculator-button"></div>
        <div class="calculator-button" v-on:click="num7">7</div>
        <div class="calculator-button" v-on:click="num8">8</div>
        <div class="calculator-button" v-on:click="num9">9</div>
        <div class="no-calculator-button"></div>
        <div class="calculator-button" v-on:click="num4">4</div>
        <div class="calculator-button" v-on:click="num5">5</div>
        <div class="calculator-button" v-on:click="num6">6</div>
        <div class="calculator-button" v-on:click="minus">&#x2212;</div>
        <div class="calculator-button" v-on:click="num1">1</div>
        <div class="calculator-button" v-on:click="num2">2</div>
        <div class="calculator-button" v-on:click="num3">3</div>        
        <div class="calculator-button" v-on:click="plus">+</div>
        <div class="calculator-button" v-on:click="negate">&#x2213;</div>
        <div class="calculator-button" v-on:click="num0">0</div>
        <div class="calculator-button" v-on:click="separator">:</div>
        <div class="calculator-button" v-on:click="equal">=</div>
      </div>
    </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import moment from 'moment';
import { CalculatorTimeFormat, Calculation, Operations, TimeValue, Operator } from "../Model";

@Component
export default class Calculator extends Vue {
    private _overwriteDisplay = false;
    private _hasPressedNumber = false;
    private _separatorSetExplicitly = false;

    public calculatorType: CalculatorTimeFormat = CalculatorTimeFormat.HoursAndMinutes;

    private currentCalculation = new Calculation();
    //public get CurrentCalculation(): string { return this._currentCalculation ? this._currentCalculation.toString() : ''; }
    private get currentCalculationDisplay(): string {
        let display = '';
        for(const part of this.currentCalculation) {
            if(part instanceof Operator) {
                display += part.toString();
            } else {
                display += this.formatCalculation(part.toString());
            }
        }

        return display;
    }

    public calculatorDisplay = '';

    constructor() {
        super();
        this._overwriteDisplay = false;
        this._hasPressedNumber = false;
        this._separatorSetExplicitly = false;
        this.calculatorType = CalculatorTimeFormat.HoursAndMinutes;
        this.currentCalculation = new Calculation();
    }

    private changeTimeFormat(timeFormat: CalculatorTimeFormat): void {
        this.calculatorType = timeFormat;
        this.currentCalculation.changeTimeFormat(timeFormat);

        if (this.calculatorDisplay !== '') {
            if (timeFormat === CalculatorTimeFormat.HoursAndMinutes) {
                // Remove seconds part of the current display
                const parts = this.calculatorDisplay.split(':');

                if (parts.length === 3) {
                    this.calculatorDisplay = this.calculatorDisplay.substr(0, this.calculatorDisplay.lastIndexOf(':'));
                }
            } else {
                if (this._overwriteDisplay === true) {
                    // Add seconds part to the current display
                    this.calculatorDisplay += ':00';
                }
            }
        }
    }

    private numberPressed(value: number): void {
        if (this._overwriteDisplay === true) {
            this.calculatorDisplay = '';
            this._overwriteDisplay = false;
        }

        if (this.calculatorDisplay !== '') {
            const isNegated = this.calculatorDisplay.startsWith('-');

            if (this.calculatorType === CalculatorTimeFormat.HoursAndMinutes) {
                this.numberPressedInHoursAndMinutesMode(isNegated, value);
            } else {
                this.numberPressedInSecondsMode(isNegated, value);
            }
        } else {
            this.calculatorDisplay = value.toString();
        }

        this._hasPressedNumber = true;
    }

    private numberPressedInHoursAndMinutesMode(isNegated: boolean, value: number): void {
        if (this._separatorSetExplicitly === true) {
            const parts = this.calculatorDisplay.split(':');

            if (parts.length === 2 && parts[1].length >= 2) {
                return;  // Cannot have more than two digits representing minutes
            }

            this.calculatorDisplay += value.toString();
        } else {
            let temp = this.calculatorDisplay.replace(':', '') + value.toString();
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

            this.calculatorDisplay = temp;
        }
    }

    private numberPressedInSecondsMode(isNegated: boolean, value: number): void {
        if (this._separatorSetExplicitly === true) {
            const parts = this.calculatorDisplay.split(':');

            if (parts.length === 3 && parts[2].length >= 2) {
                return;  // Cannot have more than two digits representing seconds
            } else if (parts.length === 2 && parts[1].length >= 2) {
                let temp = parts[0] + ':' + parts[1].substr(0, 2) + ':';

                if (parts[1].length > 2) {
                    temp += parts[1].substr(2);
                }

                temp += value.toString();
                this.calculatorDisplay = temp;
            } else if (parts.length === 1 && parts[0].length >= 2) {
                let temp = parts[0].substr(0, 2) + ':';

                if (parts[0].length > 2) {
                    temp += parts[0].substr(2);
                }

                temp += value.toString();
                this.calculatorDisplay = temp;
            } else {
                this.calculatorDisplay += value.toString();
            }
        } else {
            let temp = this.calculatorDisplay.replace(':', '') + value.toString();
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

            this.calculatorDisplay = temp;
        }
    }

    private separatorPressed(): void {
        if (this.calculatorDisplay === '' || this._overwriteDisplay === true) {
            this.calculatorDisplay = '0:';
        } else {
            if (this.calculatorType === CalculatorTimeFormat.HoursAndMinutes) {
                this.calculatorDisplay = this.calculatorDisplay.replace(':', '') + ':';
            } else {
                const parts = this.calculatorDisplay.split(':');

                if (parts.length === 1) {
                    this.calculatorDisplay = parts[0] + ':';
                } else if (parts.length === 2) {
                    let temp = parts[0] + ':';

                    if (parts[1].length < 2) {
                        temp += '0' + parts[1];
                    } else {
                        temp += parts[1];
                    }

                    temp += ':';
                    this.calculatorDisplay = temp;
                }
            }
        }

        this._separatorSetExplicitly = true;
        this._overwriteDisplay = false;
    }

    private calculate(op: Operations): void {
        if (op === Operations.add || op === Operations.substract) {
            this.currentCalculation.push(new TimeValue(this.calculatorDisplay, this.calculatorType));
            this.currentCalculation.push(new Operator(op));
            this.performCalculation();
        } else {
            if (this._hasPressedNumber === true) {
                this.currentCalculation.push(new TimeValue(this.calculatorDisplay, this.calculatorType));
            }

            this.performCalculation();
            this.currentCalculation = new Calculation();
        }

        this._hasPressedNumber = false;
    }

    private performCalculation(): void {
        const result = this.currentCalculation.calculate();
        this.calculatorDisplay = this.formatCalculation(result);
        this._overwriteDisplay = true;
        this._separatorSetExplicitly = false;
    }

    private formatCalculation(value: string): string {
        let durationValue = moment.duration(value);
        const isNeagtive = durationValue.asMilliseconds() < 0;

        if (isNeagtive === true) {
            durationValue = moment.duration(durationValue.asMilliseconds() * -1);
        }

        function formatAsTwoDigits(str: string): string {
            if(str.length > 1) {
                return str;
            }

            return '0' + str;
        }

        if (this.calculatorType === CalculatorTimeFormat.HoursAndMinutes) {
            return (isNeagtive ? '-' : '') + formatAsTwoDigits(durationValue.asHours.toString()) + ':' + formatAsTwoDigits(durationValue.minutes.toString());
        }

        return (isNeagtive ? '-' : '') + formatAsTwoDigits(durationValue.asHours.toString()) + ':' + formatAsTwoDigits(durationValue.minutes.toString() + ':' + formatAsTwoDigits(durationValue.seconds.toString()));
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
        this.calculatorDisplay = '';
        this._hasPressedNumber = false;
        this._overwriteDisplay = false;
        this._separatorSetExplicitly = false;
    }
    public clearAll(): void {
        this.currentCalculation = new Calculation();
        this.calculatorDisplay = '';
        this._hasPressedNumber = false;
        this._overwriteDisplay = false;
        this._separatorSetExplicitly = false;
    }
    public backspace(): void {
        let temp = this.calculatorDisplay;

        if (temp !== '') {
            if (temp.lastIndexOf(':') == (temp.length - 1)) {
                this._separatorSetExplicitly = false;
            }

            temp = temp.substr(0, temp.length - 1);

            // Don't leave a separator at the end
            if (temp.length > 0 && temp.lastIndexOf(':') == (temp.length - 1)) {
                this._separatorSetExplicitly = false;
                temp = temp.substr(0, temp.length - 1);
            }

            this.calculatorDisplay = temp;
            this._overwriteDisplay = false;

            if (this.calculatorDisplay === '') {
                this._hasPressedNumber = false;
            }
        }
    }
    public negate(): void {
        let temp = this.calculatorDisplay;

        if (temp !== '') {
            if (temp.startsWith('-')) {
                temp = temp.substr(1);
            } else {
                temp = '-' + temp;
            }
        } else {
            temp = '-';
        }

        this.calculatorDisplay = temp;
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
    public keyUp(event: KeyboardEvent): void {
        switch(event.code) {
            case '49':
            case '97':
                this.num1();
                break;
            case '50':
            case '98':
                this.num2();
                break;
        }
    }
    //#endregion
}
</script>

<style lang="css" scoped>
.calculator {
  background-color: green;
  height: 100%;
  display: grid;
  grid-template-rows: 1fr 1.75fr;
}

.calculator-display-container {
  display: grid;
  grid-template-rows: 1fr 2fr;
}

.current-calculation {
  background-color: white;
  border: none;
  font-size: 32px;
  text-align: right;
}

.calculator-display {
  background-color: white;
  border: none;
  font-size: 60px;
  font-weight: 400;
  text-align: right;
  color: black;
}

.calculator-pad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.calculator-button {
  display: flex;
  font-size: 26px;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #efefef;
}

.no-calculator-button {
    background-color: #dedede;
}
</style>