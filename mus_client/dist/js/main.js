(function() {
    'use strict';

    angular.module('musApp', ['ngRoute', 'ngDialog', 'btford.socket-io']);

})();

(function() {
    'use strict';

    angular.module('musApp')
        .controller('mainCtrl', ['$scope', '$location', 'ngDialog', 'musSocketService', function($scope, $location, ngDialog, musSocketService) {
            $scope.musModel = {};
            $scope.playerName = '';

            musSocketService.emit('mus-info');

            $scope.createRoom = function() {
                ngDialog.openConfirm({
                    template: './src/views/ngDialogTemplates/createRoomDialog.html',
                    className: 'ngdialog-theme-default',
                    preCloseCallback: function() {
                        var nestedConfirmDialog = ngDialog.openConfirm({
                            template: './src/views/ngDialogTemplates/nameMissingConfirmationDialog.html',
                            className: 'ngdialog-theme-default'
                        });
                        return nestedConfirmDialog;
                    },
                    scope: $scope
                })
                    .then(function(value){
                        $scope.playerName = value;
                        if(typeof $scope.playerName !== 'undefined' && $scope.playerName !== '') {
                            musSocketService.emit('create-room', $scope.playerName);
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

        }]);

})();

(function() {
    'use strict';

    angular.module('musApp')
        .controller('roomCtrl', ['$scope', '$location', '$routeParams', 'ngDialog', 'musSocketService', function($scope, $location, $routeParams, ngDialog, musSocketService) {
            $scope.playerName = '';
            $scope.room = {};

            musSocketService.emit('room-info', $routeParams.roomId);

            $scope.$on('socket:room-info-success', function(event, data) {

                $scope.updateRoom(JSON.parse(data).room);
                $scope.playerName = JSON.parse(data).playerName;
                if($scope.isRoomFull()) {
                    ngDialog.open({
                        template: './src/views/ngDialogTemplates/roomFullDialog.html',
                        data: {roomId: $scope.room.id},
                        className: 'ngdialog-theme-default'
                    });
                    $location.url('/');
                } else {
                    if (!$scope.isUserInRoomAlready()) { // This can be true only for the creator of the room
                        ngDialog.openConfirm({
                            template: './src/views/ngDialogTemplates/joinRoomDialog.html',
                            className: 'ngdialog-theme-default',
                            preCloseCallback: function () {
                                var nestedConfirmDialog = ngDialog.openConfirm({
                                    template: './src/views/ngDialogTemplates/nameMissingConfirmationDialog.html',
                                    className: 'ngdialog-theme-default'
                                });
                                return nestedConfirmDialog;
                            },
                            scope: $scope
                        })
                            .then(function (value) {
                                $scope.playerName = value;
                                if (typeof $scope.playerName !== 'undefined' && $scope.playerName !== '') {
                                    musSocketService.emit('join-room', $scope.playerName, $scope.room.id);
                                } else {
                                    ngDialog.open({
                                        template: './src/views/ngDialogTemplates/noValidNameDialog.html',
                                        className: 'ngdialog-theme-default'
                                    });
                                    $location.url('/');
                                }
                            }, function () {
                                $location.url('/');
                            });
                    }
                }
            });

            $scope.$on('socket:room-info-failure', function(event, data) {
                ngDialog.open({
                    template: './src/views/ngDialogTemplates/noValidRoomDialog.html',
                    data: {roomId: data},
                    className: 'ngdialog-theme-default'
                });
                $location.url('/');
            });

            $scope.$on('socket:room-join-failure', function() {
                ngDialog.open({
                    template: './src/views/ngDialogTemplates/joinRoomFailureDialog.html',
                    className: 'ngdialog-theme-default'
                });
                $location.url('/');
            });

            $scope.$on('socket:new-player-joined', function(event, data) {
                ngDialog.open({
                    template: './src/views/ngDialogTemplates/playerJoinedRoomDialog.html',
                    data: {playerName: data},
                    className: 'ngdialog-theme-default'
                });
            });

            $scope.$on('socket:leave-room-success', function() {
                $location.url('/');
            });

            $scope.$on('socket:player-left', function(event, data) {
                ngDialog.open({
                    template: './src/views/ngDialogTemplates/playerLeftRoomDialog.html',
                    data: {playerName: data},
                    className: 'ngdialog-theme-default'
                });
            });

            $scope.$on('socket:update-room', function(event, data) {
                $scope.$apply(function() {
                    $scope.updateRoom(JSON.parse(data));
                });
            });

            $scope.updateRoom = function(room) {
                $scope.room = room;
            };

            $scope.isRoomFull = function() {
                return $scope.room.maxPlayers === $scope.room.players.length;
            };

            $scope.isUserInRoomAlready = function() {
                return $scope.room.players.indexOf($scope.playerName) > -1;
            };

            $scope.leaveRoom = function() {
                musSocketService.emit('leave-room', $scope.room.id);
            };

        }]);

})();

(function() {
    'use strict';

    /* This filter will transform this kind of object:
     {
     "key1": "value1",
     "key2": "value2"
     }
     to this array:
     [
     "key1", "key2"
     ]
     */
    angular.module('musApp')
        .filter('getKeys', function() {
            return function(input, obj) {
                for(var key in obj) {
                    input.push(key);
                }
                return input;
            };
        });
})();

(function () {
    'use strict';
    angular.module('musApp').config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'src/views/main.html',
                controller: 'mainCtrl'
            })
            .when('/room/:roomId', {
                templateUrl: 'src/views/room.html',
                controller: 'roomCtrl'
            })
            .otherwise({redirectTo: '/'});
    }]);
})();

(function() {
    'use strict';

    angular.module('musApp')
        .factory('musSocketService', function (socketFactory) {
            var socket = socketFactory();
            socket.forward('room-creation-success');

            socket.forward('room-info-success');
            socket.forward('room-info-failure');

            socket.forward('room-join-failure');
            socket.forward('new-player-joined');

            socket.forward('leave-room-success');
            socket.forward('player-left');

            socket.forward('update-mus');
            socket.forward('update-room');
            return socket;
        });
})();
