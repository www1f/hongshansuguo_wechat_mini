/**
 * 验证码服务模块
 * 支持真实验证码服务（阿里云、腾讯云等）和开发环境模拟
 */

const config = require('./config.js');

/**
 * 发送验证码
 * @param {string} phoneNumber - 手机号
 * @param {string} codeType - 验证码类型: 'register', 'login', 'reset'
 * @returns {Promise<Object>} { success: boolean, message: string, requestId?: string }
 */
async function sendVerificationCode(phoneNumber, codeType = 'register') {
  try {
    // 验证手机号格式
    if (!phoneNumber || !/^1\d{10}$/.test(phoneNumber)) {
      return {
        success: false,
        message: '手机号格式不正确'
      };
    }

    // 获取当前环境
    const isDev = config.environment === 'development';
    const forceReal = config.sms && config.sms.forceRealInDev;

    if (isDev && !forceReal) {
      // 开发环境且未强制真实发送：使用模拟验证码
      return await sendMockCode(phoneNumber, codeType);
    } else {
      // 生产环境或强制真实发送：使用真实服务
      return await sendRealCode(phoneNumber, codeType);
    }
  } catch (error) {
    console.error('发送验证码失败:', error);
    return {
      success: false,
      message: '发送验证码失败，请稍后重试'
    };
  }
}

/**
 * 验证码是否正确
 * @param {string} phoneNumber - 手机号
 * @param {string} code - 用户输入的验证码
 * @returns {Promise<Object>} { valid: boolean, message: string }
 */
async function verifyCode(phoneNumber, code) {
  try {
    const isDev = config.environment === 'development';

    if (isDev) {
      return await verifyMockCode(phoneNumber, code);
    } else {
      return await verifyRealCode(phoneNumber, code);
    }
  } catch (error) {
    console.error('验证码验证失败:', error);
    return {
      valid: false,
      message: '验证失败，请重试'
    };
  }
}

/**
 * 开发环境：模拟验证码
 * 在实际开发中可以使用固定验证码（如111111）
 */
async function sendMockCode(phoneNumber, codeType) {
  try {
    // 生成随机6位数字验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 保存到本地存储用于验证
    const mockKey = `mock_code:${phoneNumber}`;
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10分钟有效期
    
    const mockCodeData = {
      code,
      expiresAt,
      codeType,
      attempts: 0
    };

    // 在微信小程序中保存到本地存储
    try {
      wx.setStorageSync(mockKey, mockCodeData);
    } catch (e) {
      console.warn('本地存储失败，使用内存存储');
      // 使用全局变量作为备选方案
      if (!wx.mockCodes) {
        wx.mockCodes = {};
      }
      wx.mockCodes[mockKey] = mockCodeData;
    }

    console.log(`[DEV] 验证码已发送到 ${phoneNumber}: ${code}`);

    return {
      success: true,
      message: '验证码已发送',
      code: code, // 开发环境下返回验证码方便测试
      expiresAt: expiresAt
    };
  } catch (error) {
    return {
      success: false,
      message: '模拟验证码生成失败'
    };
  }
}

/**
 * 开发环境：验证模拟验证码
 */
async function verifyMockCode(phoneNumber, code) {
  try {
    const mockKey = `mock_code:${phoneNumber}`;
    
    // 先从本地存储读取
    let mockCodeData = null;
    try {
      mockCodeData = wx.getStorageSync(mockKey);
    } catch (e) {
      // 尝试从内存中读取
      if (wx.mockCodes && wx.mockCodes[mockKey]) {
        mockCodeData = wx.mockCodes[mockKey];
      }
    }

    if (!mockCodeData) {
      return {
        valid: false,
        message: '验证码已过期或不存在'
      };
    }

    // 检查是否过期
    if (mockCodeData.expiresAt < Date.now()) {
      // 清除过期的验证码
      try {
        wx.removeStorageSync(mockKey);
      } catch (e) {
        if (wx.mockCodes) delete wx.mockCodes[mockKey];
      }
      return {
        valid: false,
        message: '验证码已过期'
      };
    }

    // 检查尝试次数（防止暴力破解）
    if (mockCodeData.attempts >= 5) {
      return {
        valid: false,
        message: '尝试次数过多，请重新申请验证码'
      };
    }

    // 验证码正确
    if (mockCodeData.code === code) {
      // 清除已使用的验证码
      try {
        wx.removeStorageSync(mockKey);
      } catch (e) {
        if (wx.mockCodes) delete wx.mockCodes[mockKey];
      }
      return {
        valid: true,
        message: '验证码正确'
      };
    } else {
      // 增加尝试次数
      mockCodeData.attempts += 1;
      try {
        wx.setStorageSync(mockKey, mockCodeData);
      } catch (e) {
        if (wx.mockCodes) wx.mockCodes[mockKey] = mockCodeData;
      }
      return {
        valid: false,
        message: `验证码错误，还有 ${5 - mockCodeData.attempts} 次尝试机会`
      };
    }
  } catch (error) {
    return {
      valid: false,
      message: '验证失败，请重试'
    };
  }
}

