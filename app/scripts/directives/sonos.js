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

      var sonos = $scope.data;

      function resetInfo() {
        NetworkService.getCurrentTrackInfo(sonos).then(function(info) {
          $scope.currentTrackInfo = info;
        });
      }

      resetInfo();

      $scope.play = function() {
        NetworkService.play(sonos).then(resetInfo);
      };

      $scope.pause = function() {
        NetworkService.pause(sonos).then(resetInfo);
      };

      $scope.next = function() {
        NetworkService.next(sonos).then(resetInfo);
      };

      $scope.previous = function() {
        NetworkService.previous(sonos).then(resetInfo);
      };

    }
  };
}]);
