(function() {
    'use strict';

    angular.module('musApp')
        .controller('mainCtrl', ['$scope', '$location', 'ngDialog', 'musSocketService', function($scope, $location, ngDialog, musSocketService) {
            $scope.musModel = {};

            musSocketService.emit('mus-info');

            $scope.createRoom = function() {
                ngDialog.openConfirm({
                    template: './src/views/ngDialogTemplates/createRoomDialog.html',
                    className: 'ngdialog-theme-default',
                    preCloseCallback: function() {
                        var nestedConfirmDialog = ngDialog.openConfirm({
                            template: './src/views/ngDialogTemplates/roomCreationMissingInfoConfirmationDialog.html',
                            className: 'ngdialog-theme-default'
                        });
                        return nestedConfirmDialog;
                    },
                    scope: $scope
                })
                    .then(function(data){
                        if(typeof data.roomName !== 'undefined' && data.roomName !== '' && typeof data.playerName !== 'undefined' && data.playerName !== '') {
                            musSocketService.emit('create-room', JSON.stringify({roomName: data.roomName, playerName: data.playerName}));
                        }
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
