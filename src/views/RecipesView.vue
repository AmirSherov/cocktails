<template>
  <div class="recipes-container">
    <v-card class="recipes-card">
      <v-card-title class="recipes-header">
        <h2 class="recipes-title">Рецепты</h2>
        <div class="search-block">
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="Поиск"
          single-line
          hide-details
            class="search-field"
            density="compact"
          />
          <v-btn 
            v-if="activeTab === 1"
            color="primary" 
            @click="createRecipe"
            prepend-icon="mdi-plus"
            size="small"
          >
            Добавить рецепт
          </v-btn>
        </div>
      </v-card-title>

      <v-tabs
        v-model="activeTab"
        background-color="primary"
        dark
        class="mb-2"
      >
        <v-tab :value="0">На модерации</v-tab>
        <v-tab :value="1">Одобрены</v-tab>
        <v-tab :value="2">Отклонены</v-tab>
      </v-tabs>

      <div class="table-container">
        <v-data-table
          :headers="filteredHeaders"
          :items="currentRecipes"
          :search="search"
          density="compact"
          class="recipes-table"
          :loading="loading"
          :items-per-page="15"
          :page="page"
          :server-items-length="totalItems"
          @update:page="handlePageChange"
        >
          <template #[`item.image`]="{ item }">
            <v-avatar size="32" style="cursor: pointer">
              <v-img :src="item.image" contain class="grey lighten-2" />
            </v-avatar>
          </template>

          <template #[`item.isEnabled`]="{ item }">
            <v-chip
              :color="item.isEnabled ? 'success' : 'error'"
              size="x-small"
              class="text-caption"
            >
              {{ item.isEnabled ? 'Активный' : 'Неактивный' }}
            </v-chip>
          </template>

          <template #[`item.is_alcoholic`]="{ item }">
            <v-chip
              :color="item.is_alcoholic ? 'warning' : 'info'"
              size="x-small"
              class="text-caption"
            >
              {{ item.is_alcoholic ? 'Алкогольный' : 'Безалкогольный' }}
            </v-chip>
          </template>

          <template #[`item.tools`]="{ item }">
            <div class="tools-list">
              {{ item.tools.map(tool => {
                if (typeof tool === 'object' && tool.name) {
                  return tool.name;
                } else {
                  const foundTool = availableTools.find(t => t.id === tool);
                  return foundTool ? foundTool.name : tool;
                }
              }).join(', ') }}
            </div>
          </template>

          <template #[`item.ingredients`]="{ item }">
            <div class="ingredients-list">
              {{ item.ingredients.map(ing => {
                const ingredientName = ing.name || 
                  (ing.ingredient && typeof ing.ingredient === 'object' ? 
                    ing.ingredient.name : 
                    availableIngredients.find(i => i.id === ing.ingredient)?.name || ing.ingredient);
                return `${ingredientName} (${ing.quantity} ${ing.type})`;
              }).join(', ') }}
            </div>
          </template>

          <template #[`item.actions`]="{ item }">
            <div class="d-flex">
              <template v-if="activeTab === 0">
                <v-btn
                  icon="mdi-check"
                  color="success"
                  size="x-small"
                  variant="text"
                  class="mr-1"
                  @click="approveRecipe(item)"
                />
                <v-btn
                  icon="mdi-close"
                  color="error"
                  size="x-small"
                  variant="text"
                  class="mr-1"
                  @click="rejectRecipe(item)"
                />
                <v-btn
                  icon="mdi-pencil"
                  color="primary"
                  size="x-small"
                  variant="text"
                  @click="editRecipe(item)"
                />
              </template>

              <template v-if="activeTab === 1">
                <v-btn
                  icon="mdi-close"
                  color="error"
                  size="x-small"
                  variant="text"
                  class="mr-1"
                  @click="rejectRecipe(item)"
                />
                <v-btn
                  icon="mdi-pencil"
                  color="primary"
                  size="x-small"
                  variant="text"
                  class="mr-1"
                  @click="editRecipe(item)"
                />
                <v-btn
                  icon="mdi-delete"
                  color="error"
                  size="x-small"
                  variant="text"
                  @click="deleteRecipe(item)"
                />
              </template>

              <template v-if="activeTab === 2">
                <v-btn
                  icon="mdi-check"
                  color="success"
                  size="x-small"
                  variant="text"
                  class="mr-1"
                  @click="approveRecipe(item)"
                />
                <v-btn
                  icon="mdi-pencil"
                  color="primary"
                  size="x-small"
                  variant="text"
                  @click="editRecipe(item)"
                />
              </template>
            </div>
          </template>
        </v-data-table>
            </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="15"
          :total="totalItems"
          @current-change="handlePageChange"
          layout="total, prev, pager, next"
          :pager-count="7"
        />
            </div>
    </v-card>

      <!-- Диалог редактирования/создания рецепта -->
      <v-dialog v-model="dialog" max-width="1200px">
        <v-card>
        <v-card-title class="bg-primary text-white pa-4">
          <span>{{ formTitle }}</span>
          </v-card-title>

        <v-card-text class="pa-4">
          <v-form ref="form">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedItem.title"
                    label="Название"
                  required
                  density="comfortable"
                />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editedItem.language"
                  :items="[
                    { title: 'Русский', value: 'RU' },
                    { title: 'Английский', value: 'ENG' }
                  ]"
                  item-title="title"
                    item-value="value"
                    label="Язык"
                  density="comfortable"
                />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editedItem.description"
                    label="Описание"
                  density="comfortable"
                />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedItem.video_url"
                    label="Ссылка на видео"
                  density="comfortable"
                />
                </v-col>
                <v-col cols="12" sm="3">
                  <v-switch
                    v-model="editedItem.isEnabled"
                    label="Доступен"
                  color="success"
                />
                </v-col>
                <v-col cols="12" sm="3">
                  <v-switch
                    v-model="editedItem.is_alcoholic"
                    label="Алкогольный"
                  color="warning"
                />
                </v-col>

                <!-- Инструкция -->
                <v-col cols="12">
                <v-card outlined class="pa-4">
                    <v-card-title>Инструкция</v-card-title>
                    <v-card-text>
                    <div v-for="(step, index) in editedItem.instruction" :key="index" class="d-flex align-center mb-2">
                            <v-text-field
                              v-model="editedItem.instruction[index]"
                              :label="`Шаг ${index + 1}`"
                        density="comfortable"
                        class="flex-grow-1 mr-2"
                      />
                            <v-btn
                        icon="mdi-delete"
                        color="error"
                        size="small"
                        variant="text"
                              @click="removeInstructionStep(index)"
                      />
                    </div>
                      <v-btn
                        color="primary"
                      variant="text"
                      prepend-icon="mdi-plus"
                        @click="addInstructionStep"
                      class="mt-2"
                      >
                        Добавить шаг
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Инструменты -->
                <v-col cols="12">
                <v-card outlined class="pa-4">
                    <v-card-title>Инструменты</v-card-title>
                    <v-card-text>
                      <v-autocomplete
                      v-model="editedItem.tools"
                        :items="availableTools"
                      item-title="name"
                        item-value="id"
                        label="Добавить инструмент"
                      density="comfortable"
                      multiple
                      chips
                        @change="addTool"
                    />
                    <v-chip-group>
                        <v-chip
                          v-for="toolId in editedItem.tools"
                          :key="toolId"
                        closable
                          @click:close="removeTool(toolId)"
                        >
                          {{ availableTools.find(t => t.id === toolId)?.name || toolId }}
                        </v-chip>
                      </v-chip-group>
                    </v-card-text>
                  </v-card>
                </v-col>

                <!-- Ингредиенты -->
                <v-col cols="12">
                <v-card outlined class="pa-4">
                    <v-card-title>Ингредиенты</v-card-title>
                    <v-card-text>
                    <div v-for="(ingredient, index) in editedItem.ingredients" :key="index" class="d-flex align-center mb-2">
                          <v-autocomplete
                            v-model="ingredient.ingredient"
                            :items="availableIngredients"
                        item-title="name"
                            item-value="id"
                            label="Ингредиент"
                        density="comfortable"
                        class="mr-2"
                      />
                          <v-select
                            v-model="ingredient.type"
                            :items="measureTypes"
                            label="Мера"
                        density="comfortable"
                        class="mr-2"
                      />
                          <v-text-field
                            v-model="ingredient.quantity"
                            label="Количество"
                        density="comfortable"
                        class="mr-2"
                      />
                          <v-btn
                        icon="mdi-delete"
                        color="error"
                        size="small"
                        variant="text"
                            @click="removeIngredient(index)"
                      />
                    </div>
                      <v-btn
                        color="primary"
                      variant="text"
                      prepend-icon="mdi-plus"
                        @click="addIngredient"
                      class="mt-2"
                      >
                        Добавить ингредиент
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
          </v-form>
          </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer />
            <v-btn
            color="grey"
            variant="text"
              @click="close"
            >
              Отмена
            </v-btn>
            <v-btn
              color="primary"
              @click="save"
            class="ml-2"
            >
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  </div>
</template>

