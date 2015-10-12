angular.module('projectsinfo', [], ['$routeProvider', function($routeProvider) {

  $routeProvider.when('/projectsinfo', {
    templateUrl: 'projectsinfo/list.tpl.html',
    controller: 'ProjectsInfoCtrl',
    resolve: {
      Projects: ['Projects', function(Projects) {
        return Projects.all();
      }]
    }
  });
}]);

angular.module('projectsinfo').controller('ProjectsInfoCtrl', ['$scope', 'projects', function($scope, projects){
  $scope.projects = projects;
}]);
