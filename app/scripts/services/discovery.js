'use strict';

angular.module('sochrome')
.service('DiscoveryService', ['$q', 'lodash', 'MessageService', 'NetworkService', 'Sonos', function($q, _, MessageService, NetworkService, Sonos) {

  var NUMBER_OF_REQUESTS = 5;
  var STOP_SEARCHING = false;
  var searchString = 'M-SEARCH * HTTP/1.1\r\n' +
    'ST: ssdp:all\r\n' +
    'MAN: \"ssdp:discover\"\r\n' +
    'HOST: 239.255.255.250:1900\r\n' +
    'MX: 10\r\n\r\n' +
    'ST: urn:schemas-upnp-org:device:ZonePlayer:1';

  var host = '239.255.255.250';
  var port = 1900;

  var processSonosReply = function(request, info) {
    if (STOP_SEARCHING) {
      return;
    }
    var infoData = MessageService.arrayBufferToString(info.data);
    if (infoData.match(/sonos/i)) {
      getTopology(request, info);
      STOP_SEARCHING = true;
    }
  };

  var udpSocketInterface = chrome.sockets.udp;

  var ZoneGroup = function(coordinator, id, members) {
    this.coordinator = coordinator;
    this.id = id;
    this.members = members;
  };

  var parseZoneGroupMember = function(member) {
    var name = member.attributes.getNamedItem('ZoneName').nodeValue;
    var isBridge = !!member.attributes.getNamedItem('IsZoneBridge');
    var fullAddress = member.attributes.Location.nodeValue;
    var ipAddress = fullAddress.substring(fullAddress.indexOf(':') + 3,
        fullAddress.lastIndexOf(':'));
    return new Sonos(name, ipAddress, isBridge);
  };

  var parseTopology = function(request, topology) {
    var zoneGroups = [];
    var zoneGroupsXML = topology.getElementsByTagName('ZoneGroups')[0].childNodes;
    _.each(zoneGroupsXML, function(zoneGroup) {
      var members = [];
      _.each(zoneGroup.childNodes, function(member) {
        members.push(parseZoneGroupMember(member));
      });
      zoneGroups.push(new ZoneGroup(zoneGroup.attributes[0].nodeValue,
            zoneGroup.attributes[1].nodeValue, members));
    });
    request.resolve(zoneGroups);
  };

  var getTopology = function(request, info) {
    var tempSonos = new Sonos(null, info.remoteAddress, null);
    NetworkService.getZoneGroupState(tempSonos)
      .then(function(topologyResponse) {
        parseTopology(request, topologyResponse);
      });
  };

  this.discover = function() {

    var request = $q.defer();

    STOP_SEARCHING = false;

    udpSocketInterface.create({}, function(createInfo) {
      var socketId = createInfo.socketId;

      udpSocketInterface.bind(socketId, '0.0.0.0', 0, function(response) {
        if (response !== 0) {
          throw ('Could not bind socket');
        }

        udpSocketInterface.onReceive.addListener(function(info) {
          if (info.socketId === socketId) {
            processSonosReply(request, info);
          }
        });

        var buffer = MessageService.stringToArrayBuffer(searchString);
        var searchTimes = NUMBER_OF_REQUESTS;

        var loggingCallback = function(sendInfo) {
          if (sendInfo.resultCode < 0) {
            console.error(sendInfo);
          }
        };

        while (searchTimes--) {
          udpSocketInterface.send(socketId, buffer, host, port, loggingCallback);
        }
      });
    });

    return request.promise;
  };

}]);
