<template>
  <div class="file-upload-container">
    <div class="upload-area"
         :class="{ active: isActive }"
         @click="triggerFileInput"
         @dragenter.prevent="isActive = true"
         @dragover.prevent="isActive = true"
         @dragleave.prevent="isActive = false"
         @drop.prevent="handleDrop"
    >
      <div class="upload-icon">
        <i class="fas fa-cloud-upload-alt"></i>
      </div>
      <div class="drag-text" v-show="!file">
        Перетащите видео сюда или <span>выберите видео</span>
      </div>
      <input type="file" ref="fileInput" style="display:none" @change="handleFileChange" accept="video/*,.pdf,.doc,.docx,.txt,.rtf,.zip,.rar" />
      <div class="file-info" v-show="file">
        <div class="file-name">
          <i class="fas fa-file-alt file-icon"></i>
          <span>{{ file ? file.name : 'Видео не выбрано' }}</span>
        </div>
        <div class="file-actions">
          <button class="btn btn-outline" @click.stop="removeFile">
            <i class="fas fa-times"></i> Удалить
          </button>
        </div>
      </div>
    </div>
    <div v-if="error" class="error-message" style="color: #ff3333; margin-top: 10px;">{{ error }}</div>
  </div>
</template>

<script>
export default {
  name: 'VideoUploadForm',
  props: {
    loading: Boolean
  },
  data() {
    return {
      file: null,
      isActive: false,
      error: ''
    }
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(e) {
      const file = e.target.files[0];
      this.selectFile(file);
    },
    handleDrop(e) {
      this.isActive = false;
      const file = e.dataTransfer.files[0];
      this.selectFile(file);
    },
    selectFile(file) {
      if (!file) return;
      this.error = '';
      this.file = file;
      this.$emit('file-selected', file);
    },
    removeFile() {
      this.file = null;
      this.$refs.fileInput.value = '';
      this.$emit('file-removed');
    },
    uploadFile() {
      if (!this.file) return;
      this.$emit('upload', this.file);
    }
  }
}
</script>

<style scoped>
.file-upload-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 24px 16px;
  width: 100%;
  max-width: 500px;
  text-align: center;
  margin: 0 auto;
}
.upload-area {
  border: 2px dashed #ced4da;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.upload-area:hover {
  border-color: #4361ee;
  background-color: rgba(67, 97, 238, 0.05);
}
.upload-area.active {
  border-color: #4bb543;
  background-color: rgba(75, 181, 67, 0.05);
}
.upload-icon {
  font-size: 48px;
  color: #4361ee;
  margin-bottom: 15px;
}
.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 12px 15px;
  margin-top: 15px;
}
.file-name {
  display: flex;
  align-items: center;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 70%;
}
.file-icon {
  margin-right: 10px;
  color: #4361ee;
}
.file-actions {
  display: flex;
}
.btn {
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-primary {
  background-color: #4361ee;
  color: white;
}
.btn-primary:hover {
  background-color: #3f37c9;
  transform: translateY(-2px);
}
.btn-outline {
  background-color: transparent;
  border: 1px solid #ff3333;
  color: #ff3333;
  margin-left: 10px;
}
.btn-outline:hover {
  background-color: #ff3333;
  color: white;
}
.btn i {
  margin-right: 8px;
}
.drag-text {
  font-weight: 500;
  color: #212529;
}
.drag-text span {
  color: #4361ee;
  text-decoration: underline;
}
.error-message {
  font-size: 14px;
}
</style> 