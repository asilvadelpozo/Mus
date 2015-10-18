(function() {
    'use strict';

    angular.module('musApp').directive('avatar', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/avatar.html',
            scope: {
                playerName: '@',
                players: '=',
                mainPlayer: '='
            },
            //controller: ['$scope', function ($scope) {
            //
            //
            //
            //    $scope.getPlayerIndexClass = function() {
            //
            //        console.log($scope.playerName);
            //        console.log($scope.players);
            //        console.log($scope.mainPlayer);
            //
            //        if(typeof $scope.players === 'undefined' || $scope.playerName === null || $scope.playerName === '') {
            //            return 'avatar__player--null';
            //        }
            //        return 'avatar__player--' + $scope.players.indexOf($scope.playerName);
            //    };
            //
            //    $scope.getPlayerName = function() {
            //        if($scope.mainPlayer) {
            //            return 'Yo';
            //        }
            //        return $scope.playerName;
            //    };
            //}]
            link: function(scope, element) {

                scope.$watch('players', function(value) {
                    var avatarClass = 'avatar__player--null';
                    console.log('scope.players');
                    console.log(value);
                    console.log('scope.playerName');
                    console.log(scope.playerName);
                    if(typeof value !== 'undefined' && scope.playerName !== null && scope.playerName !== '') {
                        avatarClass = 'avatar__player--' + value.indexOf(scope.playerName);
                    }
                    element.removeClass('avatar__player--null');
                    element.removeClass('avatar__player--0');
                    element.removeClass('avatar__player--1');
                    element.removeClass('avatar__player--2');
                    element.removeClass('avatar__player--3');
                    element.addClass(avatarClass);
                    element.find('strong').text(scope.playerName);

                });
            }
        };
    });
})();