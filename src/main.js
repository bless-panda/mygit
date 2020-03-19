import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Axios from 'axios'
import './plugins/element'
// 导入全局样式
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入 NProgress 包对应的JS和CSS
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import Utile from './plugins/utils'
// 导入富文本编辑器对应的JS和CSS
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
// 导入树形表格组件
import ZkTable from 'vue-table-with-tree-grid'
// 注册全局组件
import breadcrumb from './components/common/breadcrumb'
Vue.component(breadcrumb.name, breadcrumb)

Vue.config.productionTip = false

Vue.prototype.$Http = Axios
Axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Axios.interceptors.request.use(function (config) {
  // console.log('发送请求')
  NProgress.start()
  config.headers.Authorization = Vue.prototype.$session.fetch('token')
  return config
})
Axios.interceptors.response.use(function (data) {
  // console.log('接收数据')
  NProgress.done()
  return data
})

Vue.use(Utile)
// 富文本编辑器
Vue.use(VueQuillEditor)
// 树形表格
Vue.use(ZkTable)

Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  function padStartZero (n) {
    return n < 10 ? '0' + n : n
  }
  const y = dt.getFullYear()
  const m = dt.getMonth() + 1
  const d = dt.getDate()
  const h = dt.getHours()
  const mm = dt.getMinutes()
  const s = dt.getSeconds()
  return `${y}-${padStartZero(m)}-${padStartZero(d)} ${padStartZero(h)}:${padStartZero(mm)}:${padStartZero(s)}`
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
