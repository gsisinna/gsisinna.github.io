<template>
  <section id="projects" class="projects">
    <h2 class="section-title">My Projects</h2>
    <div class="project-list">
      <div class="project" v-for="project in projects" :key="project.id">
        <div class="project-image-container">
          <img :src="project.image" :alt="project.name" />
        </div>
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <a :href="project.link" target="_blank" class="btn">View Project</a>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ProjectList',
  data() {
    return {
      projects: [
        {
          id: 1,
          name: 'Portfolio Website',
          description: 'A beautiful portfolio website built with Vue.js.',
          image: 'https://via.placeholder.com/300',
          link: '#',
        },
        {
          id: 2,
          name: 'E-commerce Platform',
          description: 'An online store built with modern web technologies.',
          image: 'https://via.placeholder.com/300',
          link: '#',
        },
      ],
    };
  },
};
</script>

<style scoped>
/* Project Section */
.projects {
  padding: 4rem 2rem;
  background-color: #ecf0f1;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2c3e50;
}

/* Project List Layout */
.project-list {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 2rem;
}

.project {
  background-color: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  width: 100%;
  max-width: 320px;
  text-align: center;
}

.project:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Project Image Styling */
.project-image-container {
  margin-bottom: 1.5rem;
}

img {
  width: 100%;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.3s;
}

.project:hover img {
  transform: scale(1.05);
}

/* Typography and Button */
h3 {
  font-size: 1.75rem;
  color: #2c3e50;
  margin: 1rem 0;
}

p {
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 1.5rem;
}

a.btn {
  padding: 0.75rem 1.5rem;
  background-color: #f39c12;
  color: white;
  text-decoration: none;
  font-weight: bold;
  border-radius: 5px;
  transition: background-color 0.3s, transform 0.3s;
}

a.btn:hover {
  background-color: #e67e22;
  transform: translateY(-3px);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .project-list {
    flex-direction: column;
    align-items: center;
  }

  .project {
    max-width: 100%;
  }
}
</style>
