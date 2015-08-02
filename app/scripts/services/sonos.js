'use strict';

angular.module('sochrome')
.factory('Sonos', function() {

  function Sonos(name, ipAddress, isBridge) {
    this.name = name;
    this.ipAddress = ipAddress;
    this.isBridge = isBridge;
  }

  return Sonos;
});
