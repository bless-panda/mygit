/**
 * Vue的插件，获取和设置sessionStorage存储
*/

let session = {
  save (key, value) {
    sessionStorage.setItem(key, value)
  },
  fetch (key) {
    return sessionStorage.getItem(key)
  },
  clear () {
    sessionStorage.clear()
  }
}

export default {
  install (Vue) {
    Vue.prototype.$session = session
  }
}
