<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb parentName='权限管理' authName="权限列表"></breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card shadow="never">
      <!-- 权限列表区域 -->
      <el-table :data="rightsList" stripe border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column prop="authName" label="权限名称"></el-table-column>
        <el-table-column prop="path" label="路径"></el-table-column>
        <el-table-column prop="level" label="权限等级">
          <template slot-scope="scope">
            <!-- <el-tag :type="tagList[scope.row.level]['type']">{{tagList[scope.row.level]['name']}}</el-tag> -->
            <el-tag type="" v-if="scope.row.level === '0'">一级</el-tag>
            <el-tag type="success" v-else-if="scope.row.level === '1'">二级</el-tag>
            <el-tag type="warning" v-else>三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 权限列表
      rightsList: [],
      // 标签
      tagList: [
        { name: '一级', type: '' },
        { name: '二级', type: 'success' },
        { name: '三级', type: 'warning' }
      ]
    }
  },
  created () {
    this.getRightsList()
  },
  methods: {
    // 获取权限列表
    getRightsList () {
      this.$Http.get('rights/list').then(response => {
        const res = response.data
        if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
        this.rightsList = res.data
      })
    }
  }
}
</script>
