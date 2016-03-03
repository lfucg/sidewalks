/*--------------Modules--------------*/

/* Main Project Dashboard App Module */
var sidewalkTracker = angular.module('sidewalkTracker', [ 'ngSanitize', 'stDirectives', 'stControllers', 'stServices', 'ui.router', 'ui.bootstrap']);

/* Directives Module */
var stDirectives = angular.module('stDirectives', []);

/* Controllers Module */
var stControllers = angular.module('stControllers', []);

/* Services Module */
var stServices = angular.module('stServices', []);

/*--------------Routing--------------*/

sidewalkTracker.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
  function($stateProvider, $urlRouterProvider, $locationProvider) {

      $urlRouterProvider.otherwise('/error');
      
      $stateProvider.
      /*Form*/
      state('home', {
        url: '',
        templateUrl: 'templates/submitRequest.html',
        controller: 'submitRequest'
      }).
      state('submit', {
        url: '/submit',
        templateUrl: 'templates/submitRequest.html',
        controller: 'submitRequest'
      }).
    /*List*/
      state('browse', {
        url: '/requests',
        templateUrl: 'templates/viewRequests.html',
        controller: 'viewRequests'
      });

  }]);

/*--------------Controllers--------------*/

stControllers.controller('projectList', ['$scope', '$location', 'getData',
  function ($scope, $location, getData) {

  }]);

/* Project List */
stControllers.controller('projectList', ['$scope', '$location', 'getData',
  function ($scope, $location, getData) {

  }]);

/*--------------Directives--------------*/


stDirectives.directive('statusFlag', function () {
    return {
        restrict: 'AE',
        scope: {
          label: '@'
        },
        template:
          '<span class="btn btn-success">{{label}}</span>'
    };
});


/*--------------Filters--------------*/

/* titlecase filter */
sidewalkTracker.filter('titlecase', function () {
  return function (input) {
    var bigwords = /\b(LFUCG|ac|aka|llc|hvac|[a-z]\/[a-z]|i|ii|iii|iv|v|vi|vii|viii|ix)\b/i;
	var smallwords = /\b(an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|to|vs)\b/i;
    var words = input.toLowerCase().split(' ');
    for (var i = 0; i < words.length; i++) {
      if (words[i].match(bigwords) !== null) {words[i] = words[i].toUpperCase()}
      else if (words[i].match(smallwords) !== null)	{words[i] = words[i].toLowerCase()}
      else {words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1)}
    }
    return words.join(' ');
  }
});

sidewalkTracker.filter('percent', function () {
  return function (input, decimals) {
  var per = input * 100
  return per.toFixed(decimals) + '%'
  }
  })