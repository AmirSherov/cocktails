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
        <el-table
          :data="currentRecipes"
          style="width: 100%"
          v-loading="loading"
          row-key="id"
          :default-sort="{ prop: 'id', order: 'ascending' }"
          @sort-change="handleSortChange"
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
            width="80"
          >
            <template #default="{ row }">
              <v-avatar size="32" style="cursor: pointer" @click="showImage(row.photo)">
                <v-img :src="row.photo" contain class="grey lighten-2" />
              </v-avatar>
            </template>
          </el-table-column>
          <el-table-column
            prop="language"
            label="Язык"
            sortable
            width="100"
          />
          <el-table-column
            prop="title"
            label="Название"
            sortable
          />
          <el-table-column
            v-if="activeTab === 0"
            prop="description"
            label="Описание"
            sortable
            show-overflow-tooltip
          />
          <el-table-column
            prop="isEnabled"
            label="Доступен"
            width="120"
          >
            <template #default="{ row }">
              <v-chip
                :color="row.isEnabled ? 'success' : 'error'"
                size="x-small"
                class="text-caption"
              >
                {{ row.isEnabled ? 'Активный' : 'Неактивный' }}
              </v-chip>
            </template>
          </el-table-column>
          <el-table-column
            prop="is_alcoholic"
            label="Алкогольный"
            sortable
            width="120"
          >
            <template #default="{ row }">
              <v-chip
                :color="row.is_alcoholic ? 'warning' : 'info'"
                size="x-small"
                class="text-caption"
              >
                {{ row.is_alcoholic ? 'Алкогольный' : 'Безалкогольный' }}
              </v-chip>
            </template>
          </el-table-column>
          <el-table-column
            prop="user"
            label="Создатель"
            width="100"
          >
            <template #default="{ row }">
              <v-btn
                text
                color="primary"
                variant="text"
                :to="{ name: 'users', query: { search: row.user }}"
                class="pa-0"
              >
                {{ row.user }}
              </v-btn>
            </template>
          </el-table-column>
          <el-table-column
            v-if="activeTab !== 0"
            prop="favorites_count"
            label="Избранное"
            sortable
            width="100"
          />
          <el-table-column
            v-if="activeTab !== 0"
            prop="video_url"
            label="Видео URL"
            sortable
            show-overflow-tooltip
          />
          <el-table-column
            prop="tools"
            label="Инструменты"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div class="tools-list">
                {{ row.tools.map(tool => {
                  if (typeof tool === 'object' && tool.name) {
                    return tool.name;
                  } else {
                    const foundTool = availableTools.find(t => t.id === tool);
                    return foundTool ? foundTool.name : tool;
                  }
                }).join(', ') }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="ingredients"
            label="Ингредиенты"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div class="ingredients-list">
                {{ row.ingredients.map(ing => {
                  const ingredientName = ing.name || 
                    (ing.ingredient && typeof ing.ingredient === 'object' ? 
                      ing.ingredient.name : 
                      availableIngredients.find(i => i.id === ing.ingredient)?.name || ing.ingredient);
                  return `${ingredientName} (${ing.quantity} ${ing.type})`;
                }).join(', ') }}
              </div>
            </template>
          </el-table-column>
          <el-table-column
            fixed="right"
            label="Действия"
            width="150"
          >
            <template #default="{ row }">
              <div class="d-flex">
                <template v-if="activeTab === 0">
                  <v-btn
                    icon="mdi-check"
                    color="success"
                    size="x-small"
                    variant="text"
                    class="mr-1"
                    @click="approveRecipe(row)"
                  />
                  <v-btn
                    icon="mdi-close"
                    color="error"
                    size="x-small"
                    variant="text"
                    class="mr-1"
                    @click="rejectRecipe(row)"
                  />
                  <v-btn
                    icon="mdi-pencil"
                    color="primary"
                    size="x-small"
                    variant="text"
                    @click="editRecipe(row)"
                  />
                </template>

                <template v-if="activeTab === 1">
                  <v-btn
                    icon="mdi-close"
                    color="error"
                    size="x-small"
                    variant="text"
                    class="mr-1"
                    @click="rejectRecipe(row)"
                  />
                  <v-btn
                    icon="mdi-pencil"
                    color="primary"
                    size="x-small"
                    variant="text"
                    class="mr-1"
                    @click="editRecipe(row)"
                  />
                  <v-btn
                    icon="mdi-delete"
                    color="error"
                    size="x-small"
                    variant="text"
                    @click="deleteRecipe(row)"
                  />
                </template>

                <template v-if="activeTab === 2">
                  <v-btn
                    icon="mdi-check"
                    color="success"
                    size="x-small"
                    variant="text"
                    class="mr-1"
                    @click="approveRecipe(row)"
                  />
                  <v-btn
                    icon="mdi-pencil"
                    color="primary"
                    size="x-small"
                    variant="text"
                    @click="editRecipe(row)"
                  />
                </template>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="recipePagination.currentPage"
          :page-size="recipePagination.pageSize"
          :total="recipePagination.total"
          @current-change="handlePageChange"
          layout="total, prev, pager, next"
          :pager-count="7"
        />
      </div>
    </v-card>
    <v-dialog v-model="dialog" max-width="1200px" persistent>
      <v-card>
        <v-overlay v-model="isSaving" class="align-center justify-center">
          <v-progress-circular
            indeterminate
            size="64"
          ></v-progress-circular>
          <div class="text-center mt-2">Сохранение рецепта...</div>
        </v-overlay>
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
                <v-col cols="12" sm="6">
                  <div class="d-flex flex-column">
                    <label for="image-upload" class="mb-2">Изображение рецепта</label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      @change="handleImageUpload"
                      class="mb-2"
                    />
                    <img
                      v-if="imagePreview || (editedIndex !== -1 && editedItem.photo)"
                      :src="imagePreview || editedItem.photo"
                      alt="Preview"
                      style="max-width: 200px; max-height: 200px; cursor: pointer;"
                      @click="showImage(imagePreview || editedItem.photo)"
                    />
                  </div>
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
                            :loading="loadingTools"
                            :search-input.sync="toolSearch"
                            @update:search-input="handleToolSearch"
                            :menu-props="{
                              maxHeight: '400px',
                              maxWidth: '400px'
                            }"
                          />
                          <v-pagination
                            v-if="toolPagination.total > 1"
                            v-model="toolPagination.currentPage"
                            :length="toolPagination.total"
                            :total-visible="3"
                            density="compact"
                            class="mt-2 ml-6"
                            @update:model-value="handleToolPageChange"
                          />
                          <v-chip-group>
                            <v-chip
                              v-for="toolId in editedItem.tools"
                              :key="toolId"
                              closable
                              @click:close="removeTool(toolId)"
                            >
                              {{ typeof toolId === 'object' ? toolId.name : (availableTools.find(t => t.id === toolId)?.name || toolId) }}
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
                                :loading="loadingIngredients"
                                v-model:search="ingredientSearch"
                                @update:search="handleIngredientSearch"
                                :menu-props="{
                                  maxHeight: '400px',
                                  maxWidth: '400px'
                                }"
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
                                <v-pagination
                                  v-if="ingredientPagination.total > 1"
                                  v-model="ingredientPagination.currentPage"
                                  :length="ingredientPagination.total"
                                  :total-visible="3"
                                  density="compact"
                                  class="mt-2 ml-6"
                                  @update:model-value="handleIngredientPageChange"
                                />
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

    <!-- Диалог для просмотра изображения -->
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
import axios from '@/plugins/axios'

