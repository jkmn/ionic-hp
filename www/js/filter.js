angular.module('starter.filter', [])

    .filter('urlencode', function() {

        var urlencode = function(str) {

            return encodeURIComponent(str);
        };
        return urlencode;

    })
    .filter('urldecode', function() {
        var urldecode = function(str) {
            return decodeURIComponent(str);
        };
        return urldecode;

    })
    .filter('orderStatus', function() {
        var oStatus = {
            waitBuyerConfirmOrder: '等待确认订单',
            waitBuyerPay: '等待付款',
            waitSellerSendGoods: '等待发货',
            waitBuyerConfirmGoods: '等待确认收货',
            tradeFinished: '交易完成',
            tradeClosed: '交易关闭',
            waitSellerAudit: '等待卖家审核'
        }

        return function(status) {
            return oStatus[status];
        }
    })
    .filter('orderStatus', function() {
        var oStatus = {
            waitBuyerConfirmOrder: '等待确认订单',
            waitBuyerPay: '等待付款',
            waitSellerSendGoods: '等待发货',
            waitBuyerConfirmGoods: '等待确认收货',
            tradeFinished: '交易完成',
            tradeClosed: '交易关闭',
            waitSellerAudit: '等待卖家审核'
        }

        return function(status) {
            return oStatus[status];
        }
    })

    //解析商品说明key对应的中文名称
    .filter('productIntoKeyToCh', function() {
        var keys = {
            'compose': '成分',
            'property': '性状',
            'function': '功能主治',
            'direction': '用法用量',
            'badness': '不良反应',
            'taboo': '禁忌',
            'notice': '注意事项',
            'reciprocity': '药物相互作用',
            'store': '贮藏',
            'packing': '包装',
            'validity': '有效期',
            'standard': '执行标准'
        };
        return function(key) {
            return keys[key];
        };

    })

    .filter('default', function() {
        return function(specil, def) {
            if (!specil || (typeof specil == 'string' && !$.trim(specil).length) ) {
                return def;
            }
            return specil;
        }
    })

    .filter('setImgSize', function() {

        function setImgSize(imgUrl, width, height) {
            if (typeof imgUrl == 'string' && imgUrl.length) {

                var index = imgUrl.indexOf('.', imgUrl.length - 7),
                    sPreix = imgUrl.substring(0, index),
                    sSuffix = imgUrl.substring(index, imgUrl.length);

                width = width || $(window).width();

                imgUrl = sPreix + '_' + width + 'x' + height + sSuffix;
            }
            return imgUrl;
        }


        return setImgSize;


    })