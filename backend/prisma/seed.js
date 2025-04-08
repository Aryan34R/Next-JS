const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const superadminEmail = "superadmin@gmail.com";

  const existingUser = await prisma.user.findUnique({
    where: { email: superadminEmail },
  });

  if (!existingUser) {
    const hashedPassword = await bcrypt.hash("qwerty", 10);

    await prisma.user.create({
      data: {
        firstName: "Super",
        lastName: "Admin",
        email: superadminEmail,
        password: hashedPassword,
        role: 1, 
      },
    });

    console.log("Superadmin user created successfully!");
  } else {
    console.log("Superadmin already exists.");
  }
}

main()
  .catch((e) => {
    console.error("Error seeding superadmin:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
