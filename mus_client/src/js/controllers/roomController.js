(function() {
    'use strict';

    angular.module('musApp')
        .controller('roomCtrl', ['$scope', '$location', '$routeParams', '$modal', 'musSocketService', function($scope, $location, $routeParams, $modal, musSocketService) {
            $scope.playerName = '';
            $scope.room = {
                game: {
                    currentStatus: 'waiting'
                }
            };

            musSocketService.emit('room-info', $routeParams.roomId);

            $scope.$on('socket:room-info-success', function(event, data) {

                $scope.updateRoom(JSON.parse(data).room);
                $scope.playerName = JSON.parse(data).playerName;
                if($scope.isRoomFull()) {
                    $modal.open({
                        animation: true,
                        templateUrl: 'src/views/modals/infoModal.html',
                        controller: 'infoModalCtrl',
                        size: 'sm',
                        resolve: {
                            infoData: function () {
                                return {
                                    title: 'Mesa llena',
                                    message: 'Lo sentimos pero esta mesa está llena. Prueba en otra!'
                                };
                            }
                        }
                    });
                    $location.url('/');
                } else {
                    if (!$scope.isUserInRoomAlready()) { // This can be true only for the creator of the room

                        var modalInstance = $modal.open({
                            animation: true,
                            templateUrl: 'src/views/modals/joinRoomModal.html',
                            controller: 'joinRoomModalCtrl',
                            size: 'sm'
                        });

                        modalInstance.result.then(function (data) {
                            musSocketService.emit('join-room', data.playerName, $scope.room.id);
                        }, function () {
                            $location.url('/');
                        });
                    }
                }
            });

            $scope.$on('socket:room-join-success', function(event, data) {
                var playerName = JSON.parse(data).playerName;
                $scope.playerName = playerName;
            });

            $scope.$on('socket:room-info-failure', function() {
                $modal.open({
                    animation: true,
                    templateUrl: 'src/views/modals/infoModal.html',
                    controller: 'infoModalCtrl',
                    size: 'sm',
                    resolve: {
                        infoData: function () {
                            return {
                                title: 'Mesa no válida',
                                message: 'La mesa a la que estas intentando acceder no existe. Prueba en otra!'
                            };
                        }
                    }
                });
                $location.url('/');
            });

            $scope.$on('socket:room-join-failure', function() {
                $modal.open({
                    animation: true,
                    templateUrl: 'src/views/modals/infoModal.html',
                    controller: 'infoModalCtrl',
                    size: 'sm',
                    resolve: {
                        infoData: function () {
                            return {
                                title: 'Error al unirse a la mesa',
                                message: 'Lo sentimos. Hubo un error al acceder a la mesa. Pruebe en otra!'
                            };
                        }
                    }
                });
                $location.url('/');
            });

            $scope.$on('socket:leave-room-success', function() {
                $location.url('/');
            });

            $scope.$on('socket:update-room', function(event, data) {
                $scope.$apply(function() {
                    $scope.updateRoom(JSON.parse(data));
                });
            });

            $scope.updateRoom = function(room) {
                var currentStatus = $scope.room.game.currentStatus;
                $scope.room = room;
                $scope.room.game.currentStatus = currentStatus;
            };

            $scope.isRoomFull = function() {
                return $scope.room.game.players.filter(function(player) { return player !== null; }).length === $scope.room.game.maxPlayers;
            };

            $scope.isUserInRoomAlready = function() {
                return $scope.room.game.players.indexOf($scope.playerName) > -1;
            };

            $scope.leaveRoom = function() {
                musSocketService.emit('leave-room', $scope.room.id);
            };

        }]);

})();
