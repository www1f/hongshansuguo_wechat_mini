const cloud = require('wx-server-sdk');
const crypto = require('crypto');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

// 密钥，必须与前端 utils/crypto.js 中的保持一致
const SECRET_KEY = 'RedMountainBareBeauty#2025@Security';

/**
 * MD5 哈希辅助函数
 */
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * 验证密码逻辑
 * 算法: MD5(MD5(password) + MD5(phoneNumber + secretKey))
 */
function verifyPassword(inputPassword, storedPassword, phoneNumber) {
  // 1. 第一层 MD5 (前端传来的 password 应该是明文，这里模拟前端的加密逻辑)
  // 注意：如果前端传的是明文，这里需要做完整的双层加密
  // 如果前端传的是已经经过第一层加密的，这里逻辑要调整
  // 根据 utils/crypto.js，前端 encryptPassword 是接收明文密码的。
  // 所以云函数这里也接收明文密码进行比对。
  
  const firstHash = md5(inputPassword);
  const salt = md5(phoneNumber + SECRET_KEY);
  const calculatedHash = md5(firstHash + salt);
  
  return calculatedHash === storedPassword;
}

/**
 * 用户登录云函数
 * @param {Object} event
 * @param {string} event.phone - 手机号
 * @param {string} event.password - 明文密码
 */
exports.main = async (event, context) => {
  const { phone, password } = event;
  const wxContext = cloud.getWXContext();

  if (!phone || !password) {
    return { success: false, message: '用户名或密码不能为空' };
  }

  try {
    // 1. 查询用户
    const userRes = await db.collection('users').where({
      phoneNumber: phone
    }).get();

    if (userRes.data.length === 0) {
      return { success: false, message: '用户名或密码错误' };
    }

    const userData = userRes.data[0];

    // 2. 验证密码
    // 注意：这里假设前端传的是明文密码。
    // 为了安全，建议前端传输时可以使用 HTTPS 保护，或者前端只做一次 MD5，后端做二次 MD5。
    // 但为了兼容现有逻辑（utils/crypto.js），我们在这里复现完整的加密比对。
    const isValid = verifyPassword(password, userData.password, phone);

    if (!isValid) {
      return { success: false, message: '用户名或密码错误' };
    }

    // 3. 登录成功，返回用户信息
    // 不返回密码字段
    delete userData.password;
    
    // 补充 openid (如果数据库里没有，可以顺便更新进去，或者直接返回)
    if (!userData._openid) {
      userData._openid = wxContext.OPENID;
      // 异步更新 openid
      db.collection('users').doc(userData._id).update({
        data: { _openid: wxContext.OPENID }
      }).catch(console.error);
    }

    return {
      success: true,
      message: '登录成功',
      userInfo: userData
    };

  } catch (err) {
    console.error('登录失败:', err);
    return {
      success: false,
      message: '登录失败，系统繁忙',
      error: err
    };
  }
};