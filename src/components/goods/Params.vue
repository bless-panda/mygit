<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb parentName='商品管理' authName="参数列表"></breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card shadow="never">
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <el-form label-position="left" class="form-params">
        <el-form-item label="选择商品分类:">
          <el-cascader v-model="checkedCate" :options="cateList" :props="cateProps" @change="cateChangeHandle"></el-cascader>
        </el-form-item>
      </el-form>
       <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="small" :disabled="!isGetData" @click="showAddDialog">添加参数</el-button>
          <!-- 参数列表区域 -->
          <el-table :data="paramsList" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag :key="index" v-for="(item, index) in scope.row.attr_vals" closable @close="handleClose(scope.row,index)">{{item}}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <el-button class="button-new-tag" v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="getParamsById(scope.row)">修改</el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParam(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="small" :disabled="!isGetData" @click="showAddDialog">添加属性</el-button>
          <!-- 属性列表区域 -->
          <el-table :data="attrsList" stripe border>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag :key="index" v-for="(item, index) in scope.row.attr_vals" closable @close="handleClose(scope.row,index)">{{item}}</el-tag>
                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" @blur="handleInputConfirm(scope.row)"></el-input>
                <el-button class="button-new-tag" v-else size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <!-- 修改按钮 -->
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="getParamsById(scope.row)">修改</el-button>
                <!-- 删除按钮 -->
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParam(scope.row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加'+this.title" :visible.sync="dialogAddVisible" width="50%" @close="closeAddDialog">
      <el-form :model="addForm" :rules="addRules" label-width="100px" ref="addForm">
        <el-form-item :label="this.title" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAddVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAddForm">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数的对话框 -->
    <el-dialog :title="'修改'+this.title" :visible.sync="dialogEditVisible" width="50%" @close="closeEditDialog">
      <el-form :model="editForm" :rules="addRules" label-width="100px" ref="editForm">
        <el-form-item :label="this.title" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
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
      // 商品分类列表
      cateList: [],
      // 商品分类配置选项
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 选中的商品分类
      checkedCate: '',
      activeName: 'many',
      // 参数列表数据
      paramsList: [],
      // 属性列表数据
      attrsList: [],
      // 是否显示按钮
      isGetData: false,
      title: '动态参数',
      // 添加对话框
      dialogAddVisible: false,
      // 添加参数表单
      addForm: {
        attr_name: ''
      },
      // 添加参数表单验证
      addRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改参数对话框
      dialogEditVisible: false,
      // 修改参数表单
      editForm: {}
    }
  },
  computed: {
    cateId () {
      return this.checkedCate[2]
    }
  },
  created () {
    // 获取商品分类列表
    this.$Http.get('categories', {
      parmas: {
        type: [1, 2, 3]
      }
    }).then(response => {
      const res = response.data
      if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
      this.cateList = res.data
    })
  },
  methods: {
    // 分类选择改变
    cateChangeHandle () {
      this.getDataList()
    },
    // 标签页切换
    handleClick () {
      this.getDataList()
      // 改变对话框标题
      if (this.activeName === 'many') {
        this.title = '动态参数'
      } else if (this.activeName === 'only') {
        this.title = '静态属性'
      }
    },
    // 获取参数列表
    getDataList () {
      // 判断只能选第三级分类
      if (this.checkedCate.length !== 3) {
        this.checkedCate = []
        this.paramsList = []
        this.attrsList = []
        this.isGetData = false
        return false
      }
      this.$Http.get(`categories/${this.cateId}/attributes`, {
        params: {
          sel: this.activeName
        }
      }).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取商品参数失败')
        res.data.forEach(item => {
          item.inputVisible = false
          item.inputValue = ''
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        if (this.activeName === 'many') {
          this.paramsList = res.data
        } else if (this.activeName === 'only') {
          this.attrsList = res.data
        }
        this.isGetData = true
      })
    },
    // 删除参数
    async removeParam (item) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancleButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // 取消删除
      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      // 确定删除，发送请求
      this.$Http.delete(`categories/${item.cat_id}/attributes/${item.attr_id}`).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('删除参数失败')
        // 成功提示
        this.$message.success('删除参数成功')
        // 刷新列表
        this.getDataList()
      })
    },
    // 删除参数项按钮
    handleClose (item, i) {
      item.attr_vals.splice(i, 1)
      this.saveAttrVals(item)
    },
    // 点击添加标签按钮，显示输入框
    showInput (item) {
      item.inputVisible = true
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 添加标签，关闭输入框，发送请求
    handleInputConfirm (item) {
      let inputValue = item.inputValue.trim()
      if (inputValue.length !== 0) {
        item.attr_vals.push(inputValue)
        this.saveAttrVals(item)
      }
      item.inputVisible = false
      item.inputValue = ''
    },
    // 修改、删除参数项
    saveAttrVals (item) {
      this.$Http.put(`categories/${item.cat_id}/attributes/${item.attr_id}`, {
        attr_name: item.attr_name,
        attr_sel: this.activeName,
        attr_vals: item.attr_vals.join(',')
      }).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('修改参数项失败')
      })
    },
    // 打开添加对话框
    showAddDialog () {
      this.dialogAddVisible = true
    },
    // 关闭添加对话框
    closeAddDialog () {
      this.$refs.addForm.resetFields()
    },
    // 添加参数，提交
    submitAddForm () {
      this.$refs.addForm.validate(valid => {
        if (!valid) return
        this.$Http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        }).then(response => {
          const res = response.data
          if (res.meta.status !== 201) return this.$message.error('添加参数失败')
          // 修改成功
          this.$message.success('添加参数成功')
          // 关闭对话框
          this.dialogAddVisible = false
          // 刷新数据
          this.getDataList()
        })
      })
    },
    // 打开修改对话框
    getParamsById (item) {
      this.$Http.get(`categories/${item.cat_id}/attributes/${item.attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      }).then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取参数信息失败')
        // 获取成功
        this.editForm = res.data
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
        this.$Http.put(`categories/${editForm.cat_id}/attributes/${editForm.attr_id}`, {
          attr_name: editForm.attr_name,
          attr_sel: this.activeName
        }).then(response => {
          const res = response.data
          if (res.meta.status !== 200) return this.$message.error('修改参数失败')
          // 修改成功
          this.$message.success('修改参数成功')
          // 关闭对话框
          this.dialogEditVisible = false
          // 刷新数据
          this.getDataList()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-alert { margin-bottom: 20px; }
  .el-tag { margin: 10px 5px; }
  .button-new-tag { margin: 10px 5px; height: 32px; line-height: 30px; padding-top: 0; padding-bottom: 0; }
  .input-new-tag { width: 90px; margin: 10px 5px; vertical-align: middle; }
</style>
