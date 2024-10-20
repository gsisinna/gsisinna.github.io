<template>
  <section id="home" class="home">
    <h1 class="fade-in">Hello, I'm Gabriele</h1>
    <p class="slide-in">Robotics Software Engineer | Designer | Coder</p>
    <a href="#projects" class="btn">View My Work</a>

    <!-- Tetris-like animated blocks -->
    <div class="tetris-blocks">
      <div v-for="n in 20" :key="n" class="block"></div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'HomeSection',
  mounted() {
    // Optional: Smooth scroll for older browsers
    const btn = document.querySelector('.btn');
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    });
  },
};
</script>

<style scoped>
/* Home section */
.home {
  height: 100vh;
  background: linear-gradient(135deg, #003366, #006699); /* Updated background gradient */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  position: relative;
  overflow: hidden;
  padding: 0 2rem;
}

h1 {
  font-size: 3rem;
  margin: 0;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  font-weight: 700;
  animation: fade-in 1s forwards ease-in-out;
}

p {
  font-size: 1.5rem;
  margin: 1rem 0;
  animation: slide-in 1.5s forwards ease-in-out;
  font-weight: 400;
  letter-spacing: 1px;
}

.btn {
  padding: 0.75rem 2rem;
  background: #004080; /* Updated button background color */
  color: white;
  text-decoration: none;
  font-size: 1.25rem;
  border-radius: 8px;
  margin-top: 2rem;
  animation: fade-in 1s forwards ease-in-out;
  transition: background-color 0.3s, transform 0.3s ease-in-out;
}

.btn:hover {
  background: white;
  color: #004080; /* Updated hover color */
  transform: translateY(-5px);
}

/* Tetris-like animated blocks */
.tetris-blocks {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.block {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  animation: float 10s infinite ease-in-out, rotate 10s infinite linear;
  opacity: 0.7;
  border-radius: 4px;
}

/* Generate blocks at random positions */
.block:nth-child(1) { left: 10%; top: 10%; }
.block:nth-child(2) { left: 25%; top: 40%; }
.block:nth-child(3) { left: 50%; top: 30%; }
.block:nth-child(4) { left: 70%; top: 20%; }
.block:nth-child(5) { left: 85%; top: 50%; }
.block:nth-child(6) { left: 90%; top: 70%; }
.block:nth-child(7) { left: 20%; top: 80%; }
.block:nth-child(8) { left: 40%; top: 60%; }
.block:nth-child(9) { left: 65%; top: 75%; }
.block:nth-child(10) { left: 5%; top: 50%; }

/* Animations for floating effect and smooth transitions */
@keyframes float {
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
  100% { transform: translateY(0) scale(1); }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Text fade and slide animations */
@keyframes fade-in {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in {
  0% { opacity: 0; transform: translateX(-100px); }
  100% { opacity: 1; transform: translateX(0); }
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  h1 {
    font-size: 2.5rem;
  }

  p {
    font-size: 1.25rem;
  }

  .btn {
    font-size: 1.15rem;
  }
}
</style>
