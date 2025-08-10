import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 导入 Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
// 导入实心图标 (solid)
import { faMagnifyingGlass, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';
// 导入品牌图标 (brands)
import { faWeixin, faQq, faWeibo, faGithub } from '@fortawesome/free-brands-svg-icons';

// 将所有需要的图标添加到库中
library.add(faMagnifyingGlass, faPenToSquare, faTrashCan, faWeixin, faQq, faWeibo, faGithub);

const app = createApp(App)

//全局注册 Font Awesome 组件
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)

app.mount('#app')
