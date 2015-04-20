// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.directive', 'starter.factory', 'starter.appConfig','starter.filter', 'ipCookie'])

.run(function($ionicPlatform, $rootScope, jpushService) {


  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }


    // var setTagsWithAliasCallback=function(event){
    //   window.alert('result code:'+event.resultCode+' tags:'+event.tags+' alias:'+event.alias);
    // }


    //  var openNotificationInAndroidCallback=function(data){
    //   var json=data;
    //   window.alert(json);
    //   if(typeof data === 'string'){
    //     json=JSON.parse(data);
    //   }
    //   var id=json.extras['cn.jpush.android.EXTRA'].id;
    //   window.alert(id);
    //   $state.go('product',{id:id});
    // }
    // var config={
    //   stac:setTagsWithAliasCallback,
    //   oniac:openNotificationInAndroidCallback
    // };

    // jpushService.init(config);
    // jpushService.setTags('dev');

    // var onOpenNotification = function(event)
    // {
    //    var alertContent
    //         if(device.platform == "Android"){
    //             alertContent=window.plugins.jPushPlugin.openNotification.alert;
    //         }else{
    //             alertContent   = event.aps.alert;
    //         }
    //         alert("open Notificaiton:"+alertContent);

    //         $state.go('product',{id:9883});
    // }

    window.plugins.jPushPlugin.init();

    // document.addEventListener("jpush.openNotification", onOpenNotification, false);

    // window.plugins.jPushPlugin.openNotificationInAndroidCallback = openNotificationInAndroidCallback;
    window.plugins.jPushPlugin.setDebugMode(true);

  });


})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
  $httpProvider.defaults.withCredentials = true;
        $ionicConfigProvider.tabs.position('bottom');
        $ionicConfigProvider.navBar.alignTitle('center');
  // $ionicConfigProvider.views.maxCache(0);
  $ionicConfigProvider.templates.maxPrefetch(0);
  $ionicConfigProvider.backButton.previousTitleText(false).text('').icon('ion-android-arrow-back');

        // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:
  //首页
  .state('tab.home', {
    url : '/home',
    views: {
      'tab-home' : {
        templateUrl: 'templates/index.html'
      }
    }
  })
  //分类
  .state('tab.category' , {
    url : '/category',
    views: {
      'tab-category': {
          templateUrl: 'templates/category/index.html',
          controller: 'CategoryCtrl'
      }
    }
  })
      //搜索
      .state('search', {
          url: '/search',
          // views: {
          //     'tab-category': {
                  templateUrl: 'templates/search/index.html',
                  controller: 'SearchCtrl'
              // }
          // }

      })


      .state('tab.activity', {
          url: '/activity',
          views: {
              'tab-activity': {
                  templateUrl: 'templates/activity/index.html',
                  controller: 'ActivityCtrl'
              }
          }
      })

      .state('activityList', {
          url: '/goodsList/activity/:activityId',
          //views: {
          //    'tab-category': {
                  templateUrl: 'templates/goods/list.html',
                  controller: "GoodsListCtrl"
          //    }
          //}
      })
      .state('promotionList', {
          url: '/goodsList/promotion/:promotion',
          //views: {
          //    'tab-category': {
                  templateUrl: 'templates/goods/list.html',
                  controller: "GoodsListCtrl"
          //    }
          //}
      })

      //商品列表
      .state('goodsList', {
        url: '/goodsList/:id',
              //views: {
              //    'tab-category': {
                      templateUrl: 'templates/goods/list.html',
                      controller: "GoodsListCtrl"
              //    }
              //}
      })

      .state('goodsListSearch', {
          url: '/goodsList/keyword/:keyword',
          //views: {
          //    'tab-category': {
                  templateUrl: 'templates/goods/list.html',
                  controller: "GoodsListCtrl"
          //    }
          //}
      })


  //商品页
  .state('product', {
    url: '/product/:id',
    //views: {
    //  'tab-category' : {
        templateUrl: 'templates/goods/goods.html',
          controller: 'ProductCtrl'
    //  }
    //}
  })


  //购物车
  .state('tab.cart', {
    url: '/cart',
    views: {
      'tab-cart': {
        templateUrl: 'templates/cart/index.html',
        controller: "CartCtrl"
      }
    }
  })
      //创建订单
      .state('orderCreate', {
          url: '/orderCreate/:orderNo',
          //views: {
          //    'tab-member': {
                  templateUrl: 'templates/order/order-create.html',
                  controller: 'OrderCreateCtrl'
          //    }
          //}
      })

      .state('orderFinish', {
          url: '/orderFinish/:orderNo',
          //views: {
          //    'tab-member': {
                  templateUrl: 'templates/order/order-finish.html',
                  controller: 'OrderCreateCtrl'
          //    }
          //}
      })


  //会员中心
  .state('tab.member', {
    url: '/member',
    views: {
      'tab-member' : {
        templateUrl: 'templates/member/index.html',
          controller: 'MemberCtrl'
      }
    }
  })
      //修改密码
      .state('tab.modifypwd', {
          url: '/modifypwd',
          views: {
              'tab-member' : {
                  templateUrl: 'templates/member/modify-pwd.html',
                  controller: 'MemberCtrl'
              }
          }
      })
      .state('tab.modifyemail', {
          url: '/modefiyemail',
          views: {
              'tab-member': {
                  templateUrl: 'templates/member/modify-email.html',
                  controller: 'MemberModifyEmailCtrl'
              }
          }
      })
      //会员信息
      .state('tab.memberinfo', {
          url: '/memberinfo',
          views: {
              'tab-member' : {
                  templateUrl: 'templates/member/info.html'
              }
          }
      })


      //订单列表
      .state('tab.orderList', {
          url: '/orderList',
          views: {
              'tab-member': {
                  templateUrl: 'templates/order/index.html',
                  controller: 'OrderListCtrl'
              }
          }
      })
      //收藏商品
      .state('tab.favorite', {
          url: '/favorite',
          views: {
              'tab-member': {
                  templateUrl: 'templates/favorite/index.html',
                  controller: 'FavoriteCtrl'
              }
          }
      })


  //登陆
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login/login.html',
          controller: 'LoginCtrl'
  })


  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/category');

});
