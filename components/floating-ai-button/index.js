Component({
  properties: {
    // 悬浮球位置
    position: {
      type: String,
      value: 'right-bottom' // 默认右下角 (可选: left-bottom)
    }
  },

  data: {
    showDialog: false,
    inputText: '',
    messages: [],
    // 预设回答库
    replyPool: [
      "这是一个有趣的提问，让我思考一下...",
      "根据我的分析，可能是这样的：这种情况通常建议先检查基础配置，再尝试重新操作。",
      "很抱歉，我暂时无法理解这个问题，请换种方式提问或者提供更多细节。",
      "已记录您的需求，建议尝试以下步骤：1.重启应用 2.检查网络 3.清除缓存",
      "感谢提问！这是常见问题，解决方法是在设置中调整相关参数。",
      "我正在学习这个领域，暂时没有完美答案，但我可以继续查找相关信息。",
      "您的问题已收到，这需要一些背景知识，让我组织一下思路...",
      "这个问题比较复杂，涉及多个方面。简单来说，关键点在于系统的整体协调。"
    ],
    // 关键词响应映射
    keywordResponses: {
      '你好': ["你好！有什么我能帮助你的吗？", "你好呀！今天有什么问题想问我？"],
      '帮助': ["我可以回答问题、提供建议，试着问我问题吧！", "需要帮助吗？请告诉我你想了解什么？"],
      '功能': ["我可以模拟以下功能：\n1. 回答问题\n2. 提供建议\n3. 闲聊解闷", "我的功能包括：问答、建议和聊天，都是模拟的哦~"],
      '谢谢': ["不客气！随时为您服务~", "很高兴能帮到你！还有其他问题吗？"]
    },
    isTyping: false,
    // 拖拽相关数据
    x: 0,
    y: 0,
    buttonLeft: 20, // 初始位置，右下角
    buttonBottom: 120,
    moving: false,
    startX: 0,
    startY: 0,
    windowWidth: 0,
    windowHeight: 0
  },

  lifetimes: {
    attached() {
      // 从本地存储获取全局对话历史
      const app = getApp();
      
      // 初始化全局对话历史
      if (!app.globalData) {
        app.globalData = {};
      }
      
      if (!app.globalData.aiMessages || app.globalData.aiMessages.length === 0) {
        app.globalData.aiMessages = [
          { id: 1, role: 'ai', content: '你好！我是泽雅AI助手，请问有什么可以帮您？' }
        ];
        // 将初始消息保存到本地存储
        this.saveMessagesToStorage(app.globalData.aiMessages);
      }
      
      // 设置到组件数据中
      this.setData({
        messages: app.globalData.aiMessages
      });
      
      // 获取屏幕尺寸
      const systemInfo = wx.getSystemInfoSync();
      this.setData({
        windowWidth: systemInfo.windowWidth,
        windowHeight: systemInfo.windowHeight
      });
      
      // 从全局数据中读取位置
      if (!app.globalData.aiButtonPosition) {
        app.globalData.aiButtonPosition = {
          left: 20,
          bottom: 120
        };
      }
      
      this.setData({
        buttonLeft: app.globalData.aiButtonPosition.left,
        buttonBottom: app.globalData.aiButtonPosition.bottom
      });
      
      // 监听消息更新事件
      this.setupMessageSync();
    },
    
    detached() {
      // 组件销毁时取消事件监听
      wx.removeStorage({
        key: 'ai_message_update_listener'
      });
    }
  },

  methods: {
    // 设置消息同步机制
    setupMessageSync() {
      // 注册消息更新事件
      wx.onAppHide(() => {
        // 页面隐藏时，记录时间戳，用于在其他页面判断是否需要更新
        wx.setStorageSync('ai_message_update_time', Date.now());
      });
      
      wx.onAppShow(() => {
        // 页面显示时，检查是否有更新
        this.checkMessageUpdates();
      });
      
      // 每隔3秒检查一次更新
      this.updateCheckInterval = setInterval(() => {
        this.checkMessageUpdates();
      }, 3000);
    },
    
    // 检查消息更新
    checkMessageUpdates() {
      try {
        // 获取上次更新时间
        const lastLocalUpdateTime = wx.getStorageSync('ai_last_update_time') || 0;
        const lastGlobalUpdateTime = wx.getStorageSync('ai_message_update_time') || 0;
        
        // 如果全局更新时间比本地更新时间新，则更新消息
        if (lastGlobalUpdateTime > lastLocalUpdateTime) {
          const app = getApp();
          const storedMessages = this.loadMessagesFromStorage();
          
          // 更新本地和全局消息
          if (app.globalData) {
            app.globalData.aiMessages = storedMessages;
          }
          
          this.setData({ messages: storedMessages });
          
          // 更新本地时间戳
          wx.setStorageSync('ai_last_update_time', lastGlobalUpdateTime);
        }
      } catch (e) {
        console.error('检查消息更新失败', e);
      }
    },
    
    // 切换对话框显示
    toggleDialog() {
      // 如果正在拖动，不打开对话框
      if (this.data.moving) {
        this.setData({ moving: false });
        return;
      }
      
      // 打开对话框前先检查更新
      if (!this.data.showDialog) {
        this.checkMessageUpdates();
      }
      
      this.setData({ 
        showDialog: !this.data.showDialog 
      });
      
      // 如果是打开对话框，自动滚动到最新消息
      if(this.data.showDialog) {
        this.scrollToBottom();
      }
    },

    // 输入处理
    onInput(e) {
      this.setData({ inputText: e.detail.value });
    },

    // 发送消息（模拟AI回复）
    sendMessage() {
      const userMsg = this.data.inputText.trim();
      if (!userMsg || this.data.isTyping) return;

      // 添加用户消息
      this.addMessage(userMsg, 'user');
      
      // 模拟AI思考
      this.setData({
        isTyping: true,
        messages: [...this.data.messages, { 
          id: Date.now(), 
          role: 'ai', 
          thinking: true,
          content: ''
        }]
      });
      
      // 自动滚动到底部
      this.scrollToBottom();
      
      // 模拟网络延迟后回复
      setTimeout(() => {
        // 移除思考中的消息
        let messages = [...this.data.messages];
        messages.pop();
        
        this.setData({ messages }, () => {
          this.generateAIReply(userMsg);
        });
      }, 1500);
    },

    // 添加消息到列表
    addMessage(content, role) {
      const newMsg = { id: Date.now(), role, content };
      const newMessages = [...this.data.messages, newMsg];
      
      this.setData({
        messages: newMessages,
        inputText: role === 'user' ? '' : this.data.inputText
      });
      
      // 同步到全局数据
      this.syncToGlobal(newMessages);
      
      // 自动滚动到底部
      this.scrollToBottom();
    },

    // 同步到全局
    syncToGlobal(messages) {
      const app = getApp();
      
      // 确保全局数据存在
      if (!app.globalData) {
        app.globalData = {};
      }
      
      // 更新全局数据和本地存储
      app.globalData.aiMessages = messages;
      this.saveMessagesToStorage(messages);
      
      // 记录更新时间，用于跨页面同步
      const updateTime = Date.now();
      wx.setStorageSync('ai_message_update_time', updateTime);
      wx.setStorageSync('ai_last_update_time', updateTime);
    },
    
    // 保存消息到本地存储
    saveMessagesToStorage(messages) {
      try {
        wx.setStorageSync('ai_chat_history', JSON.stringify(messages));
      } catch (e) {
        console.error('保存对话历史失败', e);
      }
    },
    
    // 从本地存储获取消息
    loadMessagesFromStorage() {
      try {
        const history = wx.getStorageSync('ai_chat_history');
        return history ? JSON.parse(history) : [];
      } catch (e) {
        console.error('读取对话历史失败', e);
        return [];
      }
    },

    // 生成AI回复（模拟逻辑）
    generateAIReply(userMsg) {
      // 特殊指令处理
      if (userMsg === '/clear') {
        const initialMessage = [{ id: Date.now(), role: 'ai', content: '已清空对话历史' }];
        this.setData({ 
          messages: initialMessage,
          isTyping: false 
        });
        this.syncToGlobal(initialMessage);
        return;
      }
      
      if (userMsg === '/help') {
        this.addTypingEffect("可用指令：\n/clear - 清空对话\n/help - 查看帮助");
        return;
      }
      
      // 关键词匹配
      let reply = this.findKeywordReply(userMsg);
      
      // 如果没有关键词匹配，使用随机回复
      if (!reply) {
        const randomIndex = Math.floor(Math.random() * this.data.replyPool.length);
        reply = this.data.replyPool[randomIndex];
      }
      
      // 使用打字效果添加消息
      this.addTypingEffect(reply);
    },
    
    // 查找关键词回复
    findKeywordReply(msg) {
      const lowerMsg = msg.toLowerCase();
      
      for (const keyword in this.data.keywordResponses) {
        if (lowerMsg.includes(keyword)) {
          const responses = this.data.keywordResponses[keyword];
          return responses[Math.floor(Math.random() * responses.length)];
        }
      }
      
      return null;
    },
    
    // 添加打字机效果
    addTypingEffect(content) {
      const id = Date.now();
      let newMessages = [...this.data.messages, { id, role: 'ai', content: '' }];
      
      this.setData({ messages: newMessages });
      this.syncToGlobal(newMessages);
      
      // 自动滚动到底部
      this.scrollToBottom();
      
      // 模拟打字效果
      let i = 0;
      const interval = 50; // 每个字符的延迟时间
      
      const timer = setInterval(() => {
        if (i <= content.length) {
          const updateMessages = [...this.data.messages];
          updateMessages[updateMessages.length - 1].content = content.slice(0, i);
          
          this.setData({
            messages: updateMessages
          });
          
          this.syncToGlobal(updateMessages);
          i++;
          
          // 自动滚动跟随
          this.scrollToBottom();
        } else {
          clearInterval(timer);
          this.setData({ isTyping: false });
        }
      }, interval);
    },
    
    // 滚动到底部
    scrollToBottom() {
      if (this.data.messages.length > 0) {
        const lastMessageId = this.data.messages[this.data.messages.length - 1].id;
        wx.createSelectorQuery()
          .in(this)
          .select(`#msg-${lastMessageId}`)
          .boundingClientRect(rect => {
            if (rect) {
              wx.createSelectorQuery()
                .in(this)
                .select('.dialog-content')
                .boundingClientRect(contRect => {
                  if (contRect) {
                    const scrollToY = rect.top - contRect.top;
                    const scrollView = this.selectComponent('.dialog-content');
                    if (scrollView) {
                      scrollView.scrollTo({ top: scrollToY, behavior: 'smooth' });
                    }
                  }
                })
                .exec();
            }
          })
          .exec();
      }
    },
    
    // 拖拽开始事件
    handleTouchStart(e) {
      this.touchStartTime = Date.now();
      this.setData({
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        moving: false
      });
    },
    
    // 拖拽移动事件
    handleTouchMove(e) {
      const moveX = Math.abs(e.touches[0].clientX - this.data.startX);
      const moveY = Math.abs(e.touches[0].clientY - this.data.startY);
      
      // 如果移动距离大于10，则认为是拖拽
      if (moveX > 10 || moveY > 10) {
        this.setData({ moving: true });
      }
      
      if (!this.data.moving) return;
      
      const deltaX = e.touches[0].clientX - this.data.startX;
      const deltaY = e.touches[0].clientY - this.data.startY;
      
      // 计算新位置（反向计算，因为是从右下角定位）
      let newLeft = this.data.buttonLeft - deltaX;
      let newBottom = this.data.buttonBottom - deltaY;
      
      // 防止移出屏幕边界
      if (newLeft < 0) newLeft = 0;
      if (newLeft > this.data.windowWidth - 45) newLeft = this.data.windowWidth - 45;
      if (newBottom < 0) newBottom = 0;
      if (newBottom > this.data.windowHeight - 45) newBottom = this.data.windowHeight - 45;
      
      this.setData({
        buttonLeft: newLeft,
        buttonBottom: newBottom,
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY
      });
    },
    
    // 拖拽结束事件
    handleTouchEnd() {
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - this.touchStartTime;
      
      // 如果触摸时间小于200ms且没有移动，则认为是点击
      if (touchDuration < 200 && !this.data.moving) {
        this.toggleDialog();
      }
      
      // 保存位置到全局数据
      if (this.data.moving) {
        const app = getApp();
        app.globalData.aiButtonPosition = {
          left: this.data.buttonLeft,
          bottom: this.data.buttonBottom
        };
      }
      
      this.setData({ moving: false });
    },
    
    // 保存按钮位置到本地存储
    saveButtonPosition() {
      try {
        wx.setStorageSync('ai_button_position', {
          left: this.data.buttonLeft,
          bottom: this.data.buttonBottom
        });
      } catch (e) {
        console.error('保存按钮位置失败', e);
      }
    },
    
    // 从本地存储加载按钮位置
    loadButtonPosition() {
      try {
        const position = wx.getStorageSync('ai_button_position');
        if (position) {
          this.setData({
            buttonLeft: position.left,
            buttonBottom: position.bottom
          });
        }
      } catch (e) {
        console.error('读取按钮位置失败', e);
      }
    }
  }
}) 