import Vue from 'vue';
import VueRouter from 'vue-router';
import NotFound from '../pages/404/index.vue';
import { dynamicLoadPacks } from '../utils/dynamicLoad';

Vue.use(VueRouter);

let routes = dynamicLoadPacks()
  .filter(pkg => pkg.page)
  .map(pkg => {
    const { name, component } = pkg;

    console.log('page:::::', pkg.page);

    return {
      path: `/${pkg.pathName}`,
      name,
      component: pkg.page,
      meta: {
        componentName: pkg.name
      }
    };
  });

routes = [
  ...routes,
  {
    path: '*',
    name: 'not-found',
    component: NotFound
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
});

export default router;
