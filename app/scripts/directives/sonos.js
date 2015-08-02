'use strict';

angular.module('sochrome')
.directive('sonos', [function() {
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    templateUrl: 'views/directives/sonos.html',
    link: function() {
    }
  };
}]);
