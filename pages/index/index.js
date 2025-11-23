// index.js
// 获取应用实例
const app = getApp()
const cloudImage = require('../../utils/cloudImage.js')
const storyService = require('../../utils/storyService.js')

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    swiperCurrent: 0,
    swiperList: [],
    navIcons: [],
    stories: [],
    loading: false
  },
  
  // 页面加载
  async onLoad() {
    this.setData({ loading: true });
    
    try {
      // 获取推荐故事
      const featuredStories = await storyService.getFeaturedStories(2);
      this.setData({ stories: featuredStories });
      
      // 获取轮播图图片
      const bannerFileIDs = [
        'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/banners/banner_001.jpg',
        'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/banners/banner_002.jpg',
        'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/banners/banner_003.jpg',
        'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/banners/banner_004.jpg',
        'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/banners/banner_005.jpg'
      ];
      
      // 获取导航图标图片
      const navIconFileIDs = [
        'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/icons/新闻.png',
        'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/icons/活动预约.png',
        'cloud://cloud1-4gs4byk3b4e9d2d2.636c-cloud1-4gs4byk3b4e9d2d2-1329424972/images/icons/地图打卡.png'
      ];
      
      // 获取轮播图临时链接
      const bannerURLs = await cloudImage.batchGetTempFileURL(bannerFileIDs);
      const swiperList = bannerFileIDs.map((fileID, index) => ({
        id: index,
        title: ['泽雅风光', '红色故事', '特色产品', '乡村振兴', '精品推荐'][index],
        bgColor: ['#FFA07A', '#FF7F50', '#FF6347', '#FF4500', '#B22222'][index],
        path: bannerURLs[index]
      }));
      
      // 获取导航图标临时链接
      const navIconURLs = await cloudImage.batchGetTempFileURL(navIconFileIDs);
      const navIcons = navIconURLs.map(url => ({ path: url }));
      
      this.setData({
        swiperList,
        navIcons,
        loading: false
      });
    } catch (error) {
      console.error('加载数据失败:', error);
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      });
      this.setData({ loading: false });
    }
    
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },

  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  // 轮播图切换事件
  swiperChange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

  // 跳转到新闻页面
  navigateToNews: function() {
    wx.navigateTo({
      url: '../news/news'
    })
  },

  // 跳转到活动页面
  navigateToActivity: function() {
    wx.navigateTo({
      url: '../activity/activity'
    })
  },

  // 跳转到地图页面
  navigateToMap: function() {
    wx.navigateTo({
      url: '../map/map'
    })
  },

  // 跳转到更多红色故事页面
  navigateToRedStories: function() {
    wx.navigateTo({
      url: '../redStories/redStories'
    })
  },
  
  // 显示故事详情
  showStoryDetail: function(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `../storyDetail/storyDetail?id=${id}`
    })
  },

  loadStories: function() {
    const db = wx.cloud.database();
    db.collection('stories').get({
      success: res => {
        this.setData({
          stories: res.data
        });
      },
      fail: err => {
        console.error('获取故事列表失败：', err);
        wx.showToast({
          title: '获取故事列表失败',
          icon: 'none'
        });
      }
    });
  }
})