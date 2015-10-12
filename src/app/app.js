angular.module('app', [
  'ngRoute',
  'projectsinfo',
  'dashboard',
  'projects',
  'admin',
  'services.breadcrumbs',
  'services.i18nNotifications',
  'services.httpRequestTracker',
  'security',
  'directives.crud',
  'templates.app',
  'templates.common'
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
}])
