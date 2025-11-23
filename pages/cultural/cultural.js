const cloudImage = require('../../utils/cloudImage.js')

Page({
  data: {
    culturalItems: [],
    loading: true
  },
  
  async onLoad() {
    try {
      // 从云数据库获取文物信息
      const db = wx.cloud.database();
      const result = await db.collection('cultural')
        .orderBy('createTime', 'desc')
        .get();

      if (result.data && result.data.length > 0) {
        // 获取文物图片的临时链接
        const fileIDs = result.data.map(item => item.image);
        const tempFileURLs = await cloudImage.batchGetTempFileURL(fileIDs);

        // 更新文物数据，添加图片临时链接
        const culturalItems = result.data.map((item, index) => ({
          ...item,
          image: tempFileURLs[index]
        }));

        this.setData({
          culturalItems,
          loading: false
        });
      } else {
        this.setData({
          culturalItems: [],
          loading: false
        });
      }
    } catch (error) {
      console.error('获取文物信息失败：', error);
      wx.showToast({
        title: '获取文物信息失败',
        icon: 'error'
      });
      this.setData({
        loading: false
      });
    }

    wx.setNavigationBarTitle({
      title: '文物展示'
    })
  },
  
  // 查看文物详情
  viewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/culturalDetail/culturalDetail?id=${id}`
    });
  },

  // 图片加载错误处理
  onImageError(e) {
    console.warn('图片加载失败:', e);
    // 可以在这里设置默认图片或隐藏图片
  },

  // 下拉刷新
  async onPullDownRefresh() {
    try {
      const db = wx.cloud.database();
      const result = await db.collection('cultural')
        .orderBy('createTime', 'desc')
        .get();

      if (result.data && result.data.length > 0) {
        const fileIDs = result.data.map(item => item.image);
        const tempFileURLs = await cloudImage.batchGetTempFileURL(fileIDs);

        const culturalItems = result.data.map((item, index) => ({
          ...item,
          image: tempFileURLs[index]
        }));

        this.setData({
          culturalItems
        });
      }

      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
    } catch (error) {
      console.error('刷新文物信息失败：', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'error'
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  }
}); 