(function() {
    'use strict';

    angular.module('musApp', ['ngRoute', 'ngAnimate', 'btford.socket-io', 'ui.bootstrap']);

})();

(function () {
    'use strict';

    angular.module('musApp')
        .controller('chatCtrl', ['$scope', '$element', '$filter', 'musSocketService', function($scope, $element, $filter, musSocketService) {
            $scope.chatLog = [];
            $scope.message = '';

            $scope.$on('socket:room-join-success', function(event, data) {
                var roomName = JSON.parse(data).room.name,
                    playerName = JSON.parse(data).playerName;
                $scope.updateLog(roomName, '¡Bienvenido a ' + roomName + ' ' + playerName + '!');
            });

            $scope.$on('socket:new-message', function(event, data) {
                $scope.updateLog(JSON.parse(data).playerName, JSON.parse(data).message);
            });

            $scope.$on('socket:new-player-joined', function(event, data) {
                var roomName = JSON.parse(data).room.name,
                    playerName = JSON.parse(data).playerName;
                $scope.updateLog(roomName, playerName + ' se ha unido a ' + roomName + '.');
            });

            $scope.$on('socket:player-left', function(event, data) {
                var roomName = JSON.parse(data).room.name,
                    playerName = JSON.parse(data).playerName;
                $scope.updateLog(roomName, playerName + ' ha abandonado ' + roomName + '.');
            });

            $scope.$watchCollection('chatLog', function() {
                $scope.$evalAsync(function() {
                    var chatLog = $element[0].getElementsByClassName('chat__panel')[0];
                    chatLog.scrollTop = chatLog.scrollHeight;
                });

            });

            $scope.updateLog = function(playerName, content) {
                $scope.chatLog.push({
                    playerName: playerName,
                    time: new Date(),
                    content: content
                });
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
        .controller('gameActionsCtrl', ['$scope', 'musSocketService', function($scope, musSocketService) {

            $scope.currentStatus = 'waiting';

            console.log(musSocketService);

            $scope.$on('socket:game-started', function() {
                $scope.currentStatus = 'game-started';
            });

            $scope.$on('socket:update-room', function() {
                if(!$scope.isRoomFull()) {
                    $scope.currentStatus = 'waiting';
                }
            });

            $scope.isRoomFull = function() {
                return $scope.room.game.players.filter(function(player) { return player !== null; }).length === $scope.room.game.maxPlayers;
            };

        }]);

})();
(function() {
    'use strict';

    angular.module('musApp')
        .controller('gameTableCtrl', ['$scope', 'playerLocatorService', function($scope, playerLocatorService) {

            $scope.getPlayer = function(index) {
                return playerLocatorService.locatePlayer($scope.room, $scope.playerName, index);
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

            $scope.roomSize = function(room) {
                return room.game.players.filter(function(player) { return player !== null; }).length;
            };

            $scope.isRoomFull = function(room) {
                return room.game.players.filter(function(player) { return player !== null; }).length === 4;
            };

            $scope.getFullRooms = function() {
                var result = [];
                if(typeof $scope.musModel.roomsModel !== 'undefined') {
                    for(var roomId in $scope.musModel.roomsModel.rooms) {
                        if($scope.isRoomFull($scope.musModel.roomsModel.rooms[roomId])) {
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
                        if (!$scope.isRoomFull($scope.musModel.roomsModel.rooms[roomId])) {
                            result.push($scope.musModel.roomsModel.rooms[roomId]);
                        }
                    }
                }
                return result;
            };

            $scope.getPlayerIndexClass = function(playerName, players) {
                return (typeof players !== 'undefined') ? 'avatar--mini--' + players.indexOf(playerName) : '';
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

(function() {
    'use strict';

    angular.module('musApp').directive('avatar', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/avatar.html',
            scope: {
                playerName: '=',
                players: '=',
                mainPlayer: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.getPlayerIndexClass = function() {
                    if(typeof $scope.players === 'undefined' || $scope.playerName === null) {
                        return 'avatar__player--null';
                    }
                    return 'avatar__player--' + $scope.players.indexOf($scope.playerName);
                };

                $scope.getPlayerName = function() {
                    if($scope.mainPlayer) {
                        return 'Yo';
                    }
                    return $scope.playerName;
                };
            }]
        };
    });
})();
(function() {
    'use strict';

    angular.module('musApp').directive('chat', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/chat.html',
            scope: {
                playerName: '=',
                players: '='
            },
            controller: 'chatCtrl'
        };
    });
})();
(function() {
    'use strict';

    angular.module('musApp').directive('gameActions', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/game-actions.html',
            scope: {
                room : '=',
                playerName: '='
            },
            controller: 'gameActionsCtrl'
        };
    });

})();
(function() {
    'use strict';

    angular.module('musApp').directive('game', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                playerName: '=',
                room: '='
            },
            templateUrl: 'src/views/templates/game.html',
            controller: ['$scope', 'playerLocatorService', function($scope, playerLocatorService) {

                $scope.getPlayer = function(index) {
                    return playerLocatorService.locatePlayer($scope.room, $scope.playerName, index);
                };

            }]
        };
    });
})();
(function() {
    'use strict';

    angular.module('musApp').directive('gameTable', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                playerName: '=',
                room: '='
            },
            templateUrl: 'src/views/templates/game-table.html',
            controller: 'gameTableCtrl'
        };
    });
})();
(function() {
    'use strict';

    angular.module('musApp').directive('message', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/message.html',
            scope: {
                playerName: '=',
                message: '=',
                players: '='
            },
            controller: ['$scope', function ($scope) {
                $scope.getPlayerIndexClass = function() {
                    if($scope.players.indexOf($scope.message.playerName) === -1) {
                        return 'message__player--room';
                    }
                    return 'message__player--' + $scope.players.indexOf($scope.message.playerName);
                };
            }]
        };
    });
})();
(function() {
    'use strict';

    angular.module('musApp').directive('spinner', function() {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="spinner">' +
                            '<div class="bounce1"></div>' +
                            '<div class="bounce2"></div>' +
                            '<div class="bounce3"></div>' +
                      '</div>'
        };
    });

})();
(function() {
    'use strict';

    angular.module('musApp')
        .filter('withoutNull', function() {
            return function(input) {
                var result = [];
                input.forEach(function(entry) {
                    if(entry !== null) {
                        result.push(entry);
                    }
                });
                return result;
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

            socket.forward('game-started');

            socket.forward('new-message');

            return socket;
        });
})();

(function() {
    'use strict';

    angular.module('musApp')
        .factory('playerLocatorService', function () {
            function locatePlayer(room, mainPlayerName, targetPlayerIndex) {
                if (typeof room.game !== 'undefined' && typeof room.game.players !== 'undefined') {
                    var indexOfMainPlayer = room.game.players.indexOf(mainPlayerName),
                        realTargetPlayerIndex = (indexOfMainPlayer + targetPlayerIndex) % room.game.maxPlayers;
                    return room.game.players[realTargetPlayerIndex];
                }
                return null;
            }

            return {
                locatePlayer: locatePlayer
            };
        });

})();

(function() {
    'use strict';

    angular.module('musApp')
        .controller('createRoomModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

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
        }]);
})();
(function() {
    'use strict';

    angular.module('musApp')
        .controller('infoModalCtrl', ['$scope', '$modalInstance', 'infoData', function ($scope, $modalInstance, infoData) {

            $scope.infoData = infoData;

            $scope.ok = function () {
                $modalInstance.close();
            };
        }]);
})();
(function() {
    'use strict';

    angular.module('musApp')
        .controller('joinRoomModalCtrl', ['$scope', '$modalInstance', function ($scope, $modalInstance) {

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
        }]);
})();