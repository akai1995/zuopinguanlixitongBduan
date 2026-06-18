<template>
  <div class="page-container">
    <div class="stats-section">
      <div class="stats-section__title">数据统计</div>
      <div class="stat-cards">
        <div class="stat-card stat-card--primary">
          <div class="stat-card__icon stat-card__icon--primary">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__label">作品总数</div>
            <div class="stat-card__value">{{ stats.totalWorks }}</div>
            <div class="stat-card__extra">累计上传的设计作品</div>
          </div>
        </div>
        <div class="stat-card stat-card--success">
          <div class="stat-card__icon stat-card__icon--success">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="9" r="2" fill="currentColor"/>
              <path d="M21 15l-5-5L9 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__label">AI生图总数</div>
            <div class="stat-card__value">{{ stats.totalAiImages }}</div>
            <div class="stat-card__extra">通过AI工具生成的图片</div>
          </div>
        </div>
        <div class="stat-card stat-card--warning">
          <div class="stat-card__icon stat-card__icon--warning">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__label">近30天新增</div>
            <div class="stat-card__value">{{ stats.recent30Days }}</div>
            <div class="stat-card__extra">作品和AI生图合计新增</div>
          </div>
        </div>
        <div class="stat-card stat-card--danger">
          <div class="stat-card__icon stat-card__icon--danger">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.657 8.943H3.343a2 2 0 0 0-1.414 3.414l8.657 8.657a2 2 0 0 0 2.828 0l8.657-8.657a2 2 0 0 0-1.414-3.414z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 13h3M14 13h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="stat-card__content">
            <div class="stat-card__label">{{ stats.topLabel }}</div>
            <div class="stat-card__value">{{ stats.topLabelValue }}</div>
            <div class="stat-card__extra">最常用分类标签 / AI工具</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-container">
      <div class="chart-container__title">每月新增趋势</div>
      <div ref="chartRef" style="width: 100%; height: 360px;"></div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import worksStore from '@/store/works'
import aiImagesStore from '@/store/aiImages'
import themeStore from '@/store/theme'

export default {
  name: 'DashboardPage',
  data() {
    return {
      chart: null,
      worksState: worksStore.useState(),
      themeState: themeStore.useState(),
    }
  },
  computed: {
    aiImages() {
      return aiImagesStore.getState().aiImages
    },
    currentTheme() {
      return this.themeState.theme
    },
    stats() {
      const works = this.worksState.works
      const aiImages = this.aiImages
      const now = new Date()
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const recentWorks = works.filter((w) => new Date(w.createdAt) >= thirtyDaysAgo).length
      const recentAi = aiImages.filter((w) => new Date(w.createdAt) >= thirtyDaysAgo).length

      const tagCount = {}
      works.forEach((w) => {
        w.tags.forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1 })
      })
      let topTag = '无'
      let topTagCount = 0
      Object.entries(tagCount).forEach(([tag, count]) => {
        if (count > topTagCount) { topTag = tag; topTagCount = count }
      })

      const toolCount = {}
      aiImages.forEach((item) => {
        toolCount[item.aiTool] = (toolCount[item.aiTool] || 0) + 1
      })
      let topTool = '无'
      let topToolCount = 0
      Object.entries(toolCount).forEach(([tool, count]) => {
        if (count > topToolCount) { topTool = tool; topToolCount = count }
      })

      return {
        totalWorks: works.length,
        totalAiImages: aiImages.length,
        recent30Days: recentWorks + recentAi,
        topLabel: topTagCount >= topToolCount ? '最常用作品标签' : '最常用AI工具',
        topLabelValue: topTagCount >= topToolCount ? topTag : topTool,
      }
    },
  },
  watch: {
    currentTheme() {
      this.$nextTick(() => this.initChart())
    },
  },
  mounted() {
    this.$nextTick(() => this.initChart())
  },
  beforeDestroy() {
    if (this.chart) this.chart.dispose()
  },
  methods: {
    initChart() {
      if (!this.$refs.chartRef) return
      if (this.chart) this.chart.dispose()
      this.chart = echarts.init(this.$refs.chartRef)
      this.updateChart()
      window.addEventListener('resize', this.handleResize)
    },
    updateChart() {
      if (!this.chart) return
      const isDark = themeStore.getState().theme === 'dark'
      const containerWidth = this.$refs.chartRef?.offsetWidth || 800
      const barWidth = Math.min(Math.max(containerWidth / 12 * 0.6, 12), 40)
      const months = []
      const workData = [8, 12, 6, 15, 10, 8, 12, 9, 7, 5, 8, 10]
      const aiData = [18, 22, 15, 25, 18, 12, 20, 16, 14, 12, 18, 10]
      const now = new Date()
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
      }
      this.chart.setOption({
        tooltip: { trigger: 'axis', textStyle: { fontSize: 14, color: isDark ? '#ADADAD' : '#595959' } },
        legend: { textStyle: { color: isDark ? '#ADADAD' : '#595959', fontSize: 14 }, data: ['作品', 'AI生图'] },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { 
          type: 'category', 
          data: months, 
          axisLine: { lineStyle: { color: isDark ? '#373737' : '#D9D9D9' } }, 
          axisLabel: { color: isDark ? '#ADADAD' : '#595959', fontSize: 14, rotate: containerWidth < 600 ? 45 : 0 },
          axisTick: { lineStyle: { color: isDark ? '#373737' : '#D9D9D9' } }
        },
        yAxis: { 
          type: 'value', 
          axisLine: { lineStyle: { color: isDark ? '#373737' : '#D9D9D9' } }, 
          axisLabel: { color: isDark ? '#ADADAD' : '#595959', fontSize: 14 }, 
          splitLine: { lineStyle: { color: isDark ? '#2C2C2C' : '#E5E5E5' } },
          axisTick: { lineStyle: { color: isDark ? '#373737' : '#D9D9D9' } }
        },
        series: [
          { name: '作品', type: 'bar', data: workData, itemStyle: { color: '#1962EC', borderRadius: [4, 4, 0, 0] }, barWidth: barWidth },
          { name: 'AI生图', type: 'line', data: aiData, smooth: true, itemStyle: { color: '#1BCB8B' }, lineStyle: { width: 2 }, symbol: 'circle', symbolSize: containerWidth < 600 ? 6 : 8 },
        ],
      })
    },
    handleResize() { 
      if (this.chart) {
        this.updateChart()
        this.chart.resize()
      } 
    },
  },
}
</script>

<style scoped>
.stats-section {
  background: var(--bg-card);
  border-radius: var(--radius-module);
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid var(--border-secondary);
  box-shadow: var(--shadow-card);
  width: 100%;
  box-sizing: border-box;
}
.stats-section__title {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-medium);
  color: var(--text-title);
  margin-bottom: 20px;
}
.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  width: 100%;
}
.stat-card__value {
  font-size: 32px;
  font-weight: var(--font-weight-medium);
  color: var(--text-title);
  line-height: 1.2;
}
@media (max-width: 768px) {
  .stats-section {
    padding: 16px;
  }
  .stat-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
.chart-container__title {
  font-size: var(--font-size-h1) !important;
}
</style>