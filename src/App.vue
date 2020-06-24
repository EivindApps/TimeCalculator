<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view id="router-view"/>
  </div>
</template>

<style lang="scss">
html {
  box-sizing: border-box;
  height: 100%
}

body {
  height: 100%;
}

*, *::before, *::after {
  margin: 0;
  padding: 0;
  box-sizing: inherit;
}

#app {
  height: 100%;
  display: grid;
  grid-template-rows: 60px 1fr;
}

#nav {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
}

#router-view {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr;
}

#home {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr;
}


.Calculator {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr 1.75fr;
}

.CalculatorDisplayContainer {
  display: grid;
  grid-template-rows: 1fr 2fr;
}

.CurrentCalculation {
  background-color: white;
  border: none;
  font-size: 32px;
  text-align: right;
}

.CalculatorDisplay {
  background-color: white;
  border: none;
  font-size: 60px;
  font-weight: 400;
  text-align: right;
  color: black;
}

.CalculatorPad {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.CalculatorButton {
  display: flex;
  font-size: 26px;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: #efefef;
}
</style>