/**
 * 生产环境：调用真实验证码服务
 * 支持：阿里云、腾讯云、华为云等
 */
async function sendRealCode(phoneNumber, codeType) {
  try {
    // 选择验证码服务提供商
    const provider = config.sms?.provider || 'aliyun';

    switch (provider) {
      case 'aliyun':
        return await sendAliyunCode(phoneNumber, codeType);
      case 'tencent':
        return await sendTencentCode(phoneNumber, codeType);
      case 'huawei':
        return await sendHuaweiCode(phoneNumber, codeType);
      case 'market':
        return await sendMarketCode(phoneNumber, codeType);
      default:
        return {
          success: false,
          message: '不支持的验证码服务提供商'
        };
    }
  } catch (error) {
    return {
      success: false,
      message: '发送验证码失败'
    };
  }
}

/**
 * 云市场短信服务
 */
async function sendMarketCode(phoneNumber, codeType) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'sendSMS',
      data: {
        provider: 'market',
        phoneNumber,
        codeType
      }
    });

    if (result.result.success) {
      return {
        success: true,
        message: '验证码已发送',
        requestId: result.result.requestId
      };
    } else {
      return {
        success: false,
        message: result.result.message || '发送失败'
      };
    }
  } catch (error) {
    console.error('云市场短信调用失败:', error);
    return {
      success: false,
      message: '发送失败，请稍后重试'
    };
  }
}

/**
 * 阿里云短信服务
 */
async function sendAliyunCode(phoneNumber, codeType) {
  try {
    // 调用微信云函数来处理阿里云API调用
    const result = await wx.cloud.callFunction({
      name: 'sendSMS',
      data: {
        provider: 'aliyun',
        phoneNumber,
        codeType
      }
    });

    if (result.result.success) {
      return {
        success: true,
        message: '验证码已发送',
        requestId: result.result.requestId
      };
    } else {
      return {
        success: false,
        message: result.result.message || '发送失败'
      };
    }
  } catch (error) {
    console.error('阿里云验证码发送失败:', error);
    return {
      success: false,
      message: '发送验证码失败'
    };
  }
}

/**
 * 腾讯云短信服务
 */
async function sendTencentCode(phoneNumber, codeType) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'sendSMS',
      data: {
        provider: 'tencent',
        phoneNumber,
        codeType
      }
    });

    if (result.result.success) {
      return {
        success: true,
        message: '验证码已发送',
        requestId: result.result.requestId
      };
    } else {
      return {
        success: false,
        message: result.result.message || '发送失败'
      };
    }
  } catch (error) {
    console.error('腾讯云验证码发送失败:', error);
    return {
      success: false,
      message: '发送验证码失败'
    };
  }
}

/**
 * 华为云短信服务
 */
async function sendHuaweiCode(phoneNumber, codeType) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'sendSMS',
      data: {
        provider: 'huawei',
        phoneNumber,
        codeType
      }
    });

    if (result.result.success) {
      return {
        success: true,
        message: '验证码已发送',
        requestId: result.result.requestId
      };
    } else {
      return {
        success: false,
        message: result.result.message || '发送失败'
      };
    }
  } catch (error) {
    console.error('华为云验证码发送失败:', error);
    return {
      success: false,
      message: '发送验证码失败'
    };
  }
}

/**
 * 生产环境：验证真实验证码
 */
async function verifyRealCode(phoneNumber, code) {
  try {
    const result = await wx.cloud.callFunction({
      name: 'verifySMS',
      data: {
        phoneNumber,
        code
      }
    });

    return {
      valid: result.result.valid,
      message: result.result.message
    };
  } catch (error) {
    return {
      valid: false,
      message: '验证失败'
    };
  }
}

module.exports = {
  sendVerificationCode,
  verifyCode,
  // 导出内部函数供测试使用
  sendMockCode,
  verifyMockCode
};
