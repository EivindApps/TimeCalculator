<template>
  <div class="home">
    <!--<img alt="Vue logo" src="../assets/logo.png">-->
    <!--<HelloWorld msg="Welcome to Your Vue.js App"/>-->
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
