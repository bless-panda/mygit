<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb parentName='权限管理' authName="角色列表"></breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card shadow="never">
      <!-- 添加按钮 -->
      <el-button type="primary" @click="showAddDialog">添加角色</el-button>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" stripe border>
        <el-table-column type="expand">
          <template slot-scope="props">
            <!-- 渲染一级权限 -->
            <el-row :class="['vcenter', 'bdBottom', i==0 ? 'bdTop' : '']" v-for="(item1,i) in props.row.children" :key="item1.id">
              <el-col :span="5">
                <el-tag closable @close="removeRoleRight(props.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row :class="['vcenter', i==0 ? '': 'bdTop']" v-for="(item2,i) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag closable @close="removeRoleRight(props.row, item2.id)" type="success">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染三级权限 -->
                  <el-col :span="18">
                    <el-tag closable @close="removeRoleRight(props.row, item3.id)" type="warning" v-for="item3 in item2.children" :key="item3.id">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="getRoleById(scope.row.id)">编辑</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip class="item" effect="dark" content="分配角色" placement="top">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRights(scope.row)">分配权限</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="dialogAddVisible" width="50%" @close="closeAddDialog">
      <el-form :model="addForm" :rules="addRules" label-width="100px" ref="addForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="dialogEditVisible" width="50%" @close="closeEditDialog">
      <el-form :model="editForm" :rules="addRules" label-width="100px" ref="editForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="dialogSetVisible" width="50%" @close="closeSetDialog">
      <el-tree :data="rightsData" :props="rightsTreeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="rightsChecked" ref="rightsTree"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogSetVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmSet">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 角色列表
      rolesList: [],
      // 添加角色对话框
      dialogAddVisible: false,
      // 添加角色表单
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加表单验证
      addRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      // 修改角色对话框
      dialogEditVisible: false,
      // 修改角色表单
      editForm: {},
      // 分配角色对话框
      dialogSetVisible: false,
      // 权限列表
      rightsData: [],
      // 权限树形配置
      rightsTreeProps: {
        children: 'children',
        label: 'authName'
      },
      // 当前选中的角色数据
      currentRole: {},
      // 选中的权限
      rightsChecked: []
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    // 获取角色列表
    getRoleList () {
      this.$Http.get('roles').then(response => {
        const { data: res } = response
        if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
        this.rolesList = res.data
      }).catch(console.log)
    },
    // 展示添加角色对话框
    showAddDialog () {
      this.dialogAddVisible = true
    },
    // 关闭添加角色对话框
    closeAddDialog () {
      this.$refs.addForm.resetFields()
    },
    // 添加角色，提交
    submitAddForm () {
      this.$refs.addForm.validate(valid => {
        if (!valid) return
        this.$Http.post('roles', this.addForm).then(response => {
          const res = response.data
          if (res.meta.status !== 201) return this.$message.error('添加角色失败')
          // 关闭对话框
          this.dialogAddVisible = false
          // 成功提示
          this.$message.success('添加角色成功')
          // 刷新角色列表
          this.getRoleList()
        })
      })
    },
    // 查询角色，展示修改角色对话框
    getRoleById (id) {
      this.$Http.get('roles/' + id).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('查询角色失败')
        this.editForm = res.data
        this.dialogEditVisible = true
      })
    },
    // 关闭修改角色对话框
    closeEditDialog () {
      this.$refs.editForm.resetFields()
    },
    // 修改角色，提交
    submitEditForm () {
      this.$refs.editForm.validate(valid => {
        if (!valid) return
        this.$Http.put('roles/' + this.editForm.roleId, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        }).then(response => {
          const res = response.data
          if (res.meta.status !== 200) return this.$message.error('修改角色失败')
          // 关闭对话框
          this.dialogEditVisible = false
          // 成功提示
          this.$message.success('修改角色成功')
          // 刷新角色列表
          this.getRoleList()
        })
      })
    },
    // 删除角色
    async removeRoleById (roleId) {
      const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancleButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 取消删除
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 确定删除，发送请求
      this.$Http.delete('roles/' + roleId).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('删除角色失败')
        // 成功提示
        this.$message.success('删除角色成功')
        // 刷新角色列表
        this.getRoleList()
      })
    },
    // 分配权限
    setRights (currentRole) {
      this.currentRole = currentRole
      // 获取权限列表
      this.$Http.get('rights/tree').then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
        // 获取权限列表成功，渲染树形控件
        this.rightsData = res.data
        // 递归获取三级节点的id
        this.getLeafKeys(currentRole, this.rightsChecked)
        // 打开分配权限对话框
        this.dialogSetVisible = true
      })
    },
    // 通过递归方式，获取角色下所有三级权限的id，并保存到数组里
    getLeafKeys (node, arr) {
      // 如果当前node节点没有children属性，则是三级节点
      if (!node.children) return arr.push(node.id)
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    // 关闭分配权限对话框
    closeSetDialog () {
      this.rightsChecked = []
    },
    // 确定分配权限
    confirmSet () {
      let pramas = []
      this.$refs.rightsTree.getCheckedNodes(false, true).forEach(item => {
        pramas.push(item.id)
      })
      this.$Http.post('roles/' + this.currentRole.id + '/rights', {
        rids: pramas.join(',')
      }).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('分配权限失败')
        // 关闭对话框
        this.dialogSetVisible = false
        // 成功提示
        this.$message.success('分配权限成功')
        // 刷新角色列表
        this.getRoleList()
      })
    },
    // 删除角色指定权限
    removeRoleRight (role, rightId) {
      this.$Http.delete(`roles/${role.id}/rights/${rightId}`).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('取消权限失败')
        // 成功提示
        this.$message.success('取消权限成功')
        // 刷新权限
        // this.getRoleList()
        this.rolesList.forEach(item => {
          if (item.id === role.id) {
            role.children = res.data
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-tag { margin: 10px 5px; }
  .bdTop { border-top: 1px solid #eee; }
  .bdBottom { border-bottom: 1px solid #eee; }
  .vcenter { display: flex; align-items: center; }
</style>
