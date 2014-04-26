//Todo: Login Page
//on ready, start load and get token
//if OK broadcast OK
//if failed and need login broadcast failed

//in app if received failed
//in list view or add view - go to login
//after login go to list view

//service - syncronize database with blogger api
//expose status - broadcast change in status
//queue sync request
// - var needSync
// - var duringSync
// - loop when finish sync
// - success and needSync - do sync
// - failed, turn on needSync and try again after some time out
// -






'use strict';

angular.module('Ionic03.controllers')

.service('GoogleApi', function($rootScope, $q, $http, localStorageService, GoogleApp) {
    var googleapi = {
        setToken: function (data) {
            console.log('GoogleApi: setToken', data);

            //Cache the token
            localStorageService.add('access_token',data.access_token);
            //Cache the refresh token, if there is one
            localStorageService.add('refresh_token', data.refresh_token || localStorageService.get('refresh_token'));
            //Figure out when the token will expire by using the current
            //time, plus the valid time (in seconds), minus a 1 minute buffer
            var expiresAt = new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000;
            localStorageService.add('expires_at', expiresAt);
        },

        authorize: function (options) {
            var deferred = $q.defer();

            //Build the OAuth consent page URL
            var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
                client_id: options.client_id,
                redirect_uri: options.redirect_uri,
                response_type: 'code',
                scope: options.scope
            });

            console.log('authorize: [' + authUrl + ']');

            //Open the OAuth consent page in the InAppBrowser
            var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

            //The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob"
            //which sets the authorization code in the browser's title. However, we can't
            //access the title of the InAppBrowser.
            //
            //Instead, we pass a bogus redirect_uri of "http://localhost", which means the
            //authorization code will get set in the url. We can access the url in the
            //loadstart and loadstop events. So if we bind the loadstart event, we can
            //find the authorization code and close the InAppBrowser after the user
            //has granted us access to their data.
            authWindow.addEventListener('loadstart', googleCallback);

            function googleCallback(e) {
                console.log('googleCallback [' + e +']');

                var url = (typeof e.url !== 'undefined' ? e.url : e.originalEvent.url);
                var code = /\?code=(.+)$/.exec(url);
                var error = /\?error=(.+)$/.exec(url);

                console.log('googleCallback url:[' + url +']');
                console.log('googleCallback code:[' + code +']');
                console.log('googleCallback error:[' + error +']');

                if (code || error) {
                    //Always close the browser when match is found
                    console.log('googleCallback Close window');
                    authWindow.close();
                }

                if (code) {
                    //Exchange the authorization code for an access token
                    $.post('https://accounts.google.com/o/oauth2/token', {
                        code: code[1],
                        client_id: options.client_id,
                        client_secret: options.client_secret,
                        redirect_uri: options.redirect_uri,
                        grant_type: 'authorization_code'
                }).done(function(data) {
                        console.log('googleCallback finally, calling setToken' + data);
                        googleapi.setToken(data);
                        deferred.resolve(data);
                }).fail(function(response) {
                        console.log('googleCallback catch ' + response);
                        console.log('googleCallback catch JSON:' + response.responseJSON);
                        deferred.reject(response.responseJSON);
                    });
                } else if (error) {
                    console.log('googleCallback error [' + error + ']');
                    //The user denied access to the app
                    deferred.reject({
                        error: error[1]
                    });
                }
            }

            return deferred.promise;
        },

        getToken: function (options) {
            var deferred = $q.defer();

            if (new Date().getTime() < localStorageService.get('expires_at')) {
                console.log('GoogleApi:getToken, Has a valid token in local storage');

                deferred.resolve({
                    access_token: localStorageService.get('access_token')
                });
            } else if (localStorageService.get('refresh_token')) {
                console.log('GoogleApi:getToken, Request to refresh token');
                $.post('https://accounts.google.com/o/oauth2/token', {
                    refresh_token: localStorageService.get('refresh_token'),
                    client_id: options.client_id,
                    client_secret: options.client_secret,
                    grant_type: 'refresh_token'
                }).done(function(data) {
                    console.log('GoogleApi:getToken, Got refresh token, save it');
                    googleapi.setToken(data);
                    deferred.resolve(data);
                }).fail(function(response) {
                    console.log('GoogleApi:getToken, Failed to get token: '+response.responseJSON);
                    deferred.reject(response.responseJSON);
                });
            } else {
                console.log('GoogleApi:getToken, Not found Token in local storage');
                deferred.reject();
            }

            return deferred.promise;
        }
    };

    return googleapi;
})

