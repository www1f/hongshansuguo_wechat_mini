Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    back: {
      type: Boolean,
      value: true
    },
    customStyle: {
      type: String,
      value: ''
    }
  },
  data: {
    statusBarHeight: 0
  },
  lifetimes: {
    attached() {
      const systemInfo = wx.getSystemInfoSync()
      this.setData({
        statusBarHeight: systemInfo.statusBarHeight
      })
    }
  },
  methods: {
    handleBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack({
          delta: 1
        });
      } else {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }
    }
  }
}) 