
/**
*  Module
*
* Description
*/
angular.module('starter.appConfig', [])

.factory('AppUrl',  function(){
    return {
        host: 'http://192.168.0.145:8100',
        category: '/app/goods/cate/list.jhtml', //分类
        cart: {
            add:  '/app/cart/add.jhtml', //添加
            list: '/app/cart/list.jhtml', //列表
            edit: '/app/cart/edit.jhtml', //编辑
            delete: '/app/cart/delete.jhtml' //删除
        },
        goods: {
            list: '/app/goods/list', //商品列表
            search:  '/app/goods/search/tip.jhtml?keyword=', //搜索
            search_list: '/app/goods/search/list', //搜索结果
            product:   '/app/goods/{id}.jhtml', //商品页
            validity: '/app/goods/getRecentlyBatch.jhtml?id=', //商品有效期
            promotion: '/app/goods/promotion/list' //促销活动
        },
        activity: {
            home: '/app/goods/promotion.jhtml'
        },
        login: {
            publicKey: '/app/system/publicKey.jhtml', //加密秘钥
            login: '/app/login.jhtml', //请求登陆
            loginStatus: '/app/status.jhtml', //登陆状态
            logout: '/app/logout.jhtml' //退出登陆
        },
        order: {
            create: '/app/order/create.jhtml' ,//创建订单
            info: '/app/order/info.jhtml?tradeNo=',
            detail: '/app/order/detail.jhtml?tradeNo=', //订单详情
            cancel: '/app/order/cancelOrder.jhtml', //取消订单
            deleteItem: '/app/order/deleteOrderItem.jhtml', //删除订单项
            confirm: '/app/order/confirm.jhtml', //确认订单
            list: '/app/order/list.jhtml', //订单列表
            log: '/app/order/log.jhtml?orderNo=', //订单日志
            deleteOrder: '/app/order/delete.jhtml', //删除订单
            finish: '/app/order/confirmReceive.jhtml' //订单完成
        },
        member: {
            info: '/app/member/info.jhtml', //会员信息
                modifyPwd: '/app/member/modifyPwdSubmit.jhtml', //修改密码
                captcha : '/app/member/sendEmailCaptcha.jhtml' ,//发送邮箱验证码
                verify: '/app/member/verifyEmail.jhtml' //验证并修改邮箱
        },
        //到货通知
        stocknotify: {
            register: '/app/stockNotice/register.jhtml' , //注册到货通知
            list: '/app/stockNotice/list.jhtml', //注册的列表
            delete: '/app/stockNotice/delete.jhtml' //删除
        },
        //收藏
        favorite: {
            add: '/app/favorite/add.jhtml', //添加商品收藏
            tagList: '/app/favorite/tag/list.jhtml', //收藏标签
            list: '/app/favorite/list.jhtml', //收藏商品列表
            del: '/app/favorite/delete.jhtml' //删除收藏商品
        }
    };
})