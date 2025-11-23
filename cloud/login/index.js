const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 用户登录云函数
 * @param {Object} event
 * @param {string} event.phone - 手机号
 * @param {string} event.password - 加密后的密码
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
    // 前端已经进行了加密，这里直接比对数据库中的加密密码
    if (password !== userData.password) {
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