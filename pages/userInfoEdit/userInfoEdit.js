const db = wx.cloud.database()
const errorHandler = require('../../utils/error.js')
const auth = require('../../utils/auth.js')
const config = require('../../utils/config.js')

Page({
  data: {
    nickName: '',
    phoneNumber: '',
    email: '',
    avatarUrl: '',
    genderOptions:['男','女','保密'],
    genderIndex: 2,
    hometown: '',
    birthday: '',
    zodiac: '',
    // 通用编辑器
    showEditor:false,
    editorField:'',
    editorType:'text',
    editorPlaceholder:'',
    tempValue:''
  },
  onLoad(){
    this.prefill()
  },
  async prefill(){
    try{
      const authenticatedUser = auth.getAuthenticatedUser()
      if(!authenticatedUser){
        wx.navigateTo({url:'/pages/login/login'})
        return
      }
      const res = await db.collection('users').where({_id: authenticatedUser._id}).get()
      if(res.data.length){
        const u = res.data[0]
        this.setData({
          nickName: u.nickName || '',
          phoneNumber: u.phoneNumber || '',
          email: u.email || '',
          avatarUrl: u.avatarUrl || '',
          genderIndex: typeof u.gender==='number'? u.gender: 2,
          hometown: u.hometown || '',
          birthday: u.birthday || '',
          zodiac: this.calcZodiac(u.birthday)
        })
      }
    }catch(err){
      errorHandler.handleError(err,'获取资料失败')
    }
  },
  onNameInput(e){this.setData({nickName:e.detail.value})},
  onPhoneInput(e){this.setData({phoneNumber:e.detail.value})},
  onEmailInput(e){this.setData({email:e.detail.value})},
  onGenderChange(e){ this.setData({ genderIndex: Number(e.detail.value) }) },
  onBirthdayChange(e){ const b=e.detail.value; this.setData({ birthday:b, zodiac: this.calcZodiac(b) }) },
  onEditField(e){
    const field = e.currentTarget.dataset.field
    const placeholderMap={nickName:'请输入昵称',hometown:'请输入籍贯',phoneNumber:'请输入手机号',email:'请输入邮箱'}
    const typeMap={phoneNumber:'number',email:'text'}
    this.setData({
      showEditor:true,
      editorField: field,
      editorType: typeMap[field] || 'text',
      editorPlaceholder: placeholderMap[field] || '请输入',
      tempValue: this.data[field] || ''
    })
  },
  onTempInput(e){ this.setData({ tempValue: e.detail.value }) },
  onEditorCancel(){ this.setData({ showEditor:false }) },
  onEditorSave(){
    const f=this.data.editorField
    if(!f) return this.onEditorCancel()
    const v=this.data.tempValue
    // 简单校验
    if(f==='phoneNumber' && v && !/^1[3-9]\d{9}$/.test(v)) return wx.showToast({title:'手机号格式不正确',icon:'none'})
    if(f==='email' && v && !config.business.emailRegex.test(v)) return wx.showToast({title:'邮箱格式不正确',icon:'none'})
    this.setData({ [f]: v, showEditor:false })
  },
  noop(){},
  calcZodiac(dateStr){
    if(!dateStr) return ''
    const d=new Date(dateStr.replace(/-/g,'/'))
    if(isNaN(d)) return ''
    const m=d.getMonth()+1, day=d.getDate()
    const arr=[
      [120,'摩羯'],[219,'水瓶'],[321,'双鱼'],[420,'白羊'],[521,'金牛'],[622,'双子'],
      [722,'巨蟹'],[823,'狮子'],[923,'处女'],[1023,'天秤'],[1122,'天蝎'],[1222,'射手'],[1231,'摩羯']
    ]
    const num=m*100+day
    for(let i=0;i<arr.length;i++){ if(num<=arr[i][0]) return arr[i][1] }
    return '摩羯'
  },
  async onSave(){
    const {nickName,phoneNumber,email,genderIndex,hometown,birthday,zodiac,avatarUrl}=this.data
    if(!nickName){return wx.showToast({title:'请输入昵称',icon:'none'})}
    if(phoneNumber && !/^1[3-9]\d{9}$/.test(phoneNumber)){
      return wx.showToast({title:'手机号格式不正确',icon:'none'})
    }
    if(email && !config.business.emailRegex.test(email)){
      return wx.showToast({title:'邮箱格式不正确',icon:'none'})
    }
    try{
      const authenticatedUser = auth.getAuthenticatedUser()
      await db.collection('users').where({_id: authenticatedUser._id}).update({
        data:{nickName,phoneNumber,email,gender: genderIndex,hometown,birthday,zodiac,avatarUrl,updateTime: db.serverDate()}
      })
      // 更新本地缓存
      const cache = wx.getStorageSync('userInfo') || {}
      cache.nickName = nickName
      cache.phoneNumber = phoneNumber
      cache.email = email
      cache.gender = genderIndex
      cache.hometown = hometown
      cache.birthday = birthday
      cache.zodiac = zodiac
      cache.avatarUrl = avatarUrl
      wx.setStorageSync('userInfo', cache)
      wx.showToast({title:'保存成功'})
      setTimeout(()=>{ wx.navigateBack({delta:1}) }, 600)
    }catch(err){
      errorHandler.handleError(err,'保存失败')
    }
  }
  ,
  async onChangeAvatar(){
    try{
      const choose = await wx.chooseMedia({count:1,mediaType:['image'],sourceType:['album','camera']})
      const tempFilePath = choose.tempFiles[0].tempFilePath
      wx.showLoading({title:'上传中'})
      const authenticatedUser = auth.getAuthenticatedUser()
      const ext = (tempFilePath.match(/\.([^.]+)$/) || [,'jpg'])[1]
      const cloudPath = `avatars/${authenticatedUser._id}_${Date.now()}.${ext}`
      const uploadRes = await wx.cloud.uploadFile({cloudPath,filePath: tempFilePath})
      // 删除旧头像（如为云文件）
      if(this.data.avatarUrl && this.data.avatarUrl.indexOf('cloud://')===0){
        try{ await wx.cloud.deleteFile({fileList:[this.data.avatarUrl]}) }catch(e){ /* 忽略 */ }
      }
      // 更新数据库
      await db.collection('users').where({_id: authenticatedUser._id}).update({
        data:{ avatarUrl: uploadRes.fileID, updateTime: db.serverDate() }
      })
      // 更新本地与页面
      const cache = wx.getStorageSync('userInfo') || {}
      cache.avatarUrl = uploadRes.fileID
      wx.setStorageSync('userInfo', cache)
      this.setData({ avatarUrl: uploadRes.fileID })
      wx.hideLoading()
      wx.showToast({title:'头像已更新'})
    }catch(err){
      wx.hideLoading()
      if(err && err.errMsg && err.errMsg.indexOf('cancel')>-1){return}
      errorHandler.handleError(err,'更新头像失败')
    }
  }
})