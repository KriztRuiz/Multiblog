import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const abogado = await prisma.user.create({
    data: {
      name: "Juan Pérez",
      email: "abogado@example.com",
      password: await bcrypt.hash("abogado123", 10),
    },
  });

  const maestro = await prisma.user.create({
    data: {
      name: "María López",
      email: "maestro@example.com",
      password: await bcrypt.hash("maestro123", 10),
    },
  });

  const doctor = await prisma.user.create({
    data: {
      name: "Carlos Gómez",
      email: "doctor@example.com",
      password: await bcrypt.hash("doctor123", 10),
    },
  });

  await prisma.post.create({
    data: {
      title: "Experiencia legal de hoy",
      content:
        "Hoy representé a un cliente en la corte y logramos un acuerdo favorable.",
      authorId: abogado.id,
    },
  });

  await prisma.post.create({
    data: {
      title: "Clase de hoy",
      content:
        "Hoy enseñé matemáticas a mis alumnos y exploramos ecuaciones cuadráticas.",
      authorId: maestro.id,
    },
  });

  await prisma.post.create({
    data: {
      title: "Atención médica de hoy",
      content:
        "Hoy atendí a varios pacientes con gripe y recomendé reposo e hidratación.",
      authorId: doctor.id,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
