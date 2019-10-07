// components/progress-bar/progress-bar.js
let movableAreaWidth = 0
let movableViewWidth = 0
const backgroundAudioManager = wx.getBackgroundAudioManager()
let currentSec = -1 // 当前秒数
let duration = 0  // 当前歌曲的总时长，以秒为单位
let isMoving = false  // 表示当前进度条是否在拖拽，解决：当进度条拖动时候和updatetime事件有冲突的问题

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    showTime: {
      currentTime: '00:00',
      totalTime: '00:00'
    },
    movableDis: 0,
    progress: 0
  },

  lifetimes: {
    ready() {
      this._getMovableDis()
      this._bindBGMEvent()
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(e) {
      // console.log(e)
      // 拖动
      if(e.detail.source == 'touch') {
        this.data.progress = e.detail.x / (movableAreaWidth - movableViewWidth) * 100
        this.data.movableDis = e.detail.x
        isMoving = true
      }
    },
    onTouchEnd() {
      const currentTimeFmt = this._dateFormat(Math.floor(backgroundAudioManager.currentTime))
      this.setData({
        progress: this.data.progress,
        movableDis: this.data.movableDis,
        ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
      })
      backgroundAudioManager.seek(duration * this.data.progress / 100)
      isMoving = false
    },
    _getMovableDis() {
      const query = this.createSelectorQuery()
      query.select('.movable-area').boundingClientRect()
      query.select('.movable-view').boundingClientRect()
      query.exec((rect) => {
        // console.log('rect: ', rect)
        movableAreaWidth = rect[0].width
        movableViewWidth = rect[1].width
        console.log(movableAreaWidth, movableViewWidth)
      })
    },
    _bindBGMEvent() {
      backgroundAudioManager.onPlay(() => {
        console.log('onPlay')
        isMoving = false
      })

      backgroundAudioManager.onStop(() => {
        console.log('onStop')
      })

      backgroundAudioManager.onPause(() => {
        console.log('onPause')
      })

      backgroundAudioManager.onWaiting(() => {
        console.log('onWaiting')
      })

      backgroundAudioManager.onCanplay(() => {
        console.log('onCanplay')
        console.log('duration: ', backgroundAudioManager.duration)
        if (backgroundAudioManager.duration !== undefined) {
          this._setTime()
        } else {
          setTimeout(() => {
            this._setTime()
          }, 1000)
        }
      })

      backgroundAudioManager.onTimeUpdate(() => {
        // console.log('onTimeUpdate')
        if(!isMoving) {
          const currentTime = backgroundAudioManager.currentTime
          const duration = backgroundAudioManager.duration
          // console.log('currentTime: ', currentTime)
          const sec = currentTime.toString().split('.')[0]
          if (sec != currentSec) {
            const currentTimeFmt = this._dateFormat(currentTime)
            this.setData({
              movableDis: (movableAreaWidth - movableViewWidth) * currentTime / duration,
              progress: currentTime / duration * 100,
              ['showTime.currentTime']: `${currentTimeFmt.min}:${currentTimeFmt.sec}`
            })
            // console.log('sec: ', sec)
            currentSec = sec
            // 联动歌词
            this.triggerEvent('timeUpdate', {
              currentTime
            })
          }
        }
      })

      backgroundAudioManager.onEnded(() => {
        console.log('onEnded')
        this.triggerEvent('musicEnd')
      })

      backgroundAudioManager.onError((res) => {
        console.log('onError')
        console.error(res.errMsg)
        console.error(res.errCode)
        wx.showToast({
          title: '错误：' + res.errCode,
        })
      })
    },
    _setTime() {
      duration = backgroundAudioManager.duration
      // console.log('setTime - duration: ', duration)
      const durationFmt = this._dateFormat(duration)
      // console.log('durationFmt: ', durationFmt)
      this.setData({
        ['showTime.totalTime']: `${durationFmt.min}:${durationFmt.sec}`
      })
    },
    // 格式化时间
    _dateFormat(sec) {
      // 分钟
      const min = Math.floor(sec / 60)
      sec = Math.floor(sec % 60)
      return {
        'min': this._parse0(min),
        'sec': this._parse0(sec)
      }
    },

    _parse0(sec) {
      return sec < 10 ? '0' + sec : sec
    }
  }
})
