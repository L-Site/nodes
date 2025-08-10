<template>
  <div class="categories-page">
    <div class="categories-card">
      <header class="categories-header">
        <h2>细化分类整理</h2>
        <p>分类更加明确，记录更加清晰</p>
        <div class="menu-container">
          <button class="menu-btn" @click.stop="isMenuVisible = !isMenuVisible">
            <font-awesome-icon :icon="['fas', 'ellipsis-v']" />
          </button>
          <div v-if="isMenuVisible" class="dropdown-menu" @click.stop>
            <button @click="logout">退出登录</button>
            <button @click="switchUser">更换用户</button>
          </div>
        </div>
      </header>

      <main class="categories-list">
        <div
          v-if="allCategory"
          class="category-item"
          :style="{ borderLeftColor: allCategory.themeColor }"
          @click="viewCategory(allCategory.id)"
        >
          <div class="category-info">
            <span class="category-icon-wrapper" :style="{ backgroundColor: allCategory.themeColor }">
              <font-awesome-icon :icon="allCategory.icon" class="category-icon" />
            </span>
            <span class="category-name">{{ allCategory.name }}</span>
            <span class="category-count">{{ allCategory.count }}</span>
          </div>
          <div class="category-actions">
            <span class="action-arrow">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </span>
          </div>
        </div>

        <div
          v-for="category in userCategories"
          :key="category.id"
          class="category-item"
          :style="{ borderLeftColor: category.themeColor }"
        >
          <div class="category-info" @click="viewCategory(category.id)">
            <span class="category-icon-wrapper" :style="{ backgroundColor: category.themeColor }">
              <font-awesome-icon :icon="category.icon" class="category-icon" />
            </span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">{{ category.count }}</span>
          </div>
          <div class="category-actions">
            <span class="action-btn" @click.stop="editCategory(category)">
              <font-awesome-icon
                :icon="['fas', 'pen-to-square']"
                class="action-icon edit-icon"
              />
            </span>
            <span class="action-btn" @click.stop="deleteCategory(category.id)">
              <font-awesome-icon
                :icon="['fas', 'trash-can']"
                class="action-icon delete-icon"
              />
            </span>
            <span class="action-arrow">
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </span>
          </div>
        </div>
      </main>

      <div class="add-category-section">
        <button class="add-category-btn" @click="showAddCategoryForm = !showAddCategoryForm">
          <font-awesome-icon :icon="['fas', 'plus']" /> 添加新分类
        </button>
        <form v-if="showAddCategoryForm" @submit.prevent="addCategory" class="add-category-form">
          <input type="text" v-model="newCategoryName" placeholder="输入新分类名称" required />
          <input type="color" v-model="newCategoryThemeColor" class="color-picker" />
          <button type="submit" class="submit-add-btn">创建</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import Swal from 'sweetalert2';
import { faEllipsisV, faPenToSquare, faTrashCan, faChevronRight, faStar, faPlus } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

library.add(faEllipsisV, faPenToSquare, faTrashCan, faChevronRight, faStar, faPlus);

const router = useRouter();
const isMenuVisible = ref(false);

const allCategory = ref(null);
const userCategories = ref([]);
const newCategoryName = ref('');
const newCategoryThemeColor = ref('#007bff');
const showAddCategoryForm = ref(false);

const fetchCategories = async () => {
    try {
        const response = await api.get('/categories');
        
        const allCategoryData = response.data.find(cat => cat.id === 1);
        const otherCategories = response.data.filter(cat => cat.id !== 1);

        if (allCategoryData) {
            allCategory.value = {
                id: allCategoryData.id,
                name: allCategoryData.name,
                count: allCategoryData.noteCount,
                icon: ['fas', allCategoryData.icon || 'star'],
                themeColor: allCategoryData.theme_color || '#ffc107',
            };
        }

        userCategories.value = otherCategories.map(cat => ({
            id: cat.id,
            name: cat.name,
            count: cat.noteCount,
            icon: ['fas', cat.icon || 'star'],
            themeColor: cat.theme_color || '#ffc107',
        }));

    } catch (error) {
        console.error('Error fetching categories:', error);
    }
};

const addCategory = async () => {
    if (!newCategoryName.value.trim()) {
        Swal.fire('请输入分类名称', '', 'warning');
        return;
    }

    try {
        const newCategory = {
            name: newCategoryName.value,
            icon: 'star',
            theme_color: newCategoryThemeColor.value,
        };
        await api.post('/categories', newCategory);
        Swal.fire({
            icon: 'success',
            title: '分类创建成功',
            showConfirmButton: false,
            timer: 1500
        });
        newCategoryName.value = '';
        showAddCategoryForm.value = false;
        fetchCategories();
    } catch (error) {
        console.error('Error creating category:', error);
        Swal.fire('创建分类失败', '请重试或检查后端服务。', 'error');
    }
};

