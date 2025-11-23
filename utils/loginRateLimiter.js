/**
 * 登录限流与安全检查模块
 * 防止暴力破解和恶意登录尝试
 */

const config = require('./config.js');

// 本地存储的尝试记录（生产环境应使用服务端存储）
const loginAttemptKey = 'login_attempts';
const lockedAccountKey = 'locked_accounts';

/**
 * 获取登录尝试次数
 * @param {string} identifier - 标识符（电话号码或微信ID）
 * @returns {Object} { attempts: number, remainingTime: number, isLocked: boolean }
 */
function getLoginAttempts(identifier) {
  try {
    const now = Date.now();
    let attempts = [];
    
    try {
      const storedAttempts = wx.getStorageSync(loginAttemptKey);
      if (storedAttempts && Array.isArray(storedAttempts)) {
        attempts = storedAttempts;
      }
    } catch (e) {
      console.warn('读取登录尝试记录失败');
    }

    // 过滤该用户的尝试记录（仅保留10分钟内的）
    const timeWindow = 10 * 60 * 1000; // 10分钟
    const userAttempts = attempts.filter(attempt => 
      attempt.identifier === identifier && 
      (now - attempt.timestamp) < timeWindow
    );

    // 检查账户是否被锁定
    let lockedAccounts = [];
    try {
      const storedLockedAccounts = wx.getStorageSync(lockedAccountKey);
      if (storedLockedAccounts && Array.isArray(storedLockedAccounts)) {
        lockedAccounts = storedLockedAccounts.filter(account => 
          (now - account.lockedAt) < account.lockDuration
        );
      }
    } catch (e) {
      console.warn('读取锁定账户列表失败');
    }

    const isLocked = lockedAccounts.some(account => account.identifier === identifier);
    
    if (isLocked) {
      const lockedAccount = lockedAccounts.find(acc => acc.identifier === identifier);
      const remainingTime = Math.ceil((lockedAccount.lockDuration - (now - lockedAccount.lockedAt)) / 1000);
      return {
        attempts: userAttempts.length,
        remainingTime,
        isLocked: true,
        message: `账户已锁定，请在 ${remainingTime} 秒后重试`
      };
    }

    return {
      attempts: userAttempts.length,
      maxAttempts: config.security?.loginMaxAttempts || 5,
      remainingAttempts: Math.max(0, (config.security?.loginMaxAttempts || 5) - userAttempts.length),
      isLocked: false
    };
  } catch (error) {
    console.error('获取登录尝试次数失败:', error);
    return {
      attempts: 0,
      isLocked: false,
      error: error.message
    };
  }
}

/**
 * 记录登录尝试
 * @param {string} identifier - 标识符
 * @param {boolean} success - 是否成功
 */
function recordLoginAttempt(identifier, success = false) {
  try {
    if (success) {
      // 成功登录，清除该用户的所有尝试记录
      clearLoginAttempts(identifier);
      return;
    }

    // 失败尝试
    let attempts = [];
    try {
      const stored = wx.getStorageSync(loginAttemptKey);
      if (stored && Array.isArray(stored)) {
        attempts = stored;
      }
    } catch (e) {
      console.warn('读取登录尝试记录失败');
    }

    // 添加新的尝试记录
    attempts.push({
      identifier,
      timestamp: Date.now(),
      success: false
    });

    // 保存到本地存储
    try {
      wx.setStorageSync(loginAttemptKey, attempts);
    } catch (e) {
      console.warn('保存登录尝试记录失败');
    }

    // 检查是否需要锁定账户
    const maxAttempts = config.security?.loginMaxAttempts || 5;
    const timeWindow = 10 * 60 * 1000;
    const now = Date.now();
    
    const recentAttempts = attempts.filter(attempt => 
      attempt.identifier === identifier && 
      (now - attempt.timestamp) < timeWindow
    );

    if (recentAttempts.length >= maxAttempts) {
      lockAccount(identifier);
    }
  } catch (error) {
    console.error('记录登录尝试失败:', error);
  }
}

/**
 * 清除登录尝试记录
 * @param {string} identifier - 标识符
 */
function clearLoginAttempts(identifier) {
  try {
    let attempts = [];
    try {
      const stored = wx.getStorageSync(loginAttemptKey);
      if (stored && Array.isArray(stored)) {
        attempts = stored;
      }
    } catch (e) {
      console.warn('读取登录尝试记录失败');
    }

    // 移除该用户的所有记录
    const filtered = attempts.filter(attempt => attempt.identifier !== identifier);
    
    try {
      wx.setStorageSync(loginAttemptKey, filtered);
    } catch (e) {
      console.warn('保存登录尝试记录失败');
    }
  } catch (error) {
    console.error('清除登录尝试失败:', error);
  }
}

/**
 * 锁定账户
 * @param {string} identifier - 标识符
 */
function lockAccount(identifier) {
  try {
    let lockedAccounts = [];
    try {
      const stored = wx.getStorageSync(lockedAccountKey);
      if (stored && Array.isArray(stored)) {
        lockedAccounts = stored;
      }
    } catch (e) {
      console.warn('读取锁定账户列表失败');
    }

    // 检查是否已经锁定
    const alreadyLocked = lockedAccounts.some(account => account.identifier === identifier);
    if (alreadyLocked) {
      return;
    }

    // 锁定时间：30分钟
    const lockDuration = 30 * 60 * 1000;
    
    lockedAccounts.push({
      identifier,
      lockedAt: Date.now(),
      lockDuration
    });

    try {
      wx.setStorageSync(lockedAccountKey, lockedAccounts);
    } catch (e) {
      console.warn('保存锁定账户列表失败');
    }

    console.log(`账户 ${identifier} 已被锁定 ${lockDuration / 1000 / 60} 分钟`);
  } catch (error) {
    console.error('锁定账户失败:', error);
  }
}

/**
 * 解锁账户
 * @param {string} identifier - 标识符
 */
function unlockAccount(identifier) {
  try {
    let lockedAccounts = [];
    try {
      const stored = wx.getStorageSync(lockedAccountKey);
      if (stored && Array.isArray(stored)) {
        lockedAccounts = stored;
      }
    } catch (e) {
      console.warn('读取锁定账户列表失败');
    }

    const filtered = lockedAccounts.filter(account => account.identifier !== identifier);
    
    try {
      wx.setStorageSync(lockedAccountKey, filtered);
    } catch (e) {
      console.warn('保存锁定账户列表失败');
    }

    console.log(`账户 ${identifier} 已解锁`);
  } catch (error) {
    console.error('解锁账户失败:', error);
  }
}

/**
 * 检查是否可以登录
 * @param {string} identifier - 标识符
 * @returns {Object} { canLogin: boolean, message: string }
 */
function canLogin(identifier) {
  try {
    const { isLocked, message, remainingAttempts } = getLoginAttempts(identifier);
    
    if (isLocked) {
      return {
        canLogin: false,
        message: message
      };
    }

    if (remainingAttempts <= 0) {
      return {
        canLogin: false,
        message: '登录失败次数过多，账户已被锁定'
      };
    }

    return {
      canLogin: true,
      remainingAttempts
    };
  } catch (error) {
    console.error('检查登录权限失败:', error);
    return {
      canLogin: true, // 出错时允许登录，避免完全阻塞
      error: error.message
    };
  }
}

module.exports = {
  getLoginAttempts,
  recordLoginAttempt,
  clearLoginAttempts,
  lockAccount,
  unlockAccount,
  canLogin
};
