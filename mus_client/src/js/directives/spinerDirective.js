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