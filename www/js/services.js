angular.module('starter.services', ['starter.factory', 'starter.appConfig'])

    //分类
    .factory("CategoryServices", function(HttpFactory, AppUrl) {
        var url = AppUrl['host'] + AppUrl['category'];

        return {
            getTop: function(handle) {
                 return HttpFactory({
                    url: url,
                    data: {isTop: true},
                    cache: true,
                    hasLoading: true
                }, handle);
            },

            getCategoryById: function(id, handle) {
                return HttpFactory({
                    url: url,
                    data: {parentId: id},
                    cache: true
                }, handle);
            }

        }
    })
    //商品列表
    .factory('GoodsListServices', function(Http, AppUrl, HttpFactory) {

            var url = {
                def: AppUrl['host'] + AppUrl['goods']['list'],
                search: AppUrl['host'] +  AppUrl['goods']['search_list'],
                promotion: AppUrl['host'] + AppUrl['goods']['promotion']
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
            List.prototype.nextPage = function(handle){
                if (this.isLoad ) return false;
                this.isLoad = true;
                var sURl = this.createUrl();

                HttpFactory({
                    url: sURl,
                    cache: true
                }, handle)

                // return Http.secretGet(sURl, {cache: true})
                //     .success(function(data){
                //         this.item  = this.item.concat(data.pager.list);
                //         this.isLoad = false;
                //         this.where.page += 1;
                //         this.maxPage = data.pager.pageCount;
                //         this.loadFilter(data.selectorMap);
                //     }.bind(this))
                //     .error(function(data, status){
                //         if (status == 0) {
                //             this.isLoad = true;
                //         } else {
                //             this.isLoad = false;
                //         }
                //     }.bind(this));
            };


            List.prototype.setData = function(data){
                  this.item  = this.item.concat(data.pager.list);
                  this.isLoad = false;
                  this.where.page += 1;
                  this.maxPage = data.pager.pageCount;
                  this.loadFilter(data.selectorMap);
            }


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
    .factory('ProductServices', function(Http, AppUrl, HttpFactory) {
        return {
            /**
             * 根据id获取商品信息
             * @param  {[int]} id [商品id]
             * @return $http
             */
            getById: function(id, handle) {
                HttpFactory({
                    url: AppUrl['host'] + AppUrl['goods']['product'].replace('{id}',id)
                }, handle)
            },
            /**
             * 获取商品有效期
             * @param  {[int]} nId [商品id]
             * @return {[object]}   $http
             */
            fRecentlyBatch: function(nId, handle) {
                var url = AppUrl['host'] + AppUrl['goods']['validity'];
                HttpFactory({
                    url: url + nId,
                    cache: true
                }, handle)
            }
        }
    })
    //商品搜索
    .factory('SearchServices', function(Http, AppUrl) {
        return {
            findByKeyWord: function(keyword) {
                var request = AppUrl['host'] + AppUrl['goods']['search'] + keyword;
                return Http.secretGet(request, {cache: true});
            }
        }
    })
    //购物车
    .factory('CartServices', function(Http, $ionicPopup, AppUrl) {

        var Cart = function(){
            this.list = [];
        };

        Cart.prototype =  {
            //添加到购物车
            add: function(id, num, sCallBack, eCallBack){
                var params = {goodsId: id, quantity: num};
                Http.post(AppUrl['host'] + AppUrl['cart']['add'], params)
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
                return Http.get(AppUrl['host'] + AppUrl['cart']['list'])
                    .success(function(data) {
                        this.list = data;
                    }.bind(this))
            },
            //修改数量
            edit: function(id, quantity) {
                var params = {cartItemId: id, quantity:quantity};
                return Http.secretPost(AppUrl['host'] + AppUrl['cart']['edit'], params)
            },
            //删除购物车项
            del: function(aIds) {
                var params = {cartItemIds: aIds};
                return Http.post(AppUrl['host'] + AppUrl['cart']['delete'], params);

            }
        }

        return Cart;

    })

    //用户登陆
    .factory('LoginServices', function(Http, AppUrl) {
        var  url = {
            publicKey: AppUrl['host'] + AppUrl['login']['publicKey'],
            login: AppUrl['host'] + AppUrl['login']['login']
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
                var url = AppUrl['host'] + AppUrl['login']['loginStatus'];
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
                var url = AppUrl['host'] + AppUrl['login']['logout'];

                return Http.get(url);
            }
        }
    })

    //订单
    .factory('OrderServices', function(Http, $ionicPopup, AppUrl) {
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
                return Http.post(AppUrl['host'] + AppUrl['order']['create'], params)
            },
            //订单详情
            detail: function() {
                Http.get(AppUrl['host'] + AppUrl['order']['detail'] + this.orderNo, {cache: false})
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
                Http.post(AppUrl['host'] + AppUrl['order']['cancel'], params)
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
                var url = AppUrl['host'] + AppUrl['order']['deleteItem'],
                    params = {id: orderId};
                return Http.post(url, params);
            },
            /*
             提交订单
             return object
             */
            confirm: function() {

                var url = AppUrl['host'] + AppUrl['order']['confirm'],
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
                var url = AppUrl['host'] + AppUrl['order']['list'],
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
                var url = AppUrl['host'] + AppUrl['order']['log'] + this.orderNo;
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
                var url = AppUrl['host'] + AppUrl['order']['deleteOrder'],
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
                var url = AppUrl['host'] + AppUrl['order']['finish'],
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
    .factory('MemberServices', function(Http, EncryptPwd, AppUrl) {

        var Member = function(){};

        Member.prototype = {

            //获取会员信息
            getInfo: function() {
                var url = AppUrl['host'] + AppUrl['member']['info'];
                return Http.secretGet(url);
            },

            //修改密码
            modifyPwd: function(oldPwd, newPwd, sCallBack, eCallBack) {
                EncryptPwd([oldPwd, newPwd], function(data) {
                    var url = AppUrl['host'] + AppUrl['member']['modifyPwd'];

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
                var url = AppUrl['host']+ AppUrl['member']['captcha'],
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
                var url = AppUrl['host'] + AppUrl['member']['verify'],
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
    .factory('StockNoticeServices', function(Http, AppUrl) {
        var aRootUrl = AppUrl['stocknotify'];
        return {
            /**
             * 注册到货通知
             * @param nId
             * @returns {*}
             */
            fRegister: function(nId) {
                var sUrl = AppUrl['host'] + aRootUrl['register'],
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
    .factory('FavoriteServices', function(Http, AppUrl) {
        return {
            isLoad : false,
            //获取标签列表
           getTagList: function() {
               return Http.secretGet(AppUrl['host'] + AppUrl['favorite']['tagList']);
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

                return Http.post(AppUrl['host'] + AppUrl['favorite']['add'], params);
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
                var sUrl = AppUrl['host'] + AppUrl['favorite']['list'];
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
                var sUrl = AppUrl['host'] + AppUrl['favorite']['del'],
                    params = {tagId: tagId, ids: sId};
                return Http.post(sUrl, params);
            },

        }

    })

    //密码加密
    .factory('EncryptPwd',  function($http, $rootScope, AppUrl){
        return function(aPwd, callback) {

            var url = AppUrl['host'] + AppUrl['login']['publicKey'];

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
    .factory('ActivityServices', function(Http, AppUrl) {
        var sUrl = AppUrl['host'] + AppUrl['activity']['home'];
        return {
            get: function() {
                return Http.get(sUrl);
            }
        }
    })

