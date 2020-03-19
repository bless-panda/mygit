<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb parentName='商品管理' authName="添加商品"></breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card shadow="never">
      <!-- 标题 -->
      <el-alert title="消息提示的文案" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤 -->
      <el-steps :active="activeIndex - 0" finish-status="success" space="80%" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs标签页 -->
      <el-form :model="addForm" :rules="addRules" label-position="top" ref="addForm">
        <el-tabs v-model="activeIndex"  tab-position="left" :before-leave="tabBeforeLeaveFn" @tab-click="tabClickHandle">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" @change="cateChangeHandle"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="(item, index) in manyAttrData" :key="item.attr_id">
              <!-- 复选框组 -->
              <el-checkbox-group v-model="checkedAttrs[index]['attr_vals']">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染表单的Item项 -->
            <el-form-item :label="item.attr_name" v-for="item in onlyAttrData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload class="upload-demo" :action="uploadUrl" :headers="headerObj" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
             <quill-editor v-model="addForm.goods_introduce" ref="myQuillEditor"></quill-editor>
             <el-button type="primary" style="margin-top:15px;" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible">
      <img width="100%" :src="previewImageUrl" alt="">
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
      cateProps: { expandTrigger: 'hover', value: 'cat_id', label: 'cat_name' },
      // 步骤index
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        attrs: [],
        pics: [],
        goods_introduce: ''
      },
      addRules: {
        goods_name: { required: true, message: '请输入商品名称', trigger: 'blur' },
        goods_price: { required: true, message: '请输入商品价格', trigger: 'blur' },
        goods_weight: { required: true, message: '请输入商品重量', trigger: 'blur' },
        goods_number: { required: true, message: '请输入商品数量', trigger: 'blur' },
        goods_cat: { required: true, message: '请选择商品分类', trigger: 'blur' }
      },
      // 是否改变分类
      isCateChangeMany: false,
      isCateChangeOnly: false,
      // 动态参数列表数据
      manyAttrData: [],
      checkedAttrs: [],
      // 静态属性列表数据
      onlyAttrData: [],
      // 上传图片的url地址
      uploadUrl: 'https://www.liulongbin.top:8888/api/private/v1/upload',
      // 上传图片的请求头
      headerObj: { Authorization: this.$session.fetch('token') },
      // 预览图片的url`
      previewImageUrl: '',
      previewVisible: false
    }
  },
  computed: {
    cateId () {
      return this.addForm.goods_cat[this.addForm.goods_cat.length - 1]
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    getCateList () {
      this.$Http.get('categories').then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
        this.cateList = res.data
      })
    },
    // 标签切换之前
    tabBeforeLeaveFn (activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length === 0) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // 标签切换
    tabClickHandle () {
      if (this.activeIndex === '1') {
        if (!this.isCateChangeMany) return
        this.$Http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'many'
          }
        }).then(response => {
          const res = response.data
          if (res.meta.status !== 200) return this.$message.error('获取商品参数失败')
          this.isCateChangeMany = false
          res.data.map(item => {
            item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          })
          this.manyAttrData = res.data
          this.checkedAttrs = res.data.map(item => {
            return {
              attr_id: item.attr_id,
              attr_vals: item.attr_vals
            }
          })
        })
      } else if (this.activeIndex === '2') {
        if (!this.isCateChangeOnly) return
        this.$Http.get(`categories/${this.cateId}/attributes`, {
          params: {
            sel: 'only'
          }
        }).then(response => {
          const res = response.data
          if (res.meta.status !== 200) return this.$message.error('获取商品属性失败')
          this.isCateChangeOnly = false
          this.onlyAttrData = res.data
        })
      }
    },
    // 商品分类选择改变
    cateChangeHandle (val) {
      this.isCateChangeMany = true
      this.isCateChangeOnly = true
    },
    // 处理图片预览
    handlePreview (file) {
      this.previewImageUrl = file.response.data.url
      this.previewVisible = true
    },
    // 文件上传成功
    handleSuccess (response) {
      let picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 文件移除
    handleRemove (file, fileList) {
      let tmp = file.response.data.tmp_path
      let i = this.addForm.pics.findIndex(item => item.pic === tmp)
      this.addForm.pics.splice(i, 1)
    },
    // 添加商品
    add () {
      this.$refs.addForm.validate(valid => {
        if (!valid) return this.$message.error('请完善表单数据后再添加！')
        let argForm = JSON.parse(JSON.stringify(this.addForm))
        argForm.goods_cat = argForm.goods_cat.join(',')
        this.checkedAttrs.forEach(item => {
          argForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          })
        })
        this.onlyAttrData.forEach(item => {
          argForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })
        this.$Http.post('goods', argForm).then(response => {
          const res = response.data
          if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-steps { margin: 15px 0; }
</style>
