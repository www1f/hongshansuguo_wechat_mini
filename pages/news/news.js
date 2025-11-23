// pages/news/news.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newsList: [],
    loading: false,
    isBottom: false,
    needRefresh: false // 添加标记是否需要刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '新闻资讯'
    });
    this.loadNewsData();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时检查是否需要刷新数据
    if (this.data.needRefresh) {
      this.loadNewsData();
      this.setData({
        needRefresh: false
      });
    }
  },

  /**
   * 从news获取新闻数据
   */
  loadNewsData: function() {
    const that = this
    const db = wx.cloud.database()
    
    this.setData({
      loading: true
    });
    
    // 查询news集合中的所有数据
    db.collection('news').get({
      success: function(res) {
        
        // 将查询到的数据转换为newsList需要的格式
        const formattedNews = res.data.map(item => {
          return {
            id: item._id, // 使用数据库中的_id
            title: item.title || '', 
            image: item.image || '',
            date: item.date || '',
            source: item.source || '未知', // 使用数据库中的source，如果为空则使用默认值
            intro: item.intro || '',
            bgColor: '#e74c3c',
            views: Math.floor(item.views) || 0 // 确保views是整数
          }
        })
        
        // 更新页面数据
        that.setData({
          newsList: formattedNews,
          loading: false
        })
        
      },
      fail: function(err) {
        console.error('数据库查询失败', err)
        wx.showToast({
          title: '数据加载失败',
          icon: 'none'
        })
        that.setData({
          loading: false
        });
      }
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({
      loading: true
    });
    
    // 重新加载数据
    this.loadNewsData();
    
    // 停止下拉刷新
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.isBottom) return;
    
    this.setData({
      loading: true
    });
    
    // 模拟加载更多
    setTimeout(() => {
      this.setData({
        isBottom: true,
        loading: false
      });
    }, 800);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '泽雅文旅资讯',
      path: '/pages/news/news'
    };
  },

  // 查看新闻详情
  viewNewsDetail(e) {
    const id = e.currentTarget.dataset.id;
    // 设置需要刷新的标记
    this.setData({
      needRefresh: true
    });
    wx.navigateTo({
      url: `/pages/newsDetail/newsDetail?id=${id}`
    });
  },
  
  // 处理返回按钮点击
  handleBack() {
    wx.navigateBack();
  }
})