const editCategory = async (category) => {
    const { value: formValues } = await Swal.fire({
        title: `修改分类: ${category.name}`,
        html: `
            <input id="swal-input1" class="swal2-input" value="${category.name}">
            <input type="color" id="swal-input2" class="swal2-input color-picker-swal" value="${category.themeColor}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: '保存',
        cancelButtonText: '取消',
        preConfirm: () => {
            const name = document.getElementById('swal-input1').value;
            const themeColor = document.getElementById('swal-input2').value;
            if (!name) {
                Swal.showValidationMessage('分类名称不能为空');
            }
            return { name, themeColor };
        }
    });

    if (formValues) {
        try {
            const updatedCategory = {
                name: formValues.name,
                icon: 'star',
                theme_color: formValues.themeColor,
            };
            await api.put(`/categories/${category.id}`, updatedCategory);
            Swal.fire({
                icon: 'success',
                title: '分类修改成功',
                showConfirmButton: false,
                timer: 1500
            });
            fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            Swal.fire('修改失败', '请重试或检查后端服务。', 'error');
        }
    }
};

const deleteCategory = async (categoryId) => {
    const result = await Swal.fire({
        title: '确定删除此分类吗?',
        text: "删除后将无法恢复!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: '是的，删除它!'
    });

    if (result.isConfirmed) {
        try {
            await api.delete(`/categories/${categoryId}`);
            Swal.fire(
                '已删除!',
                '您的分类已成功删除。',
                'success'
            );
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            Swal.fire('删除失败', '请重试或检查后端服务。', 'error');
        }
    }
};

const viewCategory = (categoryId) => {
  router.push({ name: 'category-notes', params: { categoryId: categoryId } });
};

const logout = () => {
  localStorage.removeItem('token');
  router.push({ name: 'login' });
};

const switchUser = () => {
  logout();
};

const handleClickOutside = (event) => {
  if (isMenuVisible.value && !event.target.closest('.menu-container')) {
    isMenuVisible.value = false;
  }
};

onMounted(() => {
  fetchCategories();
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
/* 移动端优先的响应式布局 */
.categories-page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  background-color: white;
  padding: 10px; /* 移动端较小的填充 */
  box-sizing: border-box;
}

.categories-card {
  width: 100%; /* 移动端全宽 */
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 20px; /* 移动端填充 */
  box-sizing: border-box;
}

/* 媒体查询：当屏幕宽度超过 768px 时，切换为桌面端样式 */
@media (min-width: 768px) {
  .categories-page {
    align-items: center;
    padding: 20px;
  }
  .categories-card {
    width: 600px;
    max-width: 90%;
    padding: 30px;
  }
}

.categories-header {
  text-align: center;
  margin-bottom: 20px; /* 移动端间距更小 */
  position: relative;
}

.categories-header h2 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.categories-header p {
  color: #888;
  font-size: 14px;
  margin: 5px 0 0;
}

.menu-container {
  position: absolute;
  top: 0;
  right: 0;
}

.menu-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #888;
  cursor: pointer;
  padding: 8px; /* 增加触摸区域 */
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 5px 0;
  z-index: 10;
  min-width: 120px;
  display: flex;
  flex-direction: column;
}

.dropdown-menu button {
  background: none;
  border: none;
  text-align: left;
  padding: 10px 15px;
  font-size: 14px;
  cursor: pointer;
  color: #333;
}

.dropdown-menu button:hover {
  background-color: #f0f2f5;
}

.categories-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  border-left: 5px solid transparent;
  transition: transform 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.category-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.category-info {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.category-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 15px;
  color: white;
  flex-shrink: 0;
}

.category-icon {
  font-size: 18px;
}

.category-name {
  font-weight: bold;
  font-size: 16px;
  flex-grow: 1;
  word-break: break-all;
  text-align: left;
}

.category-count {
  margin-left: 10px;
  color: #888;
  font-size: 14px;
  flex-shrink: 0;
}

.category-actions {
  display: flex;
  align-items: center;
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

.action-arrow {
  color: #ccc;
  margin-left: 15px;
}

.add-category-section {
  text-align: center;
  margin-top: 20px;
}

.add-category-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.add-category-btn:hover {
  background-color: #0056b3;
}

.add-category-form {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.add-category-form input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
}

.submit-add-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-add-btn:hover {
  background-color: #218838;
}
.color-picker {
  padding: 0;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.color-picker-swal {
  padding: 0;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
}
</style>