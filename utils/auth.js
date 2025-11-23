/**
 * 用户认证和令牌管理系统
 * 
 * 功能：
 * 1. 用户登录后生成令牌
 * 2. 使用令牌而不是 openid 作为身份标识
 * 3. 支持登录过期管理
 * 4. 统一用户身份认证机制
 */

const config = require('./config.js');

/**
 * 生成唯一的用户会话令牌
 * @returns {string} 令牌
 */
function generateToken() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2);
  return `${timestamp}-${randomStr}`;
}

/**
 * 登录成功后保存令牌和用户信息
 * @param {Object} userData - 用户数据（包含 _openid 或 phoneNumber）
 * @param {string} loginMethod - 登录方式：'phone' 或 'wechat'
 */
function saveLoginToken(userData, loginMethod = 'phone') {
  try {
    // 生成令牌
    const token = generateToken();
    
    // 计算过期时间（7天）
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    
    // 构建登录信息对象
    const loginInfo = {
      token: token,                    // 登录令牌
      userId: userData._id,            // 用户唯一ID（云数据库自动生成）
      phoneNumber: userData.phoneNumber || '',  // 可选
      openid: userData._openid || '',   // 可选
      loginMethod: loginMethod,         // 登录方式
      isLoggedIn: true,
      loginTime: Date.now(),           // 登录时间
      expiresAt: expiresAt,            // 过期时间
      expiresIn: 7 * 24 * 60 * 60     // 过期秒数
    };
    
    // 保存到本地存储
    wx.setStorageSync(config.storage.keys.loginToken, token);
    wx.setStorageSync(config.storage.keys.loginInfo, loginInfo);
    wx.setStorageSync(config.storage.keys.isLoggedIn, true);
    
    // 保存简化的用户信息
    const userInfo = {
      _id: userData._id,
      nickName: userData.nickName || '',
      avatarUrl: userData.avatarUrl || '',
      phoneNumber: userData.phoneNumber || '',
      email: userData.email || '',
      gender: userData.gender || 2
    };
    wx.setStorageSync(config.storage.keys.userInfo, userInfo);
    
    return loginInfo;
  } catch (error) {
    console.error('保存登录令牌失败:', error);
    throw error;
  }
}

/**
 * 获取当前的登录令牌
 * @returns {string|null} 令牌或 null
 */
function getLoginToken() {
  try {
    return wx.getStorageSync(config.storage.keys.loginToken) || null;
  } catch (error) {
    console.error('获取登录令牌失败:', error);
    return null;
  }
}

/**
 * 获取完整的登录信息
 * @returns {Object|null} 登录信息或 null
 */
function getLoginInfo() {
  try {
    return wx.getStorageSync(config.storage.keys.loginInfo) || null;
  } catch (error) {
    console.error('获取登录信息失败:', error);
    return null;
  }
}

/**
 * 检查登录是否过期
 * @returns {boolean} 是否已过期
 */
function isLoginExpired() {
  try {
    const loginInfo = getLoginInfo();
    if (!loginInfo) return true;
    
    const now = Date.now();
    const expiresAt = loginInfo.expiresAt;
    
    return now > expiresAt;
  } catch (error) {
    console.error('检查登录过期失败:', error);
    return true;
  }
}

/**
 * 获取有效的认证用户信息
 * 如果登录已过期，返回 null
 * @returns {Object|null} 用户信息或 null
 */
function getAuthenticatedUser() {
  try {
    // 检查登录状态
    const isLoggedIn = wx.getStorageSync(config.storage.keys.isLoggedIn);
    if (!isLoggedIn) return null;
    
    // 检查是否过期
    if (isLoginExpired()) {
      // 清除过期的登录信息
      clearLogin();
      return null;
    }
    
    // 返回用户信息
    return wx.getStorageSync(config.storage.keys.userInfo) || null;
  } catch (error) {
    console.error('获取认证用户信息失败:', error);
    return null;
  }
}

/**
 * 刷新登录令牌有效期
 * 用户有活动时调用此函数来延长登录时间
 */
function refreshLoginToken() {
  try {
    const loginInfo = getLoginInfo();
    if (!loginInfo) return false;
    
    // 重新计算过期时间
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    loginInfo.expiresAt = expiresAt;
    loginInfo.expiresIn = 7 * 24 * 60 * 60;
    
    // 保存更新
    wx.setStorageSync(config.storage.keys.loginInfo, loginInfo);
    
    return true;
  } catch (error) {
    console.error('刷新登录令牌失败:', error);
    return false;
  }
}

/**
 * 清除登录信息（退出登录）
 */
function clearLogin() {
  try {
    wx.removeStorageSync(config.storage.keys.loginToken);
    wx.removeStorageSync(config.storage.keys.loginInfo);
    wx.removeStorageSync(config.storage.keys.isLoggedIn);
    wx.removeStorageSync(config.storage.keys.userInfo);
    wx.removeStorageSync(config.storage.keys.openid);  // 移除旧的 openid
    
    return true;
  } catch (error) {
    console.error('清除登录信息失败:', error);
    return false;
  }
}

/**
 * 获取用户 ID（统一接口）
 * 无论是手机号登录还是微信登录，都返回相同的用户ID
 * @returns {string|null} 用户ID
 */
function getUserId() {
  try {
    const loginInfo = getLoginInfo();
    return loginInfo?.userId || null;
  } catch (error) {
    console.error('获取用户ID失败:', error);
    return null;
  }
}

/**
 * 获取登录方式
 * @returns {string|null} 登录方式 ('phone'|'wechat') 或 null
 */
function getLoginMethod() {
  try {
    const loginInfo = getLoginInfo();
    return loginInfo?.loginMethod || null;
  } catch (error) {
    console.error('获取登录方式失败:', error);
    return null;
  }
}

/**
 * 检查用户是否已认证
 * @returns {boolean}
 */
function isAuthenticated() {
  return getAuthenticatedUser() !== null && !isLoginExpired();
}

/**
 * 更新用户信息（同时更新本地存储和数据库）
 * @param {Object} updateData - 要更新的数据
 */
async function updateUserInfo(updateData) {
  try {
    const db = wx.cloud.database();
    const userId = getUserId();
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    // 过滤掉保留字段和系统字段
    const reservedFields = ['_id', '_openid', 'createTime'];
    const safeUpdateData = {};
    
    for (const key in updateData) {
      if (!reservedFields.includes(key) && key !== 'updateTime') {
        safeUpdateData[key] = updateData[key];
      }
    }
    
    // 如果没有可更新的字段，直接返回
    if (Object.keys(safeUpdateData).length === 0) {
      console.warn('没有可更新的字段');
      return wx.getStorageSync(config.storage.keys.userInfo);
    }
    
    // 更新数据库
    await db.collection(config.database.collections.users)
      .doc(userId)
      .update({
        data: {
          ...safeUpdateData,
          updateTime: db.serverDate()
        }
      });
    
    // 更新本地用户信息
    const userInfo = wx.getStorageSync(config.storage.keys.userInfo);
    const updatedUserInfo = { ...userInfo, ...safeUpdateData };
    wx.setStorageSync(config.storage.keys.userInfo, updatedUserInfo);
    
    return updatedUserInfo;
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
}

module.exports = {
  generateToken,
  saveLoginToken,
  getLoginToken,
  getLoginInfo,
  isLoginExpired,
  getAuthenticatedUser,
  refreshLoginToken,
  clearLogin,
  getUserId,
  getLoginMethod,
  isAuthenticated,
  updateUserInfo
};
