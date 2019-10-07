// pages/player/player.js
let musiclist = []
// 正在播放歌曲的index
let nowPlayingIndex = 0
// 获取全局唯一的背景音频管理器
const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picUrl: '',
    isPlaying: false,  // false不播放， true播放
    isLyricShow: false,  // 表示当前歌词是否显示
    lyric: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.getSystemInfo({

      success: function (res) {
        var version = res.SDKVersion;
        version = version.replace(/\./g, "")
        console.log('version: ',version)
      }
    })
    console.log('options: ', options)
    nowPlayingIndex = options.index
    musiclist = wx.getStorageSync('musiclist')
    this._loadMusicDetail(options.musicId)
  },

  _loadMusicDetail(musicId) {
    backgroundAudioManager.stop()
    let music = musiclist[nowPlayingIndex]
    console.log(music)
    wx.setNavigationBarTitle({
      title: music.name,
    })

    this.setData({
      picUrl: music.al.picUrl,
      isPlaying: false
    })

    wx.showLoading({
      title: '加载中',
    })

    wx.cloud.callFunction({
      name: 'music',
      data: {
        musicId,
        $url: 'musicUrl',
      }
    }).then(res => {
      console.log('musicUrl-res: ', res)
      let result = res.result
      backgroundAudioManager.src = result.data[0].url
      backgroundAudioManager.title = music.name
      backgroundAudioManager.coverImgUrl = music.al.picUrl
      backgroundAudioManager.singer = music.ar[0].name
      backgroundAudioManager.epname = music.al.name

      this.setData({
        isPlaying: true
      })
      wx.hideLoading()

      // 加载歌词
      wx.cloud.callFunction({
        name: 'music',
        data: {
          musicId,
          $url: 'lyric'
        }
      }).then((res) => {
        console.log('lyric - res: ', res)
        let lyric = '暂无歌词'
        const lrc = JSON.parse(res.result).lrc
        if (lrc) {
          lyric = lrc.lyric
        }
        this.setData({
          lyric
        })
      })
    })
  },

  togglePlaying() {
    // 正在播放
    if(this.data.isPlaying) {
      backgroundAudioManager.pause()
    } else {
      backgroundAudioManager.play()
    }
    this.setData({
      isPlaying: !this.data.isPlaying
    })
  },

  onPrev() {
    nowPlayingIndex--
    if (nowPlayingIndex < 0) {
      nowPlayingIndex = musiclist.length - 1
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  onNext() {
    nowPlayingIndex++
    if (nowPlayingIndex === musiclist.length) {
      nowPlayingIndex = 0
    }
    this._loadMusicDetail(musiclist[nowPlayingIndex].id)
  },

  onChangeLyricShow() {
    this.setData({
      isLyricShow: !this.data.isLyricShow
    })
  },

  timeUpdate(e) {
    this.selectComponent('.lyric').update(e.detail.currentTime)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})