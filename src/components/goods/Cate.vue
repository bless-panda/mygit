<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb parentName='商品管理' authName="商品分类"></breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card shadow="never">
      <el-button type="primary" @click="showAddDialog">添加分类</el-button>
      <!-- 用户列表区域 -->
      <zk-table
      ref="table"
      sum-text="sum"
      show-index
      index-text="#"
      :data="cateList"
      :columns="columns"
      border
      tree-type
      :selection-type = "false"
      :expand-type = "false"
      >
        <template slot="deleted" scope="scope">
          <i :class="scope.cat_deleted ? 'el-icon-error' : 'el-icon-success'" style="color: #20b2aa;"></i>
        </template>
        <template slot="level" scope="scope">
          <el-tag type="" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <template slot="handle" scope="scope">
          <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="getCateById(scope.row.cat_id)">编辑</el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeCateById(scope.row.cat_id)">删除</el-button>
        </template>
      </zk-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加分类" :visible.sync="dialogAddVisible" width="50%" @close="closeAddDialog">
      <el-form :model="addForm" :rules="addRules" label-width="100px" ref="addForm">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader style="width: 100%;" clearable v-model="parentCateId" :options="parentCateList" :props="cateProps" ref="parentCate" @change="cateChangeHandle"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog title="修改分类" :visible.sync="dialogEditVisible" width="50%" @close="closeEditDialog">
      <el-form :model="editForm" :rules="addRules" label-width="100px" ref="editForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogEditVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitEditForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 分类列表数据
      cateList: [],
      // 总数
      total: 0,
      // 获取分类列表的数据对象
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 表格各列配置
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          type: 'template',
          template: 'deleted'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'level'
        },
        {
          label: '操作',
          width: '200px',
          type: 'template',
          template: 'handle'
        }
      ],
      // 父级分类列表
      parentCateList: [],
      // 父级分类id
      parentCateId: [],
      // 商品分类配置选项
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        checkStrictly: true
      },
      // 添加角色表单
      addForm: {
        // 分类父ID
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 分类层级
        cat_level: 0
      },
      // 添加分类对话框
      dialogAddVisible: false,
      addRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 修改分类对话框
      dialogEditVisible: false,
      // 修改表单
      editForm: {}
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    getCateList () {
      this.$Http.get('categories', {
        params: this.queryInfo
      }).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败')
        this.total = res.data.total
        this.cateList = res.data.result
      })
    },
    // 监听pagesize改变事件
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`);
      this.queryInfo.pagesize = val
      this.getCateList()
    },
    // 监听pagenum改变事件
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`);
      this.queryInfo.pagenum = val
      this.getCateList()
    },
    // 展开添加分类对话框
    showAddDialog () {
      this.dialogAddVisible = true
      this.$Http.get('categories', {
        params: { type: 2 }
      }).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败')
        this.parentCateList = res.data
      })
    },
    // 分类选择改变
    cateChangeHandle (val) {
      this.addForm.cat_pid = val.length > 0 ? val[val.length - 1] : 0
      this.addForm.cat_level = val.length
      if (this.$refs.parentCate) {
        this.$refs.parentCate.dropDownVisible = false // 监听值发生变化就关闭它
      }
    },
    // 关闭添加分类对话框
    closeAddDialog () {
      this.$refs.addForm.resetFields()
      this.parentCateId = []
    },
    // 添加分类，提交
    submitAddForm () {
      this.$refs.addForm.validate(valid => {
        if (!valid) return
        this.$Http.post('categories', this.addForm).then(response => {
          const res = response.data
          if (res.meta.status !== 201) return this.$message.error('添加分类失败')
          // 成功提示
          this.$message.success('添加分类成功')
          // 关闭对话框
          this.dialogAddVisible = false
          // 刷新数据
          this.getCateList()
        })
      })
    },
    // 打开修改对话框
    getCateById (id) {
      this.$Http.get(`categories/${id}`).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取分类信息失败')
        // 获取成功
        this.editForm = res.data
        console.log(this.editForm)
        // 打开对话框
        this.dialogEditVisible = true
      })
    },
    // 关闭修改对话框
    closeEditDialog () {
      this.$refs.editForm.resetFields()
    },
    // 修改参数，提交
    submitEditForm () {
      this.$refs.editForm.validate(valid => {
        if (!valid) return
        let editForm = this.editForm
        console.log(editForm)
        this.$Http.put(`categories/${editForm.cat_id}`, {
          cat_name: editForm.cat_name
        }).then(response => {
          const res = response.data
          if (res.meta.status !== 200) return this.$message.error('修改参数失败')
          // 修改成功
          this.$message.success('修改分类成功')
          // 关闭对话框
          this.dialogEditVisible = false
          // 刷新数据
          this.getCateList()
        })
      })
    },
    // 删除参数
    async removeCateById (id) {
      const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancleButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 取消删除
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 确定删除，发送请求
      this.$Http.delete(`categories/${id}`).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('删除分类失败')
        // 成功提示
        this.$message.success('删除分类成功')
        // 刷新列表
        this.getCateList()
      })
    }
  }
}
</script>

<style lang="scss">
  .el-cascader-panel {
    .el-radio { height: 100%; width: 100%; position: absolute; left: 0; top: 0; z-index: 10;
      span { visibility: hidden; }
    }
  }
</style>
