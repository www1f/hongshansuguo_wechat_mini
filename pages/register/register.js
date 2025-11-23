const db = wx.cloud.database()
const crypto = require('../../utils/crypto.js')
const config = require('../../utils/config.js')
const errorHandler = require('../../utils/error.js')
const auth = require('../../utils/auth.js')
const verificationCode = require('../../utils/verificationCode.js')

Page({
  data: {
    phone: '',
    verifyCode: '',
    password: '',
    confirmPassword: '',
    agreePolicy: false,
    codeSent: false,
    countDown: 60,
    phoneFocus: false,
    verifyCodeFocus: false,
    passwordFocus: false,
    confirmPasswordFocus: false
  },
  
  onLoad() {
    wx.setNavigationBarTitle({
      title: '注册'
    });
  },
  
  // 焦点控制
  focusPhone() {
    this.setData({
      phoneFocus: true,
      verifyCodeFocus: false,
      passwordFocus: false,
      confirmPasswordFocus: false
    });
  },
  
  focusVerifyCode() {
    this.setData({
      phoneFocus: false,
      verifyCodeFocus: true,
      passwordFocus: false,
      confirmPasswordFocus: false
    });
  },
  
  focusPassword() {
    this.setData({
      phoneFocus: false,
      verifyCodeFocus: false,
      passwordFocus: true,
      confirmPasswordFocus: false
    });
  },
  
  focusConfirmPassword() {
    this.setData({
      phoneFocus: false,
      verifyCodeFocus: false,
      passwordFocus: false,
      confirmPasswordFocus: true
    });
  },
  
  blurInput() {
    this.setData({
      phoneFocus: false,
      verifyCodeFocus: false,
      passwordFocus: false,
      confirmPasswordFocus: false
    });
  },
  
  inputPhone(e) {
    this.setData({
      phone: e.detail.value
    });
  },
  
  inputVerifyCode(e) {
    this.setData({
      verifyCode: e.detail.value
    });
  },
  
  inputPassword(e) {
    this.setData({
      password: e.detail.value
    });
  },
  
  inputConfirmPassword(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },
  
  // 密码输入框处理函数
  handlePasswordTap() {
    this.setData({
      passwordFocus: true,
      phoneFocus: false,
      verifyCodeFocus: false,
      confirmPasswordFocus: false
    });
  },
  
  handlePasswordFocus() {
    this.setData({
      passwordFocus: true,
      phoneFocus: false,
      verifyCodeFocus: false,
      confirmPasswordFocus: false
    });
  },
  
  handlePasswordBlur() {
    // 不立即取消focus状态，避免快速切换时的闪烁问题
  },
  
  // 确认密码输入框处理函数
  handleConfirmPasswordTap() {
    this.setData({
      confirmPasswordFocus: true,
      phoneFocus: false,
      verifyCodeFocus: false,
      passwordFocus: false
    });
  },
  
  handleConfirmPasswordFocus() {
    this.setData({
      confirmPasswordFocus: true,
      phoneFocus: false,
      verifyCodeFocus: false,
      passwordFocus: false
    });
  },
  
  handleConfirmPasswordBlur() {
    // 不立即取消focus状态，避免快速切换时的闪烁问题
  },
  
  switchAgreePolicy() {
    this.setData({
      agreePolicy: !this.data.agreePolicy
    });
  },
  
  startCountDown() {
    const timer = setInterval(() => {
      if (this.data.countDown > 0) {
        this.setData({
          countDown: this.data.countDown - 1
        });
      } else {
        clearInterval(timer);
        this.setData({
          codeSent: false,
          countDown: 60
        });
      }
    }, 1000);
  },
  
  async sendVerifyCode() {
    const { phone } = this.data;
    
    if (!phone) {
      errorHandler.showWarning('请输入手机号');
      return;
    }
    
    if (!/^1\d{10}$/.test(phone)) {
      errorHandler.showWarning('手机号格式不正确');
      return;
    }
    
    errorHandler.showLoading('发送中...');
    
    try {
      // 使用新的验证码模块发送验证码
      const result = await verificationCode.sendVerificationCode(phone, 'register');
      
      if (result.success) {
        this.setData({
          codeSent: true
        });
        
        errorHandler.showSuccess('验证码已发送');
        this.startCountDown();
      } else {
        errorHandler.showWarning(result.message || '发送失败');
      }
    } catch (error) {
      errorHandler.handleError(error, '发送验证码失败');
    } finally {
      errorHandler.hideLoading();
    }
  },
  
  register() {
    const { phone, verifyCode, password, confirmPassword, agreePolicy } = this.data;
    
    if (!agreePolicy) {
      errorHandler.showWarning('请同意用户协议和隐私政策');
      return;
    }
    
    if (!phone || !verifyCode || !password || !confirmPassword) {
      errorHandler.showWarning('请填写完整信息');
      return;
    }
    
    if (!/^1\d{10}$/.test(phone)) {
      errorHandler.showWarning('手机号格式不正确');
      return;
    }
    
    if (password.length < config.business.passwordMinLength || password.length > config.business.passwordMaxLength) {
      errorHandler.showWarning(`密码长度需在 ${config.business.passwordMinLength}-${config.business.passwordMaxLength} 字符之间`);
      return;
    }
    
    if (password !== confirmPassword) {
      errorHandler.showWarning('两次密码输入不一致');
      return;
    }

    errorHandler.showLoading('注册中...');
    
    // 加密密码
    const encryptedPassword = crypto.encryptPassword(password, phone);

    // 调用云函数进行注册
    wx.cloud.callFunction({
      name: 'register',
      data: {
        phone: phone,
        password: encryptedPassword,
        verifyCode: verifyCode
      }
    }).then(res => {
      errorHandler.hideLoading();
      const result = res.result;
      
      if (result.success) {
        errorHandler.showSuccess('注册成功');
        
        // 构建用户数据对象
        const userData = result.userInfo;
        
        // 保存登录状态
        auth.saveLoginToken(userData, 'phone');
        
        // 跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);
      } else {
        errorHandler.showWarning(result.message || '注册失败');
      }
    }).catch(err => {
      errorHandler.hideLoading();
      errorHandler.handleError(err, '注册请求失败');
    });
  },

  goToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    });
  },
  
  handleBack() {
    wx.navigateBack();
  }
}); 