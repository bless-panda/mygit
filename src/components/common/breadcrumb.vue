<template>
  <el-breadcrumb separator-class="el-icon-arrow-right" class="breadcrumb">
    <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
    <el-breadcrumb-item>{{parentName}}</el-breadcrumb-item>
    <el-breadcrumb-item>{{authName}}</el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
export default {
  name: 'breadcrumb',
  props: {
    parentName: {
      type: String,
      default: ''
    },
    authName: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
  .breadcrumb { margin-bottom: 20px; }
</style>
