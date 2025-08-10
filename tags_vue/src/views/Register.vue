<template>
  <div class="auth-page register-page">
    <div class="auth-card">
      <div class="register-section">
        <h2 class="auth-title">用户注册</h2>
        <p class="auth-subtitle">创建你的专属账户，开始记录你的生活点滴。</p>
        <form @submit.prevent="handleRegister" class="auth-form">
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            placeholder="请输入用户名" 
            required 
            class="auth-input"
          />
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="请输入密码" 
            required 
            class="auth-input" 
          />
          <input 
            type="password"
            id="confirm-password"
            v-model="confirmPassword"
            placeholder="请再次输入密码"
            required
            class="auth-input"
          />
          <button type="submit" class="auth-btn">注册</button>
        </form>
        
        <div class="mobile-login-link">
          <span class="have-account-text">已有账号？</span>
          <router-link to="/login" class="link">立即登录</router-link>
        </div>
      </div>

      <div class="login-section">
        <h3>已有账号？</h3>
        <p>快来登录，继续你的旅程。</p>
        <button class="login-btn" @click="goToLogin">登录</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import Swal from 'sweetalert2';

const router = useRouter();
const username = ref('');
const password = ref('');
const confirmPassword = ref('');

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    Swal.fire({
      icon: 'error',
      title: '密码不一致',
      text: '两次输入的密码不相同，请重新输入。',
    });
    return;
  }
  
  try {
    const response = await api.post('/register', {
      username: username.value,
      password: password.value,
    });
    
    await Swal.fire({
      icon: 'success',
      title: '注册成功',
      text: response.data.message || '账户已创建，请登录。',
      showConfirmButton: false,
      timer: 1500
    });
    
    router.push({ name: 'login' });
  } catch (err) {
    let errorMessage = '注册失败，请稍后再试。';
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    Swal.fire({
      icon: 'error',
      title: '注册失败',
      text: errorMessage,
    });
    console.error(err);
  }
};

const goToLogin = () => {
  router.push({ name: 'login' });
};
</script>

<style scoped>
/* 通用认证页面的样式 */
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
  max-width: 400px; /* 移动端最大宽度 */
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  padding: 30px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
.link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}
.link:hover {
  text-decoration: underline;
}

/* 注册页特定样式 */
.register-page .auth-card {
  max-width: 900px;
}
.register-section {
  flex: 1;
  text-align: center;
}

/* 登录分栏样式 (桌面端显示) */
.login-section {
  display: none;
  background-color: #007bff;
  color: white;
  padding: 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.login-section h3 {
  margin-top: 0;
  font-size: 24px;
}
.login-section p {
  font-size: 14px;
}
.login-btn {
  background-color: white;
  color: #007bff;
  border: none;
  padding: 10px 25px;
  border-radius: 20px;
  font-size: 16px;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.2s, color 0.2s;
}
.login-btn:hover {
  background-color: #e9ecef;
}

/* 移动端登录链接样式 */
.mobile-login-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}
.have-account-text {
  color: #666;
  margin-right: 5px;
}

/* 桌面端布局 */
@media (min-width: 768px) {
  .register-page .auth-card {
    display: flex;
    flex-direction: row;
    width: 900px;
  }
  .register-section {
    padding: 40px 60px;
  }
  .login-section {
    display: flex;
    flex: 1;
  }
  .mobile-login-link {
    display: none;
  }
}
</style>