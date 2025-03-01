<template>
  <div class="ingredients-page">
    <h1>Ингредиенты</h1>
    <div class="section">
      <h2>Блоки категорий</h2>
      <el-table
        :data="categorySections"
        style="width: 100%"
        v-loading="loadingSections"
        row-key="id"
        :default-sort="{ prop: 'id', order: 'ascending' }"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="name"
          label="Название"
        />
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
          prop="categories"
          label="Категории"
        >
          <template #default="{ row }">
            <el-select
              v-model="row.categories"
              multiple
              filterable
              remote
              :remote-method="searchCategories"
              placeholder="Выберите категории"
              @change="(value) => handleCategoriesChange(row, value)"
            >
              <el-option
                v-for="item in availableCategories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="section">
      <div class="section-header">
        <h2>Категории</h2>
        <el-button type="primary" @click="handleAddCategory">
          Добавить категорию
        </el-button>
      </div>
      <div class="search-bar">
        <el-input
          v-model="categorySearchQuery"
          placeholder="Поиск категорий..."
          @input="handleCategorySearch"
          clearable
        />
      </div>
      <el-table
        :data="categories"
        style="width: 100%"
        v-loading="loadingCategories"
        row-key="id"
        :default-sort="{ prop: 'id', order: 'ascending' }"
      >
        <el-table-column
          prop="id"
          label="ID"
          sortable
          width="80"
        />
        <el-table-column
          prop="name"
          label="Название"
          sortable
        />
        <el-table-column
          prop="language"
          label="Язык"
          sortable
          width="100"
        >
          <template #default="{ row }">
            {{ row.language === 'ENG' ? 'English' : 'Русский' }}
          </template>
        </el-table-column>
        <el-table-column
          prop="is_main"
          label="Основная"
          width="100"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.is_main"
              @change="handleCategoryUpdate(row)"
            />
          </template>
        </el-table-column>
        <el-table-column
          prop="is_alcoholic"
          label="Алкогольная"
          width="100"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.is_alcoholic"
              @change="handleCategoryUpdate(row)"
            />
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
              @click="handleEditCategory(row)"
            >
              Редактировать
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDeleteCategory(row)"
            >
              Удалить
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="categoryPagination.currentPage"
          v-model:page-size="categoryPagination.pageSize"
          :total="categoryPagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="(size) => { categoryPagination.pageSize = size; handleCategorySearch(); }"
          @current-change="handleCategoryPageChange"
        />
      </div>
    </div>
    <div class="section">
      <div class="section-header">
        <h2>Ингредиенты</h2>
        <el-button type="primary" @click="handleAddIngredient">
          Добавить ингредиент
        </el-button>
      </div>
      <div class="search-bar">
        <el-input
          v-model="ingredientSearchQuery"
          placeholder="Поиск ингредиентов..."
          @input="handleIngredientSearch"
          clearable
        />
      </div>
      <el-table
        :data="ingredients"
        style="width: 100%"
        v-loading="loadingIngredients"
        row-key="id"
        :default-sort="{ prop: 'id', order: 'ascending' }"
      >
        <el-table-column
          prop="id"
          label="ID"
          sortable
          width="80"
        />
        <el-table-column
          prop="language"
          label="Язык"
          sortable
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
          prop="category_name"
          label="Категория"
          sortable
        >
          <template #default="{ row }">
            <el-select
              v-model="row.category"
              filterable
              remote
              :remote-method="searchCategories"
              placeholder="Выберите категорию"
              @change="(value) => handleIngredientCategoryChange(row, value)"
            >
              <el-option
                v-for="item in availableCategories"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_alcoholic"
          label="Алкогольный"
          width="100"
        >
          <template #default="{ row }">
            <el-switch
              v-model="row.is_alcoholic"
              @change="handleIngredientUpdate(row)"
            />
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
              @click="handleEditIngredient(row)"
            >
              Редактировать
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDeleteIngredient(row)"
            >
              Удалить
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="ingredientPagination.currentPage"
          v-model:page-size="ingredientPagination.pageSize"
          :total="ingredientPagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="(size) => { ingredientPagination.pageSize = size; handleIngredientSearch(); }"
          @current-change="handleIngredientPageChange"
        />
      </div>
    </div>
    <el-dialog
      :title="categoryDialogTitle"
      v-model="categoryDialogVisible"
      width="50%"
    >
      <el-form
        ref="categoryFormRef"
        :model="categoryForm"
        :rules="categoryRules"
        label-width="120px"
      >
        <el-form-item label="Название" prop="name">
          <el-input v-model="categoryForm.name" />
        </el-form-item>
        <el-form-item label="Язык" prop="language">
          <el-select v-model="categoryForm.language" placeholder="Выберите язык">
            <el-option label="English" value="ENG" />
            <el-option label="Русский" value="RUS" />
          </el-select>
        </el-form-item>
        <el-form-item label="Основная">
          <el-switch v-model="categoryForm.is_main" />
        </el-form-item>
        <el-form-item label="Алкогольная">
          <el-switch v-model="categoryForm.is_alcoholic" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="categoryDialogVisible = false">Отмена</el-button>
          <el-button type="primary" @click="handleCategorySubmit">
            {{ isEditCategory ? 'Сохранить' : 'Создать' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      :title="ingredientDialogTitle"
      v-model="ingredientDialogVisible"
      width="50%"
    >
      <el-form
        ref="ingredientFormRef"
        :model="ingredientForm"
        :rules="ingredientRules"
        label-width="120px"
      >
        <el-form-item label="Название" prop="name">
          <el-input v-model="ingredientForm.name" />
        </el-form-item>
        <el-form-item label="Язык" prop="language">
          <el-select v-model="ingredientForm.language" placeholder="Выберите язык">
            <el-option label="English" value="ENG" />
            <el-option label="Русский" value="RUS" />
          </el-select>
        </el-form-item>
        <el-form-item label="Описание" prop="description">
          <el-input v-model="ingredientForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="Категория" prop="category">
          <el-select
            v-model="ingredientForm.category"
            filterable
            remote
            :remote-method="searchCategories"
            placeholder="Выберите категорию"
          >
            <el-option
              v-for="item in availableCategories"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Алкогольный">
          <el-switch v-model="ingredientForm.is_alcoholic" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="ingredientDialogVisible = false">Отмена</el-button>
          <el-button type="primary" @click="handleIngredientSubmit">
            {{ isEditIngredient ? 'Сохранить' : 'Создать' }}
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

export default {
  name: 'IngredientsView',
  setup() {
    const categorySections = ref([])
    const loadingSections = ref(false)
    const categories = ref([])
    const loadingCategories = ref(false)
    const categorySearchQuery = ref('')
    const categoryDialogVisible = ref(false)
    const isEditCategory = ref(false)
    const categoryFormRef = ref(null)
    const availableCategories = ref([])
    const categoryPagination = ref({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })

    const categoryForm = ref({
      name: '',
      language: '',
      is_main: false,
      is_alcoholic: false
    })

    const categoryRules = {
      name: [{ required: true, message: 'Введите название', trigger: 'blur' }],
      language: [{ required: true, message: 'Выберите язык', trigger: 'change' }]
    }
    const ingredients = ref([])
    const loadingIngredients = ref(false)
    const ingredientSearchQuery = ref('')
    const ingredientDialogVisible = ref(false)
    const isEditIngredient = ref(false)
    const ingredientFormRef = ref(null)
    const ingredientPagination = ref({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })

    const ingredientForm = ref({
      name: '',
      language: '',
      description: '',
      category: null,
      is_alcoholic: false
    })
    const ingredientRules = {
      name: [{ required: true, message: 'Введите название', trigger: 'blur' }],
      language: [{ required: true, message: 'Выберите язык', trigger: 'change' }],
      category: [{ required: true, message: 'Выберите категорию', trigger: 'change' }]
    }

    const fetchCategorySections = async () => {
      loadingSections.value = true
      try {
        const response = await axios.get('/admin/ingredient/category-section/')
        const sectionsData = Array.isArray(response.data) ? response.data : []
        categorySections.value = sectionsData.map(section => ({
          ...section,
          categories: Array.isArray(section.categories) ? section.categories : []
        }))
      } catch (error) {
        ElMessage.error('Ошибка при загрузке блоков категорий')
      } finally {
        loadingSections.value = false
      }
    }

    const handleCategoriesChange = async (row, value) => {
      try {
        const payload = {
          ...row,
          categories: Array.isArray(value) ? value : []
        }
        await axios.put(`/admin/ingredient/category-section/${row.id}/`, payload)
        ElMessage.success('Категории обновлены')
      } catch (error) {
        ElMessage.error('Ошибка при обновлении категорий')
      }
    }
    const fetchCategories = async (query = '', page = 1) => {
      loadingCategories.value = true
      try {
        const response = await axios.get('/admin/ingredient/category/', {
          params: {
            search: query || undefined,
            page: page,
            page_size: categoryPagination.value.pageSize
          }
        })
        
        if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data.results)) {
            categories.value = response.data.results
            categoryPagination.value.total = response.data.count || 0
          } else if (Array.isArray(response.data)) {
            categories.value = response.data
            categoryPagination.value.total = response.data.length
          } else {
            categories.value = []
            categoryPagination.value.total = 0
          }
        }
      } catch (error) {
        ElMessage.error('Ошибка при загрузке категорий')
      } finally {
        loadingCategories.value = false
      }
    }

    const handleCategoryPageChange = (page) => {
      categoryPagination.value.currentPage = page
      fetchCategories(categorySearchQuery.value, page)
    }

    const handleCategorySearch = () => {
      categoryPagination.value.currentPage = 1 
      fetchCategories(categorySearchQuery.value, 1)
    }

    const searchCategories = async (query) => {
      if (query) {
        try {
          const searchParams = isNaN(query) ? 
            { search: query } : 
            { id: query }
          const response = await axios.get('/admin/ingredient/category/', { params: searchParams })
          availableCategories.value = Array.isArray(response.data.results) ? response.data.results : 
            (Array.isArray(response.data) ? response.data : [])
        } catch (error) {
          ElMessage.error('Ошибка при поиске категорий')
        }
      } else {
        availableCategories.value = []
      }
    }

    const resetCategoryForm = () => {
      categoryForm.value = {
        name: '',
        language: '',
        is_main: false,
        is_alcoholic: false
      }
    }

    const handleAddCategory = () => {
      isEditCategory.value = false
      resetCategoryForm()
      categoryDialogVisible.value = true
    }

    const handleEditCategory = (row) => {
      isEditCategory.value = true
      categoryForm.value = { ...row }
      categoryDialogVisible.value = true
    }

    const handleDeleteCategory = async (row) => {
      try {
        await axios.delete(`/admin/ingredient/category/${row.id}/`)
        ElMessage.success('Категория удалена')
        fetchCategories()
      } catch (error) {
        ElMessage.error('Ошибка при удалении категории')
      }
    }

    const handleCategoryUpdate = async (row) => {
      try {
        await axios.patch(`/admin/ingredient/category/${row.id}/`, row)
        ElMessage.success('Категория обновлена')
      } catch (error) {
        ElMessage.error('Ошибка при обновлении категории')
      }
    }

    const handleCategorySubmit = async () => {
      if (!categoryFormRef.value) return

      await categoryFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            if (isEditCategory.value) {
              await axios.patch(`/admin/ingredient/category/${categoryForm.value.id}/`, categoryForm.value)
            } else {
              await axios.post('/admin/ingredient/category/', categoryForm.value)
            }
            categoryDialogVisible.value = false
            fetchCategories()
          } catch (error) {
            ElMessage.error('Ошибка при сохранении категории')
          }
        }
      })
    }

    const fetchIngredients = async (query = '', page = 1) => {
      loadingIngredients.value = true
      try {
        const response = await axios.get('/admin/ingredient/', {
          params: {
            search: query || undefined,
            page: page,
            page_size: ingredientPagination.value.pageSize
          }
        })

        if (response.data && typeof response.data === 'object') {
          if (Array.isArray(response.data.results)) {
            ingredients.value = response.data.results
            ingredientPagination.value.total = response.data.count || 0
          } else if (Array.isArray(response.data)) {
            ingredients.value = response.data
            ingredientPagination.value.total = response.data.length
          } else {
            ingredients.value = []
            ingredientPagination.value.total = 0
          }
        }
      } catch (error) {
        ElMessage.error('Ошибка при загрузке ингредиентов')
      } finally {
        loadingIngredients.value = false
      }
    }

    const handleIngredientPageChange = (page) => {
      ingredientPagination.value.currentPage = page
      fetchIngredients(ingredientSearchQuery.value, page)
    }

    const handleIngredientSearch = () => {
      ingredientPagination.value.currentPage = 1 
      fetchIngredients(ingredientSearchQuery.value, 1)
    }

    const resetIngredientForm = () => {
      ingredientForm.value = {
        name: '',
        language: '',
        description: '',
        category: null,
        is_alcoholic: false
      }
    }

    const handleAddIngredient = () => {
      isEditIngredient.value = false
      resetIngredientForm()
      ingredientDialogVisible.value = true
    }

    const handleEditIngredient = (row) => {
      isEditIngredient.value = true
      ingredientForm.value = { ...row }
      ingredientDialogVisible.value = true
    }

    const handleDeleteIngredient = async (row) => {
      try {
        await axios.delete(`/admin/ingredient/${row.id}/`)
        ElMessage.success('Ингредиент удален')
        fetchIngredients()
      } catch (error) {
        ElMessage.error('Ошибка при удалении ингредиента')
      }
    }

    const handleIngredientUpdate = async (row) => {
      try {
        await axios.patch(`/admin/ingredient/${row.id}/`, row)
        ElMessage.success('Ингредиент обновлен')
      } catch (error) {
        ElMessage.error('Ошибка при обновлении ингредиента')
      }
    }

    const handleIngredientCategoryChange = async (row, value) => {
      try {
        const payload = {
          ...row,
          category: value
        }
        await axios.patch(`/admin/ingredient/${row.id}/`, payload)
        ElMessage.success('Категория ингредиента обновлена')
      } catch (error) {
        ElMessage.error('Ошибка при обновлении категории ингредиента')
      }
    }

    const handleIngredientSubmit = async () => {
      if (!ingredientFormRef.value) return

      await ingredientFormRef.value.validate(async (valid) => {
        if (valid) {
          try {
            if (isEditIngredient.value) {
              await axios.patch(`/admin/ingredient/${ingredientForm.value.id}/`, ingredientForm.value)
            } else {
              await axios.post('/admin/ingredient/', ingredientForm.value)
            }
            ingredientDialogVisible.value = false
            fetchIngredients()
          } catch (error) {
            ElMessage.error('Ошибка при сохранении ингредиента')
          }
        }
      })
    }

    onMounted(() => {
      fetchCategorySections()
      fetchCategories()
      fetchIngredients()
    })

    return {
      categorySections,
      loadingSections,
      handleCategoriesChange,
      categories,
      loadingCategories,
      categorySearchQuery,
      categoryDialogVisible,
      categoryForm,
      categoryFormRef,
      categoryRules,
      availableCategories,
      handleCategorySearch,
      handleAddCategory,
      handleEditCategory,
      handleDeleteCategory,
      handleCategoryUpdate,
      handleCategorySubmit,
      searchCategories,
      categoryDialogTitle: computed(() => isEditCategory.value ? 'Редактировать категорию' : 'Создать категорию'),
      categoryPagination,
      handleCategoryPageChange,
      ingredients,
      loadingIngredients,
      ingredientSearchQuery,
      ingredientDialogVisible,
      ingredientForm,
      ingredientFormRef,
      ingredientRules,
      handleIngredientSearch,
      handleAddIngredient,
      handleEditIngredient,
      handleDeleteIngredient,
      handleIngredientUpdate,
      handleIngredientCategoryChange,
      handleIngredientSubmit,
      ingredientDialogTitle: computed(() => isEditIngredient.value ? 'Редактировать ингредиент' : 'Создать ингредиент'),
      ingredientPagination,
      handleIngredientPageChange
    }
  }
}
</script>

<style scoped>
.ingredients-page {
  padding: 20px;
}

.section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

h1 {
  margin-bottom: 30px;
}

h2 {
  margin-bottom: 20px;
}
</style> 