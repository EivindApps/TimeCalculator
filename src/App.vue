<template>
  <div id="app">
    <!--<div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view id="router-view"/>-->
    <Calculator />
  </div>
</template>
<script>
// @ is an alias to /src
//import HelloWorld from '@/components/HelloWorld.vue'
import Calculator from '@/components/Calculator.vue'

export default {
  name: 'Home',
  components: {
  ///  HelloWorld,
    Calculator
  }
}
</script>
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
  background-color: aqua;
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
</style>
