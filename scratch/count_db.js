const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const postings = await prisma.posting.count();
  const skills = await prisma.skill.count();
  const candidates = await prisma.candidateProfile.count();
  const recruiters = await prisma.recruiterProfile.count();
  console.log({ postings, skills, candidates, recruiters });
  
  const sample = await prisma.posting.findMany({
    take: 5,
    include: { postingSkills: true }
  });
  console.log("Postings Sample:", JSON.stringify(sample, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
