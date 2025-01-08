/*
* Created by Abid Nurul Hakim, 2015
* Email : abidnurulhakim@gmail.com
* For README can be access in https://github.com/abidnurulhakim/input-gmaps
*/

var stackInputGmap = [];
var InputGmap = function(input, options) {
    this.defaultLatitude = -6.1750359;
    this.defaultLongitude = 106.827192;

    if (!options) {
        this.dataPoints = [];
        this.height = 400;
        this.width = 100;
        this.totalMaxMarker = 100;
        this.latitude = null;
        this.longitude = null;
        this.zoom = 15;
    } else {
        this.dataPoints = (!options.points) ? [] : options.points;
        this.height = (!options.height) ? 300 : options.height;
        this.width = (!options.width) ? 100 : options.width;
        this.totalMaxMarker = (!options.maxMarker) ? 100 : options.maxMarker;
        this.latitude = (!options.longitude) ? null : options.latitude;
        this.longitude = (!options.longitude) ? null : options.longitude;
        this.zoom = (!options.zoom) ? 15 : options.zoom;
    }
    this.points = [];
    if (Array.isArray(this.dataPoints)) {
        for (var i = 0; i < this.dataPoints.length; i++) {
            if ((typeof this.dataPoints[i].latitude == 'number') && (typeof this.dataPoints[i].longitude == 'number')) {
                this.points.push(new google.maps.LatLng(this.dataPoints[i].latitude, this.dataPoints[i].longitude));
            }
        };
    }

    this.input = input;
    this.container = $("<div class='input-map' style='width:"+this.width+"%;height:"+this.height+"px'></div>");

    /*
    * Initialize map
    * @param {Object}  data
    * @return {google.maps.Map}
    */
    this.initializeMap = function(data) {
        var map_options = {
            center: data.position,
            zoom: data.zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(data.container[0], map_options);
        return map;
    };

    /*
    * Initialize event listener click for remove marker by user
    * @param {Object}  data
    * @param {google.maps.Marker}  marker
    */
    this.initializeRemoveMarkerListener = function(data, marker) {
        google.maps.event.addListener(marker, 'click', function(event) {
            marker.setMap(null);
            var arrayTempPosition = [];
            for (var i = data.points.length-1; i >= 0 ; i--) {
                if (data.points[i].lat() != marker.getPosition().lat() || data.points[i].lng() != marker.getPosition().lng()) {
                    var position = data.points.pop();
                    arrayTempPosition.push(position);
                } else {
                    var position = data.points.pop();
                }
            }
            for (var i = arrayTempPosition.length-1; i >= 0 ; i--) {
                var position = arrayTempPosition.pop();
                data.points.push(position);
            }
            var value = data.pointsToString(data.points);
            data.element.attr("value", value);
        });
    };

    /*
    * Initialize marker in a map
    * @param {Object}  data
    * @param {google.maps.Map} map
    * @param {google.maps.LatLng}  positions
    * @return {google.maps.Marker}
    */
    this.initializeMarker = function(data, map, positions) {
        var marker = new google.maps.Marker({
            position: positions,
            map: map,
        });
        return marker;
    };

    /*
    * initialize event lister click for add marker by user
    * @param {Object}  data
    * @param {google.maps.Map}  map
    */
    this.initializeAddMarkerListener = function(data, map) {
        google.maps.event.addListener(map, 'click', function(event) {
            if (data.points.length < data.maxMarker) {
                var marker = data.initializeMarker(data, map, event.latLng);
                data.initializeRemoveMarkerListener(data, marker);
                data.points.push(event.latLng);
                var value = data.pointsToString(data.points);
                data.element.attr("value", value);
            }
        });
    };

    /*
    * Get string from array points
    * @param {Array}  points
    * @return {String}
    */
    this.pointsToString = function(points) {
        if (points.length < 1) {
            return "";
        }
        var result = points[0].lat()+","+points[0].lng();
        for (var i = 1; i < points.length; i++) {
            result += ";" + points[i].lat() + "," + points[i].lng();
        }
        return result;
    };

    this.initializeDivMap = function (data) {
        data.element.attr("hidden", true);
        data.container.insertBefore(data.element);
        var inputMap = data.initializeMap(data);
        for (var i = 0; i < data.points.length; i++) {
            var marker =  this.initializeMarker(data, inputMap, data.points[i]);
            this.initializeRemoveMarkerListener(data, marker);
        }
        data.element.attr("value", data.pointsToString(data.points));
        data.initializeAddMarkerListener(data, inputMap);
    };

    this.data = {
        'position' : new google.maps.LatLng(this.defaultLatitude, this.defaultLongitude),
        'width' : this.width,
        'height' : this.height,
        'maxMarker' : this.totalMaxMarker,
        'points' : this.points,
        'container' : this.container,
        'element' : this.input,
        'zoom' : this.zoom,
        'initializeMap' : this.initializeMap,
        'initializeMarker' : this.initializeMarker,
        'initializeAddMarkerListener' : this.initializeAddMarkerListener,
        'initializeRemoveMarkerListener' : this.initializeRemoveMarkerListener,
        'pointsToString' : this.pointsToString,
        'initializeDivMap' : this.initializeDivMap
    };

    if (!this.latitude || !this.longitude) {
        if (navigator.geolocation) {
            stackInputGmap.push(this.data);
            navigator.geolocation.getCurrentPosition(function(position){
                var data = stackInputGmap.pop();
                data.position = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                data.initializeDivMap(data);
            }, function (){
                var data = stackInputGmap.pop();
                data.initializeDivMap(data);
            });
        } else {
            this.initializeDivMap(this.data);
        }
    } else {
        this.data.position = new google.maps.LatLng(options.latitude, options.longitude);
        this.initializeDivMap(this.data);
    }

};

var elementInputMap = [];
$("[data-toggle='input-gmap']").each(function(i){
    var myLatitude = -6.1750359;
    var myLongitude = 106.827192;
    if (navigator.geolocation) {
        elementInputMap.push($(this));
        navigator.geolocation.getCurrentPosition(function(position){
            myLatitude = position.coords.latitude;
            myLongitude = position.coords.longitude;
            var el = elementInputMap.pop();
            initInputMap(el, myLatitude, myLongitude);
        }, function (){
            var el = elementInputMap.pop();
            initInputMap(el, myLatitude, myLongitude);
        });
    } else {
        initInputMap($(this), myLatitude, myLongitude);
    }
});

function initInputMap (container, myLatitude, myLongitude) {
    var width = (!container.data('width')) ? 100 : container.data('width');
    var height = (!container.data('height')) ? 400 : container.data('height');
    var points = (!container.data('points')) ? "" : container.data('points');
    var maxMarker = (!container.data('max-marker')) ? 100 : container.data('max-marker');
    var latitude = (!container.data('latitude')) ? myLatitude : container.data('latitude');
    var longitude = (!container.data('longitude')) ? myLongitude : container.data('longitude');
    var zoom = (!container.data('zoom')) ? 15 : container.data('zoom');
    var arrayPoints = [];
    if (points.trim().length > 0) {
        var split = points.split(";");
        for (var i = 0; i < split.length; i++) {
            var position = split[i].split(",");
            if (position.length > 1) {
                arrayPoints.push({ 'latitude' : Number(position[0]), 'longitude' : Number(position[1])});
            }
        };
    }
    var map = new InputGmap(container, {
        'width' : width,
        'height' : height,
        'points' : arrayPoints,
        'maxMarker' : maxMarker,
        'latitude' : latitude,
        'longitude' : longitude,
    });
}
