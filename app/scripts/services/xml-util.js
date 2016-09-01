'use strict';

angular.module('sochrome')
.service('XmlUtil', ['lodash', 'he', function(_, he) {

  var parser = new DOMParser();

  var defaultOptions = {
    'decode': true
  };

  this.parse = function(data, options) {
    var props = _.assign({}, defaultOptions, options);
    data = props.decode ? he.decode(data) : data;
    return parser.parseFromString(data, 'text/xml');
  };
}]);
