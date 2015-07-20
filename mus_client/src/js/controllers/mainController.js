(function() {
    'use strict';

    angular.module('musApp')
        .controller('mainCtrl', ['$scope', '$log', '$location', 'musSocketService', function($scope, $log, $location, musSocketService) {
            $scope.musModel = {};
            $scope.playerName = '';

            musSocketService.emit('mus-info');

            $scope.updateModel = function(model) {
                $scope.musModel = model;
                $log.log($scope.musModel);
            };

            $scope.createRoom = function() {
                $log.log('Main Player Name: ', $scope.playerName);
                musSocketService.emit('create-room', $scope.playerName);
            };

            $scope.$on('socket:room-creation-success', function(event, data) {
                $log.log('Main Event: ', event.name);
                $location.url( "/room/" + data );
            });

            $scope.$on('socket:room-join-success', function(event, data) {
                $log.log('Main Event: ', event.name);
                $location.url( "/room/" + data );
            });

            $scope.$on('socket:room-join-failure', function(event, data) {
                $log.log('Main Event: ', event.name);
                $log.log(data);
            });

            $scope.$on('socket:update-mus', function(event, data) {
                $log.log('Main Event: ', event.name);
                $scope.$apply(function() {
                    $scope.updateModel(JSON.parse(data));
                });
            });

            $scope.joinRoom = function(roomId) {
                $log.log('Trying to join room: ' + roomId);
                musSocketService.emit('join-room', $scope.playerName, roomId);
            };

        }]);

})();
