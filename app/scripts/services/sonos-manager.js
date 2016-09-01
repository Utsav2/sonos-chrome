'use strict';

angular.module('sochrome')
.service('SonosManager', ['lodash', 'DiscoveryService', 'NetworkService', 'Sonos', '$q', function(_, DiscoveryService, NetworkService, Sonos, $q) {

  var self = this;
  var groupPromise = $q.defer();

  this.initialize = function() {
    self._ipToSonosMap = {};
    self._zoneGroups = [];
    
    DiscoveryService.discover()
      .then(function(zoneGroups) {
        self._zoneGroups = zoneGroups;
        groupPromise.resolve(self._zoneGroups);
      });
  };

  this.getZoneGroups = function() {
    return groupPromise.promise;
  };

  this.initialize();

}]);
