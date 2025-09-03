import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} from '../controllers/usersController';

const router = Router();

// Retrieve all users
router.get('/', getUsers);
// Retrieve a single user by id
router.get('/:id', getUser);
// Update a user
router.put('/:id', updateUser);
// Delete a user
router.delete('/:id', deleteUser);

export default router;