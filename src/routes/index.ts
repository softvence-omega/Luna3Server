import express from 'express';
import authRouter from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import habitRoutes from '../modules/habits/habiits.routes';
import exerciseRoutes from '../modules/workout/exercise.routes';
import foodRoutes from '../modules/foodLooging/food.route';

const Routes = express.Router();
// Array of module routes
const moduleRouts = [
  {
    path: '/auth',
    router: authRouter,
  },
  {
    path: '/users',
    router:userRoutes,
  },
  {
    path: '/habits',
    router:habitRoutes,
  },
  {
    path: '/exercise',
    router:exerciseRoutes,
  },
  {
    path: '/foods',
    router:foodRoutes,
  }
];

moduleRouts.forEach(({ path, router }) => {
  Routes.use(path, router);
});

export default Routes;
