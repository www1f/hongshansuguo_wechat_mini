const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

/**
 * 用户注册云函数
 * @param {Object} event
 * @param {string} event.phone - 手机号
 * @param {string} event.password - 加密后的密码
 * @param {string} event.verifyCode - 验证码
 */
exports.main = async (event, context) => {
  const { phone, password, verifyCode } = event;
  const wxContext = cloud.getWXContext();

  // 1. 参数校验
  if (!phone || !password || !verifyCode) {
    return { success: false, message: '参数不完整' };
  }

  try {
    // 2. 校验验证码
    // 查询该手机号、未过期、未使用、且匹配验证码的记录
    const verifyResult = await db.collection('sms_codes')
      .where({
        phoneNumber: phone,
        code: verifyCode,
        used: false,
        expiresAt: _.gt(db.serverDate()) // 过期时间大于当前时间
      })
      .orderBy('createTime', 'desc')
      .limit(1)
      .get();

    if (verifyResult.data.length === 0) {
      return { success: false, message: '验证码错误或已过期' };
    }

    // 3. 校验手机号是否已注册
    const userCheck = await db.collection('users').where({
      phoneNumber: phone
    }).count();

    if (userCheck.total > 0) {
      return { success: false, message: '该手机号已注册' };
    }

    // 4. 标记验证码为已使用
    const codeId = verifyResult.data[0]._id;
    await db.collection('sms_codes').doc(codeId).update({
      data: { used: true }
    });

    // 5. 创建用户
    const createTime = db.serverDate();
    const addUserResult = await db.collection('users').add({
      data: {
        _openid: wxContext.OPENID, // 绑定微信 OpenID
        phoneNumber: phone,
        password: password, // 存储前端传来的密码（建议前端已加密）
        nickName: '用户' + phone.substring(7),
        avatarUrl: '',
        gender: 0, // 0: 未知, 1: 男, 2: 女
        email: '',
        createTime: createTime,
        updateTime: createTime
      }
    });

    // 6. 返回成功结果
    return {
      success: true,
      message: '注册成功',
      userId: addUserResult._id,
      userInfo: {
        _id: addUserResult._id,
        phoneNumber: phone,
        nickName: '用户' + phone.substring(7),
        avatarUrl: ''
      }
    };

  } catch (err) {
    console.error('注册失败:', err);
    return {
      success: false,
      message: '注册失败，系统繁忙',
      error: err
    };
  }
};