// 云函数入口文件
const cloud = require('wx-server-sdk')

const TcbRouter = require('tcb-router')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.use(async(ctx, next) => {
    console.log('进入全局中间件')
    ctx.data = {}
    ctx.data.openId = event.userInfo.openId
    await next()
    console.log('退出全局中间件')
  })

  app.router('music', async (ctx, next) => {
    console.log('进入music名称中间件')
    ctx.data.musicName = '数鸭子'
    await next()
    console.log('退出music名称中间件')
  }, async (ctx, next) => {
    console.log('进入music类型中间件')
    ctx.data.musicType = '儿歌'
    ctx.body = {
      data: ctx.data
    }
    console.log('退出music类型中间件')
  })

  app.router('movie', async (ctx, next) => {
    console.log('进入movie名称中间件')
    ctx.data.musicName = '千与千寻'
    await next()
    console.log('退出movie名称中间件')
  }, async (ctx, next) => {
    console.log('进入movie类型中间件')
    ctx.data.musicType = '日本动画片'
    ctx.body = {
      data: ctx.data
    }
    console.log('退出movie类型中间件')
  })

  return app.serve()
}