import express from 'express';
import authRouter from '../modules/auth/auth.routes';
import userRoutes from '../modules/user/user.routes';
import habitRoutes from '../modules/habits/habiits.routes';
import exerciseRoutes from '../modules/workout/exercise.routes';
import foodRoutes from '../modules/foodLooging/food.route';
import barbellRoutes from '../modules/barbellLLM/barbel.routes';
import tipsRoute from '../modules/tips/tips.route';
import articleRoute from '../modules/tips/articleTips/article.route';
import analysisRoutes from '../modules/analysis/analysis.route';
import foodAnalysisRoutes from '../modules/foodAnalysis/foodanalysis.route';
import notificationRouter from '../modules/notifications/notification.route';
import privacyPolicyRoutes from '../modules/privacyPolicy/privacyPolicy.route';

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
  },
  {
    path: '/barbelLLM',
    router:barbellRoutes,
  },
  {
    path: '/tips',
    router: tipsRoute,
  },
  {
    path: '/articles',
    router: articleRoute,
  },
  {
    path: '/analysis',
    router: analysisRoutes,
  },
  {
    path: '/foodAnalysis',
    router: foodAnalysisRoutes,
  },
  {
    path: '/notifications',
    router: notificationRouter,
  },
  {
    path: '/privacy-policy',
    router: privacyPolicyRoutes,
  }
];

moduleRouts.forEach(({ path, router }) => {
  Routes.use(path, router);
});

export default Routes;
