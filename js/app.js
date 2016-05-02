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

      $urlRouterProvider.otherwise('/home');
      
      $stateProvider.
      state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'home'
      }).
      state('submit', {
        url: '/submit/:street',
        templateUrl: 'templates/submit.html',
        controller: 'submit'
      }).
      state('browse', {
        url: '/requests',
        templateUrl: 'templates/browse.html',
        controller: 'browse'
      }).
      state('vote', {
        url: '/vote/:requestId',
        templateUrl: 'templates/vote.html',
        controller: 'vote'
      }).
      state('thanks', {
        url: '/thanks/:requestId',
        templateUrl: 'templates/thanks.html',
        controller: 'thanks'
      }).
      state('contact', {
        url: '/contact',
        templateUrl: 'templates/contact.html',
        controller: 'contact'
      });

  }]);

/*--------------Controllers--------------*/

stControllers.controller('submit', ['$scope', '$location', '$stateParams',
  function ($scope, $location, $stateParams) {

    $scope.existing = true

    $scope.formData = {
      "street" : $stateParams.street
    }

    $scope.submit = function() {
  dataTools.vote($scope.vote).then(function(result){
  $location.path('/thanks/1') 
  })
  }

  }]);

stControllers.controller('browse', ['$scope', '$location', 'dataTools',
  function ($scope, $location, dataTools) {

  dataTools.requests().then(function(result) {
      $scope.requests = result.data.results
  })  

  }]);

stControllers.controller('home', ['$scope', '$location',
  function ($scope, $location) {

  $scope.submit = function() { 
  $location.path('/submit/' + $scope.street)
  }

  }]);

stControllers.controller('thanks', ['$scope', '$location',
  function ($scope, $location) {

  }]);

stControllers.controller('vote', ['$scope', '$location','dataTools', '$stateParams',
  function ($scope, $location, dataTools, $stateParams) {

  $scope.vote = {
  "request_id" : $stateParams.requestId
  }

  $scope.voteCheck = true

  $scope.voteAllowed = function() {
  dataTools.voteCheck($stateParams.requestId,$scope.vote.email).then(function(result){
  $scope.voteCheck = result.data.vote_allowed
  console.log(result.data.vote_allowed)
  })
  } 

  $scope.submit = function() {
  dataTools.vote($scope.vote).then(function(result){
  $location.path('/thanks/1') 
  })
  }  

  }]);

stControllers.controller('contact', ['$scope', '$location',
  function ($scope, $location) {

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

/*--------------Services--------------*/

stServices.factory('dataTools', ['$http', function($http){
  return {
    streets: function(){
      return $http.get('https://sidewalk-tracker.herokuapp.com/api/v1/streets')
    },
    searchStreet: function(street){
      return $http.get('https://sidewalk-tracker.herokuapp.com/api/v1/requests/street/' + street)
    },
    requests: function(){
      return $http.get('https://sidewalk-tracker.herokuapp.com/api/v1/requests')
    },
    voteCheck: function(id, email){
      return $http.get('https://sidewalk-tracker.herokuapp.com/api/v1/vote-check/' + id + '/' + email)
    },
    vote: function(formData){
      return $http({
                    method: "post",
                    url: 'https://sidewalk-tracker.herokuapp.com/api/v1/vote',
                    data: formData
                })
    },
    request: function(formData){
      return $http({
                    method: "post",
                    url: 'https://sidewalk-tracker.herokuapp.com/api/v1/vote"',
                    data: formData
                })
    },

}}]);