/**
 * 错误处理工具
 * 统一处理各种错误情况
 */

const errorMessages = {
  // 网络错误
  NETWORK_ERROR: '网络连接失败，请检查您的网络',
  NETWORK_TIMEOUT: '网络请求超时，请稍后重试',
  
  // 认证错误
  AUTH_FAILED: '认证失败，请重新登录',
  SESSION_EXPIRED: '登录已过期，请重新登录',
  UNAUTHORIZED: '您没有权限执行此操作',
  
  // 数据库错误
  DB_ERROR: '数据库操作失败，请稍后重试',
  RECORD_NOT_FOUND: '记录不存在',
  RECORD_EXISTS: '记录已存在',
  
  // 文件错误
  FILE_NOT_FOUND: '文件不存在',
  FILE_UPLOAD_FAILED: '文件上传失败',
  FILE_DOWNLOAD_FAILED: '文件下载失败',
  
  // 参数错误
  INVALID_PARAMS: '参数有误，请检查输入',
  MISSING_PARAMS: '缺少必要参数',
  
  // 业务错误
  PHONE_ALREADY_REGISTERED: '该手机号已被注册',
  PHONE_NOT_FOUND: '未找到该手机号对应的用户',
  PASSWORD_MISMATCH: '密码不匹配',
  OLD_PASSWORD_ERROR: '旧密码错误',
  
  // 系统错误
  SYSTEM_ERROR: '系统错误，请稍后重试',
  UNKNOWN_ERROR: '未知错误，请稍后重试'
};

/**
 * 处理错误并显示提示
 * @param {Error|Object} error - 错误对象
 * @param {string} customMessage - 自定义错误信息
 * @param {boolean} showToast - 是否显示 Toast 提示
 */
function handleError(error, customMessage = '', showToast = true) {
  let message = customMessage || errorMessages.SYSTEM_ERROR;
  
  // 根据错误类型获取对应的消息
  if (error) {
    if (error.message) {
      // 检查是否是已知的错误类型
      if (error.message in errorMessages) {
        message = errorMessages[error.message];
      } else {
        message = error.message;
      }
    } else if (error.errMsg) {
      // 微信 API 返回的错误
      if (error.errMsg.includes('fail')) {
        message = errorMessages.NETWORK_ERROR;
      }
    }
  }
  
  // 输出到控制台用于调试
  console.error('[Error]', error);
  console.error('[Message]', message);
  
  // 显示 Toast 提示
  if (showToast) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2000
    });
  }
  
  return message;
}

/**
 * 显示成功消息
 * @param {string} message - 成功消息
 */
function showSuccess(message = '操作成功') {
  wx.showToast({
    title: message,
    icon: 'success',
    duration: 2000
  });
}

/**
 * 显示警告消息
 * @param {string} message - 警告消息
 */
function showWarning(message = '警告') {
  wx.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}

/**
 * 显示加载状态
 * @param {string} message - 加载消息
 */
function showLoading(message = '加载中...') {
  wx.showLoading({
    title: message,
    mask: true
  });
}

/**
 * 隐藏加载状态
 */
function hideLoading() {
  wx.hideLoading();
}

module.exports = {
  errorMessages,
  handleError,
  showSuccess,
  showWarning,
  showLoading,
  hideLoading
};
