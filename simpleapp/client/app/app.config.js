'use strict';

angular.module('simpleApp', [
  'ngRoute'
]);

angular.
  module('simpleApp').
  config(['$locationProvider' ,'$routeProvider',
    function config($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');

      $routeProvider.
        when('/home', {
          template: '<home></home>'
        }).
        otherwise('/home');
    }
  ]);
