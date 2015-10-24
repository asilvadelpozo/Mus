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

            console.log(musSocketService);


            $scope.$on('socket:game-started', function() {
                $scope.game.currentStatus = 'game-started';
            });

            $scope.$on('socket:player-left', function() {
                $scope.game.currentStatus = 'waiting';
            });

            $scope.$on('socket:hand-started', function(event, data) {
                var cards = JSON.parse(data),
                    newCards = [[0, 0, 0, 0],
                                [0, 0, 0, 0],
                                [0, 0, 0, 0],
                                [0, 0, 0, 0]
                    ];
                $scope.game.currentStatus = 'hand-started';
                $scope.game.players.forEach(function (player, index) {
                    if($scope.playerName === player) {
                        newCards[index] = cards;
                    }
                });
                $scope.game.cards = newCards;
            });

            $scope.isRoomFull = function() {
                return $scope.game.players.filter(function(player) { return player !== null; }).length === $scope.game.maxPlayers;
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

(function() {
    'use strict';

    angular.module('musApp').directive('avatar', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/avatar.html',
            scope: {
                playerName: '@',
                players: '='
            },
            link: function(scope, element) {

                scope.$watch('playerName', function(value) {
                    var newAvatarClass = '';
                    element[0].classList.forEach(function(cls) {
                        if (cls.indexOf('avatar__player--') === 0) {
                            element.removeClass(cls);
                        }
                    });
                    if(typeof scope.players !== 'undefined' && value !== null && value !== '') {
                        newAvatarClass = 'avatar__player--' + scope.players.indexOf(value);
                    }
                    else {
                        newAvatarClass = 'avatar__player--null';
                    }
                    element.addClass(newAvatarClass);
                    element.find('strong').text(scope.playerName);

                });
            }
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
                game : '=',
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
                    return playerLocatorService.locatePlayer($scope.room.game, $scope.playerName, index);
                };

            }]
        };
    });
})();
(function() {
    'use strict';

    angular.module('musApp').directive('gameTable', ['cardDealingOrderService', 'playerLocatorService', 'cardTranslatorService', function(cardDealingOrderService, playerLocatorService, cardTranslatorService) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                playerName: '=',
                room: '='
            },
            templateUrl: 'src/views/templates/game-table.html',
            controller: ['$scope', function($scope) {

                $scope.getPlayer = function(index) {
                    return playerLocatorService.locatePlayer($scope.room.game, $scope.playerName, index);
                };

            }],
            link: function(scope, element) {

                function removeOldClassesFromCard(playerCardsElements, cardIndex) {
                    playerCardsElements[cardIndex].classList.forEach(function (cardClass) {
                        if (cardClass.indexOf('card--') === 0 || cardClass.indexOf('card__order') === 0 || cardClass.indexOf('card__animation--player') === 0) {
                            playerCardsElements[cardIndex].classList.remove(cardClass);
                        }
                    });
                }

                function addNewClassesToCard(playerCardsElements, cardIndex, cardDealingOrder, playerPositionOnTheTable, playerRealIndex) {
                    if (scope.room.game.currentStatus !== 'waiting') {
                        playerCardsElements[cardIndex].classList.add('card__order' + cardDealingOrder);
                    }
                    playerCardsElements[cardIndex].classList.toggle('card__animation--player' + playerPositionOnTheTable, scope.room.game.currentStatus !== 'waiting');
                    playerCardsElements[cardIndex].classList.add('card--' + cardTranslatorService.translateCard(scope.room.game.cards[playerRealIndex][cardIndex]));
                }

                scope.$watch('room.game.cards', function(newCards, oldCards) {

                    if(typeof newCards !== 'undefined' && typeof oldCards !== 'undefined' && typeof scope.playerName !== 'undefined' && scope.playerName !== '') {
                        var dealingOrder = cardDealingOrderService.getDealingOrder(oldCards, newCards, scope.room.game, scope.playerName);

                        for (var playerPositionOnTheTable = 0; playerPositionOnTheTable < scope.room.game.maxPlayers; playerPositionOnTheTable++) {
                            var player = playerLocatorService.locatePlayer(scope.room.game, scope.playerName, playerPositionOnTheTable),
                                playerRealIndex = scope.room.game.players.indexOf(player),
                                dealingOrderForPlayer = dealingOrder[playerRealIndex],
                                playerCardsElements = element[0].querySelector('#player' + playerPositionOnTheTable + '-cards').children;

                            dealingOrderForPlayer.forEach(function (cardDealingOrder, cardIndex) {
                                if (cardDealingOrder !== 0) { // If the card has changed...
                                    removeOldClassesFromCard(playerCardsElements, cardIndex);
                                    addNewClassesToCard(playerCardsElements, cardIndex, cardDealingOrder, playerPositionOnTheTable, playerRealIndex);
                                }
                            });
                        }
                    }
                });
            }
        };
    }]);
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
        .factory('cardDealingOrderService', ['playerLocatorService', function (playerLocatorService) {

             function shiftArrayNPositionsOnDirection(array, positions, direction) {
                 var i;
                if(direction === 'right') {
                    for(i = 0; i < positions; i++) {
                        array.unshift(array.pop());
                    }
                }
                if(direction === 'left') {
                    for(i = 0; i < positions; i++) {
                        array.push(array.shift());
                    }
                }
            }

            function reverseOrder(array, index) {
                var biggerThan0Reversed = array[index].filter(function(item) {
                    return item > 0;
                }).reverse();
                array[index].forEach(function(elem, elemIndex) {
                    if(elem > 0) {
                        array[index][elemIndex] = biggerThan0Reversed.shift();
                    }
                });
            }

            function getDealingOrder(oldCards, newCards, game, mainPlayerName) {
                var dealingOrder = [[0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0]],
                    order = 1;

                // First we shift both arrays 'hand' positions to the left
                shiftArrayNPositionsOnDirection(oldCards, game.hand, 'left');
                shiftArrayNPositionsOnDirection(newCards, game.hand, 'left');

                if(game.currentStatus === 'hand-started') { // We have to deal alternatively
                    for(var cardIndex = 0; cardIndex < 4; cardIndex++) {
                        for(var playerIndex = 0; playerIndex < oldCards.length; playerIndex++) {
                            dealingOrder[playerIndex][cardIndex] = order;
                            order++;
                        }
                    }
                } else { // We have to deal normally
                    oldCards.forEach(function (playerCards, playerIndex) {
                        playerCards.forEach(function (card, cardIndex) {
                            if (newCards[playerIndex][cardIndex] !== card) { // The card did change
                                dealingOrder[playerIndex][cardIndex] = order;
                                order++;
                            }
                        });
                    });
                }

                // Now we shift back to the right 'hand' positions all the arrays
                shiftArrayNPositionsOnDirection(oldCards, game.hand, 'right');
                shiftArrayNPositionsOnDirection(newCards, game.hand, 'right');
                shiftArrayNPositionsOnDirection(dealingOrder, game.hand, 'right');

                // Finally we reverse the order of players 1 and 2 for better visualization effect
                reverseOrder(dealingOrder, game.players.indexOf(playerLocatorService.locatePlayer(game, mainPlayerName, 1)));
                reverseOrder(dealingOrder, game.players.indexOf(playerLocatorService.locatePlayer(game, mainPlayerName, 2)));

                return dealingOrder;
            }

            return {
                getDealingOrder: getDealingOrder
            };
        }]);

})();

