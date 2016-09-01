'use strict';

angular.module('sochrome')
.directive('sonosList', ['SonosManager', function(SonosManager) {
  return {
    restrict: 'E',
    templateUrl: 'views/directives/sonos-list.html',
    link: function($scope) {
      SonosManager.getZoneGroups()
        .then(function(groups) {
          $scope.groups = groups;
        });
    }
  };
}]);
