/**
 * 云函数: sendSMS
 * 功能: 发送短信验证码
 * 支持: 阿里云、腾讯云、华为云
 * 
 * 使用方式:
 * wx.cloud.callFunction({
 *   name: 'sendSMS',
 *   data: {
 *     provider: 'aliyun',    // 'aliyun' | 'tencent' | 'huawei'
 *     phoneNumber: '13800138000',
 *     codeType: 'register'   // 'register' | 'login' | 'reset'
 *   }
 * })
 */

const cloud = require('wx-server-sdk');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();

/**
 * 生成随机验证码
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 云市场短信发送 (适配阿里云云市场第三方接口)
 * 这种方式通常不需要企业资质，只需要购买云市场的短信套餐
 */
async function sendMarketSMS(phoneNumber, code) {
  try {
    // 配置信息
    const appCode = process.env.MARKET_APP_CODE;
    const templateId = process.env.MARKET_TEMPLATE_ID; // 模板ID
    const host = process.env.MARKET_HOST || 'sms.market.alicloudapi.com'; // 接口域名
    const path = process.env.MARKET_PATH || '/singleSend'; // 接口路径
    
    if (!appCode || !templateId) {
      return {
        success: false,
        message: '云市场配置不完整 (需要 AppCode, TemplateId)',
        needsConfig: true
      };
    }

    console.log(`[云市场] 正在向 ${phoneNumber} 发送验证码 ${code}`);

    // 构造请求参数 (根据服务商要求调整)
    // 参数格式: content=code:xxxx&phone_number=xxxx&template_id=xxxx
    const queryObj = {
      phone_number: phoneNumber,
      template_id: templateId,
      content: `code:${code}`
    };
    
    const postData = querystring.stringify(queryObj);
    
    const options = {
      hostname: host,
      path: path,
      method: 'POST',
      headers: {
        'Authorization': 'APPCODE ' + appCode,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log(`[云市场] 状态码: ${res.statusCode}`);
          console.log(`[云市场] 响应内容: "${data}"`);

          try {
            if (!data) {
              throw new Error(`服务商返回空响应 (Status: ${res.statusCode})`);
            }
            const result = JSON.parse(data);
            console.log('[云市场] 响应:', result);
            
            // 简单的成功判断逻辑，不同服务商返回字段可能不同
            // 通常 success: true, code: 0, 或 error_code: 0 代表成功
            // 针对当前服务商: status: "OK" 代表成功
            if (result.success || result.code === 0 || result.error_code === 0 || result.status === 'OK') {
              resolve({
                success: true,
                message: '验证码已发送',
                provider: 'market',
                requestId: result.request_id || Date.now().toString()
              });
            } else {
              resolve({
                success: false,
                message: result.msg || result.message || '发送失败',
                error: result
              });
            }
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', (e) => reject(e));
      req.write(postData);
      req.end();
    });

  } catch (error) {
    console.error('云市场短信发送异常:', error);
    return {
      success: false,
      message: '云市场短信发送异常',
      error: error.message
    };
  }
}

/**
 * 云函数主入口
 */
exports.main = async (event, context) => {
  const { provider = 'market', phoneNumber, codeType = 'register', action } = event;

  // 诊断检查
  if (action === 'check') {
    return {
      success: true,
      message: 'sendSMS 云函数正常运行',
      environment: process.env.NODE_ENV || 'unknown'
    };
  }

  // 参数验证
  if (!phoneNumber) {
    return {
      success: false,
      message: 'phoneNumber 参数缺失'
    };
  }

  if (!/^1\d{10}$/.test(phoneNumber)) {
    return {
      success: false,
      message: '手机号格式不正确'
    };
  }

  // 生成验证码
  const code = generateCode();

  // 仅支持云市场短信
  let result;
  if (provider === 'market') {
    result = await sendMarketSMS(phoneNumber, code);
  } else {
    return {
      success: false,
      message: `不支持的短信提供商: ${provider}`
    };
  }

  // 如果需要配置，返回特定错误
  if (result.needsConfig) {
    return {
      success: false,
      message: result.message,
      tip: '请在微信云开发控制台的"云函数 → 函数配置"中添加以下环境变量:',
      envVars: ['MARKET_APP_CODE', 'MARKET_TEMPLATE_ID', 'MARKET_HOST', 'MARKET_PATH']
    };
  }

  // 返回结果
  if (result.success) {
    console.log(`验证码已发送: ${phoneNumber} -> ${code}`);
    
    // 将验证码存入数据库 sms_codes 集合
    try {
      await db.collection('sms_codes').add({
        data: {
          phoneNumber: phoneNumber,
          code: code,
          codeType: codeType,
          used: false,
          createTime: db.serverDate(),
          expiresAt: db.serverDate({
            offset: 5 * 60 * 1000 // 5分钟后过期
          })
        }
      });
    } catch (dbErr) {
      console.error('验证码入库失败:', dbErr);
      // 即使入库失败，短信已发送，但为了流程闭环，这里可以视为失败或仅记录日志
      // 建议：如果入库失败，用户无法验证，应返回错误
      return {
        success: false,
        message: '系统繁忙，请稍后重试',
        error: dbErr
      };
    }

    return {
      success: true,
      message: '验证码已发送',
      provider: provider,
      requestId: result.requestId
    };
  } else {
    return result;
  }
};