<script>
import axios from '@/plugins/axios'

export default {
  name: 'RecipesView',

  data: () => ({
    activeTab: 0,
    search: '',
    dialog: false,
    headers: [
      { title: 'ID', key: 'id', sortable: true, width: '30px' },
      { title: 'Фото', key: 'image', sortable: false, width: '30px' },
      { title: 'Язык', key: 'language', sortable: true, width: '30px' },
      { title: 'Название', key: 'title', sortable: true, width: '120px' },
      { title: 'Описание', key: 'description', sortable: false, show: [0], width: '120px' },
      { title: 'Доступен', key: 'isEnabled', sortable: false, width: '30px' },
      { title: 'Алкогольный', key: 'is_alcoholic', sortable: true, width: '30px' },
      { title: 'Создатель', key: 'user', sortable: false, width: '30px' },
      { title: 'Избранное', key: 'favorites_count', sortable: true, width: '30px', show: [1, 2] },
      { title: 'Видео URL', key: 'video_url', sortable: true, show: [1, 2], width: '70px' },
      { title: 'Действия', key: 'actions', sortable: false, width: '85px' }
    ],
    pendingRecipes: [],
    approvedRecipes: [],
    rejectedRecipes: [],
    editedIndex: -1,
    editedItem: {
      id: null,
      title: '',
      description: '',
      instruction: [],
      isEnabled: true,
      user: 0,
      ingredients: [],
      tools: [],
      is_alcoholic: false,
      language: 'RUS',
      moderation_status: 'Approved',
      video_url: ''
    },
    defaultItem: {
      id: null,
      title: '',
      description: '',
      instruction: [],
      isEnabled: true,
      user: 0,
      ingredients: [],
      tools: [],
      is_alcoholic: false,
      language: 'RUS',
      moderation_status: 'Approved',
      video_url: ''
    },
    selectedTool: null,
    availableTools: [],
    availableIngredients: [],
    measureTypes: [
      'ounce',
      'ml',
      'gram',
      'piece',
      'spoon',
      'cup',
      'tablespoon',
      'teaspoon',
      'slice',
      'twist',
      'cube',
      'sprig',
      'pinch',
      'spiral',
      'wedge',
      'dash',
      'block',
      'circle',
      'bottle'
    ],
    sortBy: ['title'],
    sortDesc: [false],
    loading: false,
    page: 1,
    totalItems: 0,
    nextUrl: null,
    currentPage: 1,
    pageSize: 10
  }),

  computed: {
    currentRecipes() {
      switch (Number(this.activeTab)) {
        case 0:
          return this.pendingRecipes
        case 1:
          return this.approvedRecipes
        case 2:
          return this.rejectedRecipes
        default:
          return []
      }
    },
    tableTitle() {
      switch (Number(this.activeTab)) {
        case 0:
          return 'Рецепты на модерации'
        case 1:
          return 'Одобренные рецепты'
        case 2:
          return 'Отклоненные рецепты'
        default:
          return 'Рецепты'
      }
    },
    formTitle() {
      return this.editedIndex === -1 ? 'Новый рецепт' : 'Редактирование рецепта'
    },
    filteredHeaders() {
      return this.headers.filter(header => 
        !header.show || header.show.includes(this.activeTab)
      );
    }
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    activeTab: {
      handler(newVal) {
        this.page = 1;
        this.search = '';
        this.initialize();
      }
    },
    search: {
      handler(newVal) {
        if (this.activeTab === 1) {
          this.debounceSearch(newVal);
        }
      }
    }
  },

  created() {
    this.initialize();
    this.loadToolsAndIngredients();
    this.debounceSearch = this.debounce(this.performSearch, 300);
  },

  methods: {
    debounce(fn, delay) {
      let timeout;
      return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    },

    async performSearch(query) {
      if (this.activeTab === 1) {
        try {
          this.loading = true;
          const response = await axios.get(`/admin/recipe/approved/?page=${this.currentPage}&search=${query || ''}`);
          console.log('Search API Response:', {
            count: response.data.count,
            next: response.data.next,
            previous: response.data.previous,
            results: response.data.results
          });
          this.approvedRecipes = this.processRecipes(response.data);
          this.totalItems = response.data.count || 0;
        } catch (error) {
          console.error('Error searching recipes:', error);
        } finally {
          this.loading = false;
        }
      }
    },

    async initialize() {
      try {
        this.loading = true;
        let response;
        switch (this.activeTab) {
          case 0: // На модерации
            response = await axios.get('/admin/recipe/pending/');
            console.log('Pending Recipes Response:', response.data);
            this.pendingRecipes = this.processRecipes(response.data);
            break;
          case 1: // Одобрены
            response = await axios.get(`/admin/recipe/approved/?page=${this.currentPage}&search=${this.search || ''}`);
            console.log('Approved Recipes Response:', {
              count: response.data.count,
              next: response.data.next,
              previous: response.data.previous,
              results: response.data.results
            });
            this.approvedRecipes = this.processRecipes(response.data);
            this.totalItems = response.data.count || 0;
            break;
          case 2: // Отклонены
            response = await axios.get('/admin/recipe/rejected/');
            console.log('Rejected Recipes Response:', response.data);
            this.rejectedRecipes = this.processRecipes(response.data);
            break;
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
        this.pendingRecipes = [];
        this.approvedRecipes = [];
        this.rejectedRecipes = [];
      } finally {
        this.loading = false;
      }
    },

    processRecipes(data) {
      const recipes = Array.isArray(data) ? data : Array.isArray(data.results) ? data.results : []
      return recipes.map(recipe => ({
        ...recipe,
        // Преобразуем объект инструкций в массив
        instruction: recipe.instruction ? 
          Object.entries(recipe.instruction)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([, value]) => value) : 
          []
      }))
    },

    async loadToolsAndIngredients() {
      try {
        const [tools, ingredients] = await Promise.all([
          axios.get('/admin/tool/'),
          axios.get('/admin/ingredient/')
        ])
        
        console.log('Tools Response:', tools.data);
        console.log('Ingredients Response:', ingredients.data);
        
        // Убедимся, что данные являются массивами
        this.availableTools = Array.isArray(tools.data) ? tools.data :
                            Array.isArray(tools.data.results) ? tools.data.results : []
        this.availableIngredients = Array.isArray(ingredients.data) ? ingredients.data :
                                   Array.isArray(ingredients.data.results) ? ingredients.data.results : []
      } catch (error) {
        console.error('Error fetching tools and ingredients:', error)
        this.availableTools = []
        this.availableIngredients = []
      }
    },

    editRecipe(item) {
      this.editedIndex = this.getRecipeIndex(item)
      this.editedItem = Object.assign({}, item)
      this.loadToolsAndIngredients()
      this.dialog = true
    },

    getRecipeIndex(item) {
      switch (item.status) {
        case 'Pending':
          return this.pendingRecipes.indexOf(item)
        case 'Approved':
          return this.approvedRecipes.indexOf(item)
        case 'Rejected':
          return this.rejectedRecipes.indexOf(item)
        default:
          return -1
      }
    },

    createRecipe() {
      this.editedIndex = -1;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedItem.moderation_status = 'Approved';
      this.loadToolsAndIngredients();
      this.dialog = true;
    },

    async deleteRecipe(item) {
      if (confirm('Вы уверены, что хотите удалить этот рецепт?')) {
        try {
          await axios.delete(`/admin/recipe/approved/${item.id}/`);
          this.initialize();
        } catch (error) {
          console.error('Error deleting recipe:', error);
        }
      }
    },

    async approveRecipe(item) {
      try {
        let endpoint;
        const updatedRecipe = {
          ...item,
          moderation_status: 'Approved',
          tools: item.tools.map(tool => (typeof tool === 'object' ? tool.id : tool)),
          photo: null
        };
        
        switch (this.activeTab) {
          case 0: // На модерации
            endpoint = `/admin/recipe/pending/${item.id}/`;
            await axios.put(endpoint, updatedRecipe);
            break;
          case 2: // Отклонены
            endpoint = `/admin/recipe/rejected/${item.id}/`;
            await axios.put(endpoint, updatedRecipe);
            break;
        }
        
        this.initialize();
      } catch (error) {
        console.error('Error approving recipe:', error);
      }
    },

    async rejectRecipe(item) {
      try {
        let endpoint;
        const updatedRecipe = {
          ...item,
          moderation_status: 'Rejected',
          tools: item.tools.map(tool => (typeof tool === 'object' ? tool.id : tool)),
          photo: null
        };
        switch (this.activeTab) {
          case 0: // На модерации
            endpoint = `/admin/recipe/pending/${item.id}/`;
            await axios.put(endpoint, updatedRecipe);
            break;
          case 1: // Одобрены
            endpoint = `/admin/recipe/approved/${item.id}/`;
            await axios.put(endpoint, updatedRecipe);
            break;
        }
        
        this.initialize();
      } catch (error) {
        console.error('Error rejecting recipe:', error);
      }
    },

    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save() {
      try {
        const instructionObj = {};
        this.editedItem.instruction.forEach((step, index) => {
          if (step.trim()) {
            instructionObj[index + 1] = step;
          }
        });

        const processedIngredients = this.editedItem.ingredients
          .filter(ing => ing.ingredient && ing.quantity && ing.type)
          .map(ing => ({
            ingredient: typeof ing.ingredient === 'object' ? ing.ingredient.id : ing.ingredient,
            name: typeof ing.ingredient === 'object' ? ing.ingredient.name : 
                  this.availableIngredients.find(i => i.id === ing.ingredient)?.name || '',
            quantity: ing.quantity,
            type: ing.type
          }));

        const processedTools = this.editedItem.tools.map(toolId => {
          if (typeof toolId === 'object') {
            return toolId.id;
          }
          return toolId;
        });

        const userId = localStorage.getItem('userId');
        const recipeData = {
          title: this.editedItem.title,
          description: this.editedItem.description || null,
          user: parseInt(userId) || 0,
          instruction: instructionObj,
          isEnabled: this.editedItem.isEnabled,
          ingredients: processedIngredients,
          tools: processedTools,
          is_alcoholic: this.editedItem.is_alcoholic,
          language: typeof this.editedItem.language === 'object' ? this.editedItem.language.value : this.editedItem.language,
          moderation_status: this.editedItem.moderation_status,
          video_url: this.editedItem.video_url || null
        };

        if (!this.editedItem.id) {
          // Создание нового рецепта (только на вкладке "Одобрены")
          recipeData.moderation_status = 'Approved';
          await axios.post('/admin/recipe/approved/', recipeData);
        } else {
          // Редактирование существующего рецепта
          let endpoint;
          switch (this.activeTab) {
            case 0:
              endpoint = `/admin/recipe/pending/${this.editedItem.id}/`;
              break;
            case 1:
              endpoint = `/admin/recipe/approved/${this.editedItem.id}/`;
              break;
            case 2:
              endpoint = `/admin/recipe/rejected/${this.editedItem.id}/`;
              break;
            default:
              throw new Error('Неизвестный статус рецепта');
          }
          await axios.put(endpoint, recipeData);
        }
        
        this.close();
        this.initialize();
      } catch (error) {
        console.error('Error saving recipe:', error);
        console.error('Error details:', error.response ? error.response.data : 'No response data');
      }
    },

    addInstructionStep() {
      this.editedItem.instruction.push('')
    },

    removeInstructionStep(index) {
      this.editedItem.instruction.splice(index, 1)
    },

    addTool() {
      if (this.selectedTool) {
        if (!this.editedItem.tools.includes(this.selectedTool.id)) {
          this.editedItem.tools.push(this.selectedTool.id)
        }
        this.selectedTool = null
      }
    },

    removeTool(tool) {
      const index = this.editedItem.tools.indexOf(tool)
      if (index !== -1) {
        this.editedItem.tools.splice(index, 1)
      }
    },

    addIngredient() {
      this.editedItem.ingredients.push({
        ingredient: null,
        quantity: '',
        type: 'ounce'
      })
    },

    removeIngredient(index) {
      this.editedItem.ingredients.splice(index, 1)
    },

    handlePageChange(page) {
      this.currentPage = page;
      this.initialize();
    }
  }
}
</script>

<style scoped>
.recipes-container {
  height: calc(100vh - 64px);
  padding: 16px;
  margin-left: -160px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.recipes-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.recipes-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.recipes-title {
  font-size: 20px;
  margin: 0;
}

.search-block {
  display: flex;
  align-items: center;
  gap: 16px;
}

.search-field {
  width: 300px;
}

.table-container {
  flex: 1;
  overflow: auto;
  margin: 0 16px;
}

.recipes-table {
  width: 100%;
  table-layout: fixed;
  font-size: 13px;
}

.recipes-table .v-data-table-header th {
  white-space: nowrap;
  font-weight: 600 !important;
  background-color: #f5f5f5;
  padding: 0 8px !important;
}

.recipes-table .v-data-table__wrapper {
  overflow-x: auto;
  margin: 0;
  padding: 0;
}

.recipes-table .v-data-table__wrapper table {
  min-width: 100%;
  border-collapse: collapse;
}

.recipes-table .v-data-table__wrapper td {
  height: 40px !important;
  padding: 0 8px !important;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tools-list,
.ingredients-list {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination-container {
  padding: 16px;
  display: flex;
  justify-content: center;
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>