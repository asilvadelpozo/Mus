(function() {
    'use strict';

    angular.module('musApp', ['ngRoute', 'btford.socket-io']);

})();

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

(function() {
    'use strict';

    angular.module('musApp')
        .controller('roomCtrl', ['$scope', '$log', '$location', '$routeParams', 'musSocketService', function($scope, $log, $location, $routeParams, musSocketService) {
            $scope.playerName = '';
            $scope.room = {};

            musSocketService.emit('room-info', $routeParams.roomId);

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

            socket.forward('room-join-success');
            socket.forward('room-join-failure');
            socket.forward('new-player-joined');

            socket.forward('leave-room-success');
            socket.forward('player-left');

            socket.forward('update-mus');
            socket.forward('update-room');
            return socket;
        });
})();
