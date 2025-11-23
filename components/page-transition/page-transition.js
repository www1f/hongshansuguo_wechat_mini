Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    }
  },
  data: {
    animationData: {}
  },
  lifetimes: {
    attached() {
      // 在组件实例进入页面节点树时执行
    }
  },
  methods: {
    // 显示加载动画
    showLoading() {
      this.setData({
        show: true
      });
    },
    // 隐藏加载动画
    hideLoading() {
      this.setData({
        show: false
      });
    }
  }
}) 