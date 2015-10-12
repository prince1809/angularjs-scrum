/*! angularjs-scrum - v1.0.0 - 2015-10-13
 * https://github.com/prince1809/angularjs-scrum#readme
 * Copyright (c) 2015 Prince Kumar (prince1809);
 * Licensed 
 */
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
  'templates.common']);

angular.module('app').constant('MONGOLAB_CONFIG', {
  baseUrl: '/databases/',
  dbName: 'ascrum'
});

//TODO: move those messages to a separate module
angular.module('app').constant('I18N.MESSAGES', {
  'errors.route.changeError':'Route change error',
  'crud.user.save.success':"A user with id '{{id}}' was saved successfully.",
  'crud.user.remove.success':"A user with id '{{id}}' was removed successfully.",
  'crud.user.remove.error':"Something went wrong when removing user with id '{{id}}'.",
  'crud.user.save.error':"Something went wrong when saving a user...",
  'crud.project.save.success':"A project with id '{{id}}' was saved successfully.",
  'crud.project.remove.success':"A project with id '{{id}}' was removed successfully.",
  'crud.project.save.error':"Something went wrong when saving a project...",
  'login.reason.notAuthorized':"You do not have the necessary access permissions.  Do you want to login as someone else?",
  'login.reason.notAuthenticated':"You must be logged in to access this part of the application.",
  'login.error.invalidCredentials': "Login failed.  Please check your credentials and try again.",
  'login.error.serverError': "There was a problem with authenticating: {{exception}}."
});

angular.module('app').config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
  $locationProvider.html5Mode(true);
  $routeProvider.otherwise({redirectTo:'/projectsinfo'});
}]);

angular.module('app').run(['security', function(security) {
  // Get the current user when the application starts
  // (in case they are still logged in from a previous session)
  security.requestCurrentUser();
}]);

angular.module('app').controller('AppCtrl', ['$scope', 'i18nNotifications', 'localizedMessages', function($scope, i18nNotifications, localizedMessages) {

  $scope.notifications = i18nNotifications;

  $scope.removeNotification = function (notification) {
    i18nNotifications.remove(notification);
  };

  $scope.$on('$routeChangeError', function(event, current, previous, rejection){
    i18nNotifications.pushForCurrentRoute('errors.route.changeError', 'error', {}, {rejection: rejection});
  });
}]);

angular.module('app').controller('HeaderCtrl', ['$scope', '$location', '$route', 'security', 'breadcrumbs', 'notifications', 'httpRequestTracker',
  function ($scope, $location, $route, security, breadcrumbs, notifications, httpRequestTracker) {
  $scope.location = $location;
  $scope.breadcrumbs = breadcrumbs;

  $scope.isAuthenticated = security.isAuthenticated;
  $scope.isAdmin = security.isAdmin;

  $scope.home = function () {
    if (security.isAuthenticated()) {
      $location.path('/dashboard');
    } else {
      $location.path('/projectsinfo');
    }
  };

  $scope.isNavbarActive = function (navBarPath) {
    return navBarPath === breadcrumbs.getFirst().name;
  };

  $scope.hasPendingRequests = function () {
    return httpRequestTracker.hasPendingRequests();
  };
}]);

angular.module('dashboard',['resources.projects', 'resources.tasks'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/dashboard', {
    templateUrl: 'dashboard/dashboard.tpl.html',
    controller: 'DashboardCtrl',
    resolve: {
      projects: [ 'Projects', function(Projects) {
        // TODO: need to know the current user here
        return Projects.all();
      }],
      tasks: ['Tasks', function(Tasks) {
        // TODO: need to know the current user here
        return Tasks.all();
      }]
    }
  });
}])

.controller('DashboardCtrl', ['$scope', '$location', 'projects', 'tasks', function($scope, $location, projects, tasks){
  $scope.projects = projects;
  $scope. tasks = tasks;

  $scope.manageBacklog = function(projectId) {
    $location.path('/projects/' + projectId + '/productbacklog');
  };

  $scope.manageSprints = function(projectId){
    $location.path('/projects/' + projectId + '/sprints');
  };
}]);

angular.module('projects', ['resources.projects', 'sprints', 'security.authorization'])

.config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider){
  $routeProvider.when('/projects', {

  });
}]);

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

angular.module('resources.projects', ['mongolabResource']);
angular.module('resources.projects').factory('Projects', ['mongolabResource', function($mongolabResource) {

}]);

angular.module('resources.tasks', ['mongolabResource']);
angular.module('resources.tasks').factory('Tasks',['mongolabResource', function($mongolabResource){

}]);

angular.module('security.service', [
  'security.retryQueue',
  'security.login',
  'ui.bootstrap.dialog'
])

