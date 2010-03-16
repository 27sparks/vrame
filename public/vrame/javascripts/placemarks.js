GMap = function(placemark_div) {
    this.div = placemark_div;
    this.div.gmap = this;
    
    this.map_canvas = $('.map_canvas',  this.div);
    this.json_field = $('.json_string', this.div);
    this.form = $(this.json_field.attr('form'));
    this.address_field = $('.address', this.div);
    this.spinner = $('.spinner', this.div);
    this.suggestion = $('.suggestion', this.div);
    this.address_suggestion_output = $('.address_suggestion', this.div);
    this.accept_suggestion_button = $('.accept_suggestion', this.div);
    
    this.map = new google.maps.Map(this.map_canvas[0], {
        zoom: 5,
        center: GMap.deutschland,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    
    this.marker = new google.maps.Marker({
        visible: false,
        map: this.map,
        clickable: false
    });
    
    var placemark = GMap.parse(this.json_field.val());
    
    if (typeof(placemark) == 'object' && placemark != null) {
        this.relocate_map(placemark);
        this.set_marker(placemark.geometry.location);
        this.address_field.val(placemark.formatted_address);
    }
    
    // Setup event handling
    
    this.old_address = this.address_field.val();
    this.relocate_timer = null;
    
    var eventData  = { gmap : this };
    this.address_field
        .bind('keyup', eventData , this.update_handler)
        .bind('keypress', eventData, this.update_handler)
        .bind('blur', eventData, this.update_handler);
    
    this.accept_suggestion_button.bind('click', eventData, this.accept_suggestion);
    
    this.form.bind('submit', eventData, this.submit_check);
};


GMap.prototype = {
    set_marker : function(pos){
        this.marker.setPosition(pos);
        this.marker.setVisible(true);
    },
    
    unset_marker : function() {
        this.marker.setVisible(false);
    },
    
    relocate_map : function(placemark) {
        this.map.fitBounds(placemark.geometry.viewport);
        this.set_marker(placemark.geometry.location);
    },
    
    update_handler : function(e){
        var gmap = e.data.gmap;
        if (e.keyCode == 13) {
            e.preventDefault();
        }
        var new_address = $(this).val();
        if (new_address != gmap.old_address) { //only act on changes
            gmap.old_address = new_address;

            if (gmap.relocate_timer) { //reset old timer
                clearTimeout(gmap.relocate_timer);
            }
            gmap.relocate_timer = setTimeout(function(){
                gmap.update();
            }, 500);
        }
    },
    
    update : function() {
        var gmap = this;
        var address = gmap.address_field.val();
        gmap.spinner.show();
        GMap.geocoder.geocode({
            address: address,
            bounds: this.map.getBounds()
        }, function (result, status) {
            gmap.spinner.hide();
            var first_result = result[0];
            if (status === 'OK' && first_result) {
                gmap.relocate_map(first_result);
                gmap.suggest_address(first_result);
            }
        });
    },
    
    suggest_address : function (result) {
        this.address_suggestion_output.html(result.formatted_address)
        this.address_suggestion = result;
        this.suggestion.show();
    },
    
    accept_suggestion : function (e) {
        var gmap = e.data.gmap;
        var address = gmap.address_suggestion;
        var serialized_address = GMap.stringify(address);
        gmap.json_field.val(serialized_address);
        gmap.address_field.val(address.formatted_address);
        gmap.suggestion.hide();
    },
    
    submit_check : function (e) {
        var gmap = e.data.gmap;
        var address = gmap.address_field.val();
        var json_value = gmap.json_field.val();
        if (address == '') {
            gmap.json_field.val('');
        } else if (json_value == '') {
            alert('Bitte übernehmen Sie eine von Google Maps gefundene Adresse vor dem Speichern');
            gmap.address_field.focus();
            return false;
        }
    }
    
}

GMap.stringify = function(o) {
    var result_geometry = {
        location : {
            lat   : o.geometry.location.lat(),
            lng   : o.geometry.location.lng()
        },
        location_type : o.geometry.location_type,
        viewport : {
            north : o.geometry.viewport.getNorthEast().lat(),
            east  : o.geometry.viewport.getNorthEast().lng(),
            south : o.geometry.viewport.getSouthWest().lat(),
            west  : o.geometry.viewport.getSouthWest().lng()
        }
    };
    if (o.geometry.bounds) {
        result_geometry.bounds = {
            north : o.geometry.bounds.getNorthEast().lat(),
            east  : o.geometry.bounds.getNorthEast().lng(),
            south : o.geometry.bounds.getSouthWest().lat(),
            west  : o.geometry.bounds.getSouthWest().lng()
        }
    }
    o.geometry = result_geometry;
    return JSON.stringify(o);
};

GMap.parse = function(s) {
    if (s == '') return null;
    try {
        var o = JSON.parse(s);
    } catch (e) {
        return false;
    }
    if (!o.geometry) {
        return false;
    }
    var geometry = {};
    geometry.location = new google.maps.LatLng(o.geometry.location.lat, o.geometry.location.lng);
    geometry.location_type = o.geometry.location_type;
    geometry.viewport = new google.maps.LatLngBounds(
            new google.maps.LatLng(o.geometry.viewport.south, o.geometry.viewport.west),
            new google.maps.LatLng(o.geometry.viewport.north, o.geometry.viewport.east)
        );
    if (o.geometry.bounds) {
        geometry.bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(o.geometry.bounds.south, o.geometry.bounds.west),
                new google.maps.LatLng(o.geometry.bounds.north, o.geometry.bounds.east)
            );
    }
    o.geometry = geometry;
    return o;
};

// Transform Google's address components into a key-value object
GMap.transform_address = function(address_components) {
    var result = {};
    for (var i=0; i < address_components.length; i++) {
        var key   = address_components[i].types[0];
        var value = address_components[i].long_name;
        result[key] = value;
    }
    return result;
}

GMap.initialize_placemark_divs = function(){
    try {
        GMap.geocoder    = new google.maps.Geocoder();
        GMap.deutschland = new google.maps.LatLng(51.1656910, 10.4515260);
    } catch(e) {
    }
    $('div.placemark').each(function(){
        this.gmap = new GMap(this);
    });
};

$(GMap.initialize_placemark_divs);