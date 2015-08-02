(function () {
    'use strict';

    angular.module('musApp')
        .controller('chatController', ['$scope', '$element', '$filter', 'musSocketService', function($scope, $element, $filter, musSocketService) {
            $scope.chatLog = [];
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
                $scope.chatLog.push($filter('formatMessage')(playerName, message));
            };

            $scope.sendMessage = function() {
                musSocketService.emit('message', $scope.message);
                $scope.message = '';
            };

        }]);
})();