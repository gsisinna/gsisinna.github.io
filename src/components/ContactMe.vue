<template>
  <section id="contact" class="contact">
    <h2 class="fade-in">Contact Me</h2>

    <div class="contact-container">
      <form @submit.prevent="submitForm" class="fade-in form">
        <div class="form-group">
          <input
            type="text"
            v-model="name"
            placeholder="Your Name"
            required
            class="animated-placeholder"
          />
        </div>
        <div class="form-group">
          <input
            type="email"
            v-model="email"
            placeholder="Your Email"
            required
            class="animated-placeholder"
          />
        </div>
        <div class="form-group">
          <textarea
            v-model="message"
            placeholder="Your Message"
            rows="5"
            required
            class="animated-placeholder"
          ></textarea>
        </div>
        <button type="submit" class="btn fade-in">Send Message</button>
      </form>

      <ul class="fade-in contact-links">
        <li>
          <a href="mailto:gabriele.sisinna@gmail.com" class="contact-link">Email</a>
        </li>
        <li>
          <a href="https://github.com/gsisinna" target="_blank" class="contact-link">GitHub</a>
        </li>
        <li>
          <a href="https://linkedin.com/in/gabriele-sisinna-4a6081109" target="_blank" class="contact-link">LinkedIn</a>
        </li>
      </ul>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ContactMe',
  data() {
    return {
      name: '',
      email: '',
      message: '',
    };
  },
  methods: {
    submitForm() {
      alert(`Thank you, ${this.name}! Your message has been sent.`);
      this.name = '';
      this.email = '';
      this.message = '';
    },
  },
};
</script>

<style scoped>
.contact {
  padding: 4rem 2rem;
  background: #2c3e50;
  color: white;
  text-align: center;
}

.contact-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease-in-out;
}

.form:hover {
  transform: scale(1.02);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  color: #2c3e50;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15);
  transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: #7f8c8d;
  transition: transform 0.3s ease;
}

.animated-placeholder:focus::placeholder {
  transform: translateY(-25px);
  opacity: 0;
}

button.btn {
  padding: 0.75rem 1.75rem;
  background: #f39c12;
  color: white;
  font-size: 1.25rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s ease-in-out;
}

button.btn:hover {
  background: white;
  color: #f39c12;
  transform: translateY(-5px);
}

.contact-links {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.contact-links li {
  font-size: 1.25rem;
}

.contact-link {
  color: white;
  text-decoration: none;
  position: relative;
}

.contact-link::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 3px;
  bottom: -5px;
  left: 0;
  background-color: #f39c12;
  visibility: hidden;
  transform: scaleX(0);
  transition: all 0.3s ease-in-out;
}

.contact-link:hover::before {
  visibility: visible;
  transform: scaleX(1);
}

.contact-link:hover {
  color: #f39c12;
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

.fade-in {
  opacity: 0;
  animation: fade-in 1s forwards;
}

.fade-in:nth-child(1) {
  animation-delay: 0.3s;
}

.fade-in:nth-child(2) {
  animation-delay: 0.6s;
}

.fade-in:nth-child(3) {
  animation-delay: 0.9s;
}
</style>
