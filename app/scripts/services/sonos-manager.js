'use strict';

angular.module('sochrome')
.service('SonosManager', ['lodash', 'DiscoveryService', 'NetworkService', 'Sonos', '$q', function(_, DiscoveryService, NetworkService, Sonos, $q) {

  var self = this;
  var groupPromise = $q.defer();

  this.initialize = function() {
    self._ipToSonosMap = {};
    self._zoneGroups = [];
    var request = $q.defer();
    DiscoveryService.discover(request);
    request.promise.then(function(zoneGroups) {
      self._zoneGroups = zoneGroups;
      groupPromise.resolve(self._zoneGroups);
    });
  };

  this.getZoneGroupsPromise = function() {
    return groupPromise.promise;
  };

  var getAll = function() {
    return _.reduce(self._zoneGroups, function(total, zoneGroup) {
      return total.concat(zoneGroup.members);
    }, []);
  };

  var getAllSpeakers = function() {
    return _.reject(getAll(), { isBridge: true });
  };

  this.actionAll = function(actionFn) {
    getAllSpeakers().forEach(function(sonos) {
      actionFn(sonos);
    });
  };

  this.playAll = this.actionAll.bind(this, NetworkService.play);

  this.pauseAll = this.actionAll.bind(this, NetworkService.pause);

  this.initialize();

}]);
