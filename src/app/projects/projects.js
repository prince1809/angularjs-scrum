angular.module('projects', ['resources.projects', 'sprints', 'security.authorization'])

.config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider.when('/projects', {

  });
}]);
