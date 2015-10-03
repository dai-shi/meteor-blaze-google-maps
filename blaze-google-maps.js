var defaultConfig = {
  options: {
    center: {
      lat: 0,
      lng: 0
    },
    zoom: 0
  },
  attrs: {
    marker: {
      lat: 'lat',
      lng: 'lng'
    }
  },
  helpers: {
    getInfoWindowContent: function(item) {
      return item.name || 'empty';
    },
    isInfoWindowOpen: function(item) {
      return !!item.name;
    }
  }
};

GoogleMaps = {};

GoogleMaps.config = function(config) {
  _.extend(defaultConfig, config);
};
GoogleMaps.setConfig = function(key, value) {
  dot.set(defaultConfig, key, value);
};

Template.googleMap.onRendered(function() {
  var template = this;
  var data = template.data || {};
  var element = template.firstNode;
  var options = _.extend({}, defaultConfig.options, data.options || {});
  if (typeof data.centerLat === 'number') {
    options.center.lat = data.centerLat;
  }
  if (typeof data.centerLng === 'number') {
    options.center.lng = data.centerLng;
  }
  if (typeof data.zoom === 'number') {
    options.zoom = data.zoom;
  }

  var fireCustomEvent = function(name, detail) {
    var event = new CustomEvent(name, {
      detail: detail,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  };

  var ensureCloseInfoWindow = function(marker) {
    if (marker.infoWindow) {
      marker.infoWindow.close();
      google.maps.event.clearInstanceListeners(marker.infoWindow);
      delete marker.infoWindow;
    }
  };

  template.map = new google.maps.Map(element, options);

  template.autorun(function() {
    var data = Template.currentData() || {};
    if (typeof data.zoom === 'number') {
      if (data.zoom !== template.map.getZoom()) {
        template.map.setZoom(data.zoom);
      }
    }
    if (typeof data.centerLat === 'number' && typeof data.centerLng === 'number') {
      var latlng = new google.maps.LatLng(data.centerLat, data.centerLng);
      if (!latlng.equals(template.map.getCenter())) {
        template.map.setCenter(latlng);
      }
    }
  });

  if (data.markers instanceof Mongo.Cursor) {
    template.markers = {};
    Items.find().observe({
      added: function(item) {
        var itemId = item._id;
        var lat = dot.get(item, defaultConfig.attrs.marker.lat);
        var lng = dot.get(item, defaultConfig.attrs.marker.lng);
        var markerOpts = {
          draggable: false,
          position: new google.maps.LatLng(lat, lng),
          map: template.map,
          id: itemId
        };
        var marker = new google.maps.Marker(markerOpts);
        template.markers[itemId] = marker;
        google.maps.event.addListener(marker, 'click', function() {
          fireCustomEvent('marker_click', {
            id: itemId
          });
        });
        Tracker.autorun(function() {
          var item = Items.findOne(itemId);
          ensureCloseInfoWindow(marker);
          if (defaultConfig.helpers.isInfoWindowOpen(item)) {
            marker.infoWindow = new google.maps.InfoWindow({
              content: defaultConfig.helpers.getInfoWindowContent(item)
            });
            google.maps.event.addListener(marker.infoWindow, 'closeclick', function() {
              ensureCloseInfoWindow(marker);
              fireCustomEvent('marker_closeclick', {
                id: itemId
              });
            });
            marker.infoWindow.open(template.map, marker);
          }
        });
      },
      changed: function(item) {
        var lat = dot.get(item, defaultConfig.attrs.marker.lat);
        var lng = dot.get(item, defaultConfig.attrs.marker.lng);
        template.markers[item._id].setPosition(new google.maps.LatLng(lat, lng));
      },
      removed: function(item) {
        var marker = template.markers[item._id];
        ensureCloseInfoWindow(marker);
        marker.setMap(null);
        google.maps.event.clearInstanceListeners(marker);
        delete template.markers[item._id];
      }
    });
  }

  google.maps.event.addListener(template.map, 'center_changed', function() {
    fireCustomEvent('center_changed', {
      center: {
        lat: template.map.getCenter().lat(),
        lng: template.map.getCenter().lng()
      }
    });
  });

  google.maps.event.addListener(template.map, 'zoom_changed', function() {
    fireCustomEvent('zoom_changed', {
      zoom: template.map.getZoom()
    });
  });

  google.maps.event.addListener(template.map, 'click', function(event) {
    fireCustomEvent('map_click', {
      lat: event.latLng.lat(),
      lng: event.latLng.lng()
    });
  });
});

Template.googleMap.onDestroyed(function() {
  var template = this;
  google.maps.event.clearInstanceListeners(template.map);
});