(function() {
    'use strict';

    angular.module('musApp')
        .factory('cardTranslatorService', function () {
            function getCardType(typeInt) {
                switch (typeInt) {
                    case 0:
                        return 'o';
                    case 1:
                        return 'c';
                    case 2:
                        return 'e';
                    case 3:
                        return 'b';
                }
            }

            function translateCard(card) {
                switch(card) {
                    case -1:
                        return 'empty';
                    case 0:
                        return 'reverse';
                    default:
                        var number = card % 10,
                            type = Math.floor(card / 10);
                        if (number === 0) {
                            number = 10;
                            type = type - 1;
                        }
                        return getCardType(type) + number;
                }
            }

            return {
                translateCard: translateCard
            };
        });

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
            socket.forward('hand-started');

            socket.forward('new-message');

            return socket;
        });
})();

(function() {
    'use strict';

    angular.module('musApp')
        .factory('playerLocatorService', function () {
            function locatePlayer(game, mainPlayerName, targetPlayerIndex) {
                if (typeof game !== 'undefined' && typeof game.players !== 'undefined') {
                    var indexOfMainPlayer = game.players.indexOf(mainPlayerName),
                        realTargetPlayerIndex = (indexOfMainPlayer + targetPlayerIndex) % game.maxPlayers;
                    return game.players[realTargetPlayerIndex];
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