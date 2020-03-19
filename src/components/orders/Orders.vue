<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb parentName='订单管理' authName="订单列表"></breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card shadow="never">
      <!-- 搜索&添加用户区域 -->
      <!-- <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row> -->

      <!-- 订单列表区域 -->
      <el-table :data="ordersList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格" width="80px"></el-table-column>
        <el-table-column prop="order_pay" label="是否付款" width="80px">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.order_pay === '1'" type="primary">已付款</el-tag>
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货" width="80px"></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template slot-scope="scope">
            {{scope.row.create_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template slot-scope="scope">
            <!-- 修改订单地址按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" title="修改订单地址" @click="editAddresHandle(scope.row.order_id)"></el-button>
            <!-- 查询物流信息按钮 -->
            <el-button type="success" icon="el-icon-location" size="mini" title="物流信息" @click="queryLogHandle(scope.row.order_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>

      <!-- 修改地址对话框 -->
      <el-dialog title="修改地址" :visible.sync="dialogEditVisible" width="50%" @close="closeEditDialog">
        <el-form :model="editForm" :rules="formRules" label-width="100px" ref="editForm">
          <el-form-item label="省市区/县" prop="province">
            <!-- <el-input v-model="editForm.province"></el-input> -->
            <el-cascader v-model="editForm.province" :options="cityOptions" expand-trigger="hover" style="width: 100%;" @change="cityChangeHandle"></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address">
            <el-input v-model="editForm.address"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogEditVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditForm">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 查看物流对话框 -->
      <el-dialog title="查看物流进度" :visible.sync="dialogLogVisible" width="50%" @close="closeLogDialog">
        <el-timeline>
          <el-timeline-item v-for="(item, index) in logList" :key="index" :timestamp="item.time" placement="top">
            {{item.context}}
          </el-timeline-item>
        </el-timeline>
      </el-dialog>

    </el-card>
  </div>
</template>

<script>
import cityOptions from '@/assets/js/city_data2017_element.js'
export default {
  data () {
    return {
      // 订单数据列表
      ordersList: [],
      // 订单总数
      total: 0,
      // 获取订单列表参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 修改地址表单
      editForm: {},
      // 修改地址对话框
      dialogEditVisible: false,
      // 表单验证
      formRules: {
        province: [
          { required: true, message: '请选择省市区/县', trigger: 'blur' }
        ],
        address: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 省市区数据
      cityOptions: cityOptions,
      checkedCity: [],
      // 查看物流对话框
      dialogLogVisible: false,
      // 物流信息
      logList: []
    }
  },
  created () {
    this.getOrdersList()
  },
  methods: {
    getOrdersList () {
      this.$Http.get('orders', {
        params: this.queryInfo
      }).then(response => {
        let res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
        // 获取成功
        this.total = res.data.total
        this.ordersList = res.data.goods
      })
    },
    // 监听pagesize改变事件
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`);
      this.queryInfo.pagesize = val
      this.getOrdersList()
    },
    // 监听pagenum改变事件
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`);
      this.queryInfo.pagenum = val
      this.getOrdersList()
    },
    // 修改订单地址，打开修改地址对话框
    editAddresHandle () {
      this.dialogEditVisible = true
    },
    // 关闭修改对话框
    closeEditDialog () {
      this.$refs.editForm.resetFields()
    },
    // 修改订单地址，提交
    submitEditForm () {
      this.$refs.editForm.validate(valid => {
        if (!valid) return
        // 关闭修改地址对话框
        this.dialogEditVisible = false
        // 成功提示
        this.$message.success('修改地址成功')
      })
    },
    // 城市选择
    cityChangeHandle (val) {
    },
    // 关闭物流信息对话框
    closeLogDialog () {
      this.logList = []
    },
    // 查询物流信息
    queryLogHandle (id) {
      console.log(id)
      this.$Http.get('kuaidi/1106975712662').then(response => {
        let res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取物流信息失败')
        this.logList = res.data
        this.dialogLogVisible = true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-timeline { padding: 0 20px; }
</style>
