'use strict';

angular.module('sochrome')
.service('NetworkService', ['MessageService', '$q', function(MessageService, $q) {
  var playPauseParams = [
    {
      name: 'InstanceID',
      value: 0
    },
    {
      name: 'Speed',
      value: 1
    }
  ];

  var params = {
    'Play': playPauseParams,
    'Pause': playPauseParams,
    'Previous': playPauseParams,
    'Next': playPauseParams,
  };

  var sendCommand = function(sonos, name) {
    return MessageService.sendCommand(sonos, name, params[name] || []);
  };

  this.play = function(sonos) {
    return sendCommand(sonos, 'Play');
  };

  this.pause = function(sonos) {
    return sendCommand(sonos, 'Pause');
  };

  this.next = function(sonos) {
    return sendCommand(sonos, 'Next');
  };

  this.previous = function(sonos) {
    return sendCommand(sonos, 'Previous');
  };

  //http://stackoverflow.com/a/7918944/3399432
  var escapeXML = function(string) {
    return string.replace(/&apos;/g, '\'')
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&');
  };

  this.getZoneGroupState = function(sonos) {
    var topologyParsed = $q.defer();
    var topologyResponse = sendCommand(sonos, 'GetZoneGroupState');
    topologyResponse.then(function(data) {
      var parser = new DOMParser();
      var parsed = parser.parseFromString(escapeXML(data), 'text/xml');
      topologyParsed.resolve(parsed);
    });
    return topologyParsed.promise;
  };

}]);


