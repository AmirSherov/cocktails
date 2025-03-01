<template>
  <div class="tools-page">
    <div class="tools-header">
      <h1>Инструменты</h1>
      <div class="tools-actions">
        <el-input
          v-model="searchQuery"
          placeholder="Поиск..."
          @input="handleSearch"
          clearable
        />
        <el-button type="primary" @click="handleAdd">
          Добавить инструмент
        </el-button>
      </div>
    </div>

    <el-table
      :data="tools"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column
        prop="id"
        label="ID"
        sortable
        width="80"
      />
      <el-table-column
        prop="photo"
        label="Фото"
        width="120"
      >
        <template #default="{ row }">
          <el-image
            v-if="row.photo"
            :src="row.photo"
            fit="cover"
            style="width: 50px; height: 50px; border-radius: 4px;"
            :preview-src-list="[row.photo]"
            :initial-index="0"
          >
            <template #error>
              <div class="image-error">
                <el-icon><picture-filled /></el-icon>
              </div>
            </template>
          </el-image>
          <span v-else>Нет фото</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="language"
        label="Язык"
        width="100"
      >
        <template #default="{ row }">
          {{ row.language === 'ENG' ? 'English' : 'Русский' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="Название"
        sortable
      />
      <el-table-column
        prop="description"
        label="Описание"
        sortable
        show-overflow-tooltip
      />
      <el-table-column
        prop="history"
        label="История"
        show-overflow-tooltip
      />
      <el-table-column
        prop="how_to_use"
        label="Как использовать"
        show-overflow-tooltip
      />
      <el-table-column
        label="Ссылки"
        width="120"
      >
        <template #default="{ row }">
          <el-popover
            placement="top"
            width="200"
            trigger="hover"
          >
            <template #reference>
              <el-button link type="primary">
                {{ row.links?.length || 0 }} ссылок
              </el-button>
            </template>
            <div v-if="row.links?.length">
              <div v-for="(link, index) in row.links" :key="index">
                <a :href="link" target="_blank">{{ link }}</a>
              </div>
            </div>
            <div v-else>Нет ссылок</div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column
        fixed="right"
        label="Действия"
        width="150"
      >
        <template #default="{ row }">
          <el-button
            link
            type="primary"
            @click="handleEdit(row)"
          >
            Редактировать
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(row)"
          >
            Удалить
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalItems"
        @current-change="handlePageChange"
        layout="prev, pager, next"
      />
    </div>
    <el-dialog
      :title="dialogTitle"
      v-model="dialogVisible"
      width="60%"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="Язык" prop="language">
          <el-select v-model="form.language" placeholder="Выберите язык">
            <el-option label="English" value="ENG" />
            <el-option label="Русский" value="RUS" />
          </el-select>
        </el-form-item>
        <el-form-item label="Название" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="Описание" prop="description">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
        <el-form-item label="История" prop="history">
          <el-input v-model="form.history" type="textarea" />
        </el-form-item>
        <el-form-item label="Как использовать" prop="how_to_use">
          <el-input v-model="form.how_to_use" type="textarea" />
        </el-form-item>
        <el-form-item label="Изображение">
          <input
            type="file"
            @change="handleImageChange"
            accept="image/*"
            class="file-input"
            ref="fileInput"
          />
          <img
            v-if="imagePreview"
            :src="imagePreview"
            class="preview-image"
            alt="Preview"
          />
        </el-form-item>
        <el-form-item label="Ссылки">
          <div v-for="(link, index) in form.links" :key="index" class="link-item">
            <el-input v-model="form.links[index]" />
            <el-button type="danger" @click="removeLink(index)">Удалить</el-button>
          </div>
          <el-button type="primary" @click="addLink">Добавить ссылку</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Отмена</el-button>
          <el-button type="primary" @click="handleSubmit">
            {{ isEdit ? 'Сохранить' : 'Создать' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from '@/plugins/axios'
import { ElMessage } from 'element-plus'
import { PictureFilled } from '@element-plus/icons-vue'

export default {
  name: 'ToolsView',
  components: {
    PictureFilled
  },
  setup() {
    const tools = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const dialogVisible = ref(false)
    const isEdit = ref(false)
    const formRef = ref(null)
    const currentPage = ref(1)
    const pageSize = ref(10)
    const totalItems = ref(0)

    const form = ref({
      language: '',
      name: '',
      description: '',
      history: '',
      how_to_use: '',
      links: [],
      image: null
    })

    const rules = {
      language: [{ required: true, message: 'Выберите язык', trigger: 'change' }],
      name: [{ required: true, message: 'Введите название', trigger: 'blur' }],
      description: [{ required: true, message: 'Введите описание', trigger: 'blur' }]
    }

    const imagePreview = ref('')
    const fileInput = ref(null)

    const fetchTools = async (query = '') => {
      loading.value = true
      try {
        const response = await axios.get(`/admin/tool/${query ? `?search=${query}&` : '?'}page=${currentPage.value}`)
        tools.value = response.data.results || []
        totalItems.value = response.data.count || 0
      } catch (error) {
        ElMessage.error('Ошибка при загрузке инструментов')
      } finally {
        loading.value = false
      }
    }

    const getImageUrl = (imagePath) => {
      if (!imagePath) return null
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath
      }
      return `${import.meta.env.VITE_API_URL}${imagePath}`
    }

    const handlePageChange = (page) => {
      currentPage.value = page
      fetchTools(searchQuery.value)
    }

    const handleSearch = () => {
      currentPage.value = 1 
      fetchTools(searchQuery.value)
    }

    const handleImageChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        form.value.image = file
        imagePreview.value = URL.createObjectURL(file)
      }
    }

    const resetForm = () => {
      form.value = {
        language: '',
        name: '',
        description: '',
        history: '',
        how_to_use: '',
        links: [],
        image: null
      }
      imagePreview.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    const handleAdd = () => {
      isEdit.value = false
      resetForm()
      dialogVisible.value = true
    }

    const handleEdit = (row) => {
      isEdit.value = true
      form.value = { ...row }
      if (row.photo) {
        imagePreview.value = row.photo
      } else {
        imagePreview.value = ''
      }
      dialogVisible.value = true
    }

    const handleDelete = async (row) => {
      try {
        await axios.delete(`/admin/tool/${row.id}/`)
        ElMessage.success('Инструмент успешно удален')
        fetchTools()
      } catch {
        ElMessage.error('Ошибка при удалении инструмента')
      }
    }

    const handleSubmit = async () => {
      if (!formRef.value) return

      await formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            const formData = new FormData()
            formData.append('language', form.value.language)
            formData.append('name', form.value.name)
            formData.append('description', form.value.description)
            formData.append('history', form.value.history || '')
            formData.append('how_to_use', form.value.how_to_use || '')
            form.value.links.filter(link => link !== '').forEach(link => {
              formData.append('links', link)
            })
            if (form.value.image) {
              formData.append('photo', form.value.image)
            }

            if (isEdit.value) {
              await axios.patch(`/admin/tool/${form.value.id}/`, formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              })
              ElMessage.success('Инструмент успешно обновлен')
            } else {
              await axios.post('/admin/tool/', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data'
                }
              })
              ElMessage.success('Инструмент успешно создан')
            }
            dialogVisible.value = false
            fetchTools()
          } catch (error) {
            ElMessage.error(`Ошибка при сохранении инструмента: ${error.response?.data?.detail || error.message}`)
          }
        }
      })
    }

    const addLink = () => {
      form.value.links.push('')
    }

    const removeLink = (index) => {
      form.value.links.splice(index, 1)
    }

    onMounted(() => {
      fetchTools()
    })

    return {
      tools,
      loading,
      searchQuery,
      dialogVisible,
      isEdit,
      form,
      formRef,
      rules,
      handleSearch,
      handleAdd,
      handleEdit,
      handleDelete,
      handleSubmit,
      addLink,
      removeLink,
      dialogTitle: computed(() => isEdit.value ? 'Редактировать инструмент' : 'Создать инструмент'),
      currentPage,
      pageSize,
      totalItems,
      handlePageChange,
      fileInput,
      imagePreview,
      handleImageChange,
      fileInputClass: 'file-input',
      previewImageClass: 'preview-image',
      imageErrorClass: 'image-error',
      getImageUrl,
    }
  }
}
</script>

<style scoped>
.tools-page {
  padding: 20px;
}

.tools-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tools-actions {
  display: flex;
  gap: 10px;
}

.avatar-uploader {
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.link-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.file-input {
  margin-bottom: 10px;
}

.preview-image {
  width: 178px;
  height: 178px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.image-error {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  background: #f5f7fa;
  color: #909399;
}
</style> 