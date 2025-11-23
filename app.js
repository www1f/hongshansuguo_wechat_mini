/**
 * 博物馆小程序应用入口文件
 * 主要功能：
 * 1. 全局状态管理
 * 2. 用户登录状态维护
 * 3. AI聊天助手功能
 * 4. 页面过渡动画
 * 5. 应用更新检查
 */
const config = require('./utils/config.js');

// 为兼容基础库内部读取 /saaa_config.json 的行为，拦截文件系统访问并返回占位配置
(function ensureSaaaConfigAvailable() {
  try {
    if (!wx || typeof wx.getFileSystemManager !== 'function') {
      return;
    }

    const originalGetFSM = wx.getFileSystemManager.bind(wx);

    const patchManager = manager => {
      if (!manager || manager.__saaaPatched) {
        return manager;
      }

      const respondWithStub = (options, methodName, data = '{}') => {
        const result = {
          data,
          errMsg: `${methodName}:ok`
        };
        if (options && typeof options === 'object') {
          options.success?.(result);
          options.complete?.(result);
        }
      };

      const wrap = methodName => {
        const originalMethod = typeof manager[methodName] === 'function'
          ? manager[methodName].bind(manager)
          : null;

        if (!originalMethod) return;

        manager[methodName] = (...args) => {
          const options = args[0];
          const targetPath = options?.filePath || options?.path || options;

          if (targetPath === '/saaa_config.json') {
            if (methodName === 'readFileSync') {
              return '{"enable":false}';
            }
            if (methodName === 'readFile') {
              respondWithStub(options, methodName, '{"enable":false}');
              return undefined;
            }
            if (methodName === 'access' || methodName === 'accessSync') {
              const okResult = { errMsg: `${methodName}:ok` };
              if (options && typeof options === 'object') {
                options.success?.(okResult);
                options.complete?.(okResult);
              }
              return undefined;
            }
          }

          if (typeof targetPath === 'string' && targetPath.startsWith('wxfile://usr/miniprogramLog/')) {
            if (methodName === 'readFileSync') {
              return '';
            }
            if (methodName === 'readFile') {
              respondWithStub(options, methodName, '');
              return undefined;
            }
            if (methodName === 'access' || methodName === 'accessSync') {
              const okResult = { errMsg: `${methodName}:ok` };
              if (options && typeof options === 'object') {
                options.success?.(okResult);
                options.complete?.(okResult);
              }
              return undefined;
            }
          }

          return originalMethod(...args);
        };
      };

      wrap('readFile');
      wrap('readFileSync');
      wrap('access');
      wrap('accessSync');

      manager.__saaaPatched = true;
      return manager;
    };

    wx.getFileSystemManager = (...args) => {
      const manager = originalGetFSM(...args);
      return patchManager(manager);
    };

    patchManager(originalGetFSM());
  } catch (err) {
    console.warn('Failed to patch getFileSystemManager:', err);
  }
})();

// 预创建基础库可能访问的日志文件，避免 access 错误
(function ensureMiniProgramLogFiles() {
  try {
    if (!wx || typeof wx.getFileSystemManager !== 'function' || !wx.env || !wx.env.USER_DATA_PATH) {
      return;
    }

    const fsm = wx.getFileSystemManager();
    const logDir = `${wx.env.USER_DATA_PATH}/miniprogramLog`;

    try {
      fsm.accessSync(logDir);
    } catch (dirErr) {
      try {
        fsm.mkdirSync(logDir, true);
      } catch (mkdirErr) {
        console.warn('Failed to create log directory:', mkdirErr);
        return;
      }
    }

    const logPath = `${logDir}/log3`;
    try {
      fsm.accessSync(logPath);
    } catch (fileErr) {
      try {
        fsm.writeFileSync(logPath, '', 'utf8');
      } catch (writeErr) {
        console.warn('Failed to create log file:', writeErr);
      }
    }
  } catch (err) {
    console.warn('ensureMiniProgramLogFiles failed:', err);
  }
})();

