<template>
  <section id="home" class="home">
    <h1 class="fade-in">Hello, I'm Gabriele</h1>
    <p class="slide-in">Full-Stack Developer | Designer | Coder</p>
    <a href="#projects" class="btn fade-in">View My Work</a>
  </section>
</template>

<script>
export default {
  name: 'HomeSection',
};
</script>

<style scoped>
/* Home section */
.home {
  height: 100vh;
  background: #f39c12;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  position: relative;
}

h1, p, .btn {
  opacity: 0;
  animation: fade-in 1.5s forwards;
}

h1 {
  font-size: 3rem;
  margin: 0;
  animation-delay: 0.2s;
}

p {
  font-size: 1.5rem;
  margin: 1rem 0;
  animation-delay: 0.6s;
}

.btn {
  padding: 0.75rem 1.5rem;
  background: #2c3e50;
  color: white;
  text-decoration: none;
  font-size: 1.25rem;
  border-radius: 5px;
  animation-delay: 1s;
}

.btn:hover {
  background: white;
  color: #2c3e50;
}

/* Keyframes for animations */
@keyframes fade-in {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Sections after home */
.projects, .about, .contact {
  min-height: 100vh;
  padding: 4rem 2rem;
  background-color: #ecf0f1;
  color: #2c3e50;
  text-align: center;
}

.projects {
  background: #34495e;
  color: white;
}

.about {
  background: #1abc9c;
}

.contact {
  background: #e74c3c;
}

/* Smooth scroll for the button */
html {
  scroll-behavior: smooth;
}
</style>
