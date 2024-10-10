<template>
  <section id="projects" class="projects">
    <h2>My Projects</h2>
    <div class="project-list">
      <div class="project" v-for="project in projects" :key="project.id">
        <img :src="project.image" :alt="project.name" />
        <h3>{{ project.name }}</h3>
        <p>{{ project.description }}</p>
        <a :href="project.link" target="_blank">View Project</a>
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
.projects {
  padding: 2rem;
}

.project-list {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
}

.project {
  background: #ecf0f1;
  padding: 1.5rem;
  margin: 1rem;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}

img {
  max-width: 100%;
  border-radius: 8px;
}

a {
  text-decoration: none;
  color: #f39c12;
}
</style>
