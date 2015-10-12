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
