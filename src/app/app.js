angular.module('app', [
  'ngRoute',
  //'projectsinfo',
//  'dashboard',
//  'projects',
//  'admin',
//  'services.breadcrumbs',
//  'services.i18nNotifications',
//  'services.httpRequestTracker',
//  'security',
//  'directives.crud',
//  'templates.app',
//  'templates.common'
]);

angular.module('app').constant('MONGOLAB_CONFIG', {
  baseUrl: '/databases/',
  dbName: 'ascrum'
});

//TODO: move those messages to a separate module
angular.module('app').constant('I18N.MESSAGES', {
  'errors.routeChangeError': 'Route Change Error'
});

angular.module('app').config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.otherwise({redirectTo: '/projectsinfo'});
}]);


angular.module('app').run(['security', function(security) {
  // Get the current suser when the application starts
  security.requestCurrentUser();
}]);

angular.module('app').controller('AppCtrl', ['$scope', 'i18nNotifications', 'localizedMessages', function($scope, i18nNotifications, localizedMessages){
  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function(notification){
    i18nNotifications.remove(notification);
  };

  $scope.$on('$routeChangeError', function(event, current, previous, rejection) {
    i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'Error', {}, {rejection: rejection});
  });
}]);


angular.module('app').controller('HeaderCtrl', ['$scope', '$location', '$route', 'security', 'breadcrumbs', 'notifications', 'httpRequestTracker',
 function($scope,$location,$route,security,breadcrumbs, notifications, httpRequestTracker) {
   $scope.location = $location;
   $scope.breadcrumbs = $breadcrumbs;

   $scope.isAuthenticated = security.isAuthenticated;
   $scope.isAdmin = security.isAdmin;

   $scope.home = function(){
     if(security.isAuthenticated()){
       $location.path('/dashboard');
     }else{
       $location.apth('/projectsinfo');
     }
   };

   $scope.isNavbarActive = function(){
     return navBarPath === breadcrumbs.getFirst().name;
   };

   $scope.hasPendingRequests = function() {
     return httpRequestTracker.hasPendingRequests();
   };
 }]);
