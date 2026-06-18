<template>
  <div class="page-container" style="padding-top: 0px;">

    <div class="filter-bar">
      <div class="filter-bar__content">
        <div class="filter-bar__item">
          <label class="filter-bar__label">搜索</label>
          <a-input-search v-model="searchText" placeholder="搜索作品标题或描述..." @search="handleSearch" @change="handleSearch" allow-clear />
        </div>
        <div class="filter-bar__item">
          <label class="filter-bar__label">分类标签</label>
          <a-select v-model="filterTags" mode="multiple" placeholder="按分类标签筛选" allow-clear @change="handleFilter">
            <a-select-option v-for="tag in storeState.customTags" :key="tag" :value="tag">{{ tag }}</a-select-option>
          </a-select>
        </div>
      </div>
      <div class="filter-bar__actions">
        <a-button @click="handleReset">重置</a-button>
        <a-button type="primary" @click="handleSearch">查询</a-button>
        <a-button type="primary" @click="openCreateModal">上传作品</a-button>
      </div>
    </div>

    <div v-if="filteredWorks.length > 0" class="work-grid">
      <div v-for="work in filteredWorks" :key="work.id" class="work-card" @click="goDetail(work.id)">
        <img :src="work.cover" :alt="work.title" class="work-card__cover" />
        <div class="work-card__body">
          <div class="work-card__title">{{ work.title }}</div>
          <div class="work-card__desc">{{ work.description }}</div>
          <div class="work-card__footer">
            <div class="work-card__tags">
              <span v-for="tag in work.tags" :key="tag" class="work-card__tag">{{ tag }}</span>
            </div>
            <span class="work-card__date">{{ formatDate(work.updatedAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state__icon"><a-icon type="picture" /></div>
      <div class="empty-state__text">暂无作品数据</div>
      <a-button type="primary" @click="openCreateModal">立即添加</a-button>
    </div>

    <a-modal v-model="modalVisible" :title="editingWork ? '编辑作品' : '上传作品'" :width="800" :destroy-on-close="true" :mask-closable="false">
      <div class="modal-form">
        <a-form :form="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
          <a-form-item label="标题">
            <a-input v-decorator="['title', { rules: [{ required: true, message: '请输入作品标题' }, { max: 50 }] }]" placeholder="请输入作品标题（最多50字）" :max-length="50" />
          </a-form-item>
          <a-form-item label="封面图" required>
            <a-upload
              v-model="fileListCover"
              :show-file-list="false"
              :before-upload="beforeCoverUpload"
              :custom-request="handleCoverUpload"
              accept="image/*"
            >
              <a-button icon="upload" :disabled="fileListCover.length >= 1">选择图片</a-button>
            </a-upload>
            <span style="display: block; margin-top: 4px; font-size: 12px; color: var(--text-auxiliary);">最多上传1张</span>
            <div v-if="coverPreview" style="margin-top: 8px; position: relative; display: inline-block;">
              <img :src="coverPreview" style="max-width: 200px; max-height: 120px; border-radius: 4px; border: 1px solid var(--border-secondary);" />
              <a-button 
                type="text" 
                icon="close" 
                size="small" 
                style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; padding: 0;"
                @click="removeCover"
              />
            </div>
          </a-form-item>
          <a-form-item label="作品集图片" required>
            <a-upload
              v-model="fileListImages"
              multiple
              :before-upload="beforeImagesUpload"
              :custom-request="handleImagesUpload"
              accept="image/*"
            >
              <a-button icon="upload" :disabled="fileListImages.length >= 9">选择多张图片</a-button>
            </a-upload>
            <span style="display: block; margin-top: 4px; font-size: 12px; color: var(--text-auxiliary);">最多上传9张</span>
            <div v-if="imagesPreview.length" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              <div v-for="(img, idx) in imagesPreview" :key="idx" style="position: relative;">
                <img :src="img" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-secondary);" />
                <a-button 
                  type="text" 
                  icon="close" 
                  size="small" 
                  style="position: absolute; top: 4px; right: 4px; background: rgba(0,0,0,0.6); color: #fff; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; padding: 0;"
                  @click="removeImage(idx)"
                />
              </div>
            </div>
          </a-form-item>
          <a-form-item label="描述">
            <a-textarea v-decorator="['description']" placeholder="请输入作品描述（最多500字）" :rows="4" :max-length="500" />
          </a-form-item>
          <a-form-item label="分类标签">
            <a-select v-decorator="['tags']" mode="tags" placeholder="选择或输入分类标签，回车添加">
              <a-select-option v-for="tag in storeState.customTags" :key="tag" :value="tag">{{ tag }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="创作年份">
            <a-select v-decorator="['year']" placeholder="选择创作年份" show-search class="no-arrow">
              <a-select-option v-for="y in yearOptions" :key="y" :value="y">{{ y }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="项目链接">
            <a-input v-decorator="['projectUrl']" placeholder="可选，输入在线原型或产品链接" />
          </a-form-item>
          <a-form-item label="是否公开">
            <a-switch v-decorator="['isPublic', { valuePropName: 'checked', initialValue: true }]" />
            <span style="margin-left: 8px; color: var(--text-auxiliary); font-size: 12px;">关闭后不在前台展示，保留在后台</span>
          </a-form-item>
        </a-form>
      </div>
      <template slot="footer">
        <a-button style="margin-right: 10px;" @click="handleCancel">取消</a-button>
        <a-button type="primary" :loading="saving" @click="handleSave">保存</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import worksStore from '@/store/works'
import { formatDate } from '@/utils/format'

export default {
  name: 'WorkManagementPage',
  data() {
    return {
      searchText: '',
      filterTags: [],
      modalVisible: false,
      editingWork: null,
      saving: false,
      fileListCover: [],
      fileListImages: [],
      coverPreview: '',
      imagesPreview: [],
      storeState: worksStore.useState(),
      form: this.$form.createForm(this, { name: 'work_form' }),
    }
  },
  computed: {
    filteredWorks() {
      let list = this.storeState.works
      if (this.filterTags.length > 0) {
        list = list.filter((work) => work.tags.some((t) => this.filterTags.includes(t)))
      }
      if (this.searchText.trim()) {
        const keyword = this.searchText.trim().toLowerCase()
        list = list.filter((work) => work.title.toLowerCase().includes(keyword) || work.description.toLowerCase().includes(keyword))
      }
      return list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    },
    yearOptions() {
      const currentYear = new Date().getFullYear()
      const years = []
      for (let y = currentYear; y >= 2000; y--) {
        years.push(y)
      }
      return years
    },
  },
  methods: {
    formatDate,
    openCreateModal() {
      this.editingWork = null
      this.fileListCover = []
      this.fileListImages = []
      this.coverPreview = ''
      this.imagesPreview = []
      this.modalVisible = true
      this.$nextTick(() => this.form.resetFields())
    },
    handleSave() {
      if (!this.coverPreview) {
        this.$message.error('请上传封面图')
        return
      }
      this.form.validateFields((err, values) => {
        if (err) return
        this.saving = true
        const data = { ...values, cover: this.coverPreview, images: this.imagesPreview }
        if (this.editingWork) {
          worksStore.getState().updateWork(this.editingWork.id, data)
          this.$message.success('作品更新成功')
        } else {
          worksStore.getState().addWork(data)
          this.$message.success('作品上传成功')
        }
        this.fileListCover = []
        this.fileListImages = []
        this.coverPreview = ''
        this.imagesPreview = []
        this.saving = false
        this.modalVisible = false
      })
    },
    beforeCoverUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件')
        return false
      }
      if (this.fileListCover.length >= 1) {
        this.$message.error('最多上传1张封面图')
        return false
      }
      return true
    },
    handleCoverUpload({ file }) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.coverPreview = e.target.result
        this.form.setFieldsValue({ cover: e.target.result })
      }
      reader.readAsDataURL(file)
    },
    handleImagesUpload({ file }) {
      if (this.imagesPreview.length >= 9) {
        this.$message.error('最多上传9张图片')
        return
      }
      const reader = new FileReader()
      reader.onload = (e) => {
        this.imagesPreview.push(e.target.result)
      }
      reader.readAsDataURL(file)
    },
    beforeImagesUpload(file) {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        this.$message.error('只能上传图片文件')
        return false
      }
      if (this.imagesPreview.length >= 9) {
        this.$message.error('最多上传9张图片')
        return false
      }
      return true
    },
    removeCover() {
      this.coverPreview = ''
      this.fileListCover = []
    },
    removeImage(index) {
      this.imagesPreview.splice(index, 1)
    },
    handleCancel() { this.modalVisible = false },
    handleDelete() {
      const self = this
      this.$confirm({
        title: '确认删除',
        content: '删除后无法恢复，确定要删除该作品吗？',
        okText: '确认删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          worksStore.getState().deleteWork(self.editingWork.id)
          self.$message.success('作品已删除')
          self.modalVisible = false
        },
      })
    },
    handleSearch() {},
    handleFilter() {},
    handleReset() {
      this.searchText = ''
      this.filterTags = []
    },
    goDetail(id) { this.$router.push(`/works/${id}`) },
  },
}
</script>