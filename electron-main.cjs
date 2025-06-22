const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { join } = require('path');

// 确保所有模块都使用CommonJS方式导入
process.env.ESLINT_NO_DEV_ERRORS = 'true';

// 安全导入globalShortcut模块
let globalShortcut;
try {
  globalShortcut = require('electron').globalShortcut;
} catch (err) {
  console.error('Failed to load globalShortcut module:', err);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      devTools: true
    },
    show: false,
    frame: false, // 无边框窗口
    titleBarStyle: 'hidden', // 隐藏标题栏但仍保留窗口控制按钮
    titleBarOverlay: {
      color: '#2f3241',
      symbolColor: '#74b1be'
    }
  });

  // 全屏切换快捷键
  if (globalShortcut) {
    globalShortcut.register('F11', () => {
      win.setFullScreen(!win.isFullScreen());
    });
  }

  // 立即打开开发者工具
  win.webContents.openDevTools();
  
  // 窗口加载完成后显示
  win.on('ready-to-show', () => {
    win.show();
    // 作为备用再次打开开发者工具
    win.webContents.openDevTools();
  });

  // 安全注册快捷键
  if (globalShortcut) {
    try {
      const ret = globalShortcut.register('CommandOrControl+Shift+I', () => {
        win.webContents.openDevTools();
      });
      if (!ret) {
        console.error('Failed to register developer tools shortcut');
      }
    } catch (err) {
      console.error('Error registering shortcut:', err);
    }
  } else {
    console.warn('globalShortcut module not available, keyboard shortcuts disabled');
  }

  // 加载前端资源

  const loadApp = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Running in development mode');
      win.loadURL('http://localhost:3000')
        .catch(err => console.error('Failed to load dev URL:', err));
      // 开发者工具已在窗口创建时打开
    } else {
      // 修正生产模式下的文件路径（适配不同打包环境）
      const staticPath = join(__dirname, '..', 'app', 'dist', 'static');
      const indexPath = join(staticPath, 'index.html');
      console.log('Production mode - Loading from:', indexPath);
      console.log('File exists:', require('fs').existsSync(indexPath));
      console.log('Current __dirname:', __dirname);
      
      // 设置静态资源基础路径
      win.webContents.session.protocol.interceptFileProtocol('file', (request, callback) => {
        let url = request.url.substr(8); // 移除file://前缀
        url = url.split('?')[0]; // 移除查询参数
        url = url.split('#')[0]; // 移除hash
        
        // 重定向静态资源请求
        if (url.includes('/static/')) {
          const resourcePath = path.join(staticPath, url.split('/static/')[1]);
          callback({ path: resourcePath });
        } else {
          callback({ path: url });
        }
      });

      // 确保加载index.html时不触发路由错误
      const normalizedPath = indexPath.replace(/\\/g, '/');
      win.loadURL(`file://${normalizedPath}`)
        .catch(err => {
          console.error('Failed to load index.html:', err);
          win.webContents.openDevTools();
          win.loadURL(`data:text/html;charset=UTF-8,<html>
            <head>
              <meta charset="UTF-8">
              <title>应用加载失败</title>
            </head>
            <body>
              <h1>加载应用失败，请检查控制台日志</h1>
              <p>详细错误信息已输出到控制台</p>
              <p>尝试加载的路径: ${indexPath}</p>
            </body>
          </html>`);
        });
    }
  };

  loadApp();

  // 监听渲染进程错误
  win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load page:', { errorCode, errorDescription });
  });

  win.webContents.on('crashed', () => {
    console.error('Renderer process crashed');
  });

  win.webContents.on('unresponsive', () => {
    console.error('Renderer process unresponsive');
  });
}

app.whenReady().then(() => {
  // 安全注册快捷键
  if (globalShortcut) {
    try {
      const ret = globalShortcut.register('CommandOrControl+Shift+I', () => {
        BrowserWindow.getAllWindows().forEach(win => {
          win.webContents.openDevTools();
        });
      });
      if (!ret) {
        console.error('Failed to register developer tools shortcut');
      }
    } catch (err) {
      console.error('Error registering shortcut:', err);
    }
  }

  const win = createWindow();

  // 添加IPC通信处理
  ipcMain.on('toggle-fullscreen', () => {
    if (win) {
      win.setFullScreen(!win.isFullScreen());
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 安全注销快捷键
app.on('will-quit', () => {
  if (globalShortcut) {
    globalShortcut.unregisterAll();
  }
});