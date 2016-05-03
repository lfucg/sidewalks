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
        url: '/thanks',
        templateUrl: 'templates/thanks.html',
        controller: 'thanks'
      }).
      state('error', {
        url: '/error',
        templateUrl: 'templates/error.html',
        controller: 'error'
      }).
      state('contact', {
        url: '/contact',
        templateUrl: 'templates/contact.html',
        controller: 'contact'
      }).
      state('thanksConfirmation', {
        url: '/confirmation-thanks',
        templateUrl: 'templates/thanks-confirmation.html',
        controller: 'thanksConfirmation'
      }).
      state('thanksFeedback', {
        url: '/feedback-thanks',
        templateUrl: 'templates/thanks-feedback.html',
        controller: 'thanksFeedback'
      });

  }]);

/*--------------Controllers--------------*/

stControllers.controller('submit', ['$scope', '$location', '$stateParams', 'dataTools',
  function ($scope, $location, $stateParams, dataTools) {

   $scope.formData = {
      "street" : $stateParams.street
    }

    $scope.sidesOptions = [{
    "name" : "One Side", "value" : "One"
    },{
    "name" : "Both Sides", "value" : "Both"
    }]

    $scope.pedOptions = [{
    "name" : "High Traffic", "value" : "High"
    },{
    "name" : "Average Traffic", "value" : "Average"
    },{
    "name" : "Low Traffic", "value" : "Low"
    }]

    $scope.yesnoOptions = [{
    "name" : "Yes", "value" : "Yes"
    },{
    "name" : "No", "value" : "No"
    }]

   dataTools.searchStreet($stateParams.street).then(function(result){
    if (result.data.results.length === 0) {$scope.existing = false}
    else {
      $scope.existing = true
      $scope.requests = result.data.results  
    }
  })

   dataTools.streets().then(function(result) {
      $scope.streets = result.data.results
  })

    $scope.submit = function() {
  dataTools.request($scope.formData).then(function(result){
   if (result.data.success === true) {
  $location.path('/thanks')
  }
  else {
  $location.path('/error')
  }
  })
  }

  }]);

stControllers.controller('browse', ['$scope', '$location', 'dataTools',
  function ($scope, $location, dataTools) {

  dataTools.requests().then(function(result) {
      $scope.requests = result.data.results
  })  

  }]);

stControllers.controller('home', ['$scope', '$location', 'dataTools',
  function ($scope, $location, dataTools) {

  dataTools.streets().then(function(result) {
      $scope.streets = result.data.results
  })

  $scope.submit = function(){ 
  $location.path('/submit/' + $scope.street)
  }

  }]);

stControllers.controller('thanks', ['$scope', '$location',
  function ($scope, $location) {

  }]);

stControllers.controller('thanksConfirmation', ['$scope', '$location',
  function ($scope, $location) {}]);

stControllers.controller('thanksFeedback', ['$scope', '$location',
  function ($scope, $location) {}]);

stControllers.controller('error', ['$scope', '$location',
  function ($scope, $location) {}]);

stControllers.controller('vote', ['$scope', '$location','dataTools', '$stateParams',
  function ($scope, $location, dataTools, $stateParams) {

  dataTools.requestByid($stateParams.requestId).then(function(result){
      $scope.request = result.data.results[0]  
    })

  $scope.vote = {
  "request_id" : $stateParams.requestId
  }

  $scope.voteCheck = true

  $scope.voteAllowed = function() {
  dataTools.voteCheck($stateParams.requestId,$scope.vote.email).then(function(result){
  $scope.voteCheck = result.data.vote_allowed
  })
  } 

  $scope.submit = function() {
  dataTools.vote($scope.vote).then(function(result){
  if (result.data.success === true) {
  $location.path('/thanks')
  }
  else {
  $location.path('/error')
  } 
  })
  }  

  }]);

stControllers.controller('contact', ['$scope', '$location', 'dataTools',
  function ($scope, $location, dataTools) {

  $scope.formData = {}

  $scope.submit = function() {
  dataTools.feedback($scope.formData).then(function(result){
   if (result.data.success === true) {
  $location.path('/feedback-thanks')
  }
  else {
  $location.path('/error')
  }
  })
  }  

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
    requestByid: function(id){
      return $http.get('https://sidewalk-tracker.herokuapp.com/api/v1/request/' + id)
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
                    url: 'https://sidewalk-tracker.herokuapp.com/api/v1/request',
                    data: formData
                })
    },
    feedback: function(formData){
      return $http({
                    method: "post",
                    url: 'https://sidewalk-tracker.herokuapp.com/api/v1/feedback',
                    data: formData
                })
    }

}}]);