.controller('dbTestCtrl', function($scope, ConfigService, $log, $q, GAPI, Blogger, pouchdb, GoogleApi) {
    $scope.blogId = '4462544572529633201';
    $scope.answer = '<empty>';
    $scope.posts = [];


    //todo: move to app value/service
    var prop = {
        client_id: '44535440585-tej15rtq3jgao112ks9pe4v5tobr7nhd.apps.googleusercontent.com',
        client_secret: 'BCOBtps2R5GQHlGKb7mu7nQt',
        redirect_uri: 'http://localhost',
        scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/blogger'
    };

    $scope.init = function() {
        console.log('Init');
        //Check if we have a valid token
        //cached or if we can get a new
        //one using a refresh token.
        GoogleApi.getToken({
            client_id: prop.client_id,
            client_secret: prop.client_secret
        }).finally(function() {
            //Show the greet view if we get a valid token
            console.log('getToken finally');
            $scope.showGreetView();
        }).catch(function() {
            //Show the login view if we have no valid token
            console.log('getToken catch');
            $scope.showLoginView();
        });
    };

    $scope.showLoginView = function() {
        //todo: state go login
        //todo: add google login page
        console.log('Show the login view if we have no valid token');
    };

    $scope.showGreetView = function() {
        console.log('Show the greet view if we get a valid token');

        //Get the token, either from the cache
        //or by using the refresh token.
        GoogleApi.getToken({
            client_id: prop.client_id,
            client_secret: prop.client_secret
        }).then(function(data) {
            //Pass the token to the API call and return a new promise object
            console.log('getToken then: '+data);
            //return GoogleApi.userInfo({ access_token: data.access_token });
            var token = {
                access_token: data.access_token,
                client_id: prop.client_id,
                cookie_policy: undefined,
                expire_in: data.expire_in,
                expire_at: new Date().getTime() + parseInt(data.expires_in, 10) * 1000 - 60000,
                token_type: data.token_type
            };
            return GAPI.init_WithToken(token);
        }).finally(function() {
            console.log('GAPI Initialized with Token from InAppBrowser Session');
        }).catch(function(err) {
            //If getting the token fails, or the token has been
            //revoked, show the login view.
            console.log('getToken failed catch: '+err);
            $scope.showLoginView();
        });
    };

    //todo: hide this, make sure work on browser
    $scope.$on('event:google-plus-signin-success', function (event, authResult) {
        console.log('Send login to server or save into cookie');
    });
    $scope.$on('event:google-plus-signin-failure', function (event,authResult) {
        console.log('Auth failure or signout detected');
    });

    $scope.authorize = function () {
        GAPI.init();
    };

    $scope.getPosts = function() {
        console.log('getOPosts');

        var p = Blogger.listPosts('4462544572529633201',
            {'fetchBodies': true, 'fetchImages': false, 'maxResults': 10,'fields': 'items(content,id,kind,published,status,title,titleLink,updated),nextPageToken'});

        console.log('Answer: ', $scope.posts);

        p.
        then(function(list) {
            console.log('List: ', list);
            $scope.posts = list.items;
        });
    };

    //todo: rename method name
    $scope.Google_Sign_Cordova = function() {
        console.log('Google_Sign_Cordova');

        //Show the consent page
        GoogleApi.authorize({
            client_id: prop.client_id,
            client_secret: prop.client_secret,
            redirect_uri: prop.redirect_uri,
            scope: prop.scope
        }).finally(function() {
            console.log('authorize: Finally');
            //Show the greet view if access is granted
            $scope.showGreetView();
        }).catch(function(data) {
            //Show an error message if access was denied
            if (data) {
                console.log('Show an error message if access was denied ', data.error);
            }
            else {
                console.log('GoogleApi.authorize catch, but no data object');
            }

        });
    };

    //$scope.init();
});

