/**
 *  Twitter App Service
 *  Using third-party OAuth.io
 *  @todo since it is for convenience purposes only, revise this not to use OAuth.io and rely on it
 * 
 *  @note pivot to second solution, which is to generate link per payment since Account Activity API( beta )
 *  requires application and approval (@see https://dev.twitter.com/webhooks/account-activity)
 */
(function() {
    'use strict';

    angular.module('twitterApp.services', []).factory('twitterService', function($q) {

        var authorizationResult = false;
        //var authorizedUser = null;
        
        const twitter_service  = 'https://api.twitter.com/1.1/';
        //const tb_hash_tag = '#tbucks_pay'; //constant id/hastag for tweetbucks
        const twitter_handle_mention = '@tbucks_pay'; //default user mention in the tweet

        return {
            initialize: function() {
                //initialize OAuth.io with public key of the application
                //@see https://oauth.io/dashboard/app/GOdDxsOEx34aFnjWQveDw5FjwI8
                OAuth.initialize('GOdDxsOEx34aFnjWQveDw5FjwI8', {
                    cache: true
                });
                //try to create an authorization result when the page loads,
                // this means a returning user won't have to click the twitter button again
                authorizationResult = OAuth.create("twitter");
            },
            getAuthenticatedUser : function() {
                var deferred = $q.defer();         
                if (authorizationResult) {
                    //get twitter authenticated user via OAuth.io
                    //@see http://docs.oauth.io/#using-rest
                    authorizationResult.me().done(function(me) {
                       // authorizedUser = me;                         
                        deferred.resolve(me);  
                                    
                    }).fail(function(err) {
                        deferred.reject(err);
                    });
                } else {
                    deferred.reject({'error' : 'twitter not initialized.'});  
                }

                return deferred.promise;

            },            
            isReady: function() {
                return (authorizationResult);
            },
            connectTwitter: function() {
                var deferred = $q.defer();
                OAuth.popup("twitter", {
                    cache: true
                }, function(error, result) {
                    // cache means to execute the callback if the tokens are already present
                    if (!error) {
                        authorizationResult = result;
                        deferred.resolve();
                    } else {
                        //do something if there's an error

                    }
                });
                return deferred.promise;
            },
            clearCache: function() {
                OAuth.clearCache('twitter');
                authorizationResult = false;
               // authorizedUser = false;
            },
            getTweets: function() {
                //create a deferred object using Angular's $q service
                //get all tweets with #tweetbucks hashtag
                // https://dev.twitter.com/rest/public/search
                //https://dev.twitter.com/rest/reference/get/search/tweets                
                // when the data is retrieved resolve the deferred object
                var deferred = $q.defer();
                var url = twitter_service + 'search/tweets.json?q=' + encodeURIComponent(twitter_handle_mention);
                url += '&count=100&result_type=recent';
                var promise = authorizationResult.get(url).done(function(data) {
                    deferred.resolve(data);
                }).fail(function(err) {
                    deferred.reject(err);
                });

                return deferred.promise;
            }
        }
    });    
})();
