const MOCK_JOBS = [
  {
    id: 1, portal: "LinkedIn", portalColor: "#0A66C2", portalIcon: "in",
    title: "Senior Frontend Engineer", company: "Stripe", location: "Remote, US",
    salary: "$160k–$210k", type: "Full-time", posted: "2h ago",
    tags: ["React", "TypeScript", "GraphQL", "Node.js"],
    description: `We're looking for a Senior Frontend Engineer to join our payments infrastructure team. You'll architect scalable UI systems serving millions of businesses globally.\n\nResponsibilities:\n- Lead frontend architecture for critical payment flows\n- Build and maintain React component libraries\n- Collaborate with design and backend teams\n- Mentor junior engineers\n\nRequirements:\n- 5+ years of frontend development experience\n- Expert-level React and TypeScript skills\n- Experience with GraphQL and REST APIs\n- Strong understanding of web performance optimization\n- Excellent communication skills`,
    match: null, applied: false, status: null,
  },
  {
    id: 2, portal: "Indeed", portalColor: "#003A9B", portalIcon: "in",
    title: "Full Stack Developer", company: "Notion", location: "San Francisco, CA",
    salary: "$140k–$180k", type: "Full-time", posted: "5h ago",
    tags: ["React", "Python", "PostgreSQL", "AWS"],
    description: `Join Notion's core product team to build the future of productivity tools.\n\nResponsibilities:\n- Build full-stack features from design to deployment\n- Own product areas end-to-end\n- Work on real-time collaboration systems\n- Improve app performance and reliability\n\nRequirements:\n- 3+ years full-stack experience\n- Proficiency in React and a backend language (Python preferred)\n- Experience with databases (PostgreSQL, Redis)\n- Familiarity with cloud infrastructure (AWS/GCP)\n- Passion for developer tools`,
    match: null, applied: false, status: null,
  },
  {
    id: 3, portal: "Glassdoor", portalColor: "#0CAA41", portalIcon: "gd",
    title: "Machine Learning Engineer", company: "OpenAI", location: "San Francisco, CA",
    salary: "$200k–$300k", type: "Full-time", posted: "1d ago",
    tags: ["Python", "PyTorch", "CUDA", "Distributed Systems"],
    description: `OpenAI is seeking ML Engineers to work on frontier AI systems.\n\nResponsibilities:\n- Design and train large-scale machine learning models\n- Build scalable ML infrastructure\n- Research and implement new training techniques\n- Collaborate with researchers on novel architectures\n\nRequirements:\n- Strong background in ML/DL (PyTorch or TensorFlow)\n- Experience with distributed training at scale\n- Solid Python skills\n- Experience with CUDA and GPU optimization preferred\n- Publications or research experience is a plus`,
    match: null, applied: false, status: null,
  },
  {
    id: 4, portal: "LinkedIn", portalColor: "#0A66C2", portalIcon: "in",
    title: "Backend Engineer – Platform", company: "Figma", location: "Remote",
    salary: "$150k–$190k", type: "Full-time", posted: "3h ago",
    tags: ["Go", "Kubernetes", "gRPC", "Postgres"],
    description: `Help Figma build the platform that powers collaborative design at scale.\n\nResponsibilities:\n- Build high-performance APIs and microservices\n- Design robust data models and storage systems\n- Improve developer experience and internal tooling\n- Ensure system reliability and observability\n\nRequirements:\n- 4+ years backend engineering experience\n- Proficiency in Go (preferred) or another systems language\n- Experience with Kubernetes and container orchestration\n- Strong understanding of distributed systems\n- Experience with gRPC or similar RPC frameworks`,
    match: null, applied: false, status: null,
  },
  {
    id: 5, portal: "Wellfound", portalColor: "#F77F00", portalIcon: "wf",
    title: "DevOps / Platform Engineer", company: "Vercel", location: "Remote, Global",
    salary: "$130k–$170k", type: "Full-time", posted: "6h ago",
    tags: ["Terraform", "AWS", "Docker", "CI/CD"],
    description: `Join Vercel's infrastructure team and build the edge network powering modern web development.\n\nResponsibilities:\n- Design and operate globally distributed infrastructure\n- Implement and improve CI/CD pipelines\n- Manage Kubernetes clusters and cloud resources\n- Improve developer experience and deployment tooling\n\nRequirements:\n- 3+ years DevOps/Platform engineering\n- Expert Terraform and Infrastructure-as-Code skills\n- Strong AWS or GCP experience\n- Experience with Kubernetes at scale\n- Knowledge of observability tools (Datadog, Grafana)`,
    match: null, applied: false, status: null,
  },
  {
    id: 6, portal: "Glassdoor", portalColor: "#0CAA41", portalIcon: "gd",
    title: "Product Designer", company: "Linear", location: "Remote",
    salary: "$120k–$160k", type: "Full-time", posted: "2d ago",
    tags: ["Figma", "Design Systems", "Prototyping", "UX Research"],
    description: `Linear is looking for a Product Designer who values craft and simplicity above all.\n\nResponsibilities:\n- Design elegant, intuitive product experiences\n- Build and maintain our design system\n- Partner with engineering to ship high-quality features\n- Conduct user research and usability testing\n\nRequirements:\n- 4+ years product design experience\n- Expert Figma skills\n- Strong portfolio demonstrating UI/UX craft\n- Experience designing complex B2B products\n- Excellent communication with cross-functional teams`,
    match: null, applied: false, status: null,
  },
];

export const PORTALS = ["All", "LinkedIn", "Indeed", "Glassdoor", "Wellfound"];

export default MOCK_JOBS;
