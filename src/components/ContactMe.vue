<template>
  <section id="contact" class="contact">
    <h2 class="fade-in">Contact Me</h2>
    
    <div class="contact-container">
      <form @submit.prevent="submitForm" class="fade-in">
        <div class="form-group">
          <input type="text" v-model="name" placeholder="Your Name" required />
        </div>
        <div class="form-group">
          <input type="email" v-model="email" placeholder="Your Email" required />
        </div>
        <div class="form-group">
          <textarea v-model="message" placeholder="Your Message" rows="5" required></textarea>
        </div>
        <button type="submit" class="btn fade-in">Send Message</button>
      </form>

      <ul class="fade-in">
        <li><a href="mailto:your.email@example.com">Email</a></li>
        <li><a href="https://github.com/yourusername" target="_blank">GitHub</a></li>
        <li><a href="https://linkedin.com/in/yourusername" target="_blank">LinkedIn</a></li>
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
      // Basic form submission handling
      alert(`Thank you, ${this.name}! Your message has been sent.`);
      // Clear the form after submission
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
  gap: 2rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
  width: 100%;
}

.form-group input, .form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  background-color: white;
  color: #2c3e50;
  box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
}

.form-group input::placeholder, .form-group textarea::placeholder {
  color: #7f8c8d;
}

button.btn {
  padding: 0.75rem 1.5rem;
  background: #f39c12;
  color: white;
  font-size: 1.25rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

button.btn:hover {
  background: white;
  color: #f39c12;
  transform: translateY(-3px);
}

ul {
  list-style: none;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
}

ul li {
  font-size: 1.25rem;
}

ul li a {
  color: white;
  text-decoration: none;
}

ul li a:hover {
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
