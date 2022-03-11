import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '../views/Home.vue';
import Subscribe from '../views/Subscribe/index.vue';
import entryForm from '../views/Subscribe/entryForm.vue';
import forgetPwd from '../views/forgetPwd/index.vue';
import grayInit from '@/packages/app-shared/gray-init';

Vue.use(VueRouter);

const routes = [
  {
    path: '/lives/watch/:id',
    component: Home,
    name: 'LiveRoom',
    meta: { title: '直播间', grayType: 'webinar' }
  },
  {
    path: '/lives/embedclient/watch/:id', //嵌入观看页
    component: Home,
    name: 'LiveEmbedRoom',
    meta: { title: '直播间嵌入', grayType: 'webinar' }
  },
  {
    path: '/lives/subscribe/:id',
    component: Subscribe,
    name: 'Subscribe',
    meta: { title: '预约', grayType: 'webinar' }
  },
  {
    path: '/lives/embedclient/subscribe/:id', //嵌入预约页
    component: Subscribe,
    name: 'SubscribeEmbed',
    meta: { title: '预约嵌入', grayType: 'webinar' }
  },
  {
    path: '/lives/entryform/:id',
    component: entryForm,
    name: 'entryForm',
    meta: { title: '独立报名表单' }
  },
  {
    path: '/forgetPwd',
    component: forgetPwd,
    name: 'forgetPwd',
    meta: { title: '忘记密码' }
  },
  {
    path: '/lives/error/:id/:code', // 统一错误页
    name: 'PageError',
    meta: { title: '系统异常' },
    component: () => import('../views/ErrorPage/error.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.ROUTER_BASE_URL,
  routes
});

router.beforeEach(async (to, from, next) => {
  const res = await grayInit(to);
  if (res) {
    console.log('---grayInit---', res);
    //处理限流逻辑
    if (res.code == 200) {
      //处理灰度
      // const VUE_MIDDLE_SAAS_LIVE_PC_PROJECT = process.env.VUE_MIDDLE_SAAS_LIVE_PC_PROJECT;
      // const VUE_APP_WEB_BASE_MIDDLE = process.env.VUE_APP_WEB_BASE_MIDDLE;
      // let protocol = window.location.protocol;
      // // 如果是中台用户, 跳转到中台
      // if (res.data.is_csd_user == 1) {
      //   if (window.location.origin != `${protocol}${VUE_APP_WEB_BASE_MIDDLE}`) {
      //     window.location.href = `${protocol}${VUE_APP_WEB_BASE_MIDDLE}/${VUE_MIDDLE_SAAS_LIVE_PC_PROJECT}${window.location.pathname}`;
      //   }
      // }
      next();
    } else {
      next({
        name: 'PageError',
        params: {
          id: to.params.id,
          code: res.code
        }
      });
    }
  } else {
    next();
  }
});

export default router;
