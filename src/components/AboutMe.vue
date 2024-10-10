<template>
  <section id="about" class="about">
    <div class="about-container">
      <div class="about-content">
        <h2 class="fade-in">About Me</h2>
        <p class="slide-up">
          I'm a passionate full-stack developer with experience in creating beautiful and functional web applications. I specialize in building scalable web solutions, combining a strong design sense with cutting-edge technologies.
        </p>
        <a href="#contact" class="btn fade-in">Get In Touch</a>
      </div>
      <div class="about-image fade-in">
        <!-- Replace with your image -->
        <img src="https://via.placeholder.com/300" alt="Your Name">
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AboutMe',
};
</script>

<style scoped>
.about {
  padding: 4rem 2rem;
  background: #3498db;
  color: white;
  text-align: center;
}

.about-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.about-content {
  max-width: 600px;
  margin-bottom: 2rem;
}

.about h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.about p {
  font-size: 1.25rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.about-image {
  max-width: 300px;
  border-radius: 50%;
  overflow: hidden;
}

.about-image img {
  width: 100%;
  height: auto;
  border-radius: 50%;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #3498db;
  text-decoration: none;
  border-radius: 5px;
  font-size: 1.25rem;
  transition: background-color 0.3s, color 0.3s;
}

.btn:hover {
  background: #2c3e50;
  color: white;
}

/* Animation */
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

@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }

}

/* Applying animation */
.fade-in {
  opacity: 0;
  animation: fade-in 1.2s forwards;
}

.slide-up {
  opacity: 0;
  animation: slide-up 1.5s forwards;
}

.about-container .fade-in {
  animation-delay: 0.5s;
}
</style>
