// vue.config.js
module.exports = {
  // 选项...
  publicPath: process.env.NODE_ENV === 'production' ? '/dist/' : '/',
  chainWebpack: config => {
    // 移除 prefetch 插件
    // config.plugins.delete('prefetch-index')

    // 或者
    // 修改它的选项：
    // config.plugin('prefetch').tap(options => {
    //   options[0].fileBlacklist = options[0].fileBlacklist || []
    //   options[0].fileBlacklist.push(/myasyncRoute(.)+?\.js$/)
    //   return options
    // })
  },
  pages: {
    index: {
      entry: 'src/main.js',
      title: '电商管理系统'
    }
  }
}
