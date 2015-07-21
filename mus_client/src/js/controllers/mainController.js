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
