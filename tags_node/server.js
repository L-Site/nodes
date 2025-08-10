import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port = 3000;

// 解决 __dirname 在 ES Module 中未定义的问题
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
    host: 'localhost',
    user: 'notes',
    password: '123123',
    database: 'notes'
};

const SECRET_KEY = 'your_secret_key';

app.use(cors());
app.use(express.json());

const pool = mysql.createPool(dbConfig);

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// =========================================================================================
// 所有 API 路由
// =========================================================================================

// 用户认证 API
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ message: '用户注册成功' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '用户名已存在' });
        }
        console.error('注册失败:', error);
        res.status(500).json({ message: '注册失败', error });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: '用户名或密码错误' });
        }
        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ message: '登录成功', token });
    } catch (error) {
        res.status(500).json({ message: '登录失败', error });
    }
});
app.post('/api/reset-password', async (req, res) => {
    const { username, password } = req.body;
    try {
        // 1. 查找用户
        const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = rows[0];

        if (!user) {
            return res.status(404).json({ message: '用户名不存在' });
        }
        
        // 2. 加密新密码
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 3. 更新数据库中的密码
        const [result] = await pool.execute('UPDATE users SET password = ? WHERE username = ?', [hashedPassword, username]);

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: '密码重置失败' });
        }
        
        res.json({ message: '密码重置成功' });
    } catch (error) {
        console.error('密码重置失败:', error);
        res.status(500).json({ message: '重置密码失败', error });
    }
});


// 分类 CRUD API
app.get('/api/categories', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const [rows] = await pool.execute(
            'SELECT c.id, c.name, c.icon, c.theme_color, (SELECT COUNT(*) FROM notes WHERE category_id = c.id) as noteCount FROM categories c WHERE user_id IS NULL OR user_id = ? ORDER BY c.id',
            [userId]
        );
        
        const allCategory = {
            id: 1,
            name: '全部',
            icon: 'star',
            theme_color: '#cd1111ff',
            noteCount: (await pool.execute('SELECT COUNT(*) as total FROM notes WHERE user_id = ?', [userId]))[0][0].total
        };

        const finalCategories = [allCategory, ...rows];
        res.json(finalCategories);
    } catch (error) {
        res.status(500).json({ message: '获取分类失败', error });
    }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { name, icon, theme_color } = req.body;
    try {
        const [result] = await pool.execute('INSERT INTO categories (user_id, name, icon, theme_color) VALUES (?, ?, ?, ?)', [userId, name, icon, theme_color]);
        res.status(201).json({ message: '分类创建成功', categoryId: result.insertId });
    } catch (error) {
        res.status(500).json({ message: '创建分类失败', error });
    }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, icon, theme_color } = req.body;
    const userId = req.user.userId;
    try {
        const [result] = await pool.execute('UPDATE categories SET name = ?, icon = ?, theme_color = ? WHERE id = ? AND user_id = ?', [name, icon, theme_color, id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到分类或无权修改' });
        }
        res.json({ message: '分类更新成功' });
    } catch (error) {
        res.status(500).json({ message: '更新分类失败', error });
    }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
        const [result] = await pool.execute('DELETE FROM categories WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到分类或无权删除' });
        }
        res.json({ message: '分类删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除分类失败', error });
    }
});

// 便签 CRUD API
app.get('/api/notes', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { categoryId } = req.query;
    try {
        let sql = `
            SELECT 
                n.*, 
                c.name as category_name, 
                c.theme_color as category_theme_color 
            FROM notes n
            LEFT JOIN categories c ON n.category_id = c.id
            WHERE n.user_id = ?
        `;
        const params = [userId];

        if (categoryId && categoryId !== '1') {
            sql += ' AND n.category_id = ?';
            params.push(parseInt(categoryId));
        }
        
        sql += ' ORDER BY n.id DESC';

        const [rows] = await pool.execute(sql, params);
        res.json(rows);
    } catch (error) {
        console.error('获取便签失败:', error);
        res.status(500).json({ message: '获取便签失败', error: error.message });
    }
});

app.post('/api/notes', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { title, content, categoryId } = req.body;
    try {
        const [result] = await pool.execute('INSERT INTO notes (user_id, category_id, title, content) VALUES (?, ?, ?, ?)', [userId, categoryId, title, content]);
        res.status(201).json({ message: '便签创建成功', noteId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.code === 'ER_NO_REFERENCED_ROW') {
            return res.status(400).json({ message: '指定的分类ID不存在', error: error.message });
        }
        res.status(500).json({ message: '创建便签失败', error });
    }
});

app.put('/api/notes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, content, categoryId } = req.body;
    const userId = req.user.userId;
    try {
        const [result] = await pool.execute('UPDATE notes SET title = ?, content = ?, category_id = ? WHERE id = ? AND user_id = ?', [title, content, categoryId, id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到便签或无权修改' });
        }
        res.json({ message: '便签更新成功' });
    } catch (error) {
        res.status(500).json({ message: '更新便签失败', error });
    }
});

app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.userId;
    try {
        const [result] = await pool.execute('DELETE FROM notes WHERE id = ? AND user_id = ?', [id, userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: '未找到便签或无权删除' });
        }
        res.json({ message: '便签删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除便签失败', error });
    }
});

// =========================================================================================
// **用于托管前端应用的代码**
// =========================================================================================

const staticPath = path.join(__dirname,'..', 'tags_vue', 'dist');

app.use(express.static(staticPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});


// =========================================================================================
// 启动服务器
// =========================================================================================

app.listen(port, async () => {
    // 获取本地 IP 地址
    const networkInterfaces = os.networkInterfaces();
    let localIpAddress;

    // 遍历网络接口以找到 IPv4 地址
    for (const name of Object.keys(networkInterfaces)) {
        for (const net of networkInterfaces[name]) {
            // 跳过内部和非 IPv4 地址
            if (net.family === 'IPv4' && !net.internal) {
                localIpAddress = net.address;
                break;
            }
        }
        if (localIpAddress) break;
    }

    // 尝试获取公网 IP 地址
    let publicIpAddress = '无法获取';
    try {
        const response = await fetch('https://api.ipify.org');
        if (response.ok) {
            publicIpAddress = await response.text();
        }
    } catch (error) {
        console.error('获取公网 IP 失败:', error.message);
    }

    console.log(`\n=================================================`);
    console.log(`  服务器已启动`);
    console.log(`  本地访问:   http://localhost:${port}`);
    if (localIpAddress) {
        console.log(`  局域网访问: http://${localIpAddress}:${port}`);
    }
    if (publicIpAddress !== '无法获取') {
        console.log(`  公网IP:     http://${publicIpAddress}:${port}`);
    }
    console.log(`=================================================\n`);
});