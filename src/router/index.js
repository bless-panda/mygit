import Vue from 'vue'
import VueRouter from 'vue-router'

// import Home from '@/views/Home'
// import Login from '@/views/Login'
// import Welcome from '@/components/Welcome'
// import User from '@/components/User'

const Login = () => import(/* webpackChunkName: "login" */'@/views/Login')
const Home = () => import(/* webpackChunkName: "home_welcome" */'@/views/Home')
const Welcome = () => import(/* webpackChunkName: "home_welcome" */'@/components/Welcome')
const Users = () => import(/* webpackChunkName: "user_roles_rights" */'@/components/user/Users')
const Roles = () => import(/* webpackChunkName: "user_roles_rights" */'@/components/rights/Roles')
const Rights = () => import(/* webpackChunkName: "user_roles_rights" */'@/components/rights/Rights')
const GoodsList = () => import(/* webpackChunkName: "list_add" */'@/components/goods/List')
const GoodsAdd = () => import(/* webpackChunkName: "list_add" */'@/components/goods/Add')
const GoodsParams = () => import(/* webpackChunkName: "params_user" */'@/components/goods/Params')
const GoodsCate = () => import(/* webpackChunkName: "params_user" */'@/components/goods/Cate')
const Orders = () => import(/* webpackChunkName: "orders_" */'@/components/orders/Orders')
const Reports = () => import(/* webpackChunkName: "params_user" */'@/components/reports/Reports')

Vue.use(VueRouter)

const routes = [
  { path: '/login', name: 'Login', component: Login },
  {
    path: '/',
    component: Home,
    meta: {
      login: true
    },
    children: [
      { path: '', component: Welcome },
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/goods', component: GoodsList },
      { path: '/goods/add', component: GoodsAdd },
      { path: '/params', component: GoodsParams },
      { path: '/categories', component: GoodsCate },
      { path: '/orders', component: Orders },
      { path: '/reports', component: Reports }
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  if (to.matched.some(item => item.meta.login)) {
    if (!router.app.$session.fetch('token')) return next('/login')
  }
  next()
})

export default router
