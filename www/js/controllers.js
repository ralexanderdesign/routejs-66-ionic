angular.module('socialTour.controllers', [])

.controller('TourCtrl', function($scope, Settings, $ionicPopup) {

  // INFO BOXES

  $scope.tourEmphasisInfo = function() {
    var alertPopup = $ionicPopup.alert({
      title: 'Culture vs. Entertainment',
      template: 'Percentage of venue types you want included in your tour: Museums, monuments, historical sites, etc. VS. music, performances, activities, etc.'
    });
  };

  // IMPORT TOUR SETTINGS DATA

  $scope.tourParams = Settings.tourParams; 
})

.controller('MapCtrl', function($scope, Settings, $http, $cordovaGeolocation) { // $ionicLoading

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  // $scope.$on('$ionicView.enter', function(e) {
  // });

  // IMPORT DATA FROM SETTINGS FACTORY

  $scope.location = Settings.location; 
  $scope.tourParams = Settings.tourParams; 

  // INITIALIZE GOOGLE MAP

  $scope.initMap = function() {
    var tourMap = new google.maps.Map(document.getElementById('map'), {
      center: {lat: $scope.location.lat, lng: $scope.location.lng},
      zoom: 12
    });
    $scope.findUserViaSensor(tourMap);
  };
  
  // ATTEMPT TO LOCATE USER VIA PHONE GPS

  $scope.findUserViaSensor = function(map) {
    $cordovaGeolocation.getCurrentPosition({
      timeout: 10000,
      enableHighAccuracy: true
    }).then(function(position) {
        $scope.location.lat = position.coords.latitude;
        $scope.location.lng = position.coords.longitude;
        console.log('Location via phone sensor: ', $scope.location);
    }).catch($scope.findUserViaHTML5(map));
  };

  // ATTEMPT TO LOCATE USER VIA HTML5 GEOLOCATION

  $scope.findUserViaHTML5 = function(map) {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        $scope.location.lat = position.coords.latitude;
        $scope.location.lng = position.coords.longitude;
        console.log('Location via HTML5 geolocation: ', $scope.location);
        $scope.fsSearch($scope.location, map);
      }, function() {
        var infoWindow = new google.maps.InfoWindow({map: map});
        $scope.handleLocationError(true, infoWindow, map.getCenter());
      });
    } else {
      // Browser doesn't support Geolocation
      var infoWindow = new google.maps.InfoWindow({map: map});
      $scope.handleLocationError(false, infoWindow, map.getCenter());
    }
  };
  
  // FOURSQUARE API CALL
  
  $scope.fsSearch = function(position, map) {
    var CLIENT_ID = "EVECKUKAZVISXZUT0E3ICP15RYP00DE4YJWULGVNLNXQ1KP4";
    var CLIENT_SECRET = "NEIRV3V5KG1GMMZAJHTHZPPM5VLYBKVJD4K1AKVQGQ0LMYJN";
    $scope.fsState = 'loading';

    $http.get("https://api.foursquare.com/v2/venues/explore/?ll=" + position.lat + "," + position.lng + "&limit=" + $scope.tourParams.stops.value +"&radius=" + ($scope.tourParams.stops.value * 1609) + "&section=arts&openNow=1&sortByDistance=1" + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET + "&v=20170319&m=foursquare")
      .then(function(result, status) {
        var fsPlaces = result.data.response.groups[0].items;
        var fsPlacesLatLng = [];
        fsPlaces.forEach(function(place) {
          fsPlacesLatLng.push(
            {
              location: {
                lat: place.venue.location.lat, 
                lng: place.venue.location.lng
              },
              stopover: true
            }
          );
        });
        $scope.fsState = 'loaded';
        $scope.drawTour(position, map, fsPlacesLatLng);
      }, function(data, status) {
        $scope.fsState = 'noResult';
      });
  };
  
  // SET MAP TO CURRENT POSITION WITH DIRECTIONS FOR TOUR
  
  $scope.drawTour = function(position, map, fsWaypoints) {
    
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();

    // var infoWindow = new google.maps.InfoWindow({map: map});
    // infoWindow.setPosition(position);
    // infoWindow.setContent('You are here.');

    map.setCenter(position);
    map.setZoom(16); 
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById('directions-panel'));
    var request = {
      origin: position,
      destination: position,
      travelMode: 'WALKING',
      waypoints: fsWaypoints,
      optimizeWaypoints: true
    };

    directionsService.route(request, function (response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
  };

  // ERROR HANDLER
  
  $scope.handleLocationError = function(browserHasGeolocation, infoWindow, position) {
    infoWindow.setPosition(position);
    infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
  };
})

.controller('DirectionsCtrl', function($scope) {
  $scope.settings = {
    enableStuff: true
  };
});
