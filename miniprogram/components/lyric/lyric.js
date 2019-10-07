// components/lyric/lyric.js
let lyricHeight = 0
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isLyricShow: {
      type: Boolean,
      value: false
    },
    lyric: {
      type: String,
      observer(newVal, oldVal, changedPath) {
        // console.log('newVal: ', newVal)
        // console.log('oldVal: ', oldVal)
        // console.log('changedPath: ', changedPath)
        this._parseLyric(newVal)
      }
    }
  },

  observers: {
    lyric(lrc) {
      console.log('lrc: ', lrc)
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    lrcList: [],
    nowLyricIndex: 0,  // 当前选中的歌词的索引
    scrollTop: 0,
  },

  lifetimes: {
    ready() {
      // 750rpx
      wx.getSystemInfo({
        success(res) {
          console.log('res: ', res)
          lyricHeight = res.screenWidth / 750 * 64
        },
      })
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    update(currentTime) {
      console.log('currentTime: ', currentTime)
      let lrcList = this.data.lrcList
      if (lrcList.length == 0) {
        return
      }
      for (let i = 0, len = lrcList.length; i < len; i++) {
        if (currentTime <= lrcList[i].time) {
          console.log('lyricHeight: ', (i - 1) * lyricHeight)
          console.log('i: ', i)
          this.setData({
            nowLyricIndex: i - 1,
            scrollTop: (i - 1) * lyricHeight
          })
          break
        }
      }
    },
    _parseLyric(sLyric) {
      let line = sLyric.split('\n')
      // console.log('line: ', line)
      let _lrcList = []
      line.forEach((elem) => {
        let time = elem.match(/\[(\d{2,}):(\d{2})(?:\.(\d{2,3}))?]/g)
        // console.log('time: ', time)
        if (time != null) {
          let lrc = elem.split(time)[1]
          // console.log('elem.split(time): ', elem.split(time))
          let timeReg = time[0].match(/(\d{2,}):(\d{2})(?:\.(\d{2,3}))?/)
          console.log('timeReg: ', timeReg)
          // 把时间转换为秒
          let time2Seconds = parseInt(timeReg[1]) * 60 + parseInt(timeReg[2]) + parseInt(timeReg[3]) / 1000
          _lrcList.push({
            lrc,
            time: time2Seconds,
          })
        }
      })
      this.setData({
        lrcList: _lrcList
      })
    }
  }
})
