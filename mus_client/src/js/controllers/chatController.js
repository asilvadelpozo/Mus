(function () {
    'use strict';

    angular.module('musApp')
        .controller('chatController', ['$scope', '$element', '$filter', 'musSocketService', function($scope, $element, $filter, musSocketService) {
            $scope.chatLog = [];
            $scope.message = '';

            $scope.$on('socket:room-join-success', function(event, playerName) {
                $scope.updateLog('Mesa', '¡Bienvenido a la mesa ' + playerName + '!');
            });

            $scope.$on('socket:new-message', function(event, data) {
                $scope.updateLog(JSON.parse(data).playerName, JSON.parse(data).message);
            });

            $scope.$on('socket:new-player-joined', function(event, playerName) {
                $scope.updateLog('Mesa', playerName + ' se ha unido a la mesa.');
            });

            $scope.$on('socket:player-left', function(event, playerName) {
                $scope.updateLog('Mesa', playerName + ' ha abandonado la mesa.');
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