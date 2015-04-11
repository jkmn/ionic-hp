/**
*  Module
*
* Description
*/
angular.module('starter.directive', [])

.directive('hideTabs', function($rootScope) {
	return {
		restrict: 'AC',
		replace: false,
		link: function(scope, iElm) {
            scope.$on('$ionicView.beforeEnter', function() {
                $rootScope.hideTabs = true;
            })
		}
	}
})

    .directive('hasTabs', function($rootScope) {
        return {
            restrict: 'AC',
            replace: false,
            link: function(scope, iElm) {
                scope.$on('$ionicView.beforeEnter', function() {
                    $rootScope.hideTabs = false;
                })
            }
        }
    })