<template>
  <div class="page-wrapper">
    <div class="category-notes-page">
      <header class="page-header">
        <router-link to="/categories" class="back-btn">
          <font-awesome-icon :icon="['fas', 'chevron-left']" />
        </router-link>
        <h2>{{ isAllCategory ? '全部便签' : `${categoryName || '加载中...'}便签` }}</h2>
      </header>

      <main class="notes-list-container">
        <div v-if="notes.length === 0" class="no-notes-message">
          <p>此分类下还没有任何便签。</p>
        </div>
        <div 
          v-for="note in notes" 
          :key="note.id" 
          class="note-item"
          :style="{ borderLeftColor: note.category_theme_color }"
        >
          <div class="note-header">
            <h3 class="note-title">{{ note.title }}</h3>
            <div class="note-actions">
              <span class="action-btn" @click.stop="editNote(note)">
                <font-awesome-icon 
                  :icon="['fas', 'pen-to-square']" 
                  class="action-icon edit-icon" 
                />
              </span>
              <span class="action-btn" @click.stop="deleteNote(note.id)">
                <font-awesome-icon 
                  :icon="['fas', 'trash-can']" 
                  class="action-icon delete-icon" 
                />
              </span>
            </div>
          </div>
          <p class="note-content">{{ note.content }}</p>
          <span 
            v-if="isAllCategory" 
            class="category-tag"
            :style="{ backgroundColor: note.category_theme_color }"
          >
            {{ note.category_name }}
          </span>
        </div>
      </main>
      
      <button
        class="add-note-btn"
        :style="{ backgroundColor: categoryThemeColor }"
        @click="showAddNoteForm = true"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
      </button>
      
      <div v-if="showAddNoteForm" class="modal-overlay" @click.self="showAddNoteForm = false">
        <div class="add-note-modal">
          <h3>添加新便签</h3>
          <form @submit.prevent="addNote">
            <select v-if="isAllCategory" v-model="selectedCategoryId" class="note-input">
              <option disabled value="">请选择一个分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
            <input 
              type="text" 
              v-model="newNoteTitle" 
              placeholder="便签标题" 
              required 
              class="note-input"
            />
            <textarea 
              v-model="newNoteContent" 
              placeholder="便签内容" 
              required 
              rows="5"
              class="note-textarea"
            ></textarea>
            <button type="submit" class="submit-note-btn" :style="{ backgroundColor: categoryThemeColor }">
              创建
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '@/api';
import Swal from 'sweetalert2';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faChevronLeft, faPlus, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

library.add(faChevronLeft, faPlus, faPenToSquare, faTrashCan);

const route = useRoute();
const notes = ref([]);
const categoryName = ref('');
const categoryThemeColor = ref('#007bff');
const showAddNoteForm = ref(false);
const newNoteTitle = ref('');
const newNoteContent = ref('');

// 用于存储所有分类的列表
const categories = ref([]);
// 用于存储用户在“全部”页面选择的分类ID
const selectedCategoryId = ref(null);


// 判断当前是否为“全部”分类
const isAllCategory = computed(() => route.params.categoryId === '1');


