'use strict';

angular.module('sochrome')
.directive('sonos', ['$log', 'NetworkService', function($log, NetworkService) {
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    templateUrl: 'views/directives/sonos.html',
    link: function($scope) {
      $scope.play = function() {
        var sonos = $scope.data;
        NetworkService.play(sonos);
      };
      $scope.pause = function() {
        var sonos = $scope.data;
        NetworkService.pause(sonos);
      };
      $scope.next = function() {
        var sonos = $scope.data;
        NetworkService.next(sonos);
      };
      $scope.previous = function() {
        var sonos = $scope.data;
        NetworkService.previous(sonos);
      };
    }
  };
}]);
