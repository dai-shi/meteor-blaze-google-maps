Template.googleMap.onRendered(function() {
  var template = this;
  var data = template.data || {};
  var element = template.firstNode;
  var options = _.extend({
    center: {
      lat: data.centerLat || 0,
      lng: data.centerLng || 0
    },
    zoom: data.zoom || 0
  }, data.options || {});

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

  google.maps.event.addDomListener(template.map, 'center_changed', function() {
    var event = new CustomEvent('center_changed', {
      detail: {
        center: {
          lat: template.map.getCenter().lat(),
          lng: template.map.getCenter().lng()
        }
      },
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  });

  google.maps.event.addDomListener(template.map, 'zoom_changed', function() {
    var event = new CustomEvent('zoom_changed', {
      detail: {
        zoom: template.map.getZoom()
      },
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  });
});

Template.googleMap.onDestroyed(function() {
  var template = this;
  google.maps.event.clearInstanceListeners(template.map);
});
