'use strict';
// Ionic Starter App, v0.9.20

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('Ionic03', [
    'ionic',
    'Ionic03.controllers',
    'Ionic03.services',
    'Ionic03.directives',
    'directive.g+signin',
    'gapi',
    'pouchdb',
    'LocalStorageModule'
])


.run(function ($ionicPlatform, $state, $rootScope, ConfigService) {
    $ionicPlatform.ready(function () {
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });

    $rootScope.$on('event:google-plus-signin-success', function (event, authResult) {
        // Send login to server or save into cookie
        console.log('event:google-plus-signin-success event:', event, 'authResult: ', authResult);
        ConfigService.login = true;
        ConfigService.authResult = authResult;
        $state.go('app.playlists');
    });

    $rootScope.$on('event:google-plus-signin-failure', function (event, authResult) {
        // Auth failure or signout detected
        console.log('event:google-plus-signin-failure event:', event, 'authResult: ', authResult);
        ConfigService.login = false;
        ConfigService.authResult = authResult;
        $state.go('login');
    });

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
        console.log("$stateChangeStart", event, toState, toParams, fromState, fromParams);
        console.log("toState.authenticate", toState);

        //http://arthur.gonigberg.com/2013/06/29/angularjs-role-based-auth/
        //https://medium.com/opinionated-angularjs/4e927af3a15f
        if (true) {

            if (!ConfigService.login) {
                if (toState.authenticate) {
                    console.log("Redirect to login");
                    $state.transitionTo("dbtest");
                    event.preventDefault();
                }
            }
            else if (toState.name == 'login') {
                $state.transitionTo("app.playlists");
                event.preventDefault();
            }
        }

    });
})
.value('GoogleApp', {
    apiKey: 'BCOBtps2R5GQHlGKb7mu7nQt', //'AIzaSyA78RO9-B7qEr-WXJULOq3u-n4C7RS9wz4',
    clientId: '44535440585-tej15rtq3jgao112ks9pe4v5tobr7nhd.apps.googleusercontent.com', //'44535440585-rshs1j4t1jc4qnp295fqmkr7jt12tbrh.apps.googleusercontent.com',
    scopes: [
        // whatever scopes you need for your app, for example:
        //'https://www.googleapis.com/auth/drive',
        //'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/blogger'
    ]
})
/*
.config(function ($httpProvider) {
    //http://victorblog.com/2012/12/20/make-angularjs-http-service-behave-like-jquery-ajax/
    //needed for the google sign, the original code was using jqery post
    //didn't work and have no way to debug this, happen only on device
    //so I go back to jquery post
    console.log('$httpProvider config');

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    //
    // The workhorse; converts an object to x-www-form-urlencoded serialization.
    // @param {Object} obj
    // @return {String}
    //
    var param = function(obj) {
        var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

        for(name in obj) {
            value = obj[name];

            if(value instanceof Array) {
                for(i=0; i<value.length; ++i) {
                    subValue = value[i];
                    fullSubName = name + '[' + i + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value instanceof Object) {
                for(subName in value) {
                    subValue = value[subName];
                    fullSubName = name + '[' + subName + ']';
                    innerObj = {};
                    innerObj[fullSubName] = subValue;
                    query += param(innerObj) + '&';
                }
            }
            else if(value !== undefined && value !== null)
                query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
        }

        console.log('$httpProvider Translate ['+query+']');

        return query.length ? query.substr(0, query.length - 1) : query;
    };

    // Override $http service's default transformRequest
    $httpProvider.defaults.transformRequest = [function(data) {
        return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
    }];
})
*/
.config(function ($stateProvider, $urlRouterProvider, localStorageServiceProvider) {

    console.log('$stateProvider config');
    localStorageServiceProvider.setPrefix('Ionic03');

    $stateProvider
        .state('unlock', {
            url: '/unlock',
            abstract: false,
            templateUrl: 'templates/unlock.html',
            controller: 'UnlockCtrl',
            authenticate: false
        })
        .state('login', {
            url: '/login',
            abstract: false,
            templateUrl: 'templates/login.html',
            controller: 'LoginCtrl',
            authenticate: false
        })
        .state('dbtest', {
            url: '/dbtest',
            abstract: false,
            templateUrl: 'templates/dbtest.html',
            controller: 'dbTestCtrl',
            authenticate: false
        })
        .state('app', {
            url: '/app',
            abstract: true,
            templateUrl: 'templates/menu.html',
            controller: 'AppCtrl',
            authenticate: true
        })

        .state('app.search', {
            url: '/search',
            views: {
                'menuContent': {
                    templateUrl: 'templates/search.html'
                }
            },
            authenticate: true
        })

        .state('app.browse', {
            url: '/browse',
            views: {
                'menuContent': {
                    templateUrl: 'templates/browse.html'
                }
            },
            authenticate: true
        })
        .state('app.playlists', {
            url: '/playlists',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlists.html',
                    controller: 'PlaylistsCtrl'
                }
            },
            resolve: {
                items: function (DataService) {
                    return DataService.getItems();
                }
            },
            authenticate: true
        })
        .state('app.single', {
            url: '/playlists/:playlistId',
            views: {
                'menuContent': {
                    templateUrl: 'templates/playlist.html',
                    controller: 'PlaylistCtrl'
                }
            },
            resolve: {
                item: function ($stateParams, DataService) {
                    var id = $stateParams.playlistId;
                    return DataService.getItem(id);
                }
            },
            authenticate: true
        })
        .state('app.add', {
            url: '/add',
            views: {
                'menuContent': {
                    templateUrl: 'templates/add.html',
                    controller: 'AddCtrl'
                }
            },
            resolve: {
                item: function (DataService) {
                    return DataService.getCurrentNewItem();
                }
            },
            authenticate: true
        });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/playlists');
});

