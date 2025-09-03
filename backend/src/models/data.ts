import { User } from './User';
import { Post } from './Post';
import { Comment } from './Comment';

/**
 * Temporary in-memory data stores.
 *
 * These arrays simulate a simple persistence layer. They should be
 * replaced with calls to an actual database for any production use.
 */
// Seed data: three users and three posts
// Note: these users have simple passwords and no hashed fields; for development only.
export const users: User[] = [
  {
    id: 'u1',
    name: 'Juan Pérez',
    email: 'abogado@example.com',
    password: 'abogado123',
    createdAt: new Date()
  },
  {
    id: 'u2',
    name: 'María García',
    email: 'maestro@example.com',
    password: 'maestro123',
    createdAt: new Date()
  },
  {
    id: 'u3',
    name: 'Carlos Martínez',
    email: 'doctor@example.com',
    password: 'doctor123',
    createdAt: new Date()
  }
];

export const posts: Post[] = [
  {
    id: 'p1',
    userId: 'u1',
    title: 'Experiencia legal de hoy',
    content: 'Hoy representé a un cliente en la corte y logramos un acuerdo favorable.',
    createdAt: new Date(),
    likes: 0
  },
  {
    id: 'p2',
    userId: 'u2',
    title: 'Clase de hoy',
    content: 'Hoy enseñé matemáticas a mis alumnos y exploramos ecuaciones cuadráticas.',
    createdAt: new Date(),
    likes: 0
  },
  {
    id: 'p3',
    userId: 'u3',
    title: 'Atención médica de hoy',
    content: 'Hoy atendí a varios pacientes con gripe y recomendé reposo e hidratación.',
    createdAt: new Date(),
    likes: 0
  }
];

export const comments: Comment[] = [];