'use strict';

angular.module('sochrome')
.service('NetworkService', ['MessageService','TrackParser','XmlUtil', '$q', function(MessageService, TrackParser, XmlUtil, $q) {
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

  var getTrackInfoParams = [
    {
      name: 'InstanceID',
      value: 0
    },
    {
      name: 'Channel',
      value: 'Master'
    }
  ];


  var params = {
    'Play': playPauseParams,
    'Pause': playPauseParams,
    'Previous': playPauseParams,
    'Next': playPauseParams,
    'GetPositionInfo': getTrackInfoParams,
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

  this.getCurrentTrackInfo = function(sonos) {
    var deferred = $q.defer();
    sendCommand(sonos, 'GetPositionInfo').then(function(info) {
      deferred.resolve(TrackParser.parse(info));
    }).catch(function(err) {
      deferred.reject(err);
    });
    return deferred.promise;
  };


  this.getZoneGroupState = function(sonos) {
    var topologyParsed = $q.defer();
    var topologyResponse = sendCommand(sonos, 'GetZoneGroupState');
    topologyResponse.then(function(data) {
      topologyParsed.resolve(XmlUtil.parse(data));
    });
    return topologyParsed.promise;
  };

}]);


