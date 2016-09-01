'use strict';

angular.module('sochrome')
.service('TrackParser', ['XmlUtil', '$log', function(XmlUtil, $log) {

  function Track(title, artist, album, albumArtUri, position,
      playlistPosition, duration, uri) {
    this.title = title;
    this.artist = artist;
    this.album = album;
    this.albumArtUri = albumArtUri;
    this.position = position;
    this.playlistPosition = playlistPosition;
    this.duration = duration;
    this.uri = uri;
  }

  function get(obj, id) {
    var item = obj.getElementsByTagName(id);
    if (item.length == 0) {
      $log.log('Could not find', id, obj);
      return null;
    }
    if (item.length > 1) {
      throw 'More than one ' + id + 'in ' + item;
    }
    return item[0].innerHTML;
  };

  this.parse = function(response) {

    response = XmlUtil.parse(response, { decode: false });

    var artist, title, album, albumArtUri;
    var playlist_position = get(response, 'Track');
    var duration = get(response, 'TrackDuration');
    var uri = get(response, 'TrackURI');
    var position = get(response, 'RelTime');
    var metadata = XmlUtil.parse(get(response, 'TrackMetaData'));

    // Duration seems to be '0:00:00' when listening to radio
    if (metadata != '' && duration == '0:00:00') {
      throw 'Not implemented parsing for radio yet';
    }

    // If the speaker is playing from the line-in source, querying for track
    // metadata will return "NOT_IMPLEMENTED".
    else if (['', 'NOT_IMPLEMENTED'].indexOf(metadata) == -1) {
      title = get(metadata, 'title');
      artist = get(metadata, 'creator');
      album = get(metadata, 'album');
      albumArtUri = get(metadata, 'albumArtURI');
    }

    return new Track(title, artist, album, albumArtUri, position,
        playlist_position, duration, uri);
  }
}]);
