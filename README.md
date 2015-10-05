blaze-google-maps (Meteor)
==========================

This is a Meteor package to provide
easy Blaze template to Google Maps.
It comes with built-in reactivity.

Example
-------

### HTML

```HTML
<div class="map">
  {{> googleMap options=mapOptions centerLat=centerLat centerLng=centerLng zoom=zoom}}
</div>
```````

### CSS

```CSS
.map {
  height: 300px;
}
```

### JavaScript

```JavaScript
Items = new Mongo.Collection('items');

if (Meteor.isClient) {

  Session.setDefault('centerLat', 21.5);
  Session.setDefault('centerLng', -158.0);
  Session.setDefault('zoom', 3);

  // optional configuration
  GoogleMaps.config({
    options: {
      center: {
        lat: 0,
        lng: 0
      },
      zoom: 5
    },
    markerOptions: {
      draggable: false,
      icon: null
    },
    markerAttrs: {
      lat: 'lat',
      lng: 'lng',
      draggable: 'draggable',
      icon: 'icon'
    }
  });

  GoogleMaps.setConfig('helpers.getInfoWindowContent', function(item) {
    return item.name || 'item-' + item._id;
  });
  GoogleMaps.setConfig('helpers.isInfoWindowOpen', function(item) {
    return Session.get('infoWindowShow-' + item._id);
  });

  Template.body.helpers({
    mapOptions: {
      backgroundColor: 'lightblue'
    },
    centerLat: function() {
      return Session.get('centerLat');
    },
    centerLng: function() {
      return Session.get('centerLng');
    },
    zoom: function() {
      return Session.get('zoom');
    },
    items: function() {
      return Items.find({});
    }
  });

  Template.body.events({
    'center_changed .map': function(event) {
      console.log('center changed', event.originalEvent.detail);
    },
    'zoom_changed .map': function(event) {
      console.log('zoom changed', event.originalEvent.detail);
    },
    'map_click .map': function(event) {
      var lat = event.originalEvent.detail.lat;
      var lng = event.originalEvent.detail.lng;
      Items.insert({
        lat: lat,
        lng: lng,
        draggable: true,
        icon: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=' + Math.floor(Math.random() * 10) + '|FF0000|FFFFFF'
      });
    },
    'marker_click .map': function(event) {
      var itemId = event.originalEvent.detail.id;
      Session.set('infoWindowShow-' + itemId, true);
    },
    'marker_closeclick .map': function(event) {
      var itemId = event.originalEvent.detail.id;
      Session.set('infoWindowShow-' + itemId, false);
    },
    'marker_dragend .map': function(event) {
      var itemId = event.originalEvent.detail.id;
      var lat = event.originalEvent.detail.lat;
      var lng = event.originalEvent.detail.lng;
      Items.update(itemId, {
        $set: {
          lat: lat,
          lng: lng
        }
      });
    }
  });

}
```
