<template>
  <div class="page-container">
    <div class="detail-page">
      <div class="detail-page__nav">
        <a-button type="link" icon="arrow-left" @click="$router.push('/works')">返回列表</a-button>
        <div v-if="neighborIds.length > 0" style="display: flex; gap: 8px;">
          <a-button size="small" :disabled="!prevId" @click="goToWork(prevId)">上一项</a-button>
          <a-button size="small" :disabled="!nextId" @click="goToWork(nextId)">下一项</a-button>
        </div>
      </div>

      <div v-if="work">
        <div class="work-header">
          <h1>{{ work.title }}</h1>
          <div class="work-header__meta">
            <a-tag v-for="tag in work.tags" :key="tag" color="blue">{{ tag }}</a-tag>
            <span>{{ work.year }}年创作</span>
            <span>更新于 {{ formatDate(work.updatedAt) }}</span>
          </div>
        </div>
        <div class="work-info">
          <div class="detail-page__section" v-if="work.description">
            <div class="detail-page__section-title">作品描述</div>
            <p>{{ work.description }}</p>
          </div>
          <div class="detail-page__section" v-if="work.projectUrl">
            <div class="detail-page__section-title">项目链接</div>
            <a :href="work.projectUrl" target="_blank">{{ work.projectUrl }}</a>
          </div>
          <div class="detail-page__section" v-if="work.images && work.images.length > 0">
            <div class="detail-page__section-title">作品集</div>
            <div class="image-gallery">
              <div class="image-gallery__thumbnails">
                <div 
                  v-for="(img, idx) in work.images" 
                  :key="idx" 
                  class="image-gallery__thumbnail"
                  :class="{ 'image-gallery__thumbnail--active': selectedImageIndex === idx }"
                  @click="selectImage(idx)"
                >
                  <img :src="img" :alt="`图${idx + 1}`" />
                </div>
              </div>
              <div class="image-gallery__main">
                <img :src="work.images[selectedImageIndex]" :alt="work.title" class="image-gallery__image" />
              </div>
            </div>
          </div>
        </div>
        <div style="margin-top: 32px; display: flex; gap: 12px;">
          <a-button type="primary" icon="edit" @click="openEdit">编辑</a-button>
          <a-button type="danger" icon="delete" @click="handleDelete">删除</a-button>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-state__icon"><a-icon type="file-unknown" /></div>
        <div class="empty-state__text">作品不存在或已被删除</div>
        <a-button @click="$router.push('/works')">返回列表</a-button>
      </div>
    </div>

    <div v-if="previewImage" class="image-preview-overlay" @click="previewImage = null"><img :src="previewImage" /></div>

    <a-modal v-model="editVisible" title="编辑作品" :width="800" :destroy-on-close="true" :mask-closable="false">
      <div class="modal-form">
        <a-form :form="editForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
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

<style scoped>
.detail-page__nav .ant-btn-link {
  color: var(--color-primary);
}
.detail-page__nav .ant-btn-link:hover {
  color: var(--color-primary-hover);
}
.work-header {
  background: var(--bg-card);
  padding: 20px;
  margin-bottom: 20px;
  border-radius: var(--radius-module);
  border: 1px solid var(--border-secondary);
}
.work-header h1 {
  font-size: var(--font-size-h1);
  font-weight: var(--font-weight-medium);
  color: var(--text-title);
  margin-bottom: 16px;
}
.work-header__meta {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.work-header__meta span {
  color: var(--text-auxiliary);
  font-size: var(--font-size-label);
}
.work-header__meta .ant-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: var(--font-size-tag);
  color: var(--color-primary);
  background: rgba(25, 98, 236, 0.08);
  border-radius: var(--radius-tag);
  line-height: 1.5;
  border: none;
}
.work-info {
  background: var(--bg-card);
  padding: 20px;
  margin-bottom: 20px;
  border-radius: var(--radius-module);
  border: 1px solid var(--border-secondary);
}
.work-info .detail-page__section {
  margin-bottom: 20px;
}
.work-info .detail-page__section:last-child {
  margin-bottom: 0;
}
.work-info .detail-page__section-title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-medium);
  color: var(--text-title);
  margin-bottom: 12px;
}
.work-info p {
  color: var(--text-secondary);
  line-height: 1.8;
  white-space: pre-wrap;
}
.work-info a {
  color: var(--color-primary);
  word-break: break-all;
}
.image-gallery {
  display: flex;
  gap: 16px;
}
.image-gallery__thumbnails {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 80px;
  flex-shrink: 0;
}
.image-gallery__thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color var(--transition-fast);
}
.image-gallery__thumbnail--active {
  border-color: var(--color-primary);
}
.image-gallery__thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.image-gallery__main {
  flex: 1;
  min-width: 0;
  border-radius: 16px;
  overflow: hidden;
  background: var(--bg-control-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-gallery__image {
  max-width: 100%;
  max-height: 70vh;
  width: auto;
  height: auto;
  display: block;
  object-fit: contain;
}
</style>

<script>
import worksStore from '@/store/works'
import { formatDate } from '@/utils/format'

export default {
  name: 'WorkDetailPage',
  data() {
    return {
      previewImage: null,
      editVisible: false,
      storeState: worksStore.useState(),
      editForm: this.$form.createForm(this, { name: 'work_edit_form' }),
      selectedImageIndex: 0,
      fileListCover: [],
      fileListImages: [],
      coverPreview: '',
      imagesPreview: [],
      saving: false,
    }
  },
  computed: {
    work() { return worksStore.getState().getWorkById(this.$route.params.id) },
    neighborIds() { return this.storeState.works.map((w) => w.id) },
    currentIdx() { return this.neighborIds.indexOf(this.$route.params.id) },
    prevId() { return this.currentIdx > 0 ? this.neighborIds[this.currentIdx - 1] : null },
    nextId() { return this.currentIdx < this.neighborIds.length - 1 ? this.neighborIds[this.currentIdx + 1] : null },
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
    selectImage(index) { this.selectedImageIndex = index },
    goToWork(id) { this.$router.push(`/works/${id}`) },
    openEdit() {
      this.fileListCover = []
      this.fileListImages = []
      this.coverPreview = this.work.cover || ''
      this.imagesPreview = [...(this.work.images || [])]
      this.editVisible = true
      this.$nextTick(() => {
        this.editForm.setFieldsValue({
          title: this.work.title,
          description: this.work.description,
          tags: this.work.tags,
          year: this.work.year,
          projectUrl: this.work.projectUrl,
          isPublic: this.work.isPublic,
        })
      })
    },
    handleSave() {
      if (!this.coverPreview) {
        this.$message.error('请上传封面图')
        return
      }
      this.saving = true
      this.editForm.validateFields((err, values) => {
        if (err) {
          this.saving = false
          return
        }
        const data = { ...values, cover: this.coverPreview, images: this.imagesPreview }
        worksStore.getState().updateWork(this.work.id, data)
        this.$message.success('作品更新成功')
        this.fileListCover = []
        this.fileListImages = []
        this.coverPreview = ''
        this.imagesPreview = []
        this.saving = false
        this.editVisible = false
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
    handleCancel() {
      this.editVisible = false
    },
    handleDelete() {
      const self = this
      this.$confirm({
        title: '确认删除', content: '删除后无法恢复，确定要删除该作品吗？',
        okText: '确认删除', okType: 'danger', cancelText: '取消',
        onOk() {
          worksStore.getState().deleteWork(self.work.id)
          self.$message.success('作品已删除')
          self.$router.push('/works')
        },
      })
    },
  },
}
</script>