<template>
  <div class="auth-page login-page">
    <div class="auth-card">
      <div class="login-section">
        <h2 class="auth-title">用户登录</h2>
        
        <div class="social-logins">
          <button class="social-btn" @click="loginWithSocial('weixin')">
            <font-awesome-icon :icon="['fab', 'weixin']" class="social-icon weixin-icon" />
          </button>
          <button class="social-btn" @click="loginWithSocial('qq')">
            <font-awesome-icon :icon="['fab', 'qq']" class="social-icon qq-icon" />
          </button>
          <button class="social-btn" @click="loginWithSocial('weibo')">
            <font-awesome-icon :icon="['fab', 'weibo']" class="social-icon weibo-icon" />
          </button>
          <button class="social-btn" @click="loginWithSocial('github')">
            <font-awesome-icon :icon="['fab', 'github']" class="social-icon github-icon" />
          </button>
        </div>
        <p class="login-tip">您可以选择以上几种方式登录您的账户！</p>
        
        <div class="divider">
          <span>或使用账号密码登录</span>
        </div>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <input type="text" id="username" v-model="username" placeholder="请输入用户名" required class="auth-input" />
          </div>
          <div class="form-group">
            <input type="password" id="password" v-model="password" placeholder="请输入密码" required class="auth-input" />
          </div>
          <div class="forgot-password-link">
            <router-link to="/forgot-password" class="link">忘记密码？</router-link>
          </div>
          <button type="submit" class="auth-btn">登录</button>
        </form>
        
        <p v-if="error" class="error-message">{{ error }}</p>
        
        <div class="mobile-register-link">
          <span class="no-account-text">没有账号？</span>
          <router-link to="/register" class="link">立即注册</router-link>
        </div>
      </div>
      
      <div class="register-section">
        <h3>没有账号？</h3>
        <p>点击注册一个属于你的账号吧。</p>
        <button class="register-btn" @click="goToRegister">注册</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api';
import Swal from 'sweetalert2';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faWeixin, faQq, faWeibo, faGithub } from '@fortawesome/free-brands-svg-icons';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';

// 添加需要的图标
library.add(faWeixin, faQq, faWeibo, faGithub, faChevronLeft);

const router = useRouter();
const username = ref('');
const password = ref('');
const error = ref(null);

const handleLogin = async () => {
  error.value = null; // 每次登录前清除错误信息
  try {
    const response = await api.post('/login', {
      username: username.value,
      password: password.value,
    });
    
    // 登录成功后，将后端返回的token保存到localStorage
    localStorage.setItem('token', response.data.token);

    // 使用 Swal 提示登录成功
    await Swal.fire({
      icon: 'success',
      title: '登录成功',
      showConfirmButton: false,
      timer: 1500
    });
    router.push({ name: 'categories' });
  } catch (err) {
    let errorMessage = '登录失败，请检查用户名或密码。';
    if (err.response && err.response.data && err.response.data.message) {
      errorMessage = err.response.data.message;
    }
    error.value = errorMessage;
    Swal.fire({
      icon: 'error',
      title: '登录失败',
      text: errorMessage,
    });
    console.error(err);
  }
};

const goToRegister = () => {
  router.push({ name: 'register' });
};

const loginWithSocial = (platform) => {
  Swal.fire({
    icon: 'info',
    title: '功能待完善',
    text: `正在使用 ${platform} 登录... (此为占位功能)`,
  });
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
  margin-bottom: 20px;
  color: #333;
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

/* 登录页特定样式 */
.login-page .auth-card {
  max-width: 900px;
}

.login-section {
  flex: 1;
  text-align: center;
}

.social-logins {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 10px;
}

.social-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}
.social-btn:hover {
  background-color: #e9ecef;
}

.social-icon {
  font-size: 24px;
}
.weixin-icon { color: #07c160; }
.qq-icon { color: #55aaff; }
.weibo-icon { color: #e6162d; }
.github-icon { color: #333; }

.login-tip {
  color: #888;
  font-size: 12px;
}

.divider {
  position: relative;
  margin: 30px 0;
  color: #aaa;
  font-size: 14px;
}
.divider span {
  background-color: white;
  padding: 0 10px;
  position: relative;
  z-index: 1;
}
.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background-color: #ddd;
}

.form-group {
  text-align: left;
}

.forgot-password-link {
  margin-top: 5px;
  text-align: right;
  font-size: 14px;
}

.forgot-password-link .link {
  color: #007bff;
}

.login-btn {
  margin-top: 20px;
}

.error-message {
  color: red;
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
}

/* 注册分栏样式 (桌面端显示) */
.register-section {
  display: none;
  background-color: #007bff;
  color: white;
  padding: 40px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.register-section h3 {
  margin-top: 0;
  font-size: 24px;
}
.register-section p {
  font-size: 14px;
}
.register-btn {
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
.register-btn:hover {
  background-color: #e9ecef;
}

/* 移动端注册链接样式 */
.mobile-register-link {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}
.no-account-text {
  color: #666;
  margin-right: 5px;
}


/* 桌面端布局 */
@media (min-width: 768px) {
  .login-page .auth-card {
    display: flex;
    flex-direction: row;
    width: 900px;
  }
  .login-section {
    padding: 40px 60px;
  }
  .register-section {
    display: flex;
    flex: 1;
  }
  .mobile-register-link {
    display: none;
  }
}
</style>