// 获取所有分类的函数，用于填充“全部”页面的下拉菜单
const fetchCategories = async () => {
    try {
        const response = await api.get('/categories');
        // 过滤掉“全部便签”分类本身
        categories.value = response.data.filter(cat => cat.id !== 1);
        if (isAllCategory.value && categories.value.length > 0 && !selectedCategoryId.value) {
            // 在“全部”页面，默认选中第一个分类
            selectedCategoryId.value = categories.value[0].id;
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

const fetchCategoryDetails = async (categoryId) => {
    try {
        const response = await api.get('/categories');
        const foundCategory = response.data.find(cat => cat.id == categoryId);
        if (foundCategory) {
            categoryName.value = foundCategory.name;
            categoryThemeColor.value = foundCategory.theme_color;
        } else {
            categoryName.value = '未知';
            categoryThemeColor.value = '#6c757d';
        }
    } catch (error) {
        console.error('Error fetching category details:', error);
        categoryName.value = '错误';
        categoryThemeColor.value = '#dc3545';
    }
};

const fetchNotes = async (categoryId) => {
    try {
        const response = await api.get('/notes', {
            params: { categoryId: categoryId },
        });
        notes.value = response.data;
    } catch (error) {
        console.error('Error fetching notes:', error);
    }
};

onMounted(() => {
    fetchCategories();
});

// 关键修改：添加便签逻辑，根据是否为“全部”页面来决定分类ID的来源
const addNote = async () => {
    if (!newNoteTitle.value.trim() || !newNoteContent.value.trim()) {
        Swal.fire('标题和内容不能为空', '', 'warning');
        return;
    }
    
    // 根据当前页面类型来确定 categoryId
    const noteCategoryId = isAllCategory.value ? selectedCategoryId.value : route.params.categoryId;
    
    if (!noteCategoryId) {
      Swal.fire('请选择一个分类', '', 'warning');
      return;
    }

    try {
        const noteData = {
            title: newNoteTitle.value,
            content: newNoteContent.value,
            categoryId: noteCategoryId, 
        };
        await api.post('/notes', noteData);
        Swal.fire({
            icon: 'success',
            title: '便签创建成功',
            showConfirmButton: false,
            timer: 1500
        });
        
        newNoteTitle.value = '';
        newNoteContent.value = '';
        showAddNoteForm.value = false;

        // 如果在“全部”页面，重置选中分类为第一个
        if (isAllCategory.value && categories.value.length > 0) {
            selectedCategoryId.value = categories.value[0].id;
        }

        fetchNotes(route.params.categoryId);
    } catch (error) {
        console.error('Error creating note:', error);
        Swal.fire('创建便签失败', '请重试或检查后端服务。', 'error');
    }
};

const editNote = async (note) => {
    const { value: formValues } = await Swal.fire({
        title: `修改便签`,
        html: `
            <input id="swal-note-title" class="swal2-input" value="${note.title}" placeholder="便签标题">
            <textarea id="swal-note-content" class="swal2-textarea" rows="5" placeholder="便签内容">${note.content}</textarea>
        `,
        showCancelButton: true,
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        preConfirm: () => {
            const title = document.getElementById('swal-note-title').value;
            const content = document.getElementById('swal-note-content').value;
            if (!title.trim() || !content.trim()) {
                Swal.showValidationMessage('标题和内容不能为空');
            }
            return { title, content };
        }
    });

    if (formValues) {
        try {
            const updatedNote = {
                title: formValues.title,
                content: formValues.content,
                categoryId: note.category_id
            };
            await api.put(`/notes/${note.id}`, updatedNote);
            Swal.fire({
                icon: 'success',
                title: '便签修改成功',
                showConfirmButton: false,
                timer: 1500
            });
            fetchNotes(route.params.categoryId);
        } catch (error) {
            console.error('Error updating note:', error);
            Swal.fire('修改失败', '请重试或检查后端服务。', 'error');
        }
    }
};

const deleteNote = async (noteId) => {
    const result = await Swal.fire({
        title: '确定删除此便签吗?',
        text: "删除后将无法恢复!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '是的，删除它!'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/notes/${noteId}`);
            Swal.fire(
                '已删除!',
                '您的便签已成功删除。',
                'success'
            );
            fetchNotes(route.params.categoryId);
        } catch (error) {
            console.error('Error deleting note:', error);
            Swal.fire('删除失败', '请重试或检查后端服务。', 'error');
        }
    }
};

watch(() => route.params.categoryId, (newCategoryId) => {
    if (newCategoryId) {
        fetchCategoryDetails(newCategoryId);
        fetchNotes(newCategoryId);

        // 关键修改：根据路由变化重置或设置选中分类ID
        if (!isAllCategory.value) {
            // 如果是特定分类，则选中ID就是当前分类ID
            selectedCategoryId.value = newCategoryId;
        } else if (categories.value.length > 0) {
            // 如果是“全部”页面，确保选中ID是有效的
            selectedCategoryId.value = categories.value[0].id;
        }
    }
}, { immediate: true });
</script>

<style scoped>
/* 样式保持不变 */
/* 移动端优先的响应式布局 */
.page-wrapper {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: white;
  padding: 10px; /* 移动端较小的填充 */
  box-sizing: border-box;
}

.category-notes-page {
  width: 100%; /* 移动端全宽 */
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px; /* 移动端填充 */
  position: relative;
  box-sizing: border-box;
}

/* 媒体查询：当屏幕宽度超过 768px 时，切换为桌面端样式 */
@media (min-width: 768px) {
  .page-wrapper {
    align-items: center;
    padding: 20px;
  }
  .category-notes-page {
    width: 600px;
    max-width: 90%;
    padding: 30px;
  }
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  position: relative;
}

.page-header h2 {
  font-size: 20px; /* 移动端字体更小 */
  font-weight: bold;
  margin: 0 auto;
  word-break: break-all;
}

@media (min-width: 768px) {
  .page-header h2 {
    font-size: 24px;
  }
}

.back-btn {
  position: absolute;
  left: 0;
  font-size: 20px;
  color: #888;
  text-decoration: none;
}

.notes-list-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.note-item {
  background-color: #f8f9fa;
  padding: 15px; /* 移动端填充更小 */
  padding-bottom: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  border-left: 5px solid transparent;
  position: relative;
  box-sizing: border-box;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.note-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  flex-grow: 1;
  word-break: break-all;
  text-align: left;
}

.note-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 10px;
}

.action-btn {
  display: inline-flex;
  padding: 8px; /* 增加触摸区域 */
  border-radius: 50%;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.action-icon {
  font-size: 16px;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
}

.edit-icon:hover {
  color: #007bff;
}

.delete-icon:hover {
  color: #dc3545;
}

.category-tag {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 12px;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: bold;
  opacity: 0.8;
}

.note-content {
  font-size: 14px;
  color: #555;
  margin: 0;
  text-align: left;
}

.no-notes-message {
  text-align: center;
  color: #888;
  margin-top: 50px;
}

.add-note-btn {
  position: fixed;
  bottom: 20px; /* 移动端位置调整 */
  right: 20px;
  width: 50px; /* 移动端尺寸调整 */
  height: 50px;
  border-radius: 50%;
  border: none;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.2s;
  z-index: 999;
}

.add-note-btn:hover {
  transform: scale(1.1);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.add-note-modal {
  background-color: white;
  padding: 20px;
  border-radius: 16px;
  width: 90%; /* 移动端自适应 */
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
}

@media (min-width: 768px) {
  .add-note-modal {
    width: 450px;
  }
}

.add-note-modal h3 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 22px;
  text-align: center;
}

.note-input, .note-textarea {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.note-textarea {
  resize: vertical;
}

.submit-note-btn {
  width: 100%;
  padding: 12px;
  border: none;
  color: white;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-note-btn:hover {
  filter: brightness(90%);
}
</style>