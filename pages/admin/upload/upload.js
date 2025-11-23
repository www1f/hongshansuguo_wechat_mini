const cloudUpload = require('../../../utils/cloudUpload.js');

Page({
  data: {
    uploadResults: [],
    isUploading: false
  },

  // 上传文物图片
  async uploadCultural() {
    this.setData({ isUploading: true });
    try {
      const results = await cloudUpload.uploadCulturalImages([
        '/images/cultural/discover.png'
      ]);
      this.setData({ uploadResults: results });
      wx.showToast({
        title: '文物图片上传完成',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '上传失败',
        icon: 'error'
      });
    } finally {
      this.setData({ isUploading: false });
    }
  },

  // 上传图标
  async uploadIcons() {
    this.setData({ isUploading: true });
    try {
      const results = await cloudUpload.uploadIcons([
        { path: '/images/icons/service.png', name: 'service.png' },
        { path: '/images/icons/feedback.png', name: 'feedback.png' },
        { path: '/images/icons/order.png', name: 'order.png' },
        { path: '/images/icons/appointment.png', name: 'appointment.png' },
        { path: '/images/icons/arrow-right.png', name: 'arrow-right.png' },
        { path: '/images/icons/cart.png', name: 'cart.png' },
        { path: '/images/icons/返回.png', name: '返回.png' },
        { path: '/images/icons/empty-cart.png', name: 'empty-cart.png' }
      ]);
      this.setData({ uploadResults: results });
      wx.showToast({
        title: '图标上传完成',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '上传失败',
        icon: 'error'
      });
    } finally {
      this.setData({ isUploading: false });
    }
  },

  // 上传用户头像
  async uploadAvatar() {
    this.setData({ isUploading: true });
    try {
      const results = await cloudUpload.uploadFile(
        '/images/default-avatar.png',
        'images/avatars/',
        'default.png'
      );
      this.setData({ uploadResults: [results] });
      wx.showToast({
        title: '头像上传完成',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: '上传失败',
        icon: 'error'
      });
    } finally {
      this.setData({ isUploading: false });
    }
  }
}); 