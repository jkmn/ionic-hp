angular.module('starter.controllers', [])
    .controller('RootCtrl', function($scope, LoginServices, $state,$ionicHistory,LoginFactory, $ionicTabsDelegate, $ionicPopup,CartServices, FavoriteServices, ProductServices) {

        //$scope.userIsLogin = function(sCallBack) {
        //    LoginServices.loginStatus(function(){
        //        if (sCallBack) sCallBack();
        //    }, function() {
        //        LoginFactory.openModal({
        //            scope: $scope,
        //            afterClose: function() {
        //                //$ionicTabsDelegate.select(0);
        //                $scope.$broadcast('afterClose', true);
        //            },
        //            successLogin: function() {
        //                $scope.$broadcast('loginSuccess', true);
        //            }
        //        });
        //    });
        //}
        var oCart = null;
        //加入购物车
        $scope.fAddCart = function(item) {
            $scope.addCartItem = item;
            $scope.addCartItem.addNum = 1;
            if (!oCart) {
                oCart = new CartServices();
            }
            //验证用户是否登陆过
            //$scope.userIsLogin(function() {
                var myPopup = $ionicPopup.show({
                    templateUrl: 'templates/cart/alertNum.html',
                    title: item.name,
                    scope: $scope,
                    buttons: [
                        { text: '取消' },
                        {
                            text: '<b>确定</b>',
                            type: 'button-positive',
                            onTap: function(e) {

                                if (item.addNum < 1) {
                                    $ionicPopup.alert({title: '购买数量不能小于1'});
                                    e.preventDefault();
                                } else {
                                    //添加到购物车
                                    oCart.add(item.id, item.addNum, function() {
                                        $ionicPopup.alert({title: '添加成功'});
                                    }, function(message) {
                                        $ionicPopup.alert({title:message});
                                        e.preventDefault();
                                    })
                                }
                            }
                        }
                    ]
                });
            //})

        }

        //商品收藏
        $scope.addFavorite = function(item){
            $scope.rootTagList = [];
            $scope.rootSelected = {};
            //$scope.userIsLogin(function() {
                FavoriteServices.getTagList()
                    .success(function(data){
                        $scope.rootTagList = data;
                        $scope.rootSelected.tag= data[0];
                    })

                $ionicPopup.show({
                    title: '加入收藏夹',
                    templateUrl: "templates/goods/favorite.html",
                    scope: $scope,
                    buttons:  [{ // Array[Object] (optional). Buttons to place in the popup footer.
                        text: '取消',
                        type: 'button-default',
                        onTap: function(e) {
                            // e.preventDefault() will stop the popup from closing when tapped.
                        }
                    }, {
                        text: '确定',
                        type: 'button-positive',
                        onTap: function(e) {

                            FavoriteServices.add(item.id, $scope.rootSelected.tag.tag || '')
                                .success(function(data) {
                                    $ionicPopup.alert({title: data.message});
                                })
                                .error(function(data, status) {
                                    if (status == 400) {
                                        $ionicPopup.alert({title: data.error});
                                        e.preventDefault();
                                    }
                                })
                        }
                    }]
                })
            //})
        };

        //下拉刷新
        $scope.doRefresh = function() {
            $scope.$broadcast('doRefresh' + $state.current.name,true);
        }
        $scope.recentlyBatch = function(item) {
            ProductServices.fRecentlyBatch(item.id, function(message) {
                $ionicPopup.alert({title: message});
            })
        }


    })

    //分类
    .controller('CategoryCtrl', function($scope, $state,$rootScope, $ionicScrollDelegate, CategoryServices) {
        var child = {};
        $scope.category = [];
        //获取顶级分类
        function getTop(){
            CategoryServices.getTop({
                timeout: function() {
                    getTop();
                },
                success: function(data) {
                    $scope.category = data;
                },
                finally: function() {
                    $scope.$broadcast('scroll.refreshComplete');
                }
            })
        }
        //获取子类
        function getChild(id) {
            if (!child[id]) {
                CategoryServices.getCategoryById(id, {
                    success: function(data) {
                        child[id] = data;
                    },
                    timeout: function() {
                        $scope.showChild(group);
                    }
                })
            }
        }
        //在载入前 先判断是否已经载入分类 没有的话去请求载入
        $scope.$on('$ionicView.beforeEnter', function() {
            if (!$scope.category.length) {
                getTop();
            }
        });
        //下拉刷新
        $scope.doRefresh = function() {
            var child = {};
            getTop();
        }
        //载入并显示子类
        $scope.showChild = function(group) {
            var id = group.id;
            group.show = !group.show;
            $ionicScrollDelegate.resize();
            getChild(id);
        }
        $scope.isGroupShown = function(group) {
            return group.show;
        }
        $scope.gGroupChild = function(group) {
            return child[group.id];
        }
    })

    //商品列表
    .controller('GoodsListCtrl',  function($scope, $state,$rootScope, $ionicHistory,$ionicModal, $stateParams, $timeout, $ionicNavBarDelegate, $ionicScrollDelegate, GoodsListServices, FavoriteServices) {
        var oGoodsListServices = new GoodsListServices();
        if ( $stateParams.id) {
            oGoodsListServices.where.cat = $stateParams.id;
        }
        if($stateParams.keyword) {
            var keyword = $stateParams.keyword;
            try {
                keyword = decodeURIComponent(keyword);
            } catch (e) {}
            keyword = encodeURIComponent(keyword);
            oGoodsListServices.keyword = keyword;
        }
        if ($stateParams.activityId) {
            oGoodsListServices.where.activity = $stateParams.activityId;
        }
        if ($stateParams.promotion) {
            oGoodsListServices.where.promotionType = $stateParams.promotion;
        }


        $scope.showSubHeader = false;
        $scope.toggleSubHeader = function() {
            $scope.showSubHeader = !$scope.showSubHeader;
        }

        $scope.goodsList = oGoodsListServices;
        //加载更多
        $scope.nextPage = function() {
           var h = oGoodsListServices.nextPage();
            if (h)
               h
                   .error(function(data, status) {
                       if (status == 0) {
                           hasMore = false;
                       }
                   })
                   .finally(function(){
                       $scope.$broadcast('scroll.infiniteScrollComplete');
                       $scope.$broadcast('scroll.refreshComplete');
                });
        }
        var hasMore = true;
        $scope.hasMore = function() {
            return !oGoodsListServices.isFinish() && hasMore;
        }
        $scope.$on('doRefresh' + $state.current.name, function(data) {
            hasMore = true;
            oGoodsListServices.initData();
            $scope.nextPage();
        })

        $scope.tempFilter = []; //临时存放筛选条件
        $scope.tempFilterList = [];//临时筛选列表

        $scope.$on('$ionicView.beforeLeave', function(){
            hasMore = false;
        })
        $scope.$on('$ionicView.afterLeave', function() {
            $scope.tempFilter = []; //临时存放筛选条件
            $scope.tempFilterList = [];//临时筛选列表
            $scope.modal.remove();
            $scope.listModal.remove();
        })
        $scope.$on('$ionicView.afterEnter', function() {
                hasMore = true;
                $ionicModal.fromTemplateUrl('templates/goods/filter.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $scope.modal = modal;
                });

                $ionicModal.fromTemplateUrl('templates/goods/filter-list.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    $scope.listModal = modal;
                });
            })

        $scope.openFilterModal = function() {
            copyFilterToTemp();
            $scope.modal.show();
        }

        //拷贝过滤条件到临时地址
        function copyFilterToTemp() {
            $scope.tempFilter = $.extend(true, [], oGoodsListServices.filter);
        }

        $scope.closeFilterModal = function() {
            $scope.modal.hide();
        }

        $scope.openFilterListModal = function(item) {
            $scope.listModal.show();
            //oGoodsListServices.loadFilterList(item.key)
            loadFilterList(item.key);
        }

        function loadFilterList(key) {
            $scope.tempFilter.forEach(function(item) {
                if (item.key == key)
                    $scope.tempFilterList = item;
            });
        }

        $scope.closeFilterListModal = function() {
            $scope.listModal.hide();
        }

        $scope.selectedFilter = function(value) {

            //oGoodsListServices.selectFilter(item);
            $scope.tempFilter.forEach(function (item) {
                if (item.key == $scope.tempFilterList.key) {
                    $scope.tempFilterList.list.forEach(function(d) {
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
                        item.selected = false;
                    }
                }
            });
            $timeout(function() {
                $scope.closeFilterListModal();
            },300)
        }
        $scope.goToSearch = function(){
            $state.go('tab.search');
        }

        $scope.getFilterList = function() {
            return $scope.tempFilterList.list;
        }

        $scope.resetFilter =  function() {
            oGoodsListServices.resetFilter();
            copyFilterToTemp();
        }
        $scope.sureFilter = function() {
            oGoodsListServices.filter = $.extend(true, oGoodsListServices.filter, $scope.tempFilter);
            oGoodsListServices.where = $.extend({}, oGoodsListServices.where,{
                page: 1, //当前页
                manufacturer:0,//生产厂家
                drugform:0,//剂型
                prescribeType: 0,//处方类型
                medicalInsuranceType: 0//医保类型
            });

            oGoodsListServices.filter.forEach(function(item) {
                if (item.selected) {
                    oGoodsListServices.where[item.key.substring(0,  item.key.length - 4)]= item.selectedID;
                }
            });
            oGoodsListServices.initData();
            $ionicScrollDelegate.resize();
            $scope.nextPage();
            $scope.closeFilterModal();
        }
    })

    //商品
    .controller('ProductCtrl', function($scope,$rootScope, $state, $ionicPopover, $state,$ionicActionSheet, $stateParams, $ionicPopup, CartServices, LoginFactory, ProductServices, LoginServices, MemberServices, StockNoticeServices, FavoriteServices) {
        var nId = parseInt($stateParams.id),
            oCart = new CartServices(),
            oMember = null;
        $scope.product = {};
        $scope.isLogin = false;
        $scope.showPromotionInfo = false;

        $scope.togglePromotion = function() {
            $scope.showPromotionInfo = !$scope.showPromotionInfo;
        }


        $scope.openLoginModel = function() {
            $scope.userIsLogin()
        }

        $scope.$on('loginSuccess', function(){
            $scope.isLogin = true;
            request();
        })

        $scope.$on('doRefresh'+ $state.current.name ,function() {
            request().finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            })
        })
        $scope.showSubHeader = false;

        $scope.toggleSubTabs = function($event) {
            $scope.showSubHeader = !$scope.showSubHeader;
            //$scope.popover.show($event);
        }



        $scope.$on('$ionicView.beforeEnter', function() {
            var template = '<ion-popover-view class="popover product-header-popover"><ion-content scroll="false"> <div class="list"><a href="#/tab/category"  class="item item-icon-left"><i class="icon ion-home"></i>分类</a></div></ion-content></ion-popover-view>';
            $scope.popover = $ionicPopover.fromTemplate(template, {
                scope: $scope
            });
        })

        $scope.$on('$ionicView.beforeLeave', function() {
            $scope.popover.remove();
        })


        //到货通知
        $scope.arrivalNotice =  function() {
            //验证用户是否登陆过
            //$scope.userIsLogin(function() {
                //step1 验证用户邮箱是否有维护
                if (!oMember) {
                    oMember = new MemberServices();
                }
                oMember.getInfo()
                    .success(function(data) {
                        //如果用户邮箱没维护 则通知用户去维护邮箱
                        if (!data.email) {
                            //step2  通知用户前往维护邮箱
                            var hideSheet = $ionicActionSheet.show({
                                destructiveText: '绑定邮箱',
                                titleText: '请绑定您的邮箱!',
                                cancelText: '取消',
                                cancel: function() {
                                    // add cancel code..
                                },
                                destructiveButtonClicked: function() {
                                    $state.go('tab.modifyemail');
                                    return true;
                                }
                            });

                        } else {
                            //step3 邮箱已存在 注册商品到到货通知
                            StockNoticeServices.fRegister( $scope.product.id)
                                .success(function(data) {
                                    $ionicPopup.alert({title: data.message});
                                })
                                .error(function(data, status) {
                                    if (status == 400) {
                                        $ionicPopup.alert({title: data.error});
                                    }
                                })
                        }
                    })
            //})

        }


        //请求数据
        request();
        function request() {
            return ProductServices.getById(nId)
                .success(function (data) {
                    $scope.product = data;
                })
        }

    })

    //搜索
    .controller('SearchCtrl', function($scope, $ionicActionSheet, $timeout, $state, SearchServices, History) {

        var timeout,
            searchList = [],
            isSearch = false,
            isEmpty = false,
            oHistory = new History();

        $scope.keyword = '';
        var aHistoryList = oHistory.get();

        $scope.$on('$ionicView.beforeEnter', function() {
            aHistoryList = oHistory.get();
        })

        $scope.$watch('keyword', function(value) {

            if (timeout) {
                $timeout.cancel(timeout);
            }
            if (value) {
                timeout = $timeout(function(){
                    isSearch = true;
                    isEmpty = false;
                    SearchServices.findByKeyWord(encodeURIComponent(value))
                        .success(function(data) {
                            searchList = data;
                            if (!searchList.length) {
                                isEmpty = true;
                            }
                        })
                },300)
            } else {
                isSearch = false;
                searchList = [];
                isEmpty = false;
            }
        });



        $scope.search = function() {
            if ($.trim($scope.keyword) == '') {return false;}
            $state.go('goodsListSearch', {keyword: encodeURIComponent($scope.keyword)});
        }

        //是否显示历史记录
        $scope.showHistory = function() {
            return !isSearch && !!aHistoryList.length;
        }

        $scope.getSearchList = function() {
            return searchList;
        }

        $scope.getHistoryList = function() {
            return aHistoryList;
        }
        $scope.isNotFind = function(){
            return isEmpty;
        }

        $scope.clearHistory = function() {
            $ionicActionSheet.show({
                destructiveText: '确定',
                titleText: '您确定要清空历史记录',
                cancelText: '取消',
                cancel: function() {
                    // add cancel code..
                },
                destructiveButtonClicked: function(index) {
                    oHistory.remove();
                    aHistoryList = [];
                    return true;
                }
            });
        }


        $scope.addHistory = function(item) {
            oHistory.add({name: encodeURIComponent(item.name)});
        }

    })

    //购物车
    .controller('CartCtrl', function($scope, $ionicHistory,$ionicPopup, $timeout, $state, CartServices, OrderServices) {
        var oCart = new CartServices(),
            oOrder = null;
        $scope.cart = oCart;
        $scope.$on('$ionicView.beforeEnter', function(){
            $scope.isFinishLoad = false;
            $scope.isEdit = false;
            $scope.totalAmount = 0;
            $scope.isChecked = false;
            oCart.getList()
                .finally(function() {
                    $scope.isFinishLoad = true;
            })
        })
        $scope.$on('doRefresh' + $state.current.name, function() {
            oCart.getList()
                .finally(function() {
                    $scope.$broadcast('scroll.refreshComplete');
                })
        })


        $scope.toggle = function() {
            $scope.isEdit = !$scope.isEdit;
        }
        //$scope.getList = function() {
        //    return oCart.list;
        //}
        $scope.addCartItem = {addNum: 1};

        //打开商品修改
        $scope.openNumPanel = function(item) {
            $scope.addCartItem.addNum = item.quantity;
            var myPopup = $ionicPopup.show({
                templateUrl: 'templates/cart/alertNum.html',
                title: '修改数量',
                scope: $scope,
                buttons: [
                    { text: '取消' },
                    {
                        text: '<b>确定</b>',
                        type: 'button-positive',
                        onTap: function(e) {

                            if ($scope.addCartItem.addNum < 1) {
                                $ionicPopup.alert({title: '商品数量不能小于1'});
                                e.preventDefault();
                            } else {
                                oCart.edit(item.id, $scope.addCartItem.addNum)
                                    .success(function(data){
                                        $ionicPopup.alert({title: "数量修改成功"});
                                        item.quantity = $scope.addCartItem.addNum;
                                        setCheckedTotalAmount();
                                    })
                                    .error(function(data, status){
                                        if (status == 400) {
                                            $ionicPopup.alert({title: data.error});
                                        }
                                        e.preventDefault();
                                    })
                            }

                        }
                    }
                ]
            });
        }

        var timeout;
        $scope.changeCartNum = function(item) {
             if (timeout) {
                 $timeout.cancel(timeout);
             }
            timeout = $timeout(function(){
                oCart.edit(item.id, item.quantity)
                    .success(function(data){
                        if ( data.type.toLocaleLowerCase() == 'error') {
                            $ionicPopup.alert({title: data.tip[1]})
                        } else {
                            item.goods.smallPrice = data.price;
                        }
                        setCheckedTotalAmount()
                    })
                    .error(function(data, status) {
                        if (status == 400) {
                           if (data.error != '系统错误')
                               $ionicPopup.alert({title: data.error});
                            setCheckedTotalAmount()
                        }
                    })
            },300)
        }

        $scope.pulsNum = function(item) {
            item.quantity++;
            $scope.changeCartNum(item);
        }

        $scope.minusNum = function(item) {
            if (item.quantity == 1) {
                $ionicPopup.alert({title: '商品数量不能小于1'});
                return ;
            }
            item.quantity--;
            $scope.changeCartNum(item);
        }
        //删除订单项
        $scope.deleteCartItem = function(item, key) {
            oCart.del(item.id)
                .success(function(data) {
                    $ionicPopup.alert({title :data.message});
                    oCart.list.splice(key,1);
                })
                .error(function(datam, status){
                    if(status == 400) {
                        $ionicPopup.alert({title :data.error});
                    }
            })

        }

        $scope.createOrder = function() {
            var aIds = getCheckedIds();
            if (!aIds.length) {
                $ionicPopup.alert({title: '请先选择商品!'});
                return;
            }

            if (oOrder == null ) {
                oOrder = new OrderServices();
            }

            oOrder.create(aIds.join(','))
                .success(function(data) {
                    if (data.type.toLowerCase() == 'success') {
                        $scope.totalAmount = 0;
                        $scope.isChecked = false;
                        $state.go('orderCreate', {orderNo: data.orderNo});
                    } else {
                        $('[goods-code=' + data.result[0].goodsCode + ']').addClass('cart-error');
                        var sErrorMsg = '';

                        if($.isArray(data.result[0].tip))
                            sErrorMsg = data.result[0].tip[0];
                        else
                            sErrorMsg = data.result[0].tip;

                        $ionicPopup.alert({
                            title:sErrorMsg
                        })
                    }
                })
                .error(function(data, status) {
                    if (status == 400) {
                        $ionicPopup.alert({title: data.error});
                    }
                })


        }
        $scope.checkedItem = function(item) {
            if (item.isChecked == false) {
                $scope.isChecked = false;
            } else {
                var allChecked = true;
                oCart.list.forEach(function(item) {

                    if (!item.isChecked){
                        allChecked = false;
                    }
                })
                $scope.isChecked = allChecked;
            }
            setCheckedTotalAmount();


        }

        $scope.checkedAll = function() {
            $scope.totalAmount = 0;
            oCart.list.forEach(function(item) {
                item.isChecked = $scope.isChecked;
            })
            setCheckedTotalAmount();
        }

        function setCheckedTotalAmount() {
            $scope.totalAmount = 0;
            oCart.list.forEach(function(item) {
                if (item.isChecked) {
                    $scope.totalAmount += item.goods.smallPrice * item.quantity;
                }
            })
        }

        //获取选中的购物车项的id
        function getCheckedIds() {
            var aIds = []
            oCart.list.forEach(function(item) {
                if (item.isChecked) {
                    aIds.push(item.id);
                }
            })
            return aIds;
        }
    })
    //创建订单
    .controller('OrderCreateCtrl', function($scope, $stateParams, $ionicPopup, $state, OrderServices) {
        var orderNo = $stateParams.orderNo;
        $scope.oOrder = new OrderServices();
        $scope.oOrder.orderNo = orderNo;
        $scope.oOrder.detail();
        $scope.msg = {};
        //确定订单
        $scope.finishOrder = function() {
            $scope.oOrder.postscript = $scope.msg.orderMsg;

            //留言内容不能大于127
            if ($scope.msg.orderMsg.length && $scope.msg.orderMsg.length > 127) {
                $ionicPopup.alert({title: '留言内容长度不能大于127个字'});
                return false;
            }

            $scope.oOrder.confirm()
                .success(function() {
                    $state.go('orderFinish', {orderNo:orderNo});
                })
                .error(function(data, status) {
                    if (status == 400) {
                        $ionicPopup.alert({title: data.error});
                    }
                })
        }
        //取消订单
        $scope.cancelOrder = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: '确定取消此订单!',
                cancelText: '取消',
                okText: '确定'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    $scope.oOrder.cancel(orderNo, function(data) {
                        if (data.error) {
                            $ionicPopup.alert({title: data.error});
                        } else {
                            $ionicPopup.alert({title: '取消成功!'});
                            $state.go('tab.category');
                        }
                    }, function(data){
                        $ionicPopup.alert({title: data});
                    });
                }
            });
        }

        $scope.deleteItem = function(item, key) {
            $scope.oOrder.deleteItem(item.id)
                .success(function(data){
                    $scope.oOrder.aDetail.totalAmount = data.totalAmount;
                    $scope.oOrder.aDetail.orderItemList.splice(key,1);
                    $ionicPopup.alert({title: '删除成功!'});
                })
                .error(function(data){
                    $.mobile.loading('hide');
                })
        }


    })

    .controller('MemberCtrl', function($scope, $state, $ionicPopup ,LoginServices, LoginFactory, $ionicTabsDelegate, MemberServices) {
        var oMemberServices = new MemberServices();


        $scope.member = {};
        oMemberServices.getInfo()
            .success(function(data) {
                $scope.member = data;
            })

        //退出登录
        $scope.logOut = function() {
            LoginServices.logout()
                .success(function(data) {
                    $state.go('login');
                })
        }
        $scope.pwd = {
            opwd: '',
            npwd: '',
            apwd: ''
        }
        //修改密码
        $scope.modifyPwd = function() {
            $scope.error = '';
            if ($.trim( $scope.pwd.opwd) == '') {
                $scope.error = '原始密码不能为空';
            }
            else if ($.trim( $scope.pwd.npwd) == '') {
                $scope.error = '新密码不能为空';
            }
            else if ( $scope.pwd.npwd !=  $scope.pwd.apwd) {
                $scope.error = '两次密码不一致';
            }

            if (!$scope.error) {
                oMemberServices.modifyPwd($scope.pwd.opwd, $scope.pwd.npwd, function(data) {
                    $scope.pwd = {
                        opwd: '',
                        npwd: '',
                        apwd: ''
                    }
                    $ionicPopup.alert({title: '密码修改成功'});
                },function(message){
                    $scope.error = message;
                })
            }
        }


    })

    //修改邮箱
    .controller('MemberModifyEmailCtrl', function($scope, $ionicPopup, MemberServices){
        $scope.Member = new MemberServices();
        $scope.email = '';
        $scope.codeBtnText = '发送验证码';
        $scope.isSend = false;
        $scope.code = '';
        $scope.error = '';
        $scope.times = 60;
        $scope.params = {
            emial: '',
            code: ''
        }
        /**
         * 发送验证码
         * @param  {[type]} $event [description]
         * @return {[type]}        [description]
         */
        $scope.fSendCode = function($event) {
            $scope.error = '';
            if (!/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test($scope.params.email)) {
                $scope.error = '请输入正确的邮箱地址';
            }
            if (!$scope.error) {
                $scope.isSend = true;
                $scope.Member.sendCaptcha($scope.params.email, function(){
                    $scope.times = 60;
                    $scope.codeBtnText = $scope.times + '秒后重新发送验证码';
                    fCountDown();
                }, function(data){
                    $scope.error = data;
                    $scope.isSend = false;
                });
            }
        }

        /**
         * 修改邮箱
         * @return {[type]} [description]
         */
        $scope.fChange =  function() {

            $scope.error = '';
            if (!/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/.test($scope.params.email)) {
                $scope.error = '请输入正确的邮箱地址';
            }
            if ($scope.params.code == '') {
                $scope.error = '验证码不能为空';
            }
            if (!$scope.error) {
                $scope.Member.verifyEmail($scope.params.email, $scope.params.code, function(){
                    $ionicPopup.alert('邮箱修改成功')
                }, function(error) {
                    $scope.error = error;
                });
            }

        }

        //监听倒计时时间
        $scope.$watch('times', function(value) {
            if (value != 60) {
                $scope.codeBtnText = $scope.times + '秒后重新发送验证码';
                if (value == 0) {
                    $scope.codeBtnText = "发送验证码";
                    $scope.isSend = false;
                }
            }
        })
        /**
         * 倒计时
         * @return {[type]} [description]
         */
        function fCountDown() {
            setTimeout(function(){
                if ($scope.times > 0) {
                    $scope.times --;
                    fCountDown();
                }
                $scope.$apply();
            }, 1000)
        }


    })

    //订单
    .controller('OrderListCtrl', function($scope, $state, $ionicPopup, $ionicScrollDelegate ,OrderServices, $ionicModal) {
        var oOrderServices = new OrderServices(),
            loadMore = true;
        $scope.orderStatus = oOrderServices.orderStatus();
        $scope.order = oOrderServices;
        $scope.orderSearch = function() {
            $ionicPopup.prompt({
                title: '请选择月份进行查询',
                inputType: 'month'
            }).then(function(res) {
                console.log('Your password is', res);
            });
        }
        $scope.orderFilter = function(key) {
           if (key != oOrderServices.where.status) {
               oOrderServices.where.status = key;
               oOrderServices.initData();
               $ionicScrollDelegate.resize();
               $scope.nextPage();
           }
        }
        $scope.nextPage = function() {
            var oHttp = oOrderServices.nextPage();
            if (oHttp) {
                oHttp
                    .error(function(data, status) {
                        if (status == 0) {
                            loadMore = false;
                        }
                    })
                    .finally(function(){
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                        $scope.$broadcast('scroll.refreshComplete');
                })
            }
        }
        $scope.$on('doRefresh' + $state.current.name, function() {
            oOrderServices.list = [];
            oOrderServices.where.pageNumber = 1;
            loadMore = true;
            $scope.nextPage();
        });

        $scope.getList = function() {
            return oOrderServices.list;
        }


        $scope.$on('$ionicView.beforeLeave', function() {
            loadMore = false;
        })
        $scope.$on('$ionicView.beforeEnter', function() {
            loadMore = true;
        })

        $scope.hasMore = function() {
            return !oOrderServices.isFinish() && loadMore;
        }

        $ionicModal.fromTemplateUrl('templates/order/detail.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        //打开订单详情
        $scope.openDetailModal = function(item) {
            oOrderServices.orderNo = item.orderNo;
            oOrderServices.aDetail = []; //初始化原有的订单详情列表
            oOrderServices.detail();
            oOrderServices.logList = [];
            oOrderServices.requestLog();
            $scope.modal.show();
        }
        $scope.colseDetailModal = function() {
            $scope.modal.hide();
        }
        $scope.getOrderItemList = function() {
            return oOrderServices.aDetail.orderItemList;
        }
        $scope.getOrderLog = function() {
            return oOrderServices.logList;
        }
        $scope.scrollToTop = function() {
            $ionicScrollDelegate.scrollTop();
        }
        //取消订单
        $scope.fCancelOrder = function(item){
            var confirmPopup = $ionicPopup.confirm({
                title: '确定取消此订单!',
                cancelText: '取消',
                okText: '确定'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    oOrderServices.cancel(item.orderNo, function(data) {
                        if (data.error) {
                            $ionicPopup.alert({title: data.error});
                        } else {
                            $ionicPopup.alert({title: '取消成功!'});
                            item.orderStatus = 'tradeClosed';
                        }
                    }, function(data){
                        $ionicPopup.alert({title: data});
                    });
                }
            });
        };
        //确认收货
        $scope.fFinishOrder = function(item){

            var confirmPopup = $ionicPopup.confirm({
                title: '请确定已经收到货!!',
                cancelText: '取消',
                okText: '确定'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    oOrderServices.finishOrder(item.orderNo, function(data) {
                        if (data.error) {
                            $ionicPopup.alert({title: data.error});
                        } else {
                            $ionicPopup.alert({title: '成功确认收货'});
                            item.orderStatus = 'tradeFinished';
                        }
                    });
                }
            });


        }
        //删除订单
        $scope.fDeleteOrder = function(item, key){

            var confirmPopup = $ionicPopup.confirm({
                title: '您确认删除此订单!',
                cancelText: '取消',
                okText: '确定'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    oOrderServices.deleteOrder(item.orderNo, function(data){
                        $ionicPopup.alert({title: '删除成功!'});
                        oOrderServices.list.splice(key,1);
                    });
                }
            });

        }


    })

    .controller('FavoriteCtrl', function($scope, $ionicPopup, $state, $ionicActionSheet, $ionicScrollDelegate, FavoriteServices) {

        $scope.tagList = []; //标签数组
        $scope.selected = {}; //选择的标签
        $scope.selected.tag = {};
        $scope.selected.nowTag = {};
        $scope.pageNumber = 1;
        $scope.list = [];
        $scope.hasMore = true; //是否还有更多
        $scope.loadMore = true;

        $scope.$on('$ionicView.beforeLeave', function(){
            $scope.loadMore = false;
        })
        $scope.$on('$ionicView.beforeEnter', function(){
            $scope.loadMore = true;
        })

        //监听selectedTag的变化 去获取相对应的收藏商品
        $scope.$watch('selected.tag', function(tag) {
            if (!$.isEmptyObject(tag)) {
                init();
            }
        })

        //下一页
        $scope.nextPage = function() {
             requestList(function() {
                 $scope.$broadcast('scroll.infiniteScrollComplete');
             })
        }



        $scope.$on('doRefresh' + $state.current.name , function() {
            $scope.hasMore = true;
            $scope.loadMore = true;
            $scope.pageNumber = 1;
            $scope.list = [];
            requestList(function() {
                $scope.$broadcast('scroll.refreshComplete');
            })
        })

        $scope.deleteFavoriteItem = function(item, key) {
             $ionicActionSheet.show({

                destructiveText: '确定',
                titleText: '确定删除此收藏的商品',
                cancelText: '取消',
                cancel: function() {
                    // add cancel code..
                },
                 destructiveButtonClicked: function() {

                    FavoriteServices.del($scope.selected.tag.tagId || '', item.id)
                        .success(function(data){
                            if (data.message) {
                                $ionicPopup.alert({title: data.message});
                                $scope.list.splice(key, 1);
                            } else if (data.error) {
                                $ionicPopup.alert({title: data.error});
                            }
                        })
                     return true;
                }
            });
        }

        var isLoad = false;//是否正在加载数据

        function init() {
            $scope.list = [];
            $ionicScrollDelegate.resize();
            $scope.hasMore = true;
            $scope.pageNumber = 1;
            $scope.nextPage();
        }
        //请求列表
        function requestList(callBack) {
            if(isLoad || !$scope.hasMore) return false;
            isLoad = true;
            return FavoriteServices.list($scope.selected.tag.tagId || '', $scope.pageNumber)
                .success(function(data) {
                    $scope.list = $scope.list.concat(data.pager.list);
                    if (!$scope.tagList.length) {
                        $scope.tagList = data.tags;
                        $scope.selected.tag =  !$scope.selected.tag.tagId ?  data.tags[0] : $scope.selected.tag;
                        $scope.selected.nowTag = $scope.selected.tag;
                    }
                    $scope.pageNumber += 1;
                    if ($scope.pageNumber > data.pager.pageCount) $scope.hasMore = false;
                })
                .error(function(data, status){
                    if (status == 0) {
                        $scope.loadMore = false;
                    }
                })
                .finally(function () {

                    isLoad = false;
                    if (callBack) callBack()

                })

        }

    })

    .controller('LoginCtrl', function($scope, $state,LoginServices, $ionicHistory,ipCookie) {
        $scope.user = {
            username: ipCookie('userName') || '',
            password: ''
        }
        $scope.userLogin = function() {
            $scope.loginError = '';
            if (!$.trim($scope.user.username).length) {
                $scope.loginError = '用户名不能为空';
            }
            if (!$.trim($scope.user.password).length) {
                $scope.loginError = '密码不能为空';
            }
            if(!$scope.loginError) {
                LoginServices.getPublicKey()
                    .success(function(data){
                        var rsaKey = new RSAKey();
                        rsaKey.setPublic(b64tohex(data.modulus), b64tohex(data.exponent));
                        var password = hex2b64(rsaKey.encrypt($scope.user.password));
                        LoginServices.login({username:$scope.user.username, password: password})
                            .success(function(data){
                                ipCookie('userName', $scope.user.username, {expires: 365*24*60*60});
                                //登陆成功跳转到首页
                                $state.go('tab.category');

                            })

                            .error(function(data, status) {
                                if (status == 400) {
                                    $scope.loginError = data.error;
                                }
                            })
                    })
            }


        }


    })

    //促销活动
    .controller('ActivityCtrl', function($scope, ActivityServices) {

        $scope.list = [];

        //$scope.$on('$ionicView.beforeEnter', function() {
            request();
        //})

        function request() {
            ActivityServices.get()
                .success(function(data) {
                    $scope.list = data;
                })
        }
    })