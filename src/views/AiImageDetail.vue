<template>
  <div class="page-container">
    <div class="detail-page">
      <div class="detail-page__nav">
        <a-button type="link" icon="arrow-left" @click="$router.push('/ai-images')">返回列表</a-button>
        <div v-if="neighborIds.length > 0" style="display: flex; gap: 8px;">
          <a-button size="small" :disabled="!prevId" @click="goToImage(prevId)">上一项</a-button>
          <a-button size="small" :disabled="!nextId" @click="goToImage(nextId)">下一项</a-button>
        </div>
      </div>

      <div v-if="item">
        <div class="work-header">
          <h1>{{ item.title }}</h1>
          <div class="work-header__meta">
            <span class="ai-tool-tag">{{ item.aiTool }}</span>
            <span v-for="tag in item.tags" :key="tag" class="work-card__tag">{{ tag }}</span>
            <span>生成于 {{ item.generateDate }}</span>
          </div>
        </div>
        
        <div class="work-info">
          <div class="detail-page__section">
            <div class="detail-page__section-title">生成提示词（Prompt）</div>
            <div class="prompt-block">
              <div class="prompt-block__content">{{ item.prompt }}</div>
              <a-tooltip title="复制提示词">
                <a-button class="prompt-block__copy" type="link" icon="copy" @click="copyPrompt(item.prompt)" />
              </a-tooltip>
            </div>
            
            <div v-if="item.negativePrompt" class="prompt-section">
              <div class="detail-page__section-title">负面提示词（Negative Prompt）</div>
              <div class="prompt-block">
                <div class="prompt-block__content">{{ item.negativePrompt }}</div>
                <a-tooltip title="复制负面提示词">
                  <a-button class="prompt-block__copy" type="link" icon="copy" @click="copyPrompt(item.negativePrompt)" />
                </a-tooltip>
              </div>
            </div>
            
            <div v-if="item.parameters" class="prompt-section">
              <div class="detail-page__section-title">生成参数</div>
              <span class="parameters-tag">{{ item.parameters }}</span>
            </div>
          </div>

          <div class="image-gallery" v-if="item.images && item.images.length > 0">
            <div class="image-gallery__title">作品图片</div>
            <div class="image-gallery__content">
              <div class="image-gallery__thumbnails">
                <div 
                  v-for="(img, idx) in item.images" 
                  :key="idx" 
                  class="image-gallery__thumbnail"
                  :class="{ 'image-gallery__thumbnail--active': selectedImageIndex === idx }"
                  @click="selectImage(idx)"
                >
                  <img :src="img" :alt="`图${idx + 1}`" />
                </div>
              </div>
              <div class="image-gallery__main">
                <img :src="item.images[selectedImageIndex]" :alt="item.title" class="image-gallery__image" />
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
        <div class="empty-state__text">AI生图不存在或已被删除</div>
        <a-button @click="$router.push('/ai-images')">返回列表</a-button>
      </div>
    </div>

    <div v-if="previewImage" class="image-preview-overlay" @click="previewImage = null"><img :src="previewImage" /></div>

    <a-modal v-model="editVisible" title="编辑AI生图" :width="800" :destroy-on-close="true" :mask-closable="false">
      <div class="modal-form">
        <a-form :form="editForm" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
          <a-form-item label="标题">
            <a-input v-decorator="['title', { rules: [{ required: true, max: 50 }] }]" placeholder="请输入标题（最多50字）" :max-length="50" />
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
              <img :src="coverPreview" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; border: 1px solid var(--border-secondary);" />
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
          <a-form-item label="生成提示词">
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
        <a-button style="margin-right: 10px;" @click="editVisible = false">取消</a-button>
        <a-button type="primary" :loading="saving" @click="handleSave">保存</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import aiImagesStore from '@/store/aiImages'

