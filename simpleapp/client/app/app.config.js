'use strict';

angular.module('simpleApp', [
  'ngRoute',
  'accountSearch'
]);

angular.
  module('simpleApp').
  config(['$locationProvider' ,'$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/accountSearch', {
          template: '<account-search></account-search>'
        }).
        otherwise('/accountSearch');
    }
  ]);
