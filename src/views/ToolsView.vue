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
      @sort-change="handleSortChange"
    >
      <el-table-column
        prop="id"
        label="ID"
        sortable="custom"
        width="80"
      />
      <el-table-column
        prop="photo"
        label="Фото"
        width="120"
      >
        <template #default="{ row }">
          <div v-if="row.photo" style="cursor: pointer" @click="showImage(row.photo)">
            <el-image
              :src="row.photo"
              fit="cover"
              style="width: 50px; height: 50px; border-radius: 4px;"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><picture-filled /></el-icon>
                </div>
              </template>
            </el-image>
          </div>
          <span v-else>Нет фото</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="language"
        label="Язык"
        sortable="custom"
        width="100"
      >
        <template #default="{ row }">
          {{ row.language === 'ENG' ? 'English' : 'Русский' }}
        </template>
      </el-table-column>
      <el-table-column
        prop="name"
        label="Название"
        sortable="custom"
      />
      <el-table-column
        prop="description"
        label="Описание"
        sortable="custom"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span>{{ row.description }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="history"
        label="История"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span>{{ row.history }}</span>
        </template>
      </el-table-column>
      <el-table-column
        prop="how_to_use"
        label="Как использовать"
        show-overflow-tooltip
      >
        <template #default="{ row }">
          <span>{{ row.how_to_use }}</span>
        </template>
      </el-table-column>
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
        layout="total, prev, pager, next"
        :pager-count="7"
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
          <div class="links-container">
            <div v-for="(link, index) in form.links" :key="index" class="link-item">
              <el-input v-model="form.links[index]" />
              <el-button type="danger" @click="removeLink(index)">Удалить</el-button>
            </div>
            <el-button type="primary" class="add-link-button" @click="addLink">Добавить ссылку</el-button>
          </div>
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

    <v-dialog v-model="imageDialog" max-width="800px">
      <v-card>
        <v-card-title class="bg-primary text-white pa-4">
          <span>Просмотр изображения</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" color="white" @click="imageDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-img
            :src="selectedImage"
            max-height="600"
            contain
            class="bg-grey-lighten-2"
          ></v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from '@/plugins/axios'
import { ElMessage } from 'element-plus'

export default {
  name: 'ToolsView',
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
    const sortBy = ref('')

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
    const imageDialog = ref(false)
    const selectedImage = ref(null)

    const fetchTools = async (query = '') => {
      loading.value = true
      try {
        let url = `/admin/tool/?page=${currentPage.value}&page_size=${pageSize.value}`
        
        if (query) {
          url += `&search=${query}`
        }
        
        if (sortBy.value) {
          url += `&ordering=${sortBy.value}`
        }
        
        const response = await axios.get(url)
        tools.value = response.data.results || []
        totalItems.value = response.data.count || 0
      } catch (error) {
        console.error('Error fetching tools:', error)
        ElMessage.error('Ошибка при загрузке инструментов')
      } finally {
        loading.value = false
      }
    }

    const handleSortChange = ({ prop, order }) => {
      if (!prop) {
        sortBy.value = ''
      } else {
        sortBy.value = order === 'descending' ? `-${prop}` : prop
      }
      fetchTools(searchQuery.value)
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
      form.value = { 
        ...row,
        links: Array.isArray(row.links) ? [...row.links] : []
      }
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

    const showImage = (imageUrl) => {
      if (imageUrl) {
        selectedImage.value = imageUrl;
        imageDialog.value = true;
      }
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
      linkItemClass: 'link-item',
      elFormItemContentClass: 'el-form-item__content',
      linksContainerClass: 'links-container',
      addLinkButtonClass: 'add-link-button',
      handleSortChange,
      sortBy,
      imageDialog,
      selectedImage,
      showImage
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

.links-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.link-item {
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
}

.link-item .el-input {
  flex: 1;
}

.add-link-button {
  align-self: flex-start;
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