App({
  // 全局数据
  globalData: {
    userInfo: null,        // 用户信息
    isLoggedIn: false,     // 登录状态
    aiMessages: null,      // AI聊天历史记录
    pageTransition: {
      isNavigating: false  // 页面切换状态
    }
  },
  
  /**
   * 应用启动时执行
   */
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: config.cloud.env,
        traceUser: config.cloud.traceUser
      }).catch(err => {
        console.error('云开发初始化失败:', err)
      })
    }

    this._initLoginState();
    this._initAIChatHistory();
    this._setupAIMessageSync();
    this._initPageTransition();
    this._checkAppUpdate();
  },
  
  /**
   * 初始化登录状态
   */
  _initLoginState() {
    this.globalData.isLoggedIn = wx.getStorageSync(config.storage.keys.isLoggedIn) || false;
    this.globalData.userInfo = wx.getStorageSync(config.storage.keys.userInfo) || null;
  },
  
  /**
   * 初始化AI聊天历史
   */
  _initAIChatHistory() {
    try {
      const aiChatHistory = wx.getStorageSync(config.storage.keys.aiChatHistory);
      this.globalData.aiMessages = aiChatHistory ? 
        JSON.parse(aiChatHistory) : 
        [{ id: 1, role: 'ai', content: '你好！我是泽雅AI助手，请问有什么可以帮您？' }];
      
      if (!aiChatHistory) {
        wx.setStorageSync(config.storage.keys.aiChatHistory, JSON.stringify(this.globalData.aiMessages));
      }
    } catch (e) {
      console.error('AI聊天历史初始化失败', e);
    }
  },
  
  /**
   * 设置AI消息同步机制
   */
  _setupAIMessageSync() {
    wx.onAppShow(() => {
      try {
        const messagesStr = wx.getStorageSync('ai_chat_history');
        if (messagesStr) {
          this.globalData.aiMessages = JSON.parse(messagesStr);
        }
      } catch (e) {
        console.error('读取AI消息失败', e);
      }
    });
    
    wx.onAppHide(() => {
      if (this.globalData.aiMessages) {
        try {
          wx.setStorageSync('ai_chat_history', JSON.stringify(this.globalData.aiMessages));
        } catch (e) {
          console.error('保存AI消息失败', e);
        }
      }
    });
  },
  
  /**
   * 初始化页面过渡动画
   */
  _initPageTransition() {
    const self = this;
    
    // 保存原始导航方法
    const navigationMethods = {
      navigateTo: wx.navigateTo,
      redirectTo: wx.redirectTo,
      switchTab: wx.switchTab,
      navigateBack: wx.navigateBack,
      reLaunch: wx.reLaunch
    };
    
    // 封装导航开始方法
    const beforeNavigate = () => {
      if (!self.globalData.pageTransition.isNavigating) {
        self.globalData.pageTransition.isNavigating = true;
        const currentPage = getCurrentPages().pop();
        currentPage?.selectComponent('#page-transition')?.showLoading();
      }
    };
    
    // 封装导航完成方法
    const afterNavigate = () => {
      setTimeout(() => {
        self.globalData.pageTransition.isNavigating = false;
        const currentPage = getCurrentPages().pop();
        currentPage?.selectComponent('#page-transition')?.hideLoading();
      }, 500);
    };
    
    // 重写导航方法
    const wrapNavigation = (originalMethod) => (options) => {
      beforeNavigate();
      const originalComplete = options.complete;
      options.complete = () => {
        originalComplete?.();
        afterNavigate();
      };
      originalMethod(options);
    };
    
    // 应用包装后的导航方法
    Object.keys(navigationMethods).forEach(method => {
      wx[method] = wrapNavigation(navigationMethods[method]);
    });
  },
  
  /**
   * 检查应用更新
   */
  _checkAppUpdate() {
    if (!wx.canIUse('getUpdateManager')) return;
    
    const updateManager = wx.getUpdateManager();
    
    updateManager.onCheckForUpdate((res) => {
      if (!res.hasUpdate) return;
      
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => res.confirm && updateManager.applyUpdate()
        });
      });
      
      updateManager.onUpdateFailed(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本下载失败，请稍后再试'
        });
      });
    });
  }
});
