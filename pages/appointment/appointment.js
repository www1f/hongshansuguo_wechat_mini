Page({
  data: {
    appointments: []
  },

  onLoad() {
    this.getAppointments()
  },

  // 获取预约列表
  getAppointments() {
    // 这里可以从云数据库获取预约数据
    // 示例数据
    const appointments = []
    this.setData({ appointments })
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.getAppointments()
    wx.stopPullDownRefresh()
  },

  // 确认预约
  confirmAppointment(e) {
    const index = e.currentTarget.dataset.index
    const appointmentList = this.data.appointmentList
    
    wx.showModal({
      title: '提示',
      content: '确定要确认这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          appointmentList[index].status = '已确认'
          this.setData({
            appointmentList: appointmentList
          })
          wx.showToast({
            title: '预约已确认',
            icon: 'success'
          })
        }
      }
    })
  }
}) 