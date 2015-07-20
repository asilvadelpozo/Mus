(function() {
    'use strict';

    angular.module('musApp')
        .controller('roomCtrl', ['$scope', '$log', '$location', '$routeParams', 'musSocketService', function($scope, $log, $location, $routeParams, musSocketService) {
            $scope.playerName = '';
            $scope.room = {};

            musSocketService.emit('room-info', $routeParams.roomId);

            $scope.updateRoom = function(room) {
                $scope.room = room;
                $log.log($scope.room);
            };

            $scope.$on('socket:update-room', function(event, data) {
                $log.log('Room Event: ', event.name);
                $scope.$apply(function() {
                    $scope.updateRoom(JSON.parse(data));
                });
            });

            $scope.$on('socket:room-info-success', function(event, data) {
                $log.log('Room Event: ', event.name);
                $log.log(JSON.parse(data));
                $scope.$apply(function() {
                    $scope.updateRoom(JSON.parse(data).room);
                    $log.log('playerName: '+  JSON.parse(data).playerName);
                    $scope.playerName = JSON.parse(data).playerName;
                    $log.log('playerName2: '+  $scope.playerName);
                });
            });

            $scope.$on('socket:room-info-failure', function(event, data) {
                $log.log('Room Event: ', event.name);
                $log.log(data);
                $location.url('/');
            });

            $scope.leaveRoom = function() {
                $log.log('leaving...: ' + JSON.stringify({playerName: $scope.playerName, roomId: $scope.room.id}));
                musSocketService.emit('leave-room', $scope.room.id);
            };

            $scope.$on('socket:leave-room-success', function(event) {
                $log.log('Room Event: ', event.name);
                $location.url('/');
            });

            $scope.$on('socket:player-left', function(event, data) {
                $log.log('Room Event: ', event.name);
                $log.log(data);
            });

        }]);

})();
