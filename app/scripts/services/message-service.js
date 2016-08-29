'use strict';

angular.module('sochrome')
.service('MessageService', ['$cacheFactory', '$http', 'MESSAGE_SERVICE_CACHE_ID', '$q', 'sprintf',

function($cacheFactory, $http, MESSAGE_SERVICE_CACHE_ID, $q, sprintf) {
  this.stringToArrayBuffer = function(str) {
    var buffer = new ArrayBuffer(str.length);
    var view = new DataView(buffer);
    for(var i = 0, l = str.length; i < l; i++) {
      view.setInt8(i, str.charAt(i).charCodeAt());
    }
    return buffer;
  };

  this.arrayBufferToString = function(buffer) {
    var arr = new Int8Array(buffer);
    var str = '';
    for(var i = 0, l = arr.length; i < l; i++)
    {
      str += String.fromCharCode.call(this, arr[i]);
    }
    return str;
  };

  var version = 1;
  var avTransportServiceType = 'AVTransport';
  var zoneGroupTopologyServiceType = 'ZoneGroupTopology';

  var serviceTypes = {
    'Play': avTransportServiceType,
    'Pause': avTransportServiceType,
    'Previous': avTransportServiceType,
    'Next': avTransportServiceType,
    'GetZoneGroupState': zoneGroupTopologyServiceType
  };

  var avTransportControlUrl = '/MediaRenderer/AVTransport/Control';
  var zoneGroupTopologyControlUrl = '/ZoneGroupTopology/Control';

  var controlUrls = {
    'Play':  avTransportControlUrl,
    'Pause': avTransportControlUrl ,
    'Previous': avTransportControlUrl,
    'Next': avTransportControlUrl,
    'GetZoneGroupState': zoneGroupTopologyControlUrl
  };

  var soapActionTemplate = '' +
    'urn:schemas-upnp-org:service:%(serviceType)s:%(version)s#%(action)s';

  var soapBodyTemplate = '' +
    '<?xml version="1.0"?>' +
    '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/"' +
    ' s:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
    '<s:Body>' +
    '<u:%(action)s xmlns:u="urn:schemas-upnp-org:service:' +
    '%(serviceType)s:%(version)s">' +
    '%(args)s' +
    '</u:%(action)s>' +
    '</s:Body>' +
    '</s:Envelope>';

  var wrapArguments = function(args) {

    if (!args) {
      return '';
    }

    var tags = [];

    args.forEach(function(arg) {
      var tag = sprintf('<%(name)s>%(value)s</%(name)s>', arg);
      tags.push(tag);
    });

    return tags.join('');
  };
      
  var getServiceType= function(action) {
    return serviceTypes[action];
  };

  var buildCommand = function(action, args) {
    args = wrapArguments(args);
    var serviceType = getServiceType(action);
    if (!serviceType) {
      throw 'Invalid serviceType!' + action
    }
    var bodyVariables = {
      args: args,
      action: action,
      serviceType: serviceType,
      version: version
    };

    var messageBody = sprintf(soapBodyTemplate, bodyVariables);
    var actionBody = sprintf(soapActionTemplate, bodyVariables);

    var headers = {'Content-Type': 'text/xml; charset="utf-8"', SOAPACTION: actionBody, Accept: 'text/xml'};

    return {
      headers: headers,
      body: messageBody
    };
  };

  var socketId;

  this.registerSocketId = function(id) {
    socketId = id;
  };

  var getControlUrl = function(action) {
    return controlUrls[action];
  };

  this.sendCommand = function(sonos, action, args) {
    var message = buildCommand(action, args);
    var controlUrl = getControlUrl(action);
    if (!controlUrl) {
      throw 'Invalid control urls for action: ' + action
    }
    var url = sprintf('http://%s:%d%s', sonos.ipAddress, 1400, controlUrl);
    var request = {
      method: 'POST',
      url: url,
      headers: message.headers,
      data: message.body
    };

    var requestPromise = $q.defer();

    $http(request)
    .success(function(data) {
      requestPromise.resolve(data);
    })
    .error(function(data) {
      requestPromise.reject(data);
    });

    return requestPromise.promise;
  };
}]);
