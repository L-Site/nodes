<template>
  <div class="auth-page">
    <div class="auth-card">
      <h2 class="auth-title">忘记密码</h2>
      <p class="auth-subtitle">请输入您的用户名并设置新密码。</p>
      <form @submit.prevent="resetPassword" class="auth-form">
        <input 
          type="text" 
          v-model="username" 
          placeholder="用户名" 
          required 
          class="auth-input" 
        />
        <input 
          type="password" 
          v-model="newPassword" 
          placeholder="新密码 (至少6位)" 
          required 
          class="auth-input" 
        />
        <input 
          type="password" 
          v-model="confirmPassword" 
          placeholder="确认密码" 
          required 
          class="auth-input" 
        />
        <button type="submit" class="auth-btn">重置密码</button>
      </form>
      <div class="auth-links">
        <router-link to="/login" class="link">返回登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api'; // 引入后端 API
import Swal from 'sweetalert2';

const router = useRouter();
const username = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const resetPassword = async () => {
  // 检查两次输入的密码是否一致
  if (newPassword.value !== confirmPassword.value) {
    Swal.fire({
      icon: 'error',
      title: '密码不一致',
      text: '两次输入的密码不相同，请重新输入。',
    });
    return;
  }

  // 检查密码长度是否符合要求
  if (newPassword.value.length < 6) {
    Swal.fire({
      icon: 'warning',
      title: '密码过短',
      text: '密码长度不得少于6位。',
    });
    return;
  }

  try {
    // 实际的后端调用
    // 请根据你的后端API端点进行修改
    await api.post('/reset-password', {
      username: username.value,
      password: newPassword.value,
    });
    
    Swal.fire({
      icon: 'success',
      title: '密码重置成功',
      text: `您的密码已成功重置！`,
      showConfirmButton: false,
      timer: 1500,
    });
    
    // 成功后跳转回登录页
    router.push({ name: 'login' });
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: '重置失败',
      text: error.response.data.message || '请重试或检查后端服务。',
    });
  }
};
</script>

<style scoped>
/* 移动端优先的响应式布局 */
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: white;
  padding: 20px;
}
.auth-card {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  box-sizing: border-box;
}
.auth-title {
  text-align: center;
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}
.auth-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.auth-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}
.auth-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background-color: #007bff;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
.auth-btn:hover {
  background-color: #0056b3;
}
.auth-links {
  margin-top: 20px;
  text-align: center;
}
.link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  margin: 0 10px;
  transition: color 0.2s;
}
.link:hover {
  text-decoration: underline;
}
</style>