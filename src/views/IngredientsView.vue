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
        @row-click="handleCategorySectionClick"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
          sortable
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
            <div class="categories-count">
              <el-tooltip
                placement="top"
                :content="getCategoriesPreview(row.categories)"
                :show-after="200"
              >
                <span>{{ row.categories?.length || 0 }} категорий</span>
              </el-tooltip>
            </div>
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
        @sort-change="handleCategorySort"
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
        @sort-change="handleIngredientSort"
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
          prop="category"
          label="Категория"
          sortable
          width="300"
        >
          <template #default="{ row }">
            <div class="category-info">
              <span v-if="getCategoryName(row.category)" class="category-name">{{ getCategoryName(row.category) }}</span>
              <span v-else class="category-name text-gray">Категория не найдена</span>
              <el-select
                v-model="row.category"
                filterable
                remote
                :remote-method="searchCategories"
                placeholder="Выберите категорию"
                @change="(value) => handleIngredientCategoryChange(row, value)"
                class="category-select"
              >
                <el-option
                  v-for="item in availableCategories"
                  :key="item.id"
                  :label="`${item.name} (ID: ${item.id})`"
                  :value="item.id"
                />
              </el-select>
            </div>
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
            Сохранить
          </el-button>
        </span>
      </template>
    </el-dialog>
    <el-dialog
      title="Управление категориями блока"
      v-model="categorySectionDialogVisible"
      width="60%"
    >
      <div v-if="selectedCategorySection">
        <div class="section-info">
          <h3>{{ selectedCategorySection.name }}</h3>
          <p>ID: {{ selectedCategorySection.id }}, Язык: {{ selectedCategorySection.language === 'ENG' ? 'English' : 'Русский' }}</p>
        </div>
        
        <div class="categories-management">
          <div class="add-category-section">
            <h4>Добавить категорию</h4>
            <div class="add-category-controls">
              <el-select
                v-model="categoryToAdd"
                filterable
                remote
                :remote-method="searchCategories"
                placeholder="Выберите категорию"
                style="width: 100%;"
              >
                <el-option
                  v-for="item in availableCategoriesToAdd"
                  :key="item.id"
                  :label="item.name + ' (ID: ' + item.id + ')'"
                  :value="item.id"
                />
              </el-select>
              <el-button 
                type="primary" 
                icon="el-icon-plus" 
                @click="addCategoryToSection"
                :disabled="!categoryToAdd"
              >
                Добавить
              </el-button>
            </div>
          </div>
          
          <div class="current-categories-section">
            <h4>Текущие категории</h4>
            <div v-if="!selectedCategorySection.categories?.length" class="no-categories">
              Нет категорий в этом блоке
            </div>
            <div v-else class="categories-list">
              <el-tag
                v-for="cat in selectedCategorySection.categories"
                :key="typeof cat === 'object' ? cat.id : cat"
                class="category-tag"
                closable
                @close="removeCategoryFromSection(typeof cat === 'object' ? cat.id : cat)"
              >
                {{ typeof cat === 'object' ? `${cat.name}: ${cat.id}` : getCategoryName(cat) }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
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
      total: 0,
      sortBy: 'id',
      sortOrder: 'ascending'
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
      total: 0,
      sortBy: 'id',
      sortOrder: 'ascending'
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

    const categorySectionDialogVisible = ref(false)
    const selectedCategorySection = ref(null)
    const categoryToAdd = ref(null)
    const availableCategoriesToAdd = computed(() => {
      if (!selectedCategorySection.value || !selectedCategorySection.value.categories) {
        return availableCategories.value;
      }
      
      return availableCategories.value.filter(
        cat => !selectedCategorySection.value.categories.includes(cat.id)
      );
    });

    const categoryMap = ref({})

    const fetchCategorySections = async () => {
      loadingSections.value = true
      try {
        const response = await axios.get('/admin/ingredient/category-section/')
        if (response.data && Array.isArray(response.data)) {
          categorySections.value = response.data.map(section => ({
            ...section,
            categories: Array.isArray(section.categories) ? section.categories : []
          }))
        } else if (response.data && typeof response.data === 'object' && Array.isArray(response.data.results)) {
          categorySections.value = response.data.results.map(section => ({
            ...section,
            categories: Array.isArray(section.categories) ? section.categories : []
          }))
        } else {
          categorySections.value = []
        }
        
        if (categorySections.value.length > 0) {
          await searchCategories('')
        }
      } catch {
        ElMessage.error('Ошибка при загрузке блоков категорий')
      } finally {
        loadingSections.value = false
      }
    }

    const handleCategoriesChange = async (row, value) => {
      try {
        const payload = {
          categories: Array.isArray(value) ? value : []
        }
        await axios.put(`/admin/ingredient/category-section/${row.id}/`, payload)
        row.categories = Array.isArray(value) ? value : []
        ElMessage.success('Категории обновлены')
      } catch {
        ElMessage.error('Ошибка при обновлении категорий')
        await fetchCategorySections()
      }
    }

    const fetchCategories = async () => {
      loadingCategories.value = true
      try {
        const params = new URLSearchParams({
          page: categoryPagination.value.currentPage.toString()
        })

        if (categorySearchQuery.value) {
          params.append('search', categorySearchQuery.value)
        }

        if (categoryPagination.value.sortBy) {
          const orderingPrefix = categoryPagination.value.sortOrder === 'descending' ? '-' : ''
          params.append('ordering', orderingPrefix + categoryPagination.value.sortBy)
        }
        
        const response = await axios.get(`/admin/ingredient/category/?${params.toString()}`)
        categories.value = response.data.results || []
        categoryPagination.value.total = response.data.count || 0
      } catch {
        ElMessage.error('Ошибка при загрузке категорий')
      }
      loadingCategories.value = false
    }

    const handleCategoryPageChange = (page) => {
      categoryPagination.value.currentPage = page
      fetchCategories()
    }

    const handleCategorySearch = () => {
      categoryPagination.value.currentPage = 1 
      fetchCategories()
    }

    const searchCategories = async (query) => {
      if (query) {
        try {
          const searchParams = !isNaN(query) ? { id: query } : { search: query }
          const response = await axios.get('/admin/ingredient/category/', { params: searchParams })
          if (response.data && Array.isArray(response.data)) {
            availableCategories.value = response.data
          } else if (response.data && Array.isArray(response.data.results)) {
            availableCategories.value = response.data.results
          } else {
            availableCategories.value = []
          }
        } catch {
          ElMessage.error('Ошибка при поиске категорий')
        }
      } else {
        try {
          const response = await axios.get('/admin/ingredient/category/')
          if (response.data && Array.isArray(response.data)) {
            availableCategories.value = response.data
          } else if (response.data && Array.isArray(response.data.results)) {
            availableCategories.value = response.data.results
          } else {
            availableCategories.value = []
          }
        } catch {
          ElMessage.error('Ошибка при загрузке категорий')
        }
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
      } catch {
        ElMessage.error('Ошибка при удалении категории')
      }
    }

    const handleCategoryUpdate = async (row) => {
      try {
        await axios.patch(`/admin/ingredient/category/${row.id}/`, row)
        ElMessage.success('Категория обновлена')
      } catch {
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
          } catch {
            ElMessage.error('Ошибка при сохранении категории')
          }
        }
      })
    }

    const handleCategorySort = ({ prop, order }) => {
      if (!prop) return
      categoryPagination.value.sortBy = prop
      categoryPagination.value.sortOrder = order || 'ascending'
      categoryPagination.value.currentPage = 1
      fetchCategories()
    }

    const handleIngredientSort = ({ prop, order }) => {
      if (!prop) return
      ingredientPagination.value.sortBy = prop
      ingredientPagination.value.sortOrder = order || 'ascending'
      ingredientPagination.value.currentPage = 1
      fetchIngredients()
    }

    const fetchIngredients = async () => {
      loadingIngredients.value = true
      try {
        const params = new URLSearchParams({
          page: ingredientPagination.value.currentPage.toString()
        })

        if (ingredientSearchQuery.value) {
          params.append('search', ingredientSearchQuery.value)
        }

        if (ingredientPagination.value.sortBy) {
          const orderingPrefix = ingredientPagination.value.sortOrder === 'descending' ? '-' : ''
          params.append('ordering', orderingPrefix + ingredientPagination.value.sortBy)
        }
        
        const response = await axios.get(`/admin/ingredient/?${params.toString()}`)
        ingredients.value = response.data.results || []
        ingredientPagination.value.total = response.data.count || 0
        
        const uniqueCategoryIds = [...new Set(ingredients.value.map(i => i.category).filter(Boolean))]
        await loadCategoriesInfo(uniqueCategoryIds)
      } catch {
        ElMessage.error('Ошибка при загрузке ингредиентов')
      }
      loadingIngredients.value = false
    }

    const loadCategoriesInfo = async (categoryIds) => {
      if (!categoryIds.length) return
      
      try {
        const params = new URLSearchParams()
        categoryIds.forEach(id => params.append('ids', id.toString()))
        
        const response = await axios.get(`/admin/ingredient/category/?${params.toString()}`)
        const categories = Array.isArray(response.data) ? response.data : 
                         response.data.results ? response.data.results : []
        categories.forEach(category => {
          categoryMap.value[category.id] = category
        })
      } catch {
        ElMessage.error('Ошибка при загрузке информации о категориях')
      }
    }

    const getCategoryName = (categoryId) => {
      if (!categoryId) return 'Не указана'
      const category = categoryMap.value[categoryId]
      return category ? `${category.name}: ${category.id}` : `Категория: ${categoryId}`
    }

    const handleIngredientPageChange = (page) => {
      ingredientPagination.value.currentPage = page
      fetchIngredients()
    }

    const handleIngredientSearch = () => {
      ingredientPagination.value.currentPage = 1
      fetchIngredients()
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
      } catch {
        ElMessage.error('Ошибка при удалении ингредиента')
      }
    }

    const handleIngredientUpdate = async (row) => {
      try {
        await axios.patch(`/admin/ingredient/${row.id}/`, row)
        ElMessage.success('Ингредиент обновлен')
      } catch {
        ElMessage.error('Ошибка при обновлении ингредиента')
      }
    }

    const handleIngredientCategoryChange = async (row, categoryId) => {
      try {
        await axios.patch(`/admin/ingredient/${row.id}/`, { category: categoryId })
        ElMessage.success('Категория ингредиента обновлена')
        fetchIngredients()
      } catch {
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
          } catch {
            ElMessage.error('Ошибка при сохранении ингредиента')
          }
        }
      })
    }

    const removeCategory = async (row, catId) => {
      try {
        const newCategories = Array.isArray(row.categories) 
          ? row.categories.filter(id => id !== catId) 
          : [];
          
        await handleCategoriesChange(row, newCategories)
      } catch {
        ElMessage.error('Ошибка при удалении категории')
      }
    }

    const handleCategorySectionClick = (row) => {
      selectedCategorySection.value = { ...row };
      categoryToAdd.value = null;
      categorySectionDialogVisible.value = true;
    };

    const addCategoryToSection = async () => {
      if (!categoryToAdd.value || !selectedCategorySection.value) return;
      
      try {
        const currentCategories = selectedCategorySection.value.categories || [];
        const currentCategoryIds = currentCategories.map(cat => {
          if (cat && typeof cat === 'object' && 'id' in cat) {
            return Number(cat.id);
          }
          return Number(cat);
        }).filter(id => !isNaN(id) && id !== null);
        
        const newCategoryId = Number(categoryToAdd.value);
        
        if (newCategoryId && !isNaN(newCategoryId)) {
          if (!currentCategoryIds.includes(newCategoryId)) {
            const newCategories = [...currentCategoryIds, newCategoryId];
            
            await axios.put(`/admin/ingredient/category-section/${selectedCategorySection.value.id}/`, {
              categories: newCategories
            });
            
            selectedCategorySection.value.categories = newCategories;
            const index = categorySections.value.findIndex(s => s.id === selectedCategorySection.value.id);
            if (index !== -1) {
              categorySections.value[index].categories = newCategories;
            }
            
            categoryToAdd.value = null;
            ElMessage.success('Категория добавлена в блок');
          } else {
            ElMessage.warning('Эта категория уже добавлена в блок');
          }
        } else {
          ElMessage.error('Некорректный ID категории');
        }
      } catch {
        ElMessage.error('Ошибка при добавлении категории в блок');
      }
    };
    
    const removeCategoryFromSection = async (catId) => {
      if (!selectedCategorySection.value) return;
      
      try {
        const currentCategories = selectedCategorySection.value.categories || [];
        const currentCategoryIds = currentCategories.map(cat => {
          if (cat && typeof cat === 'object' && 'id' in cat) {
            return Number(cat.id);
          }
          return Number(cat);
        }).filter(id => !isNaN(id) && id !== null);
        
        const catIdToRemove = Number(catId);
        const newCategories = currentCategoryIds.filter(id => id !== catIdToRemove);
        
        await axios.put(`/admin/ingredient/category-section/${selectedCategorySection.value.id}/`, {
          categories: newCategories
        });
        
        selectedCategorySection.value.categories = newCategories;
        const index = categorySections.value.findIndex(s => s.id === selectedCategorySection.value.id);
        if (index !== -1) {
          categorySections.value[index].categories = newCategories;
        }
        
        ElMessage.success('Категория удалена из блока');
      } catch {
        ElMessage.error('Ошибка при удалении категории из блока');
      }
    };

    const getCategoriesPreview = (categories) => {
      if (!categories || !categories.length) return 'Нет категорий'
      
      const previewCategories = categories.slice(0, 5)
        .map(cat => {
          if (typeof cat === 'object' && cat !== null) {
            return cat.name
          }
          return getCategoryName(cat)
        })
        .filter(Boolean)
      
      let preview = previewCategories.join(', ')
      if (categories.length > 5) {
        preview += ` , \n... и еще ${categories.length - 5} категорий`
      }
      
      return preview || 'Нет категорий'
    }

    onMounted(async () => {
      await fetchCategorySections()
      try {
        const response = await axios.get('/admin/ingredient/category/', {
          params: { page_size: 1000 }
        })
        const categories = Array.isArray(response.data) ? response.data :
                         response.data.results ? response.data.results : []
        categories.forEach(category => {
          categoryMap.value[category.id] = category
        })
      } catch {
        ElMessage.error('Ошибка при начальной загрузке категорий')
      }
      
      await searchCategories('')
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
      handleCategorySort,
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
      handleIngredientSubmit,
      handleIngredientSort,
      handleIngredientCategoryChange,
      ingredientDialogTitle: computed(() => isEditIngredient.value ? 'Редактировать ингредиент' : 'Создать ингредиент'),
      ingredientPagination,
      handleIngredientPageChange,
      removeCategory,
      getCategoryName,
      categorySectionDialogVisible,
      selectedCategorySection,
      categoryToAdd,
      availableCategoriesToAdd,
      handleCategorySectionClick,
      addCategoryToSection,
      removeCategoryFromSection,
      getCategoriesPreview,
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

.selected-categories {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.el-tag {
  margin: 2px;
}

.categories-count {
  color: #409EFF;
  cursor: pointer;
}

.section-info {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.section-info h3 {
  margin: 0 0 10px 0;
}

.section-info p {
  margin: 0;
  color: #666;
}

.categories-management {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.add-category-section, 
.current-categories-section {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.add-category-controls {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.categories-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.category-tag {
  margin: 2px;
}

.no-categories {
  color: #999;
  font-style: italic;
  margin-top: 10px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.category-name {
  font-weight: 500;
}

.text-gray {
  color: #909399;
}

.category-select {
  min-width: 200px;
}

.el-select :deep(.el-input__wrapper) {
  background-color: transparent;
}

.el-button.save-btn {
  margin-left: 8px;
}
</style> 