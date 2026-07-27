require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Adding fresh internships and projects...\n');

  const passwordHash = await bcrypt.hash('password123', 12);

  // ── Create / find recruiters ──────────────────────────────────────────────
  let techcorp = await prisma.user.findUnique({ where: { email: 'recruiter1@techcorp.com' }, include: { recruiterProfile: true } });
  if (!techcorp) {
    techcorp = await prisma.user.create({
      data: {
        email: 'recruiter1@techcorp.com', passwordHash, role: 'RECRUITER',
        recruiterProfile: { create: { companyName: 'TechCorp Solutions', companySize: '100-500', onboarded: true } },
      },
      include: { recruiterProfile: true },
    });
    console.log('✅ Created TechCorp recruiter');
  }

  let startupai = await prisma.user.findUnique({ where: { email: 'recruiter2@startupai.com' }, include: { recruiterProfile: true } });
  if (!startupai) {
    startupai = await prisma.user.create({
      data: {
        email: 'recruiter2@startupai.com', passwordHash, role: 'RECRUITER',
        recruiterProfile: { create: { companyName: 'StartupAI Labs', companySize: '10-50', onboarded: true } },
      },
      include: { recruiterProfile: true },
    });
    console.log('✅ Created StartupAI recruiter');
  }

  let google = await prisma.user.findUnique({ where: { email: 'recruiter3@google.com' }, include: { recruiterProfile: true } });
  if (!google) {
    google = await prisma.user.create({
      data: {
        email: 'recruiter3@google.com', passwordHash, role: 'RECRUITER',
        recruiterProfile: { create: { companyName: 'Google', companySize: '10000+', onboarded: true } },
      },
      include: { recruiterProfile: true },
    });
    console.log('✅ Created Google recruiter');
  }

  let meta = await prisma.user.findUnique({ where: { email: 'recruiter4@meta.com' }, include: { recruiterProfile: true } });
  if (!meta) {
    meta = await prisma.user.create({
      data: {
        email: 'recruiter4@meta.com', passwordHash, role: 'RECRUITER',
        recruiterProfile: { create: { companyName: 'Meta', companySize: '10000+', onboarded: true } },
      },
      include: { recruiterProfile: true },
    });
    console.log('✅ Created Meta recruiter');
  }

  let flipkart = await prisma.user.findUnique({ where: { email: 'recruiter5@flipkart.com' }, include: { recruiterProfile: true } });
  if (!flipkart) {
    flipkart = await prisma.user.create({
      data: {
        email: 'recruiter5@flipkart.com', passwordHash, role: 'RECRUITER',
        recruiterProfile: { create: { companyName: 'Flipkart', companySize: '1000-5000', onboarded: true } },
      },
      include: { recruiterProfile: true },
    });
    console.log('✅ Created Flipkart recruiter');
  }

  const r1 = techcorp.recruiterProfile.id;
  const r2 = startupai.recruiterProfile.id;
  const r3 = google.recruiterProfile.id;
  const r4 = meta.recruiterProfile.id;
  const r5 = flipkart.recruiterProfile.id;

  // ── Postings ──────────────────────────────────────────────────────────────
  const postings = [
    // ── INTERNSHIPS ──
    {
      recruiterId: r3, type: 'INTERNSHIP',
      title: 'Software Engineering Intern',
      description: 'Join Google\'s core engineering team to build scalable systems. Work on real products used by billions. You\'ll collaborate with senior engineers on backend infrastructure, APIs, and data pipelines.',
      stipend: 8000, duration: '3 months', deadline: new Date('2026-09-30'),
      location: 'Bangalore, India', remote: false,
      skills: [
        { skillName: 'python', weight: 5 },
        { skillName: 'algorithms', weight: 5 },
        { skillName: 'data structures', weight: 4 },
        { skillName: 'java', weight: 3 },
      ],
    },
    {
      recruiterId: r4, type: 'INTERNSHIP',
      title: 'React Frontend Intern',
      description: 'Build next-generation UI components for Meta\'s social platforms. Work with React, TypeScript, and cutting-edge web technologies. Help shape the experience for 3 billion users.',
      stipend: 7500, duration: '6 months', deadline: new Date('2026-08-31'),
      location: 'Hyderabad, India', remote: true,
      skills: [
        { skillName: 'react', weight: 5 },
        { skillName: 'javascript', weight: 5 },
        { skillName: 'typescript', weight: 4 },
        { skillName: 'css', weight: 3 },
        { skillName: 'graphql', weight: 2 },
      ],
    },
    {
      recruiterId: r1, type: 'INTERNSHIP',
      title: 'Full Stack Developer Intern',
      description: 'Work on TechCorp\'s flagship SaaS product. You\'ll own features end-to-end — from React frontends to Node.js microservices and PostgreSQL databases. Agile team, fast growth.',
      stipend: 3000, duration: '6 months', deadline: new Date('2026-10-15'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'react', weight: 4 },
        { skillName: 'node.js', weight: 4 },
        { skillName: 'postgresql', weight: 3 },
        { skillName: 'typescript', weight: 3 },
        { skillName: 'git', weight: 2 },
      ],
    },
    {
      recruiterId: r5, type: 'INTERNSHIP',
      title: 'Android Developer Intern',
      description: 'Build features for Flipkart\'s Android app used by 100M+ users. Work with Kotlin, Jetpack Compose, and modern Android architecture patterns. Great mentorship and PPO opportunity.',
      stipend: 2500, duration: '3 months', deadline: new Date('2026-09-01'),
      location: 'Bangalore, India', remote: false,
      skills: [
        { skillName: 'kotlin', weight: 5 },
        { skillName: 'android', weight: 5 },
        { skillName: 'java', weight: 3 },
        { skillName: 'rest apis', weight: 3 },
      ],
    },
    {
      recruiterId: r2, type: 'INTERNSHIP',
      title: 'Machine Learning Intern',
      description: 'Train and deploy ML models for StartupAI\'s NLP product. Work with Python, PyTorch, and transformers. Help build features that make AI accessible to businesses.',
      stipend: 4000, duration: '4 months', deadline: new Date('2026-11-30'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'python', weight: 5 },
        { skillName: 'machine learning', weight: 5 },
        { skillName: 'pytorch', weight: 4 },
        { skillName: 'nlp', weight: 4 },
        { skillName: 'sql', weight: 2 },
      ],
    },
    {
      recruiterId: r1, type: 'INTERNSHIP',
      title: 'Backend Developer Intern',
      description: 'Design and build RESTful APIs with Node.js and Express. Work on authentication, real-time features with WebSockets, and cloud deployments on AWS.',
      stipend: 2000, duration: '3 months', deadline: new Date('2026-09-30'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'node.js', weight: 5 },
        { skillName: 'express.js', weight: 4 },
        { skillName: 'sql', weight: 3 },
        { skillName: 'aws', weight: 2 },
        { skillName: 'git', weight: 2 },
      ],
    },
    {
      recruiterId: r5, type: 'INTERNSHIP',
      title: 'Data Science Intern',
      description: 'Analyze large datasets from Flipkart\'s e-commerce platform. Build dashboards, run A/B tests, and create predictive models to improve customer experience and revenue.',
      stipend: 3500, duration: '3 months', deadline: new Date('2026-08-15'),
      location: 'Bangalore, India', remote: false,
      skills: [
        { skillName: 'python', weight: 5 },
        { skillName: 'sql', weight: 5 },
        { skillName: 'data analysis', weight: 4 },
        { skillName: 'machine learning', weight: 3 },
        { skillName: 'tableau', weight: 2 },
      ],
    },
    {
      recruiterId: r3, type: 'INTERNSHIP',
      title: 'Cloud Infrastructure Intern',
      description: 'Work with Google Cloud Platform to design, deploy, and manage cloud-native infrastructure. Learn Kubernetes, Terraform, and CI/CD pipelines at scale.',
      stipend: 6000, duration: '3 months', deadline: new Date('2026-10-01'),
      location: 'Hyderabad, India', remote: false,
      skills: [
        { skillName: 'docker', weight: 5 },
        { skillName: 'kubernetes', weight: 5 },
        { skillName: 'python', weight: 3 },
        { skillName: 'linux', weight: 4 },
        { skillName: 'git', weight: 2 },
      ],
    },
    {
      recruiterId: r2, type: 'INTERNSHIP',
      title: 'UI/UX Design Intern',
      description: 'Design user interfaces and experiences for StartupAI\'s product suite. Create wireframes, prototypes, and design systems using Figma. Work closely with engineers.',
      stipend: 1800, duration: '3 months', deadline: new Date('2026-09-15'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'figma', weight: 5 },
        { skillName: 'ui/ux design', weight: 5 },
        { skillName: 'css', weight: 3 },
        { skillName: 'javascript', weight: 2 },
      ],
    },
    {
      recruiterId: r4, type: 'INTERNSHIP',
      title: 'Cybersecurity Intern',
      description: 'Help Meta secure its platforms. Perform vulnerability assessments, penetration testing, and security code reviews. Learn from world-class security engineers.',
      stipend: 7000, duration: '4 months', deadline: new Date('2026-11-01'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'cybersecurity', weight: 5 },
        { skillName: 'python', weight: 4 },
        { skillName: 'linux', weight: 4 },
        { skillName: 'networking', weight: 3 },
      ],
    },

    // ── PROJECTS ──
    {
      recruiterId: r2, type: 'PROJECT',
      title: 'AI Chatbot for Customer Support',
      description: 'Build a production-grade AI chatbot using LangChain and OpenAI GPT-4. Integrate with a FastAPI backend and deploy on AWS. The chatbot will handle 10,000+ daily queries.',
      stipend: 5000, duration: '2 months', deadline: new Date('2026-08-31'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'python', weight: 5 },
        { skillName: 'nlp', weight: 5 },
        { skillName: 'rest apis', weight: 4 },
        { skillName: 'fastapi', weight: 4 },
        { skillName: 'aws', weight: 2 },
      ],
    },
    {
      recruiterId: r1, type: 'PROJECT',
      title: 'E-Commerce Platform MVP',
      description: 'Build a full-stack e-commerce platform from scratch using React, Node.js, and PostgreSQL. Features include product listings, cart, payments (Stripe), and admin panel.',
      stipend: 4000, duration: '3 months', deadline: new Date('2026-09-30'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'react', weight: 5 },
        { skillName: 'node.js', weight: 5 },
        { skillName: 'postgresql', weight: 4 },
        { skillName: 'stripe', weight: 3 },
        { skillName: 'css', weight: 2 },
      ],
    },
    {
      recruiterId: r3, type: 'PROJECT',
      title: 'Real-Time Analytics Dashboard',
      description: 'Create a real-time analytics dashboard using React, WebSockets, and BigQuery. Visualize millions of events per day with interactive charts and drill-down capabilities.',
      stipend: 6000, duration: '2 months', deadline: new Date('2026-08-15'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'react', weight: 5 },
        { skillName: 'python', weight: 4 },
        { skillName: 'sql', weight: 5 },
        { skillName: 'data analysis', weight: 4 },
        { skillName: 'javascript', weight: 3 },
      ],
    },
    {
      recruiterId: r5, type: 'PROJECT',
      title: 'Mobile App for Grocery Delivery',
      description: 'Build a cross-platform grocery delivery app using React Native. Features include live order tracking, payment gateway, push notifications, and an admin dashboard.',
      stipend: 3500, duration: '3 months', deadline: new Date('2026-10-31'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'react', weight: 5 },
        { skillName: 'javascript', weight: 5 },
        { skillName: 'node.js', weight: 4 },
        { skillName: 'rest apis', weight: 4 },
        { skillName: 'sql', weight: 2 },
      ],
    },
    {
      recruiterId: r2, type: 'PROJECT',
      title: 'Computer Vision Object Detection',
      description: 'Build and train a YOLO-based object detection model for retail shelf analysis. Use Python, PyTorch, and OpenCV. Deploy as a REST API for integration with mobile apps.',
      stipend: 4500, duration: '2 months', deadline: new Date('2026-09-15'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'python', weight: 5 },
        { skillName: 'machine learning', weight: 5 },
        { skillName: 'pytorch', weight: 5 },
        { skillName: 'opencv', weight: 4 },
        { skillName: 'rest apis', weight: 2 },
      ],
    },
    {
      recruiterId: r4, type: 'PROJECT',
      title: 'Social Media Sentiment Tracker',
      description: 'Build a tool that monitors and analyzes social media sentiment in real-time using Twitter API, Python, and NLP. Displays insights in a beautiful React dashboard.',
      stipend: 3000, duration: '2 months', deadline: new Date('2026-08-31'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'python', weight: 5 },
        { skillName: 'nlp', weight: 5 },
        { skillName: 'react', weight: 4 },
        { skillName: 'rest apis', weight: 3 },
        { skillName: 'data analysis', weight: 4 },
      ],
    },
    {
      recruiterId: r1, type: 'PROJECT',
      title: 'DevOps CI/CD Pipeline Setup',
      description: 'Set up a complete CI/CD pipeline for a microservices app using Docker, Kubernetes, GitHub Actions, and Helm. Include monitoring with Prometheus and Grafana.',
      stipend: 3500, duration: '1 month', deadline: new Date('2026-07-31'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'docker', weight: 5 },
        { skillName: 'kubernetes', weight: 5 },
        { skillName: 'git', weight: 4 },
        { skillName: 'linux', weight: 4 },
        { skillName: 'python', weight: 2 },
      ],
    },
    {
      recruiterId: r3, type: 'PROJECT',
      title: 'Blockchain Supply Chain Tracker',
      description: 'Build a blockchain-based supply chain transparency app using Solidity and Ethereum. Create a React frontend for tracking product origin, manufacturing, and delivery.',
      stipend: 5500, duration: '3 months', deadline: new Date('2026-10-15'),
      location: 'Remote', remote: true,
      skills: [
        { skillName: 'solidity', weight: 5 },
        { skillName: 'javascript', weight: 5 },
        { skillName: 'react', weight: 4 },
        { skillName: 'web3', weight: 5 },
        { skillName: 'node.js', weight: 3 },
      ],
    },
  ];

  let created = 0;
  for (const p of postings) {
    const { skills, ...postingData } = p;
    await prisma.posting.create({
      data: { ...postingData, postingSkills: { create: skills } },
    });
    created++;
    process.stdout.write(`\r   Creating postings: ${created}/${postings.length}`);
  }

  console.log(`\n\n✅ Done! Added ${postings.length} postings:`);
  console.log(`   📋 Internships: ${postings.filter(p => p.type === 'INTERNSHIP').length}`);
  console.log(`   🚀 Projects:    ${postings.filter(p => p.type === 'PROJECT').length}`);
  console.log(`\n   Companies: Google, Meta, TechCorp, StartupAI, Flipkart`);
  console.log(`   Skills covered: Python, React, Node.js, ML, DevOps, Android, and more!`);
}

main()
  .catch((e) => { console.error('\n❌ Failed:', e.message); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