export default {
  name: 'AiImageDetailPage',
  data() {
    return {
      previewImage: null,
      editVisible: false,
      saving: false,
      selectedImageIndex: 0,
      storeState: aiImagesStore.useState(),
      editForm: this.$form.createForm(this, { name: 'ai_image_edit_form' }),
      fileListCover: [],
      fileListImages: [],
      coverPreview: '',
      imagesPreview: [],
    }
  },
  computed: {
    item() { return aiImagesStore.getState().getAiImageById(this.$route.params.id) },
    neighborIds() { return this.storeState.aiImages.map((i) => i.id) },
    currentIdx() { return this.neighborIds.indexOf(this.$route.params.id) },
    prevId() { return this.currentIdx > 0 ? this.neighborIds[this.currentIdx - 1] : null },
    nextId() { return this.currentIdx < this.neighborIds.length - 1 ? this.neighborIds[this.currentIdx + 1] : null },
  },
  watch: {
    item() {
      this.selectedImageIndex = 0
      if (this.item) {
        this.coverPreview = this.item.cover || ''
        this.imagesPreview = [...(this.item.images || [])]
      }
    },
  },
  methods: {
    goToImage(id) { this.$router.push(`/ai-images/${id}`) },
    selectImage(idx) { this.selectedImageIndex = idx },
    copyPrompt(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$message.success('已复制到剪贴板')
      }).catch(() => this.$message.error('复制失败'))
    },
    openEdit() {
      this.fileListCover = []
      this.fileListImages = []
      this.coverPreview = this.item.cover || ''
      this.imagesPreview = [...(this.item.images || [])]
      this.editVisible = true
      this.$nextTick(() => {
        this.editForm.setFieldsValue({
          title: this.item.title, aiTool: this.item.aiTool,
          prompt: this.item.prompt, negativePrompt: this.item.negativePrompt,
          parameters: this.item.parameters, tags: this.item.tags, 
          generateDate: this.item.generateDate, isPublic: this.item.isPublic,
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
        const data = {
          ...values,
          cover: this.coverPreview,
          images: this.imagesPreview,
          generateDate: values.generateDate ? values.generateDate.format('YYYY-MM-DD') : this.item.generateDate,
        }
        aiImagesStore.getState().updateAiImage(this.item.id, data)
        this.$message.success('更新成功')
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
    handleDelete() {
      const self = this
      this.$confirm({
        title: '确认删除', content: '删除后无法恢复，确定要删除该AI生图吗？',
        okText: '确认删除', okType: 'danger', cancelText: '取消',
        onOk() {
          aiImagesStore.getState().deleteAiImage(self.item.id)
          self.$message.success('AI生图已删除')
          self.$router.push('/ai-images')
        },
      })
    },
  },
}
</script>

<style scoped>
.work-header {
  background: var(--bg-card);
  padding: 24px;
  margin-bottom: 24px;
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
  gap: 8px;
  flex-wrap: wrap;
}
.work-header__meta span:not(.work-card__tag):not(.ai-tool-tag) {
  color: var(--text-auxiliary);
  font-size: var(--font-size-label);
}
.image-gallery {
  background: var(--bg-card);
  padding: 20px;
  border-radius: var(--radius-module);
  border: 1px solid var(--border-secondary);
}
.image-gallery__title {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-medium);
  color: var(--text-title);
  margin-bottom: 12px;
}
.image-gallery__content {
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
.ai-tool-tag {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 400;
  color: #1BCB8B;
  background: rgba(27, 203, 139, 0.12);
  border-radius: 2px;
  line-height: 1.5;
}
[data-theme='dark'] .ai-tool-tag {
  color: #1BCB8B;
  background: rgba(27, 203, 139, 0.2);
}
.prompt-section {
  margin-top: 20px;
}
.detail-page__section {
  background: var(--bg-card);
  padding: 20px;
  border-radius: var(--radius-module);
  border: 1px solid var(--border-secondary);
}
.parameters-tag {
  font-size: var(--font-size-body);
  padding: 4px 12px;
  border-radius: 4px;
  background: var(--bg-control-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-secondary);
}
</style>