export default {
  name: 'RecipesView',

  data: () => ({
    activeTab: 0,
    search: '',
    dialog: false,
    isSaving: false,
    recipePagination: {
      currentPage: 1,
      pageSize: 15,
      total: 0,
      sortBy: 'id',
      sortOrder: 'ascending'
    },
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
    loading: false,
    imageFile: null,
    imagePreview: null,
    imageDialog: false,
    selectedImage: null,
    toolSearch: '',
    loadingTools: false,
    toolPagination: {
      currentPage: 1,
      pageSize: 15,
      total: 0
    },
    toolSearchTimeout: null,
    ingredientSearch: '',
    loadingIngredients: false,
    ingredientPagination: {
      currentPage: 1,
      pageSize: 15,
      total: 0
    },
    ingredientSearchTimeout: null
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
        this.recipePagination.currentPage = 1;
        this.search = '';
        this.initialize();
      }
    },
    search: {
      handler(newVal) {
        this.debounceSearch(newVal);
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
      try {
        this.loading = true;
        let response;
        
        switch (this.activeTab) {
          case 0:
            response = await axios.get(`/admin/recipe/pending/?search=${query || ''}`);
            this.pendingRecipes = this.processRecipes(response.data);
            break;
          case 1:
            response = await axios.get(`/admin/recipe/approved/?page=${this.recipePagination.currentPage}&search=${query || ''}`);
            this.approvedRecipes = this.processRecipes(response.data);
            this.recipePagination.total = response.data.count || 0;
            break;
          case 2:
            response = await axios.get(`/admin/recipe/rejected/?search=${query || ''}`);
            this.rejectedRecipes = this.processRecipes(response.data);
            break;
        }
      } catch (error) {
        console.error('Error searching recipes:', error);
      } finally {
        this.loading = false;
      }
    },

    async initialize() {
      try {
        this.loading = true;
        const params = new URLSearchParams({
          page: this.recipePagination.currentPage.toString()
        });

        if (this.search) {
          params.append('search', this.search);
        }

        if (this.recipePagination.sortBy) {
          const orderingPrefix = this.recipePagination.sortOrder === 'descending' ? '-' : '';
          params.append('ordering', orderingPrefix + this.recipePagination.sortBy);
        }

        let endpoint = '';
        switch (this.activeTab) {
          case 0:
            endpoint = '/admin/recipe/pending/';
            break;
          case 1:
            endpoint = '/admin/recipe/approved/';
            break;
          case 2:
            endpoint = '/admin/recipe/rejected/';
            break;
        }

        const response = await axios.get(`${endpoint}?${params.toString()}`);
        
        switch (this.activeTab) {
          case 0:
            this.pendingRecipes = this.processRecipes(response.data);
            break;
          case 1:
            this.approvedRecipes = this.processRecipes(response.data);
            this.recipePagination.total = response.data.count || 0;
            break;
          case 2:
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
        photo: recipe.photo || null,
        instruction: recipe.instruction ? 
          Object.entries(recipe.instruction)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([, value]) => value) : 
          []
      }))
    },

    async loadToolsAndIngredients() {
      try {
        await Promise.all([
          this.fetchTools(),
          this.fetchIngredients()
        ])
      } catch (error) {
        console.error('Error fetching tools and ingredients:', error)
        this.availableTools = []
        this.availableIngredients = []
      }
    },

    async fetchTools() {
      try {
        this.loadingTools = true
        const params = new URLSearchParams({
          page: this.toolPagination.currentPage
        })

        if (this.toolSearch) {
          params.append('search', this.toolSearch)
        }

        const response = await axios.get(`/admin/tool/?${params.toString()}`)
        
        this.availableTools = Array.isArray(response.data.results) ? response.data.results : []
        this.toolPagination.total = Math.ceil((response.data.count || 0) / this.toolPagination.pageSize)
      } catch (error) {
        console.error('Error fetching tools:', error)
        this.availableTools = []
      } finally {
        this.loadingTools = false
      }
    },

    handleToolSearch(value) {
      if (this.toolSearchTimeout) {
        clearTimeout(this.toolSearchTimeout)
      }
      
      this.toolSearchTimeout = setTimeout(async () => {
        this.toolPagination.currentPage = 1
        await this.fetchTools()
      }, 300)
    },

    async handleToolPageChange(page) {
      this.toolPagination.currentPage = page
      await this.fetchTools()
    },

    async fetchIngredients() {
      try {
        this.loadingIngredients = true
        const params = new URLSearchParams({
          page: this.ingredientPagination.currentPage
        })

        if (this.ingredientSearch) {
          params.append('search', this.ingredientSearch)
        }

        const response = await axios.get(`/admin/ingredient/?${params.toString()}`)
        
        this.availableIngredients = Array.isArray(response.data.results) ? response.data.results : []
        this.ingredientPagination.total = Math.ceil((response.data.count || 0) / this.ingredientPagination.pageSize)
      } catch (error) {
        console.error('Error fetching ingredients:', error)
        this.availableIngredients = []
      } finally {
        this.loadingIngredients = false
      }
    },

    handleIngredientSearch(value) {
      if (this.ingredientSearchTimeout) {
        clearTimeout(this.ingredientSearchTimeout)
      }
      
      this.ingredientSearchTimeout = setTimeout(async () => {
        this.ingredientPagination.currentPage = 1
        await this.fetchIngredients()
      }, 300)
    },

    async handleIngredientPageChange(page) {
      this.ingredientPagination.currentPage = page
      await this.fetchIngredients()
    },

    editRecipe(item) {
      this.editedIndex = this.getRecipeIndex(item)
      this.editedItem = Object.assign({}, item)
      this.imagePreview = this.editedItem.photo;
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
        
        switch (this.activeTab) {
          case 0:
            endpoint = `/admin/recipe/pending/${item.id}/`;
            break;
          case 2:
            endpoint = `/admin/recipe/rejected/${item.id}/`;
            break;
        }

        await axios.patch(endpoint, {
          moderation_status: 'Approved'
        });
        
        this.initialize();
      } catch (error) {
        console.error('Error approving recipe:', error);
      }
    },

    async rejectRecipe(item) {
      try {
        let endpoint;
        
        switch (this.activeTab) {
          case 0:
            endpoint = `/admin/recipe/pending/${item.id}/`;
            break;
          case 1:
            endpoint = `/admin/recipe/approved/${item.id}/`;
            break;
        }

        await axios.patch(endpoint, {
          moderation_status: 'Rejected'
        });
        
        this.initialize();
      } catch (error) {
        console.error('Error rejecting recipe:', error);
      }
    },

    close() {
      this.dialog = false
      this.imageFile = null;
      this.imagePreview = null;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem)
        this.editedIndex = -1
      })
    },

    async save() {
      try {
        this.isSaving = true;
        
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
          description: this.editedItem.description || '',
          user: userId ? parseInt(userId) : 0,
          isEnabled: this.editedItem.isEnabled,
          is_alcoholic: this.editedItem.is_alcoholic,
          language: typeof this.editedItem.language === 'object' ? this.editedItem.language.value : this.editedItem.language,
          moderation_status: this.editedItem.moderation_status,
          video_url: this.editedItem.video_url || '',
          instruction: instructionObj,
          tools: processedTools,
          ingredients: processedIngredients
        };

        let response;
        let recipeId;
        let endpoint;

        if (!this.editedItem.id) {
          endpoint = '/admin/recipe/approved/';
          response = await axios.post(endpoint, recipeData);
          recipeId = response.data.id;
          if (!recipeId) {
            throw new Error('Не удалось получить ID созданного рецепта');
          }
        } else {
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
          response = await axios.put(endpoint, recipeData);
          recipeId = this.editedItem.id;
        }

        if (this.imageFile && recipeId) {
          await new Promise(resolve => setTimeout(resolve, 2000));

          try {
            const imageFormData = new FormData();
            imageFormData.append('photo', this.imageFile, this.imageFile.name);

            let imageEndpoint;
            if (!this.editedItem.id) {
              imageEndpoint = `/admin/recipe/approved/${recipeId}/`;
            } else {
              switch (this.activeTab) {
                case 0:
                  imageEndpoint = `/admin/recipe/pending/${recipeId}/`;
                  break;
                case 1:
                  imageEndpoint = `/admin/recipe/approved/${recipeId}/`;
                  break;
                case 2:
                  imageEndpoint = `/admin/recipe/rejected/${recipeId}/`;
                  break;
              }
            }

            await axios.patch(imageEndpoint, imageFormData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          } catch (imageError) {
            console.error('Error uploading image:', imageError);
            throw new Error('Error uploading image');
          }
        }

        await this.initialize();
        this.close();
      } catch (error) {
        console.error('Error saving recipe:', error);
        if (error.response && error.response.data) {
          alert(`Error saving: ${JSON.stringify(error.response.data)}`);
        } else {
          alert(`Error saving: ${error.message}`);
        }
      } finally {
        this.isSaving = false;
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
      this.recipePagination.currentPage = page;
      this.initialize();
    },

    handleSortChange({ prop, order }) {
      if (!prop) return;
      this.recipePagination.sortBy = prop;
      this.recipePagination.sortOrder = order || 'ascending';
      this.recipePagination.currentPage = 1;
      this.initialize();
    },

    showImage(imageUrl) {
      if (imageUrl) {
        this.selectedImage = imageUrl;
        this.imageDialog = true;
      }
    },

    handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Пожалуйста, выберите файл изображения');
          return;
        }
        
        this.imageFile = file;
        
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview = e.target.result;
          this.showImage(e.target.result);
        };
        reader.readAsDataURL(file);
      }
    },
  }
}
</script>

<style scoped>
.recipes-container {
  height: calc(100vh - 64px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (min-width: 1350px) {
  .recipes-container {
    margin-left: -160px;
  }
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

@media (max-width: 600px) {
  .recipes-container {
    margin-left: 0;
    padding: 8px;
  }

  .recipes-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-block {
    width: 100%;
    margin-top: 8px;
  }

  .search-field {
    width: 100%;
  }

  .table-container {
    overflow-x: auto;
  }

  .recipes-table .v-data-table__wrapper table {
    min-width: 600px;
  }
}

.v-autocomplete :deep(.v-field__append-inner) {
  align-items: center;
  padding-top: 0;
}

.v-pagination {
  margin: 0;
  padding: 0;
}
</style>