// Single source of truth for everything the site says about me.
// Edit this file to update the home page, author byline, and metadata.

export const profile = {
  name: "Gabriele Sisinna",
  handle: "gsisinna",
  role: "Robotics Software Engineer",
  location: "Bologna, Italy",
  headline: "I build robotics software that holds up outside the lab.",
  intro:
    "I work in C++ and Python on simulation, control, and system integration for autonomous and collaborative robots, with a strong focus on software architecture.",
  shortBio:
    "Robotics software engineer in Bologna, working on C++, Python, simulation, control, and system integration.",
  siteDescription:
    "Gabriele Sisinna, robotics software engineer in Bologna. Notes on ROS 2, simulation, C++, Python, and software architecture for real robots.",
  avatar: "/avatar-profile.jpg",
  avatarAlt: "Gabriele Sisinna working on a humanoid robot",
  links: {
    github: "https://github.com/gsisinna",
    linkedin: "https://www.linkedin.com/in/gabriele-sisinna-4a6081109/",
    contact: "/contact/",
    rss: "/rss.xml"
  }
};

export const focusAreas = [
  {
    icon: "robot",
    title: "Robotics software",
    text: "ROS 2, simulation, motion and control. Software that behaves the same on a laptop, in Gazebo, and on the real cell."
  },
  {
    icon: "layers",
    title: "Software architecture",
    text: "Modular C++ and Python components, clear interfaces, tests and CI/CD that keep a robot codebase easy to change."
  },
  {
    icon: "chip",
    title: "Hands-on prototyping",
    text: "Linux, electronics, 3D printing and hardware integration when an idea needs to touch real hardware quickly."
  }
] as const;

export const facts = [
  { value: "5+ years", label: "building robot software" },
  { value: "FlexLink · Lab0 · IIT", label: "industry and research labs" },
  { value: "MSc Biorobotics", label: "Scuola Superiore Sant'Anna" },
  { value: "IT · EN", label: "working languages" }
];

export const experience = [
  {
    period: "2024 – now",
    role: "Robotics Software Engineer",
    place: "FlexLink · Bologna",
    note: "Modular C++/Python software for autonomous and collaborative robotics: reusable components, CI/CD, and system integration."
  },
  {
    period: "2022 – 2023",
    role: "Robotics Engineer",
    place: "Lab0 · Genova",
    note: "Simulation, middleware, C++/Python development, Docker/Git workflows, hardware integration, and prototyping."
  },
  {
    period: "2021 – 2022",
    role: "Robotics Technician / Software Engineer",
    place: "Istituto Italiano di Tecnologia · Genova",
    note: "Assembly, testing and diagnostics of the iCub humanoid, YARP-based test tooling, Docker deployments, and support for demos."
  },
  {
    period: "2021",
    role: "Master Thesis",
    place: "Università di Pisa",
    note: "Bio-inspired control system for the humanoid robot Abel, with a ROS-based architecture in Python."
  },
  {
    period: "2020 – 2021",
    role: "Lab Training, Robotics",
    place: "Scuola Superiore Sant'Anna · Pisa",
    note: "7-DOF KUKA simulation with ROS, MoveIt and Gazebo: CLIK, PID control, and trajectory planning."
  }
];

export const skillGroups = [
  { title: "Software", items: ["C++", "Python", "CMake", "Software Architecture", "Unit Testing", "CI/CD"] },
  { title: "Robotics", items: ["ROS / ROS 2", "Gazebo", "Control Systems", "Industrial Manipulators", "Middleware", "System Integration"] },
  { title: "Systems", items: ["Linux", "Docker", "Git / GitLab", "DevOps", "Arduino", "Embedded Prototyping"] },
  { title: "Hardware", items: ["Electronics", "3D Printing", "CAD / Onshape", "Rapid Prototyping", "Hardware Integration"] }
];

export const education = [
  { title: "MSc Bionics Engineering (Biorobotics)", school: "Scuola Superiore Sant'Anna", period: "2018–2021" },
  { title: "BSc Biomedical Engineering", school: "Università di Pisa", period: "2014–2018" }
];

export const certifications = [
  { title: "Software Architecture Foundations", year: "2024" },
  { title: "Learning C++", year: "2023" },
  { title: "Learning Python", year: "2020" },
  { title: "Programming Foundations: Object-Oriented Design", year: "2020" },
  { title: "Programming Foundations: Algorithms", year: "2020" }
];

export const hobbies = [
  { label: "Guitar", value: "How I slow down. Good things are built one repeat at a time." },
  { label: "Motorcycle", value: "Freedom and focus at once: the same flow I look for when building software." },
  { label: "Trekking", value: "How I reset. Mountains feel like home after growing up near Mount Etna." }
];
