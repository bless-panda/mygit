<template>
  <div>
    <!-- 面包屑导航区域 -->
    <breadcrumb parentName='数据统计' authName="数据报表"></breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card shadow="never">
      <div id="myChart" :style="{width: '100%', height: '600px'}"></div>
    </el-card>

  </div>
</template>

<script>
// 导入图表组件
import echarts from 'echarts'
export default {
  data () {
    return {
      reportsOption: []
    }
  },
  created () {
  },
  mounted () {
    this.$Http.get('reports/type/1').then(response => {
      let res = response.data
      if (res.meta.status !== 200) return this.$message.error('获取报表')
      this.reportsOption = res.data
      this.drawLine()
      console.log(this.reportsOption)
    })
  },
  methods: {
    drawLine () {
      // 基于准备好的dom，初始化echarts实例
      let myChart = echarts.init(document.getElementById('myChart'))
      // 绘制图表
      myChart.setOption({
        ...this.reportsOption,
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            ...this.reportsOption.xAxis[0]
          }
        ]
      })
    }
  }
}
</script>
