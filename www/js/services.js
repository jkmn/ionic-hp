
var AppConfig = {
    host: 'http://122.228.188.134:9876',
    // host: 'http://192.168.0.147:8100',
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

angular.module('starter.services', ['starter.factory'])

    //分类
    .factory("CategoryServices", function(HttpFactory) {
        var url = AppConfig['host'] + AppConfig['category'];

        return {
            getTop: function(handle) {
                //return Http.get(url+'?isTop=true', {cache: true});
                console.log(url);
                 return HttpFactory({
                    url: url,
                    data: {isTop: true},
                    cache: true,
                    hasLoading: true
                }, handle);
            },

            getCategoryById: function(id, handle) {
                //params.data = {parentId: id};
                //return Http.get(url+'?parentId=' + id, {cache: true});
                return HttpFactory({
                    url: url,
                    data: {parentId: id},
                    cache: true
                }, handle);
            }

        }
    })
    //商品列表
    .factory('GoodsListServices', function(Http) {

            var url = {
                def: AppConfig['host'] + AppConfig['goods']['list'],
                search: AppConfig['host'] +  AppConfig['goods']['search_list'],
                promotion: AppConfig['host'] + AppConfig['goods']['promotion']
            }

            var filter = [
                    {
                        key: 'drugformList',
                        name: '剂型',
                        list: [],
                        selected: '',
                        selectedID: 0
                    },
                    {
                        key: 'goodsTypeList',
                        name: '中药类型',
                        list: [],
                        selected: '',
                        selectedID: 0
                    },
                    {
                        key: 'manufacturerList',
                        name: '生产厂家',
                        list: [],
                        selected: '',
                        selectedID: 0
                    },
                    {
                        key: 'medicalInsuranceTypeList',
                        name: '医保类型',
                        lsit: [],
                        selected: '',
                        selectedID: 0
                    },
                    {
                        key: 'prescribeTypeList',
                        name: '处方类型',
                        list: [],
                        selected: '',
                        selectedID: 0
                    },

                ];
            var List = function($scope) {

                this.isLoad =  false;
                this.isLoadFilter = false;//是否已经载入filter
                this.item = [];
                this.$scope = $scope;
                this.where = {
                    page: 1, //当前页
                    cat: 0, //分类id
                    manufacture:0,//生产厂家
                    drugform:0,//剂型
                    prescribeType: 0,//处方类型
                    medicalInsuranceType: 0,//医保类型
                    activity: 0 ,//活动Id
                    promotionType: '' //促销类型
                };
                this.maxPage = null;
                this.keyword = undefined; //搜索关键字
                this.activityId = 0; //活动id
                this.filter = filter;
                this.nowFilterDetail = {}; //当前过滤
            };
            List.prototype.initData = function() {
                this.isLoad =  false;
                this.item = [];
                this.where.page = 1;
                this.maxPage = null;
            }


            //下一页
            List.prototype.nextPage = function(){
                if (this.isLoad ) return false;
                this.isLoad = true;
                var sURl = this.createUrl();

                return Http.secretGet(sURl, {cache: true})
                    .success(function(data){
                        this.item  = this.item.concat(data.pager.list);
                        this.isLoad = false;
                        this.where.page += 1;
                        this.maxPage = data.pager.pageCount;
                        this.loadFilter(data.selectorMap);
                    }.bind(this))
                    .error(function(data, status){
                        if (status == 0) {
                            this.isLoad = true;
                        } else {
                            this.isLoad = false;
                        }
                    }.bind(this));
            };


            //创建请求地址
            List.prototype.createUrl = function() {
                var u = '';
                if (typeof this.keyword != 'undefined') {
                    u = url['search'];
                    for (var key in this.where) {
                        if (this.where[key]) {
                            u += '-'+ key +'-' + this.where[key];
                        }
                    }
                    u += '.jhtml?keyword=';
                    u += this.keyword;
                } else {
                    u =  this.where['activity'] || this.where['promotionType'] ? url['promotion'] : url['def'];
                    for (var key in this.where) {
                        if (this.where[key]) {
                            u += '-'+ key +'-' + this.where[key];
                        }
                    }
                    u += '.jhtml';
                }

                return u;
            }

            //列表是已经全部载入
            List.prototype.isFinish = function() {
                if (typeof this.maxPage == 'number' && this.where.page > this.maxPage) {
                    return true;
                }
                return false;
            }
            //载入filter
            List.prototype.loadFilter = function(filter) {
                if (this.isLoadFilter) return;
                for (var key in filter) {
                    this.filter.forEach(function (item) {
                        if (item.key == key) {
                            item.list = filter[key];
                            item.selected = '';
                            item.selectedID = '';
                            filter[key].forEach(function (i) {
                                if (i.isSelected) {
                                    item.selected = i.name;
                                }
                            });
                        }
                    });
                }
                this.isLoadFilter = true;
            }
            //载入过滤详细列表
            List.prototype.loadFilterList = function(key) {
                var _this = this;
                this.filter.forEach(function (item) {
                    if (item.key == key) {
                        _this.nowFilterDetail = item;
                    }
                });
            }
            //选择筛选
            List.prototype.selectFilter = function(value) {
                var _this = this;

                this.filter.forEach(function (item) {
                    if (item.key == _this.nowFilterDetail.key) {
                        _this.nowFilterDetail.list.forEach(function(d) {
                            d.isSelected = false;
                        });

                        if (value) {
                            value.isSelected = true;
                            item.selected = value.name;
                            if (item.key == 'manufacturerList') {
                                item.selectedID = value.name;
                            } else {
                                item.selectedID = value.url.match(/-\w+$/)[0].substring(1);
                            }
                        } else {
                            item.selectedID = '';
                            item.selected = '';
                            item.list.forEach(function(i) {
                                i.isSelected = false;
                            })
                        }
                    }
                });
            }
            //重置筛选条件
            List.prototype.resetFilter = function() {
                this.filter.forEach(function (item) {
                    item.selected = '';
                    item.selectedID = '';
                    item.list.forEach(function(i) {
                        i.isSelected = false;
                    })
                });
                this.where = {
                    page: 1,
                    manufacture:0,//生产厂家
                    drugform:0,//剂型
                    prescribeType: 0,//处方类型
                    medicalInsuranceType: 0//医保类型
                };
            }

            return List;

        })

    //商品详情
    .factory('ProductServices', function(Http) {
        return {
            /**
             * 根据id获取订单信息
             * @param  {[int]} id [商品id]
             * @return $http
             */
            getById: function(id) {
                // console.log(url['product'].replace('{id}',id));
                return Http.get(AppConfig['host'] + AppConfig['goods']['product'].replace('{id}',id));
            },
            /**
             * 获取商品有效期
             * @param  {[int]} nId [商品id]
             * @return {[object]}   $http
             */
            fRecentlyBatch: function(nId, callback) {
                var url = AppConfig['host'] + AppConfig['goods']['validity'];
                return Http.get(url + nId , {cache: false})
                    .success(function(data){
                        if (data.type.toLowerCase() == 'success') {
                            if (callback)
                                callback(data.content.replace('<br/>',''));
                        }
                    });
            }
        }
    })
    //商品搜索
    .factory('SearchServices', function(Http) {
        return {
            findByKeyWord: function(keyword) {
                var request = AppConfig['host'] + AppConfig['goods']['search'] + keyword;
                return Http.secretGet(request, {cache: true});
            }
        }

    })
    //购物车
    .factory('CartServices', function(Http, $ionicPopup) {

        var Cart = function(){
            this.list = [];
        };

        Cart.prototype =  {
            //添加到购物车
            add: function(id, num, sCallBack, eCallBack){
                var params = {goodsId: id, quantity: num};
                Http.post(AppConfig['host'] + AppConfig['cart']['add'], params)
                    .success(function(data) {
                        if (data.type.toLowerCase() == 'success') {
                             if(sCallBack) sCallBack();
                        } else {
                            if (eCallBack) eCallBack(data.tip[1])
                            //$ionicPopup.alert({title: data.tip[1]})
                        }
                    })
            },
            //获取购物车中的商品
            getList: function(callback) {
                return Http.get(AppConfig['host'] + AppConfig['cart']['list'])
                    .success(function(data) {
                        this.list = data;
                    }.bind(this))
            },
            //修改数量
            edit: function(id, quantity) {
                var params = {cartItemId: id, quantity:quantity};
                return Http.secretPost(AppConfig['host'] + AppConfig['cart']['edit'], params)
            },
            //删除购物车项
            del: function(aIds) {
                var params = {cartItemIds: aIds};
                return Http.post(AppConfig['host'] + AppConfig['cart']['delete'], params);

            }
        }

        return Cart;

    })

    //用户登陆
    .factory('LoginServices', function(Http) {
        var  url = {
            publicKey: AppConfig['host'] + AppConfig['login']['publicKey'],
            login: AppConfig['host'] + AppConfig['login']['login']
        }
        return {
            //获取秘钥
            getPublicKey: function() {
                return Http.get(url['publicKey']);
            },
            login: function(params) {
                return Http.post(url['login'], params);
            },
            //登陆状态
            loginStatus: function(sCallBack, eCallBack) {
                var url = AppConfig['host'] + AppConfig['login']['loginStatus'];
                return Http.secretGet(url)
                    .success(function(data) {
                        if (data.isLogin == true && sCallBack) {
                            sCallBack();
                        } else if(eCallBack) {
                            eCallBack();
                        }
                    })
            },
            //退出登录
            logout: function() {
                var url = AppConfig['host'] + AppConfig['login']['logout'];

                return Http.get(url);
            }
        }
    })

    //订单
    .factory('OrderServices', function(Http, $ionicPopup) {
        var Order = function(){
            this.orderNo = '';
            this.aDetail = {};
            this.list = [];//订单列表
            this.isLoad = false;
            this.where = {
                pageNumber: 1,
                type: false,
                month: false,
                status: -1
            };
            this.maxPage = null;
            this.logList = [];// 订单日志
        };

        Order.prototype = {

            //生成订单
            create: function(sIds, fSuccess){
                var params = {ids: sIds};
                return Http.post(AppConfig['host'] + AppConfig['order']['create'], params)
            },
            //订单详情
            detail: function() {
                Http.get(AppConfig['host'] + AppConfig['order']['detail'] + this.orderNo, {cache: false})
                    .success(function(data){
                        this.aDetail = data;
                    }.bind(this))
                    .error(function(data, status){
                        console.log(status);
                    });
            },
            /*
             取消订单
             @params:
             */
            cancel: function(orderNo, sCallBack, eCallBack) {
                var params = {orderNo: orderNo || this.orderNo};
                Http.post(AppConfig['host'] + AppConfig['order']['cancel'], params)
                    .success(function(data){
                        if (sCallBack) {
                            sCallBack(data);
                        }
                    })
                    .error(function(data, status){
                       if (status == 400 && eCallBack) {
                           eCallBack(data.error)
                       }
                    })
            },
            /*
             删除单个订单项
             @params: orderId 订单项id
             return object
             */
            deleteItem: function(orderId) {
                var url = AppConfig['host'] + AppConfig['order']['deleteItem'],
                    params = {id: orderId};
                return Http.post(url, params);
            },
            /*
             提交订单
             return object
             */
            confirm: function() {

                var url = AppConfig['host'] + AppConfig['order']['confirm'],
                    params = {
                        orderNo: this.orderNo, //订单编号
                        payType: 'cashOnDelivery' //支付方式 onlinePayment("在线支付"), cashOnDelivery("货到付款") 当前只支持 货到付款
                    };
                    if (this.postscript) {
                        params.postscript = this.postscript;
                    }
                return Http.post(url, params);
            },
            //商品列表
            getList: function() {
                var url = AppConfig['host'] + AppConfig['order']['list'],
                    p = '';
                for (i in this.where) {
                    if (this.where[i] !== false && this.where[i] != -1) {
                        p += !~p.search(/\?/) ? '?' : "&";
                        p +=  i+'='+this.where[i];
                    }
                }
                url += p ;
                return Http.secretGet(url);
            },
            nextPage: function() {
                if (this.isLoad || this.isFinish()) return false;
                this.isLoad = true;
                return this.getList()
                    .success(function(data){
                        //console.log(data);
                        this.list = this.list.concat(data.list);
                        this.isLoad = false;
                        this.where.pageNumber += 1;
                        this.maxPage = data.pageCount;
                    }.bind(this))
                    .error(function(data){
                        this.isLoad = false;
                        console.log(data);
                    }.bind(this))
            },
            /**
             * 订单日志
             * @return {[type]}
             */
            requestLog: function() {
                var url = AppConfig['host'] + AppConfig['order']['log'] + this.orderNo;
                return Http.get(url)
                    .success(function(data){
                        this.logList = data;
                    }.bind(this))
                    .error(function(data){
                        console.log(data)
                    })
            },
            /**
             * 删除订单
             * @param  {int} orderNo 订单编号
             * @return {[type]}         [description]
             */
            deleteOrder: function(orderNo, sCallBack, eCallBack) {
                var url = AppConfig['host'] + AppConfig['order']['deleteOrder'],
                    params = {orderNo: orderNo};
                Http.post(url, params)
                    .success(function(data) {
                        if (sCallBack) sCallBack(data);
                    })
                    .error(function(data){
                        if (eCallBack) eCallBack(data);
                    })
            },
            /**
             * 完成订单
             * @param  {int} orderNo 订单编号
             *
             */
            finishOrder: function(orderNo, sCallBack) {
                var url = AppConfig['host'] + AppConfig['order']['finish'],
                    params = {orderNo: orderNo};
                Http.post(url, params)
                    .success(function(data) {
                        if (sCallBack) sCallBack(data);
                    })
                    .error(function(data){
                        console.log(data);
                    })
            },

            /**
             * 判断是否已经全部加载完成
             * @return {Boolean}
             */
            isFinish: function() {
                if (typeof this.maxPage == 'number' && this.where.pageNumber > this.maxPage)
                    return true;
                return false;
            },
            initData: function() {

                this.isLoad = false;
                this.maxPage = null;
                this.logList = [];// 订单日志
                this.where.pageNumber = 1;
                this.list = [];//订单列表
            },

            orderStatus: function() {
                return {
                        '-1':'全部',
                        '0': '待确认',
                        '1': '待付款',
                        '2': '待发货',
                        '3': '待收货'
                    }
            }
        }

        return Order;
    })

    //会员
    .factory('MemberServices', function(Http, EncryptPwd) {

        var Member = function(){};

        Member.prototype = {

            //获取会员信息
            getInfo: function() {
                var url = AppConfig['host'] + AppConfig['member']['info'];
                return Http.secretGet(url);
            },

            //修改密码
            modifyPwd: function(oldPwd, newPwd, sCallBack, eCallBack) {
                EncryptPwd([oldPwd, newPwd], function(data) {
                    var url = AppConfig['host'] + AppConfig['member']['modifyPwd'];

                    Http.post(url, {oldPassword: data[0], newPassword: data[1]})
                        .success(function(data){
                            if(sCallBack)
                                sCallBack(data);
                        })
                        .error(function(data, states) {
                            if (states == 400 && eCallBack) {
                                eCallBack(data.error);
                            }
                        })
                })
            },

            /**
             * 发送邮箱验证码
             * @param  {[type]} email     [description]
             * @param  {[type]} sCallBack [description]
             * @param  {[type]} eCallBack [description]
             * @return {[type]}           [description]
             */
            sendCaptcha: function(email, sCallBack, eCallBack) {
                var url = AppConfig['host']+ AppConfig['member']['captcha'],
                    params = {email: email};
                Http.post(url ,params)
                    .success(function(data){
                        if (data.type && data.type.toLowerCase() == 'error' && eCallBack) {
                            eCallBack(data.content);
                        } else {
                            sCallBack();
                        }
                    })

            },

            verifyEmail: function(email, captcha, sCallBack, eCallBack) {
                var url = AppConfig['host'] + AppConfig['member']['verify'],
                    params = {email: email, code: captcha};
                Http.post(url ,params)
                    .success(function(data){
                        if (data.type && data.type.toLowerCase() == 'error' && eCallBack) {
                            eCallBack(data.content);
                        } else {
                            sCallBack(data);
                        }

                    })

            }
        }


        return Member;

    })

    //到货通知
    .factory('StockNoticeServices', function(Http) {
        var aRootUrl = AppConfig['stocknotify'];
        return {
            /**
             * 注册到货通知
             * @param nId
             * @returns {*}
             */
            fRegister: function(nId) {
                var sUrl = AppConfig['host'] + aRootUrl['register'],
                    params = {id: nId};
                return Http.post(sUrl, params);
            },
            /**
             * 获取到货通知列表
             */
            fList: function() {
                var sUrl = config['host'] + aRootUrl['list'];

            },

            /**
             * 删除到货通知
             */
            fDelete: function() {

            }



        }
    })

    //商品收藏
    .factory('FavoriteServices', function(Http) {
        return {
            isLoad : false,
            //获取标签列表
           getTagList: function() {
               return Http.secretGet(AppConfig['host'] + AppConfig['favorite']['tagList']);
           },

            /*
                添加收藏
                @params int 商品id
                @params string 标签名
            */
            add: function(nId, sTag) {
                sTag = sTag || '';
                var params = {
                    ids: nId,
                    tag: sTag
                };

                return Http.post(AppConfig['host'] + AppConfig['favorite']['add'], params);
            },
            /*
                获取收藏列表
                @params int tagId 标签id
                @params int pageNumber 当前页 default 1
                @params int pageSize 每页显示数量 default 20
             */
            list: function(tagId, pageNumber, pageSize) {
                var params = {
                    tagId: tagId,
                    pageNumber: pageNumber || 1,
                    pageSize: pageSize || 20
                }
                var sUrl = AppConfig['host'] + AppConfig['favorite']['list'];
                for (var key in params ) {
                    sUrl += !~sUrl.search(/\?/) ? '?' :'&';
                    sUrl += key + '=' + params[key];
                }
                return Http.secretGet(sUrl)
            },
            /*
                删除收藏商品
                @params tagId  商品标签id
                @params sId string 商品id 1,1,1
             */
            del: function(tagId, sId) {
                var sUrl = AppConfig['host'] + AppConfig['favorite']['del'],
                    params = {tagId: tagId, ids: sId};
                return Http.post(sUrl, params);
            },

        }

    })

    //密码加密
    .factory('EncryptPwd',  function($http, $rootScope){
        return function(aPwd, callback) {

            var url = AppConfig['host'] + AppConfig['login']['publicKey'];

            $http.get(url)
                .success(function(data){
                    var ePwd = null;
                    var rsaKey = new RSAKey();
                    rsaKey.setPublic(b64tohex(data.modulus), b64tohex(data.exponent));

                    if (typeof aPwd == 'string') {
                        ePwd = hex2b64(rsaKey.encrypt(aPwd));
                    } else {
                        ePwd = [];
                        for(var i = 0; i < aPwd.length; i++) {
                            ePwd[i] = hex2b64(rsaKey.encrypt(aPwd[i]));
                        }
                    }
                    if (callback) {
                        callback(ePwd)
                    }
                });
        }
    })
    //促销
    .factory('ActivityServices', function(Http) {
        var sUrl = AppConfig['host'] + AppConfig['activity']['home'];
        return {
            get: function() {
                return Http.get(sUrl);
            }
        }
    })

