<template>
  <div class="login-container">
    <div class="login-box">
      <div class="img-wrap">
        <img src="../assets/logo.png" alt="">
      </div>
      <el-form :model="loginForm" :rules="loginRules" ref="loginForm" class="login-form">
        <el-form-item prop="username" prefix-icon="iconfont icon-user">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input type="password" v-model="loginForm.password" prefix-icon="iconfont icon-3702mima"></el-input>
        </el-form-item>
        <el-form-item class="btn-wrap">
          <el-button type="primary" @click="submitLoginForm">登录</el-button>
          <el-button @click="resetForm('loginForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import NProgress from 'nprogress'
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  beforeRouteEnter (to, from, next) {
    NProgress.start()
    next()
  },
  mounted () {
    NProgress.done()
  },
  methods: {
    submitLoginForm () {
      this.$refs.loginForm.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$Http.post('login', this.loginForm)
        if (res.meta.status === 200) {
          this.$message.success({ showClose: true, message: '登录成功！' })
          this.$session.save('token', res.data.token)
          this.$router.push('/')
        } else {
          this.$message.error({ showClose: true, message: '登录失败！' })
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
  .login-container { background: #2b4b6b; height: 100%; }
  .login-box { width: 450px; margin-bottom: 65px; background: #fff; border-radius: 4px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    .img-wrap { width: 130px; height: 130px; background: #fff; padding: 10px; border-radius: 50%; box-shadow: 0 0 10px #ddd; margin: -65px auto 0; overflow: hidden; border: 1px solid #eee;
      img { background: #eee; border-radius: 50%; }
    }
  }
  .login-form { padding: 40px 20px 20px;
    .btn-wrap { text-align: right; margin-bottom: 0; }
  }
</style>
