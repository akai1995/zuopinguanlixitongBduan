<template>
  <div class="page-container" style="padding-top: 0px;">

    <div class="filter-bar">
      <div class="filter-bar__content">
        <div class="filter-bar__item">
          <label class="filter-bar__label">搜索</label>
          <a-input-search v-model="searchText" placeholder="搜索提示词或图片名称..." @search="handleSearch" @change="handleSearch" allow-clear />
        </div>
        <div class="filter-bar__item">
          <label class="filter-bar__label">AI工具</label>
          <a-select v-model="filterTools" mode="multiple" placeholder="按AI工具筛选" style="min-width: 200px;" allow-clear @change="handleFilter">
            <a-select-option v-for="tool in storeState.predefinedTools" :key="tool" :value="tool">{{ tool }}</a-select-option>
          </a-select>
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
        <a-button type="primary" @click="openCreateModal">上传图片</a-button>
      </div>
    </div>

    <div v-if="filteredImages.length > 0" class="work-grid">
      <div v-for="item in filteredImages" :key="item.id" class="work-card" @click="goDetail(item.id)">
        <img :src="item.cover" :alt="item.title" class="work-card__cover" />
        <div class="work-card__body">
          <div class="work-card__title">{{ item.title }}</div>
          <div class="work-card__desc">{{ item.prompt }}</div>
          <div class="work-card__footer">
            <div class="work-card__tags">
              <span class="ai-tool-tag">{{ item.aiTool }}</span>
              <span v-for="tag in item.tags" :key="tag" class="work-card__tag">{{ tag }}</span>
            </div>
            <span class="work-card__date">{{ item.generateDate }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-state__icon"><a-icon type="experiment" /></div>
      <div class="empty-state__text">暂无AI生图数据</div>
      <a-button type="primary" @click="openCreateModal">立即添加</a-button>
    </div>

    <a-modal v-model="modalVisible" :title="editingItem ? '编辑AI生图' : '上传AI生图'" :width="800" :destroy-on-close="true" :mask-closable="false">
      <div class="modal-form">
        <a-form :form="form" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
          <a-form-item label="标题">
            <a-input v-decorator="['title', { rules: [{ required: true, message: '请输入标题' }, { max: 50 }] }]" placeholder="请输入标题（最多50字）" :max-length="50" />
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
          <a-form-item label="AI作品图片" required>
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
          <a-form-item label="AI工具">
            <a-select v-decorator="['aiTool', { rules: [{ required: true, message: '请选择AI工具' }] }]" mode="tags" placeholder="选择或输入AI工具，回车添加">
              <a-select-option v-for="tool in storeState.predefinedTools" :key="tool" :value="tool">{{ tool }}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="提示词">
            <a-textarea v-decorator="['prompt', { rules: [{ required: true, message: '请输入提示词' }] }]" placeholder="完整展示生成提示词（Prompt）" :rows="4" />
          </a-form-item>
          <a-form-item label="负面提示词">
            <a-textarea v-decorator="['negativePrompt']" placeholder="可选，负面提示词（Negative Prompt）" :rows="2" />
          </a-form-item>
          <a-form-item label="生成参数">
            <a-input v-decorator="['parameters']" placeholder="可选，如 --ar 16:9, --v 6, --stylize 250" />
          </a-form-item>
          <a-form-item label="生成日期">
            <a-date-picker v-decorator="['generateDate']" style="width: 100%;" placeholder="选择生成日期" />
          </a-form-item>
          <a-form-item label="分类/标签">
            <a-select v-decorator="['tags']" mode="tags" placeholder="可选，如写实、插画、3D、抽象" />
          </a-form-item>
          <a-form-item label="是否展示">
            <a-switch v-decorator="['isPublic', { valuePropName: 'checked', initialValue: true }]" />
            <span style="margin-left: 8px; color: var(--text-auxiliary); font-size: 12px;">关闭后不在前台展示</span>
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
import aiImagesStore from '@/store/aiImages'
import { formatDate } from '@/utils/format'

export default {
  name: 'AiImageManagementPage',
  data() {
    return {
      searchText: '',
      filterTools: [],
      filterTags: [],
      modalVisible: false,
      editingItem: null,
      saving: false,
      storeState: aiImagesStore.useState(),
      form: this.$form.createForm(this, { name: 'ai_image_form' }),
      fileListCover: [],
      fileListImages: [],
      coverPreview: '',
      imagesPreview: [],
    }
  },
  computed: {
    filteredImages() {
      let list = this.storeState.aiImages
      if (this.filterTools.length > 0) {
        list = list.filter((item) => this.filterTools.includes(item.aiTool))
      }
      if (this.filterTags.length > 0) {
        list = list.filter((item) => item.tags.some((t) => this.filterTags.includes(t)))
      }
      if (this.searchText.trim()) {
        const keyword = this.searchText.trim().toLowerCase()
        list = list.filter((item) => item.title.toLowerCase().includes(keyword) || item.prompt.toLowerCase().includes(keyword))
      }
      return list.sort((a, b) => new Date(b.generateDate) - new Date(a.generateDate))
    },
  },
  methods: {
    formatDate,
    openCreateModal() {
      this.editingItem = null
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
      this.saving = true
      this.form.validateFields((err, values) => {
        if (err) {
          this.saving = false
          return
        }
        const data = {
          ...values,
          cover: this.coverPreview,
          images: this.imagesPreview,
          generateDate: values.generateDate ? values.generateDate.format('YYYY-MM-DD') : '',
        }
        if (this.editingItem) {
          aiImagesStore.getState().updateAiImage(this.editingItem.id, data)
          this.$message.success('AI生图更新成功')
        } else {
          aiImagesStore.getState().addAiImage(data)
          this.$message.success('AI生图上传成功')
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
        title: '确认删除', content: '删除后无法恢复，确定要删除该AI生图吗？',
        okText: '确认删除', okType: 'danger', cancelText: '取消',
        onOk() {
          aiImagesStore.getState().deleteAiImage(self.editingItem.id)
          self.$message.success('AI生图已删除')
          self.modalVisible = false
        },
      })
    },
    handleSearch() {},
    handleFilter() {},
    handleReset() {
      this.searchText = ''
      this.filterTools = []
      this.filterTags = []
    },
    goDetail(id) { this.$router.push(`/ai-images/${id}`) },
  },
}
</script>