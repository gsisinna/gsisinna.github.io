<template>
  <nav>
    <ul>
      <li><a href="#home">Home</a></li>
      <li><a href="#projects">Projects</a></li>
      <li><a href="#about">About</a></li>
      <li><a href="#contact">Contact</a></li>
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'MainNavbar',
};
</script>

<style scoped>
nav {
  background-color: #2c3e50;
  padding: 1rem;
}

ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

a {
  color: white;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  color: #f39c12;
}
</style>
