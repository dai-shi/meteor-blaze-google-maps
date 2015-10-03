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
  }
};

GoogleMaps = {};

GoogleMaps.config = function(config) {
  _.extend(defaultConfig, config);
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
        var lat = dot.get(item, defaultConfig.attrs.marker.lat);
        var lng = dot.get(item, defaultConfig.attrs.marker.lng);
        var markerOpts = {
          draggable: false,
          position: new google.maps.LatLng(lat, lng),
          map: template.map,
          id: item._id
        };
        var marker = new google.maps.Marker(markerOpts);
        google.maps.event.addListener(marker, 'click', function() {
          fireCustomEvent('marker_click', {
            id: item._id
          });
        });
        template.markers[item._id] = marker;
      },
      changed: function(newItem) {
        template.markers[newItem._id].setPosition(new google.maps.LatLng(
          newItem.lat,
          newItem.lng
        ));
      },
      removed: function(oldItem) {
        template.markers[oldItem._id].setMap(null);
        google.maps.event.clearInstanceListeners(template.markers[oldItem._id]);
        delete template.markers[oldItem._id];
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
