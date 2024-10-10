<template>
  <div id="app">
    <MainNavbar />
    <HomeSection />
    <ProjectList />
    <AboutMe />
    <ContactMe />
  </div>
</template>

<script>
import MainNavbar from './components/MainNavbar.vue';
import HomeSection from './components/HomeSection.vue';
import ProjectList from './components/ProjectList.vue';
import AboutMe from './components/AboutMe.vue';
import ContactMe from './components/ContactMe.vue';

export default {
  name: 'App',
  components: {
    MainNavbar,
    HomeSection,
    ProjectList,
    AboutMe,
    ContactMe,
  },
};
</script>


<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');

body {
  font-family: 'Poppins', sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  text-align: center;
  color: #2c3e50;
}
</style>
