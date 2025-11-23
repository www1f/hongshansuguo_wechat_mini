/**
 * 应用配置文件
 * 集中管理所有配置参数
 */

const config = {
  // 应用环境配置
  environment: 'development', // 'development' 或 'production'
  
  // 云环境配置
  cloud: {
    // 当前使用的云环境ID
    env: 'cloud1-4gs4byk3b4e9d2d2',
    
    // 环境列表（便于切换）
    environments: {
      test: 'cloud1-4gs4byk3b4e9d2d2',    // 测试环境
      production: 'prod-xxxxx'            // 生产环境（待配置）
    },
    
    // 云开发基础库最低版本
    minLibVersion: '2.2.3',
    
    // 是否追踪用户
    traceUser: true
  },
  
  // API 配置
  api: {
    // 云函数名称
    functions: {
      login: 'login',              // 登录云函数
      uploadImage: 'uploadImage'   // 图片上传云函数
    }
  },

  // 短信配置
  sms: {
    provider: 'market', // 'tencent' | 'aliyun' | 'market'
    forceRealInDev: true // 开发环境下是否强制发送真实短信
  },
  
  // 存储配置
  storage: {
    // 本地存储的键名
    keys: {
      isLoggedIn: 'isLoggedIn',           // 登录状态
      userInfo: 'userInfo',               // 用户信息
      openid: 'openid',                   // 微信 openid（已弃用，保留向后兼容）
      loginToken: 'loginToken',           // 登录令牌（新）
      loginInfo: 'loginInfo',             // 完整登录信息（新）
      aiChatHistory: 'ai_chat_history',   // AI聊天历史
      aiButtonPosition: 'ai_button_position'
    }
  },
  
  // 业务配置
  business: {
    // 默认分页大小
    pageSize: 10,
    
    // 密码最小长度
    passwordMinLength: 6,
    
    // 密码最大长度
    passwordMaxLength: 20,
    
    // 手机号正则
    phoneRegex: /^1[3-9]\d{9}$/,
    
    // 邮箱正则
    emailRegex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  
  // UI 配置
  ui: {
    // 主题色
    themeColor: '#B3261E',
    
    // 页面背景色
    pageBackgroundColor: '#f8f3e9',
    
    // Toast 默认显示时长（ms）
    toastDuration: 2000
  },
  
  // 数据库配置
  database: {
    // 集合名称
    collections: {
      users: 'users',
      stories: 'stories',
      cultural: 'cultural',
      activities: 'activities',
      news: 'news',
      appointments: 'appointments'
    }
  }
};

module.exports = config;
