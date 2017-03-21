angular.module('socialTour.services', [])

.factory('Settings', function() {

  // USER LOCATION 

  // Initialized in Manhattan
  var _location = {
    lat: 40.750222, 
    lng: -73.990282 
  };

  // RANGE INPUT FIELDS

  var _tourParams = {
    stops: {
      min: 2,
      max: 20,
      value: 11
    },
    radius: {
      min: 1,
      max: 10,
      value: 2
    },
    tourEmphasis: {
      min: 0,
      max: 100,
      value: 50
    }
  };

  return {
    location: _location,
    tourParams: _tourParams
  };
});