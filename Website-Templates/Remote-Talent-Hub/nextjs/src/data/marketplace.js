export const categories = [
  "Software Engineering",
  "UX/UI Design",
  "Product Management",
  "AI & Data",
  "Marketing",
  "Customer Success",
];

export const jobs = [
  {
    id: "senior-frontend-engineer",
    title: "Senior Frontend Engineer (React)",
    company: "Vercel",
    mark: "V",
    color: "violet",
    location: "Worldwide · Remote",
    salary: "$160k–$210k",
    type: "Full-time",
    tags: ["React", "TypeScript", "Remote"],
    description: "Help build fast, reliable experiences for developers around the world. Work closely with design and product to ship thoughtful, accessible features.",
  },
  {
    id: "product-designer",
    title: "Product Designer, Design Systems",
    company: "Linear",
    mark: "L",
    color: "blue",
    location: "Americas · Remote",
    salary: "$130k–$175k",
    type: "Full-time",
    tags: ["Figma", "Design Systems", "Remote"],
    description: "Create a coherent design language that makes powerful software feel simple. Partner with engineering and product from first sketch to final polish.",
  },
  {
    id: "ai-engineer",
    title: "AI Engineer — LLM Platform",
    company: "Notion",
    mark: "N",
    color: "green",
    location: "US / Canada · Remote",
    salary: "$180k–$240k",
    type: "Full-time",
    tags: ["Python", "LLM", "AI"],
    description: "Build reliable AI capabilities and help turn research into useful, production-ready products.",
  },
  {
    id: "growth-marketer",
    title: "B2B SaaS Growth Marketing Manager",
    company: "Figma",
    mark: "F",
    color: "orange",
    location: "North America · Remote",
    salary: "$110k–$150k",
    type: "Full-time",
    tags: ["Growth", "Marketing", "SaaS"],
    description: "Own growth experiments and collaborate with a thoughtful, distributed team.",
  },
];

export const talents = [
  {
    id: "adaze-okafor",
    name: "Adaze Okafor",
    title: "Full-Stack Engineer · Ex-Paystack",
    location: "Lagos, Nigeria · Open to remote",
    salary: "$6k–$8k / month",
    initials: "AO",
    color: "violet",
    tags: ["React", "Node.js", "Python", "PostgreSQL"],
    experience: "7 years",
    about: "I build dependable, user-friendly products from database to deployment and enjoy working with thoughtful remote teams.",
  },
  {
    id: "maya-chen",
    name: "Maya Chen",
    title: "Senior Product Designer · B2B SaaS",
    location: "Singapore · Open worldwide",
    salary: "$5k–$7k / month",
    initials: "MC",
    color: "orange",
    tags: ["Product Design", "Figma", "Design Systems"],
    experience: "8 years",
    about: "Product designer turning complex workflows into clear, welcoming experiences.",
  },
  {
    id: "james-owusu",
    name: "James Owusu",
    title: "Machine Learning Engineer",
    location: "Accra, Ghana · Open to remote",
    salary: "$6k–$9k / month",
    initials: "JO",
    color: "green",
    tags: ["Python", "Machine Learning", "LLMs"],
    experience: "6 years",
    about: "Machine learning engineer focused on moving data products from experiment to production responsibly.",
  },
];

export function getJob(id) {
  return jobs.find((job) => job.id === id);
}

export function getTalent(id) {
  return talents.find((person) => person.id === id);
}
