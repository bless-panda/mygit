<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb parentName='用户管理' authName="用户列表"></breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card shadow="never">

      <!-- 搜索&添加用户区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="changeData">
            <el-button slot="append" icon="el-icon-search" @click="changeData"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="changeMgState(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editBtnHandle(scope.row)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteBtnHandle(scope.row.id)"></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="roleBtnHandle(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogAdd" width="50%" @close="closeAddDialog">
      <el-form :model="addForm" :rules="addRules" label-width="100px" ref="addForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAdd = false">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户信息" :visible.sync="dialogEdit" width="50%" @close="closeEditDialog">
      <el-form :model="currentRowUserData" :rules="editRules" label-width="100px" ref="editForm">
        <el-form-item label="用户名">
          <el-input v-model="currentRowUserData.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="currentRowUserData.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="currentRowUserData.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogEdit = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="分配角色" :visible.sync="dialogRole" width="40%" @close="closeRoleDialog">
      <p>当前的用户：{{currentRowUserData.username}}</p>
      <p>当前的角色：{{currentRowUserData.role_name}}</p>
      <p>分配新角色：
        <el-select v-model="newRole" placeholder="请选择">
          <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogRole = false">取 消</el-button>
        <el-button type="primary" @click="submitRoleChange">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }

    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
      // 用户列表数据
      userlist: [],
      // 获取用户列表的数据对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 总页数
      total: 0,
      // 添加用户对话框
      dialogAdd: false,
      // 添加用户表单
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 修改用户信息对话框
      dialogEdit: false,
      // 分配用户角色对话框
      dialogRole: false,
      // 角色列表
      roleList: [],
      // 选中的新角色
      newRole: '',
      // 当前行用户数据
      currentRowUserData: {},
      addRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      editRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.changeData()
  },
  methods: {
    // 获取用户列表数据
    changeData () {
      this.$Http.get('users', {
        params: this.queryInfo
      }).then(response => {
        let { data: res } = response
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.userlist = res.data.users
        this.total = res.data.total
      }).catch(console.log)
    },
    // 监听 switch 开关状态的改变
    changeMgState (item) {
      this.$Http.put(`users/${item.id}/state/${item.mg_state}`).then(response => {
        let { data: res } = response
        if (res.meta.status !== 200) {
          item.mg_state = !item.mg_state
          return this.$message.error('更改用户状态失败')
        }
        this.$message.success('更改用户状态成功')
      }).catch(console.log)
    },
    // 监听pagesize改变的事件
    handleSizeChange (val) {
      this.queryInfo.pagesize = val
      this.changeData()
    },
    // 监听页码值改变的事件
    handleCurrentChange (val) {
      this.changeData()
    },
    // 展示添加用户的对话框
    showAddDialog () {
      this.dialogAdd = true
    },
    // 添加用户对话框关闭事件
    closeAddDialog () {
      this.$refs.addForm.resetFields()
    },
    // 添加用户，提交
    submitAddForm () {
      this.$refs.addForm.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$Http.post('users', this.addForm)
        if (res.meta.status === 201) {
          // 关闭对话框
          this.dialogAdd = false
          // 刷新数据列表
          this.changeData()
          // 提示添加成功
          this.$message.success('添加用户成功')
        } else {
          this.$message.error('添加用户失败')
        }
      })
    },
    // 展示编辑用户的对话框
    editBtnHandle (item) {
      this.currentRowUserData = JSON.parse(JSON.stringify(item))
      this.dialogEdit = true
    },
    // 修改用户信息并提交
    submitEditForm () {
      this.$refs.editForm.validate(async (valid) => {
        if (!valid) return
        // 发起修改用户信息的数据请求
        const { data: res } = await this.$Http.put('users/' + this.currentRowUserData.id, {
          email: this.currentRowUserData.email,
          mobile: this.currentRowUserData.mobile
        })
        if (res.meta.status === 200) {
          // 关闭对话框
          this.dialogEdit = false
          // 刷新数据列表
          this.changeData()
          // 提示修改成功
          this.$message.success('更新用户信息成功')
        } else {
          this.$message.error('更新用户信息失败')
        }
      })
    },
    // 根据Id删除对应的用户信息
    async deleteBtnHandle (userId) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')

      // 确定删除，发送请求
      const { data: res } = await this.$Http.delete(`users/${userId}`)
      if (res.meta.status === 200) {
        this.$message.success('删除成功')
        // 刷新数据列表
        this.changeData()
      } else {
        this.$message.error('删除失败')
      }
    },
    // 监听对话框关闭事件
    closeEditDialog () {
      this.$refs.editForm.resetFields()
      this.currentRowUserData = {}
    },
    closeRoleDialog () {
      this.newRole = ''
      this.currentRowUserData = {}
    },
    // 展示分配角色的对话框
    roleBtnHandle (item) {
      this.currentRowUserData = JSON.parse(JSON.stringify(item))
      // h获取角色列表
      this.$Http.get('roles').then(response => {
        let { data: res } = response
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.roleList = res.data
        this.dialogRole = true
      }).catch(console.log)
    },
    // 分配角色 提交
    submitRoleChange () {
      if (!this.newRole) return this.$message.warning('请选择要分配的新角色！')
      this.$Http.put(`users/${this.currentRowUserData.id}/role`, {
        rid: this.newRole
      }).then(response => {
        const { data: res } = response
        if (res.meta.status === 200) {
          this.dialogRole = false
          this.changeData()
          this.$message.success('分配新角色成功')
        } else {
          this.$message.error('分配新角色失败')
        }
      }).catch(console.log)
    }
  }
}
</script>
