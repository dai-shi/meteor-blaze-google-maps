blaze-google-maps (Meteor)
==========================

This is a Meteor package to provide easy Blaze template to Google Maps.  It comes with built-in reactivity.

Demo
----

A working demo is available [here](http://google-maps-example.meteor.com/)
and its source code is [here](https://github.com/dai-shi/meteor-google-maps-example)

How to use
----------

### Template

    {{> googleMap [options=...] [centerLat=...] [centerLng=...] [zoom=...] [markers=...]}}

Template data:
- options: `google.maps.MapOptions` (not reactive)
- centerLat: float number for latitude of the map center (reactive value)
- centerLng: float number for longitude of the map center (reactive value)
- zoom: integer number for zoom (reactive value)
- markers: `Mongo.Cursor` for markers (reactive list with some reactive properties)

### Markers

Markers are a collection with special properties.
- lat: float number for latitude of the marker (reactive value)
- lng: float number for longitude of the marker (reactive value)
- draggable: boolean if the marker is draggable (reactie value)
- icon: string for icon url of the marker (reactive value)

The name (or path) of these properties are configurable, for example:
`GoogleMaps.setConfig('markerAttrs.icon', 'icon.url')`

### InfoWindow

There are two helper functions for InfoWindow. See the example section below.

### Events

- center\_changed: when the map center is changed
- zoom\_changed: when the map zoom is changed
- map\_click: when the map is clicked
- marker\_click: when a marker is clicked
- marker\_closeclick: when InfoWindow of a marker is closed
- marker\_dragend: when a marker is dragged 

All events have detail information. See the example section below.

### Configuration

The default configuration can be changed by `GoogleMaps.config()`
like the following.

```JavaScript
GoogleMaps.config({
  options: {
    center: {
      lat: 0,
      lng: 0
    },
    zoom: 0
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
  },
  helpers: {
    getInfoWindowContent: function(item) {
      return item.name || 'empty';
    },
    isInfoWindowOpen: function(item) {
      return !!item.name;
    }
  }
});
```

You can also use `GoogleMaps.setConfig()`. See the example section below.

Example
-------

### HTML

```HTML
<template name="mymap">
  <div class="map">
    {{> googleMap centerLat=centerLat centerLng=centerLng zoom=zoom markers=items}}
  </div>
</template>
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

  GoogleMaps.setConfig('helpers.getInfoWindowContent', function(item) {
    return item.name || 'item-' + item._id;
  });
  GoogleMaps.setConfig('helpers.isInfoWindowOpen', function(item) {
    return Session.get('infoWindowShow-' + item._id);
  });

  Template.mymap.helpers({
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

  Template.mymap.events({
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
