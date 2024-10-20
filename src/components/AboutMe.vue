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
        <img src="https://via.placeholder.com/300" alt="Your Name">
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'AboutMe',
  mounted() {
    // Intersection Observer to trigger animations when the element is in view
    const faders = document.querySelectorAll('.fade-in');
    const sliders = document.querySelectorAll('.slide-up');
    const options = {
      threshold: 0.5,  // Element must be 50% in the viewport to trigger the animation
    };

    const appearOnScroll = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      });
    }, options);

    faders.forEach(fader => appearOnScroll.observe(fader));
    sliders.forEach(slider => appearOnScroll.observe(slider));
  }
};
</script>

<style scoped>
.about {
  padding: 5rem 1.5rem;
  background: linear-gradient(135deg, #3498db 0%, #2c3e50 100%);
  color: white;
  text-align: center;
}

.about-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  max-width: 1000px;
  margin: 0 auto;
  gap: 3rem;
}

.about-content {
  max-width: 600px;
}

.about h2 {
  font-size: 2.8rem;
  margin-bottom: 1.2rem;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
}

.about h2::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0%;
  height: 2px;
  background: #fff;
  transition: width 0.4s ease-in-out;
}

.about h2:hover::after {
  width: 100%;
}

.about p {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  line-height: 1.8;
  letter-spacing: 0.5px;
}

.about-image {
  max-width: 300px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.4s ease-in-out;
}

.about-image img {
  width: 100%;
  height: auto;
  border-radius: 50%;
}

.about-image:hover {
  transform: scale(1.05);
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.75rem;
  background: white;
  color: #3498db;
  text-decoration: none;
  border-radius: 50px;
  font-size: 1.2rem;
  transition: background-color 0.3s, color 0.3s, box-shadow 0.3s;
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.btn:hover {
  background: #2c3e50;
  color: white;
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.3);
}

/* Animations */
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

.fade-in {
  opacity: 0;
  animation: fade-in 1.2s forwards;
}

.slide-up {
  opacity: 0;
  animation: slide-up 1.5s forwards;
}

/* Trigger animation on scroll */
.appear {
  opacity: 1;
  animation: none;
}

@media (min-width: 768px) {
  .about-container {
    flex-direction: row;
  }

  .about-content {
    margin-right: 3rem;
  }
}
</style>
