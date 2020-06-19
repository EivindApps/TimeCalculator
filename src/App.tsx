import React from 'react';
import './App.css';

function App() {
  return (
    <div className="Calculator">
      <div className="CalculatorDisplayContainer">
        <input type="text" className="CurrentCalculation" disabled value="05:50 + 03:30 +"></input>
        <input type="text" className="CalculatorDisplay" disabled value="09:20"></input>
      </div>
      <div className="CalculatorPad">
        <div className="CalculatorButton">CE</div>
        <div className="CalculatorButton">C</div>
        <div className="CalculatorButton">&#x21A4;</div>
        <div className="NoCalculatorButton"></div>
        <div className="CalculatorButton">7</div>
        <div className="CalculatorButton">8</div>
        <div className="CalculatorButton">9</div>
        <div className="NoCalculatorButton"></div>
        <div className="CalculatorButton">4</div>
        <div className="CalculatorButton">5</div>
        <div className="CalculatorButton">6</div>
        <div className="CalculatorButton">&#x2212;</div>
        <div className="CalculatorButton">1</div>
        <div className="CalculatorButton">2</div>
        <div className="CalculatorButton">3</div>        
        <div className="CalculatorButton">+</div>
        <div className="CalculatorButton">&#x2213;</div>
        <div className="CalculatorButton">0</div>        
        <div className="CalculatorButton">:</div>
        <div className="CalculatorButton">=</div>
      </div>
    </div>
  );
}

export default App;
