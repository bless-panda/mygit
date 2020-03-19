<template>
  <el-container class="home-container" direction="vertical">
    <!-- 头部区域 -->
    <el-header>
      <div class="logo-box">
        <img src="../assets/img/pikaqiu.jpg" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="outLogin">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '65px' : '200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu
          class="el-menu-vertical-demo"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <!-- 一级菜单 -->
          <el-submenu v-for="item in menulist" :key="item.id" :index="item.id + ''">
            <!-- 一级菜单模板区域 -->
            <template slot="title">
              <i :class="menuIcon[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item v-for="option in item.children" :key="option.id" :index="'/' + option.path">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{option.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'home',
  created () {
    this.$Http.get('menus').then(response => {
      const { data: res } = response
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
    }).catch(console.log)
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (to.path !== '/') {
        vm.activePath = to.path.match(/^\/[a-zA-Z]+/)[0]
      }
    })
  },
  beforeRouteUpdate (to, from, next) {
    if (to.path !== '/') {
      this.activePath = to.path.match(/^\/[a-zA-Z]+/)[0]
    }
    next()
  },
  data () {
    return {
      menulist: [],
      menuIcon: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  methods: {
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    outLogin () {
      this.$session.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="scss" scoped>
  .home-container { height: 100%;
    .el-header { display: flex; background: #373d41; align-items: center; justify-content: space-between; padding-right: 50px; }
    .el-aside { background: #333744; color: #fff; }
  }
  .logo-box { height: 100%; display: flex; align-items: center;
    img { width: 50px; height: 50px; margin-right: 10px; border-radius: 50%; }
    span { font-size: 22px; color: #fff; }
  }
  .toggle-button { text-align: center; background: #4a5064; font-size: 12px; line-height: 25px; }
  .el-menu { border-right: none; }
  i.iconfont { margin-right: 10px; }
  .el-main { background: #eaedf1; }
</style>
