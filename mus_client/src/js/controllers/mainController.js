(function() {
    'use strict';

    angular.module('musApp')
        .controller('mainCtrl', ['$scope', '$location', '$modal', 'musSocketService', function($scope, $location, $modal, musSocketService) {
            $scope.musModel = {};

            musSocketService.emit('mus-info');

            $scope.createRoom = function() {

                var modalInstance = $modal.open({
                    animation: true,
                    templateUrl: 'src/views/modals/createRoomModal.html',
                    controller: 'createRoomModalCtrl',
                    size: 'sm'
                });

                modalInstance.result.then(function (data) {
                    musSocketService.emit('create-room', JSON.stringify({roomName: data.roomName, playerName: data.playerName}));
                });
            };

            $scope.$on('socket:room-creation-success', function(event, data) {
                $location.url( "/room/" + data );
            });

            $scope.$on('socket:update-mus', function(event, data) {
                $scope.updateModel(JSON.parse(data));
            });

            $scope.updateModel = function(model) {
                $scope.musModel = model;
            };

            $scope.joinRoom = function(roomId) {
                $location.url( "/room/" + roomId );
            };

            $scope.getFullRooms = function() {
                var result = [];
                if(typeof $scope.musModel.roomsModel !== 'undefined') {
                    for(var roomId in $scope.musModel.roomsModel.rooms) {
                        if($scope.musModel.roomsModel.rooms[roomId].players.length === $scope.musModel.roomsModel.rooms[roomId].maxPlayers) {
                            result.push($scope.musModel.roomsModel.rooms[roomId]);
                        }
                    }
                }
                return result;
            };

            $scope.getNotFullRooms = function() {
                var result = [];
                if(typeof $scope.musModel.roomsModel !== 'undefined') {
                    for (var roomId in $scope.musModel.roomsModel.rooms) {
                        if ($scope.musModel.roomsModel.rooms[roomId].players.length < $scope.musModel.roomsModel.rooms[roomId].maxPlayers) {
                            result.push($scope.musModel.roomsModel.rooms[roomId]);
                        }
                    }
                }
                return result;
            };

        }]);

})();
