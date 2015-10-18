(function() {
    'use strict';

    angular.module('musApp').directive('avatar', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'src/views/templates/avatar.html',
            scope: {
                playerName: '@',
                players: '=',
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