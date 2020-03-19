<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb parentName='商品管理' authName="商品列表"></breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card shadow="never">

      <!-- 搜索&添加用户区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="toAdd">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="goodslist" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格(元)" width="95px"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="70px"></el-table-column>
        <el-table-column prop="add_time" label="创建时间" width="140px">
          <template slot-scope="scope">
            {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="70px">
          <template slot-scope="scope">
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品列表
      goodslist: [],
      // 获取商品列表参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品总数
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    // 获取商品列表
    getGoodsList () {
      this.$Http.get('goods', {
        params: this.queryInfo
      }).then(response => {
        const res = response.data
        if (res.meta.status !== 200) this.$message.error('获取商品列表失败')
        this.total = res.data.total
        this.goodslist = res.data.goods
      })
    },
    // 监听pagesize改变事件
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`);
      this.queryInfo.pagesize = val
      this.getGoodsList()
    },
    // 监听pagenum改变事件
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`);
      this.queryInfo.pagenum = val
      this.getGoodsList()
    },
    // 添加商品
    toAdd () {
      this.$router.push('/goods/add')
    },
    // 根据ID删除商品
    async removeGoodsById (id) {
      // 弹框询问用户是否删除数据
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')

      // 确定删除，发送请求
      const { data: res } = await this.$Http.delete(`goods/${id}`)
      if (res.meta.status === 200) {
        this.$message.success('删除商品成功')
        // 刷新商品列表
        this.getGoodsList()
      } else {
        this.$message.error('删除商品失败')
      }
    }
  }
}
</script>
