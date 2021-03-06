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
(function () {
    'use strict';

    angular.module('musApp')
        .controller('gameActionsCtrl', ['$scope', 'musSocketService', function ($scope, musSocketService) {

            console.log(musSocketService);

            //TODO: Remove this later
            $scope.players = [];
            $scope.playerSelected = '';

            //TODO: Remove this later
            $scope.show = function() {
                var tempCards = [[0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ];
                $scope.game.players.forEach(function (player, index) {
                    if ($scope.playerName !== player) {
                        tempCards[index] = [(4 * index) + 1, (4 * index) + 2, (4 * index) + 3, (4 * index) + 4];
                    } else {
                        tempCards[index] = $scope.game.cards[index];
                    }
                });
                $scope.game.cards = tempCards;
            };

            //TODO: Remove this later
            $scope.discard = function() {
                var tempCards = [[0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0],
                    [0, 0, 0, 0]
                ];
                $scope.game.players.forEach(function (player, index) {
                    if ($scope.playerSelected === player) {
                        tempCards[index] = [-1, -1, -1, -1];
                    } else {
                        tempCards[index] = $scope.game.cards[index];
                    }
                });
                $scope.game.cards = tempCards;
            };

            //TODO: Remove this later
            $scope.updateSelectedPlayer = function(selected){
                $scope.playerSelected = selected;
            };

            $scope.$on('socket:game-started', function () {
                $scope.game.currentStatus = 'game-started';
                //TODO: Remove this later
                $scope.players = [];
                $scope.game.players.forEach(function(playerName) {
                    $scope.players.push(playerName);
                });
                $scope.playerSelected = $scope.players[0];
            });

            $scope.$on('socket:player-left', function () {
                $scope.game.currentStatus = 'waiting';
            });

            $scope.$on('socket:hand-started', function (event, data) {
                var info = JSON.parse(data),
                    cards = info.playerCards,
                    hand = info.hand,
                    newCards = [[0, 0, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0],
                        [0, 0, 0, 0]
                    ];

                $scope.game.hand = hand;
                $scope.game.currentStatus = 'hand-started';
                $scope.game.players.forEach(function (player, index) {
                    if ($scope.playerName === player) {
                        newCards[index] = cards;
                    }
                });
                $scope.game.cards = newCards;
            });

            $scope.isRoomFull = function () {
                return $scope.game.players.filter(function (player) {
                        return player !== null;
                    }).length === $scope.game.maxPlayers;
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
                    for(var i = 0; i < element[0].classList.length; i++) {
                        var cls = element[0].classList[i];
                        if (cls.indexOf('avatar__player--') === 0) {
                            element.removeClass(cls);
                        }
                    }
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

    angular.module('musApp').directive('gameTable', ['$timeout', 'cardManagerService', 'playerLocatorService', function($timeout, cardManagerService, playerLocatorService) {
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

                var animationTime = 200, // 0.20s is the time it take for the animation of dealing and discarding. It must be always the same as in _deck.scss
                    flipTime = 600,// 0.6s is the time taken for a flip. It must be always the same as in _deck.scss (check flipper class).
                    delay = 500;

                function isRoomFull() {
                    return scope.room.game.players.filter(function(player) { return player !== null; }).length === scope.room.game.maxPlayers;
                }

                function resetCardSide(cardSide, cardTranslationIncluded) {
                    var classesToRemove = []; // It is necessary to cache the classes. If not, working directly with classlist causes weird errors.
                    for(var i = 0; i < cardSide.classList.length; i++) {
                        var cardClass = cardSide.classList[i];
                        if (cardClass !== 'card--front' && cardClass !== 'card--back' && ((cardTranslationIncluded && cardClass.indexOf('card--') === 0) || cardClass.indexOf('card__') === 0)) {
                            classesToRemove.push(cardClass);
                        }
                    }
                    classesToRemove.forEach(function (cardClass) {
                        cardSide.classList.remove(cardClass);
                    });
                }

                function resetCard(cardElement) {
                    var cardFront = cardElement.querySelector('.card--front'),
                        cardBack = cardElement.querySelector('.card--back');

                    resetCardSide(cardFront, true);
                    resetCardSide(cardBack, true);

                    cardElement.classList.remove('card--flip');
                }

                function resetCards() {
                    for(var playerIndex = 0; playerIndex < scope.room.game.maxPlayers; playerIndex++) {
                        var playerCardsElements = element[0].querySelector('#player' + playerIndex + '-cards').children;
                        for(var cardIndex = 0; cardIndex < playerCardsElements.length; cardIndex++) {
                            resetCard(playerCardsElements[cardIndex]);
                        }
                    }
                }

                function triggerDealAnimation(cardBack, playerIndex, cardOrder) {
                    cardBack.classList.add('card__animation--in--player' + playerIndex);
                    cardBack.classList.add('card__order' + cardOrder);
                    cardBack.classList.add('card--reverse');
                }

                function triggerDiscardAnimation(cardBack, playerIndex, cardOrder) {
                    cardBack.classList.add('card__animation--out--player' + playerIndex);
                    cardBack.classList.add('card__order' + cardOrder);
                    $timeout(function () {
                        resetCardSide(cardBack, true);
                    }, (cardOrder * animationTime) + delay);
                }

                function deal(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo) {
                    var cardContainer = playerCardsElements[cardIndex],
                        cardFront = cardContainer.querySelector('.card--front'),
                        cardBack = cardContainer.querySelector('.card--back');

                    // Start reverse card animation: this happens for all the cards.
                    triggerDealAnimation(cardBack, playerIndex, cardOrder);

                    // When the deal animation is finished we flip the card if needed and clean animation and order classes
                    $timeout(function () {
                        if (cardManagerInfo.cardsFlip[playerIndex][cardIndex]) {
                            cardFront.classList.add('card--' + cardManagerInfo.cardsTranslation[playerIndex][cardIndex]);
                            cardContainer.classList.toggle('card--flip');
                        }
                        resetCardSide(cardBack, false);
                    }, (cardOrder * animationTime) + delay);
                }

                function discard(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo) {
                    var cardContainer = playerCardsElements[cardIndex],
                        cardFront = cardContainer.querySelector('.card--front'),
                        cardBack = cardContainer.querySelector('.card--back');

                    // Only if the card needs to be flipped
                    if (cardManagerInfo.cardsFlip[playerIndex][cardIndex]) {
                        cardContainer.classList.toggle('card--flip');

                        // After the flip animation is done we remove the class card on the front and we trigger the discard animation
                        $timeout(function () {
                            resetCardSide(cardFront, true);
                            triggerDiscardAnimation(cardBack, playerIndex, cardOrder);

                        }, (cardOrder * flipTime));
                    } else { // We just need to start the discard animation
                        triggerDiscardAnimation(cardBack, playerIndex, cardOrder);
                    }
                }

                function show(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo) {
                    var cardContainer = playerCardsElements[cardIndex],
                        cardFront = cardContainer.querySelector('.card--front');

                    // First we flip the card in case it has to be flipped
                    if (cardManagerInfo.cardsFlip[playerIndex][cardIndex]) {
                        cardFront.classList.add('card--' + cardManagerInfo.cardsTranslation[playerIndex][cardIndex]);
                        cardContainer.classList.toggle('card--flip');
                    }
                }

                function executeActionOnCards(cardManagerInfo, callback) {
                    var dealingOrder = cardManagerInfo.cardsOrder;
                    dealingOrder.forEach(function (playerDealingOrder, playerIndex) {
                        var playerCardsElements = element[0].querySelector('#player' + playerIndex + '-cards').children;
                        playerDealingOrder.forEach(function (cardOrder, cardIndex) {
                            if (cardOrder > 0) { // The card did change
                                callback(playerCardsElements, cardIndex, playerIndex, cardOrder, cardManagerInfo);
                            }
                        });
                    });
                }

                scope.$watch('room.game.cards', function(newCards, oldCards) {

                    if(typeof newCards !== 'undefined' && typeof oldCards !== 'undefined' && typeof scope.playerName !== 'undefined' && scope.playerName !== '') {

                        if(!isRoomFull()) {
                            resetCards();
                        } else {
                            var cardManagerInfo = cardManagerService.manageCards(oldCards, newCards, scope.room.game, scope.playerName);

                            switch(cardManagerInfo.action) {
                                case 'deal':
                                    executeActionOnCards(cardManagerInfo, deal);
                                    break;
                                case 'discard':
                                    executeActionOnCards(cardManagerInfo, discard);
                                    break;
                                case 'show':
                                    executeActionOnCards(cardManagerInfo, show);
                                    break;
                            }
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
(function() {
    'use strict';

    angular.module('musApp')
        .factory('cardManagerService', ['arrayShifterService', 'cardOrderService', 'cardTranslatorService', function (arrayShifterService, cardOrderService, cardTranslatorService) {

            function determineWhoChangedCards(oldCards, newCards) {
                var whoChanged = [];

                oldCards.forEach(function(oldPlayerCards, index) {
                    if(oldPlayerCards.sort().join(',') !== newCards[index].sort().join(',')) {
                        whoChanged.push(index);
                    }
                });

                return whoChanged;
            }

            function determineAction(howManyChanged) {
                switch (howManyChanged) {
                    case 4:
                        return 'deal';
                    case 1:
                        return 'discard';
                    case 3:
                        return 'show';
                }
            }

            function determineFlip(action, whoChangedCards) {
                var cardFlip = [[false, false, false, false],
                                [false, false, false, false],
                                [false, false, false, false],
                                [false, false, false, false]
                               ];
                switch (action) {
                    case 'deal': // When dealing, only player 0 flip cards
                        cardFlip[0] = [true, true, true, true];
                        break;
                    case 'discard': // When discarding, only if it was player 1 it must be flipped
                        if(whoChangedCards[0] === 0) {
                            cardFlip[0] = [true, true, true, true];
                        }
                        break;
                    case 'show': // When showing, all players but 0 should flip
                        cardFlip[1] = [true, true, true, true];
                        cardFlip[2] = [true, true, true, true];
                        cardFlip[3] = [true, true, true, true];
                        break;
                }
                return cardFlip;
            }

            function manageCards(oldCards, newCards, game, mainPlayerName) {
                var whoChangedCards,
                    action,
                    cardsOrder,
                    cardsFlip,
                    cardsTranslation,
                    realPlayerIndex = game.players.indexOf(mainPlayerName),
                    relativeOldCards = arrayShifterService.shiftArrayNPositionsOnDirection(oldCards, realPlayerIndex, 'left'),
                    relativeNewCards = arrayShifterService.shiftArrayNPositionsOnDirection(newCards, realPlayerIndex, 'left');

                whoChangedCards = determineWhoChangedCards(relativeOldCards, relativeNewCards);

                action = determineAction(whoChangedCards.length);

                cardsOrder = cardOrderService.getCardsOrder(relativeOldCards, relativeNewCards, game, mainPlayerName, action, whoChangedCards);

                cardsFlip = determineFlip(action, whoChangedCards);

                cardsTranslation = cardTranslatorService.getCardsTranslation(relativeNewCards);

                return {
                    'action': action,
                    'cardsOrder': cardsOrder,
                    'cardsFlip': cardsFlip,
                    'cardsTranslation': cardsTranslation
                };
            }

            return {
                manageCards: manageCards
            };
        }]);

})();

(function() {
    'use strict';

    angular.module('musApp')
        .factory('cardOrderService', ['arrayShifterService', function (arrayShifterService) {

            function getRelativeHand(game, mainPlayerName) {
                return (game.maxPlayers - game.players.indexOf(mainPlayerName) + game.hand) % game.maxPlayers;
            }

            function didAllCardsChange(oldCards, newCards) {
                var playerIndex = 0,
                    cardIndex = 0,
                    allCardsChanged = true;

                while(playerIndex < 4 && allCardsChanged) {
                    var playerOldCards = oldCards[playerIndex],
                        playerNewCards = newCards[playerIndex];
                    cardIndex = 0;
                    while(cardIndex < playerOldCards.length && allCardsChanged) {
                        if(playerOldCards[cardIndex] !== playerNewCards[cardIndex]) {
                            cardIndex++;
                        }
                        else {
                            allCardsChanged = false;
                        }
                    }
                    playerIndex++;
                }
                return allCardsChanged;
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

            function getDealOrder(oldCards, newCards, game, mainPlayerName) {
                var dealingOrder = [[0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0]],
                    relativeHand = getRelativeHand(game, mainPlayerName),
                    order = 1;

                // First we shift both arrays 'relativeHand' positions to the left
                arrayShifterService.shiftArrayNPositionsOnDirection(oldCards, relativeHand, 'left');
                arrayShifterService.shiftArrayNPositionsOnDirection(newCards, relativeHand, 'left');

                if(didAllCardsChange(oldCards, newCards)) { // We have to deal alternatively
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

                // Now we shift back to the right 'relativeHand' positions all the arrays
                arrayShifterService.shiftArrayNPositionsOnDirection(oldCards, relativeHand, 'right');
                arrayShifterService.shiftArrayNPositionsOnDirection(newCards, relativeHand, 'right');
                arrayShifterService.shiftArrayNPositionsOnDirection(dealingOrder, relativeHand, 'right');

                // Finally we reverse the order of players 1 and 2 for better visualization effect
                reverseOrder(dealingOrder, 1);
                reverseOrder(dealingOrder, 2);

                return dealingOrder;
            }

            function getDiscardOrder(oldCards, newCards, whoChangedCards) {
                var discardOrder = [[0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0],
                                    [0, 0, 0, 0]],
                    playerWhoDiscarded = whoChangedCards[0]; // When discarding 'whoChangeCards' should only contain 1 element

                oldCards[playerWhoDiscarded].forEach(function (card, cardIndex) {
                    if (newCards[playerWhoDiscarded][cardIndex] !== card) { // The card was discarded
                        discardOrder[playerWhoDiscarded][cardIndex] = 1;
                    }
                });

                return discardOrder;
            }

            function getShowOrder() { // The show order is always the same: all players except the main player have to show at the same time.
                return [[0, 0, 0, 0],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1],
                        [1, 1, 1, 1]];
            }

            function getCardsOrder(oldCards, newCards, game, mainPlayerName, action, whoChangedCards) {
                switch (action) {
                    case 'deal':
                        return getDealOrder(oldCards, newCards, game, mainPlayerName);
                    case 'discard':
                        return getDiscardOrder(oldCards, newCards, whoChangedCards);
                    case 'show':
                        return getShowOrder();
                }
            }

            return {
                getCardsOrder: getCardsOrder
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
                        return '';
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

            function getCardsTranslation(cards) {
                var translatedCards = [];

                cards.forEach(function(playerCards, playerIndex) {
                    translatedCards.push([]);
                    playerCards.forEach(function(card) {
                        translatedCards[playerIndex].push(translateCard(card));
                    });
                });

                return translatedCards;
            }

            return {
                getCardsTranslation: getCardsTranslation
            };
        });

})();

(function() {
    'use strict';

    angular.module('musApp')
        .factory('playerLocatorService', function () {
            function locatePlayer(game, mainPlayerName, targetPlayerIndex) {
                if (typeof game !== 'undefined' && typeof game.players !== 'undefined') {
                    var indexOfMainPlayer = game.players.indexOf(mainPlayerName),
                        realTargetPlayerIndex;
                    if(indexOfMainPlayer > -1) {
                        realTargetPlayerIndex = (indexOfMainPlayer + targetPlayerIndex) % game.maxPlayers;
                        return game.players[realTargetPlayerIndex];
                    }
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
        .factory('arrayShifterService', function () {
            function shiftArrayNPositionsOnDirection(array, positions, direction) {
                var result = array,
                    i;
                if(array.length <= 1) {
                    return array;
                }
                if(direction === 'right') {
                    for(i = 0; i < positions; i++) {
                        result.unshift(result.pop());
                    }
                }
                if(direction === 'left') {
                    for(i = 0; i < positions; i++) {
                        result.push(result.shift());
                    }
                }
                return result;
            }

            return {
                shiftArrayNPositionsOnDirection: shiftArrayNPositionsOnDirection
            };
        });

})();
