(function() {
    'use strict';

    angular.module('musApp', ['ngRoute', 'btford.socket-io', 'ui.bootstrap']);

})();

(function () {
    'use strict';

    angular.module('musApp')
        .controller('chatController', ['$scope', '$element', '$filter', 'musSocketService', function($scope, $element, $filter, musSocketService) {
            $scope.chatLog = '';
            $scope.message = '';

            $scope.$on('socket:room-join-success', function(event, playerName) {
                $scope.updateLog('Room', 'Welcome to the room ' + playerName + '!');
            });

            $scope.$on('socket:new-message', function(event, data) {
                $scope.updateLog(JSON.parse(data).playerName, JSON.parse(data).message);
            });

            $scope.$on('socket:new-player-joined', function(event, playerName) {
                $scope.updateLog('Room', playerName + ' has joined the room');
            });

            $scope.$on('socket:player-left', function(event, playerName) {
                $scope.updateLog('Room', playerName + ' has left the room');
            });

            $scope.$watch('chatLog', function() {
                var textArea = $element[0].children[0];
                textArea.scrollTop = textArea.scrollHeight;
            });

            $scope.updateLog = function(playerName, message) {
                $scope.chatLog+= $filter('formatMessage')(playerName, message);
            };

            $scope.sendMessage = function() {
                musSocketService.emit('message', $scope.message);
                $scope.message = '';
            };

        }]);
})();
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

(function() {
    'use strict';

    angular.module('musApp')
        .controller('roomCtrl', ['$scope', '$location', '$routeParams', '$modal', 'musSocketService', function($scope, $location, $routeParams, $modal, musSocketService) {
            $scope.playerName = '';
            $scope.room = {};

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
                            $scope.playerName = data.playerName;
                            musSocketService.emit('join-room', $scope.playerName, $scope.room.id);
                        }, function () {
                            $location.url('/');
                        });
                    }
                }
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

    angular.module('musApp').directive('chat', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/chat.html',
            controller: 'chatController'
        };
    });
})();
(function() {
    'use strict';

    angular.module('musApp').directive('game', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/game.html'
        };
    });
})();
(function() {
    'use strict';

    angular.module('musApp')
        .filter('formatMessage', function() {
            return function(playerName, message) {
                return new Date().toLocaleTimeString() + ' - ' + playerName + ': ' + message + '\n';
            };
        });
})();

(function() {
    'use strict';

    angular.module('musApp')
        .filter('toArray', function() {
            return function(input, obj) {
                for(var key in obj) {
                    input.push(obj[key]);
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
            socket.forward('update-mus');

            socket.forward('update-room');
            socket.forward('room-creation-success');
            socket.forward('room-info-success');
            socket.forward('room-info-failure');
            socket.forward('room-join-failure');
            socket.forward('room-join-success');
            socket.forward('new-player-joined');
            socket.forward('leave-room-success');
            socket.forward('player-left');

            socket.forward('new-message');

            return socket;
        });
})();

(function() {
    'use strict';

    angular.module('musApp')
        .controller('createRoomModalCtrl', function ($scope, $modalInstance) {

            $scope.roomName = '';
            $scope.playerName = '';

            $scope.nothingSubmittedYet = true;

            $scope.roomNameIsMissing = function() {
                return !$scope.nothingSubmittedYet && (typeof $scope.roomName === 'undefined' || $scope.roomName === '');
            };

            $scope.playerNameIsMissing = function() {
                return !$scope.nothingSubmittedYet && (typeof $scope.playerName === 'undefined' || $scope.playerName === '');
            };

            $scope.ok = function () {
                $scope.nothingSubmittedYet = false;
                if(!$scope.roomNameIsMissing() && !$scope.playerNameIsMissing()) {
                    $modalInstance.close({
                        roomName: $scope.roomName,
                        playerName: $scope.playerName
                    });
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });
})();
(function() {
    'use strict';

    angular.module('musApp')
        .controller('infoModalCtrl', function ($scope, $modalInstance, infoData) {

            $scope.infoData = infoData;

            $scope.ok = function () {
                $modalInstance.close();
            };
        });
})();
(function() {
    'use strict';

    angular.module('musApp')
        .controller('joinRoomModalCtrl', function ($scope, $modalInstance) {

            $scope.playerName = '';

            $scope.nothingSubmittedYet = true;

            $scope.playerNameIsMissing = function() {
                return !$scope.nothingSubmittedYet && (typeof $scope.playerName === 'undefined' || $scope.playerName === '');
            };

            $scope.ok = function () {
                $scope.nothingSubmittedYet = false;
                if(!$scope.playerNameIsMissing()) {
                    $modalInstance.close({
                        playerName: $scope.playerName
                    });
                }
            };

            $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
            };
        });
})();