.factory('security', ['$http', '$q', '$location', 'securityRetryQueue', '$dialog', function($http, $q, $location, queue, $dialog) {

  // Redirect to the given url (defaults to '/')

  function redirect(url){
    url = url || '/';
    $location.path(url);
  }

  //Login from dialog stuff
  var loginDialog = null;

  function openLoginDialog(){
    if(loginDialog){
      throw new Error('Trying to open a dialog that is already open !');
    }
    loginDialog = $dialog.dialog();
    loginDialog.open('/security/login/form.tpl.html', 'LoginFormController').then(openLoginDialogClose);
  }

  function closeLoginDialog(success){
    if(loginDialog){
      loginDialog.close(success);
    }
  }

  function openLoginDialogClose(success){
    loginDialog = null;
    if(success){
      queue.retryAll();
    }else {
      queue.cancelAll();
      redirect();
    }
  }

  // Register a handler for when  an item is added to the retry queue
  queue.onItemAddedCallbacks.push(function(retryItem){
    if(queue.hasMore()){
      service.showLogin();
    }
  });

  // The public API of the service

  var service = {

    // Get the first person for needing a login
    getLoginReason: function(){
      return queue.retryReason();
    },

    // show the modal login dialog
    showLogin: function(){
      openLoginDialog();
    },

    //Attempt to authenticate a user by given email and password
    login: function(email, password){
      var request = $http.post('/login', { email: email, password: password});
      return request.then(function(response){
        service.currentUser = response.data.user;
        if(service.isAuthenticated()){
          closeLoginDialog(true);
        }
        return service.isAuthenticated();
      });
    },

    //Give up trying to login and clear the retry queue
    cancelLogin: function(){
      closeLoginDialog(false);
      redirect();
    },

    //Logout the current user and redirect
    logout: function(redirectTo){
      $http.post('/logout').then(function(){
        service.currentUser = null;
        redirect(redirectTo);
      });
    },

    // Ask the backend to see if a user is already authenticated
    requestCurrentUser: function(){
      if(service.isAuthenticated()){
        return $q.when(service.currentUser);
      }else {
        return $http.get('/current-user').then(function(response){
          service.currentUser = response.data.user;
          return service.currentUser;
        });
      }
    },

    // informationabout the curreent user
    currentUser: null,

    //Is the current User authenticated
    isAuthenticated: function(){
      return !!service.currentUser;
    },

    //Is the current User an Administrator?
    isAdmin: function(){
      return !!(service.currentUser && service.currentUser.admin);
    }
  };

  return service;
}]);

angular.module('templates.app', ['header.tpl.html', 'notifications.tpl.html']);

angular.module("header.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("header.tpl.html",
    "<div class=\"navbar\" ng-controller=\"HeaderCtrl\">\n" +
    "  <div class=\"navbar-inner\">\n" +
    "    <a class=\"brand\" ng-click=\"home()\"> AScrum </a>\n" +
    "    <ul class=\"nav\">\n" +
    "      <li class=\"{active:isNavbarActive('projectsinfo')}\"><a href=\"/projectsinfo\">Current Project </a></li>\n" +
    "    </ul>\n" +
    "\n" +
    "    <ul class=\"nav\" ng-show=\"isAuthenticated()\">\n" +
    "      <li ng-class=\"{active:isNavbarActive('projects')}\"><a href=\"/projects\"> My Projects </a></li>\n" +
    "      <li class=\"dropdown\" ng-class=\"{active:isNavbarActive('admin'), open:isAdminOpen}\" ng-show=\"isAdmin()\">\n" +
    "        <a id=\"adminmenu\" role=\"button\" class=\"dropdown-toggle\" ng-click-\"isAdminOpen=!isAdminOpen\"> Admin<b class=\"caret\"></b></a>\n" +
    "        <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledy=\"adminmenu\">\n" +
    "          <li><a tabindex=\"-1\" href=\"/admin/projects\" ng-click=\"isAdminOpen=false\">Manage Projects</a></li>\n" +
    "          <li><a tabindex=\"-1\" href=\"/admin/users\" ng-click=\"isAdminOpen=false\">Manage Users</a></li>\n" +
    "        </ul>\n" +
    "    </ul>\n" +
    "\n" +
    "    <ul class=\"nav pull-right\" ng-show=\"hasPendingRequests()\">\n" +
    "      <li class=\"divider-vertical\"></li>\n" +
    "      <li><a href=\"#\"><img src=\"/static/img/spinner.gif\"></a></li>\n" +
    "    </ul>\n" +
    "    <login-toolbar></login-toolbar>\n" +
    "  </div>\n" +
    "  <div>\n" +
    "    <ul class=\"breadcrumb\">\n" +
    "      <li ng-repeat=\"breadcrumb in breadcrumb.getAll()\">\n" +
    "        <span class=\"divider\"></span>\n" +
    "        <ng-switch on=\"$last\">\n" +
    "          <span ng-switch-when=\"true\">{{breadcrumb.name}}</span>\n" +
    "          <span ng-switch-default><a href=\"{{breadcrumb.path}}\">{{breadcrumb.name}}</a></span>\n" +
    "        </ng-switch>\n" +
    "      </li>\n" +
    "    </ul>\n" +
    "  </div>\n" +
    "</div>\n" +
    "");
}]);

angular.module("notifications.tpl.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("notifications.tpl.html",
    "<div ng-class=\"['alert', 'alert-'+notification.type]\" ng-repeat=\"notification in notifications.getCurrent()\">\n" +
    "  <button class=\"close\" ng-click=\"removeNotification(notification)\">x</button>\n" +
    "  {{notification.message}}\n" +
    "</div>\n" +
    "");
}]);

angular.module('templates.common', []);

