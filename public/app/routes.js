commerceApp.config(function ($routeProvider, $locationProvider) {
    
    $routeProvider
    
    .when('/', {
        templateUrl: 'app/pages/home.html',
        controller: 'mainController'
    })
    .when('/login', {
        templateUrl: 'app/pages/login.html',
        controller: 'mainController'
    })
    .when('/register', {
        templateUrl: 'app/pages/register.html',
        controller: 'mainController'
    })
    .when('/profile', {
        templateUrl: 'app/pages/profile.html',
        controller: 'profileController'
    })
    .when('/updateprofile', {
        templateUrl: 'app/pages/updateprofile.html',
        controller: 'profileController'
    })
    .when('/cart', {
        templateUrl : 'app/pages/cart.html',
        controller: 'productController'
    })
    .when('/details/:id', {
        templateUrl : 'app/pages/details.html',
        controller: 'detailsController'
    })
});