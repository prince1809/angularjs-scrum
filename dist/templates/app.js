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
