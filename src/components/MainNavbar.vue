<template>
  <nav class="navbar">
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
/* Navbar Styles */
.navbar {
  background-color: #001f3f; /* Dark navy blue */
  padding: 1rem 2rem;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease-in-out;
}

ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

li {
  margin: 0;
}

a {
  color: #f0f0f0; /* Light gray for better contrast */
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  transition: color 0.3s, background-color 0.3s, border-radius 0.3s;
}

a:hover {
  color: #ffcc00; /* Gold for hover effect */
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
}

/* Responsive Navbar */
@media (max-width: 768px) {
  ul {
    flex-direction: column;
    gap: 1rem;
  }

  a {
    font-size: 1rem;
    padding: 1rem;
    display: block;
    text-align: center;
  }
}

/* Sticky navbar background change on scroll */
.navbar.sticky {
  background-color: rgba(0, 31, 63, 0.9); /* Slightly transparent navy */
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}
</style>
