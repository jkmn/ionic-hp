angular.module('starter.factory', [])


    .factory('LoginFactory', function($ionicModal, $rootScope, LoginServices) {
            var oModal = null,
                params = {};
        function initModal(scope) {
            $ionicModal.fromTemplateUrl('templates/login/index.html', {
                scope: scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                oModal = modal;
                oModal.show()
            });

            scope.user = {
                username: '',
                password: ''
            };
            scope.loginError = '';
            scope.closeLoginModal = function() {
                scope.user.password = '';
                scope.loginError = '';
                oModal.hide();
                if (params.afterClose) {
                    params.afterClose();
                }
            }
            scope.userLogin = function() {
                scope.loginError = '';
                if (!$.trim(scope.user.username).length) {
                    scope.loginError = '用户名不能为空';
                }
                if (!$.trim(scope.user.password).length) {
                    scope.loginError = '密码不能为空';
                }
                if(!scope.loginError) {

                    LoginServices.getPublicKey()
                        .success(function(data){
                            var rsaKey = new RSAKey();
                            rsaKey.setPublic(b64tohex(data.modulus), b64tohex(data.exponent));
                            var password = hex2b64(rsaKey.encrypt(scope.user.password));
                            LoginServices.login({username:scope.user.username, password: password})
                                .success(function(data){
                                    oModal.hide();
                                    if (params.successLogin) {
                                        params.successLogin(data);
                                    }
                                })
                                .error(function(data, status) {
                                    if (status == 400) {
                                        scope.loginError = data.error;
                                    }
                                })
                        })
                }


            }

        }


        return  {
            openModal: function(p) {
                params = p;
                initModal(params.scope);
            },
            closeModal: function() {
                oModal.hide();
            }
        }

        })


    .factory('HttpFactory', function($http, $ionicLoading, $ionicPopup, $state) {


        var fIsPost = function(config) {
            if (config.method == 'post') {
                config.transformRequest = function(data) {
                            return $.param(data || {});
                        }
            }
            return config;
        }
        var fIsGet = function(config) {

            if (config.method == 'get') {

                for (var key in config.data) {
                    config.url += !~config.url.search(/\?/) ? '?' : "&";
                    config.url += key + '=' + config.data[key];
                }
            }

            return config;
        }

        var defHandle = {

            before: function(config, handle){
                if (!handle.beforeRepalce) {
                    if (config.hasLoading) {
                        $ionicLoading.show({template: '加载中...'})
                    }
                }
                if (handle.before) {
                    handle.before();
                }
            },
            success: function(data, status, config, handle){
                if (config.hasLoading) {
                    $ionicLoading.hide();
                }
                if (handle.success) {
                    handle.success(data, status);
                }
            },
            error: function(data, status, config, handle) {
                if (config.hasLoading) {
                    $ionicLoading.hide();
                }
                //链接超时
                if (status == 0) {
                   var confirm=  $ionicPopup.confirm({
                        title: "网络链接异常",
                        cancelText: '取消', // String (default: 'Cancel'). The text of the Cancel button.
                        okText: '重试' // String (default: 'OK'). The text of the OK button.
                    });

                    confirm.then(function(res) {
                        if (res) {
                             if (handle.timeout) {
                                 handle.timeout();
                             }
                        } else {

                        }
                    })

                }
                else if (status == 403) {
                    $state.go('login');
                }
                else if (status == 500 || status ==400 ) {
                    var confirm=  $ionicPopup.confirm({
                        title: data.error,
                        cancelText: '取消', // String (default: 'Cancel'). The text of the Cancel button.
                        okText: '重试' // String (default: 'OK'). The text of the OK button.
                    });
                    confirm.then(function(res) {
                        if (res) {
                             if (handle.error) {
                                 handle.error(data);
                             }
                        } else {

                        }
                    })
                }
            },
            finally: function(data, config, handle) {
                if (handle.finally) {
                    handle.finally();
                }
            }
        }

        var http = function(config, handle) {
            var config = {
                url: config.url || '',
                method: config.method || 'get',
                data: config.data || {},
                headers:  {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                cache: config.cache || false,
                timeout: config.timeout || 20000,
                hasLoading: config.hasLoading || false
            };
            handle = handle || {};
            config = fIsPost(config);
            config = fIsGet(config);
            defHandle.before(config, handle);
            return $http(config)
                .success(function(data, status) {
                    defHandle.success(data, status, config, handle);
                })
                .error(function(data, status) {
                    defHandle.error(data, status, config, handle);
                })
                .finally(function(data) {
                    defHandle.finally(data, config, handle);
                })
        }


        return http;


    })

    .factory('Http', function($http, $state,$rootScope, $ionicLoading, $ionicPopup) {
        var oDefConfig = {
            timeout: 20000,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
        }
        return {
            post: function(url, params, config) {
                $ionicLoading.show({template: 'Loading...'})
                return this.secretPost(url, params, config)
                    .success(function(){
                        $ionicLoading.hide();
                    })
                    .error(function(){
                        $ionicLoading.hide();
                    })
            },

            get: function(url, config) {
                $ionicLoading.show({template: 'Loading...'})
                return this.secretGet(url, config)
                    .success(function(){
                        $ionicLoading.hide();
                    })
                    .error(function(){
                        $ionicLoading.hide();
                    })
            },
            secretPost: function(url, params, config) {
                    var transFn = function(data) {
                            return $.param(params || {});
                        },
                        postCfg = {
                            transformRequest: transFn
                        };
                    config = $.extend(postCfg,oDefConfig, config);
                    return $http.post(url, params, config)
                        .error(function(data, status) {
                            if (status == 403) {
                                $state.go('login');
                            }
                            else if( status == 0) {
                                $ionicPopup.alert({'title': '网络请求超时, 请下拉刷新重试'})
                            }
                            else if(status == 500) {
                                $ionicPopup.alert({title: data.error});
                            }
                        })
            },
            secretGet: function(url, config) {
                config = $.extend({}, oDefConfig, config);
                return $http.get(url, config)
                    .error(function(data, status) {
                        if (status == 403) {
                           $state.go('login');
                        }
                        else if( status == 0) {
                            $ionicPopup.alert({'title': '网络请求超时, 请下拉刷新重试'})
                        }
                        else if(status == 500) {
                            $ionicPopup.alert({title: data.error});
                        }
                    })
            }
        }
    })


    .factory('History', function(){
        var History = function() {}
        History.prototype = {

            add: function(history) {

                var aHistory = this.get();
                aHistory.forEach(function(i, index) {
                    if (i.name == history.name) {
                        aHistory.splice(index, 1);
                    }
                });
                aHistory.unshift(history);
                window.localStorage.setItem('history', JSON.stringify(aHistory));
                return aHistory;

            },
            get: function() {

                return  JSON.parse(window.localStorage.getItem('history')) || [];

            },
            remove: function(){
                return window.localStorage.removeItem('history');
            }

        }
        return History;
    })




