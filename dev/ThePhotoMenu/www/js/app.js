// Instagram API Endpoint
// Places = https://api.instagram.com/v1/locations/search?lat=41.8931049&lng=-87.621279&client_id=e5b069c8c1034004a8e0220a4c60cd00&access_token=&undefined
// Search https://api.instagram.com/v1/locations/search?foursquare_v2_id=514c911de4b086be7d501e09&client_id=e5b069c8c1034004a8e0220a4c60cd00&access_token=&undefined
// Media = https://api.instagram.com/v1/locations/118243956/media/recent?client_id=e5b069c8c1034004a8e0220a4c60cd00&access_token=&undefined

// Contain the core
;(function(window) {

    window.App = window.App || {};

    window.App.ready = {

        // Responsible to store default values
        defaults: {
            userPosition: null,
            locationId: null
        },

        /**
         * Responsible to initialize the actions
         * of getting the user location and storing before show the view
         * @method initUserLocation
         */
        initUserLocation: function(position) {
            this.defaults.userPosition = position;
            this.triggerGetPlaces();
        },

        /**
         * Responsible to hide splash view and show home view
         * @method showHomeScreen
         */
        showHomeScreen: function() {
            var elSplashView = document.getElementById('splashView')
                , elHomeView =document.getElementById('homeView')
                , wHeight = $(window).height();

            if ( elSplashView.hasAttribute('data-visible', 'true') ) {
                elSplashView.setAttribute('data-visible', 'false');
                elHomeView.setAttribute('data-visible', 'true');
                elHomeView.style.height = wHeight + 'px';
            }
        },

        /**
         * Responsible to attach event
         * on the circle button and initialize
         * the request on the the Instagram API
         * based on the user geolocation
         * @method triggerGetPlaces
         */
        triggerGetPlaces: function() {
            var ButtonGetPlaces = document.getElementById('buttonGetPlaces');
            ButtonGetPlaces.addEventListener('touchstart', window.App.ready.getPlaces, false);
        },

        /**
         * Responsible to get locations based
         * on the geolocation lat/lon
         * @method showLocations
         */
        getPlaces: function() {
            var lat = window.App.ready.defaults.userPosition.coords.latitude
                , long = window.App.ready.defaults.userPosition.coords.longitude;

            window.App.ready.loadingNewView();

            $.ajax({
                url: 'https://api.instagram.com/v1/locations/search?lat=' + lat + '&lng=' + long + '&client_id=e5b069c8c1034004a8e0220a4c60cd00&access_token=&undefined',
                type: 'GET',
                dataType: 'jsonp',
                success: function(data) {
                    window.App.ready.renderView('places-template', data.data);
                },
                error: function(error) {
                    console.log('error on requesting places', error)
                }
            });
        },

        /**
         * Responsible to render view
         * @method renderView
         */
        renderView: function(template, data) {
            var query = data
                , source = $('#' + template).html()
                , compiledTemplate = Handlebars.compile(source)
                , result = compiledTemplate(query);

            if ( template === 'search-template' ) {
                $('#placesView').prepend(result);
            } else {
                $('#templateWrapper').html(result);
            }

            if ( template === 'places-template' ) {
                this.triggerGetLocation();
                this.triggerSearch();
            }

            this.newViewLoaded()

        },

        /**
         * Responsible to hide loader and show new view
         * @newViewLoaded
         */
        newViewLoaded: function() {
            var elTemplateView = document.getElementById('templateWrapper')
                , elLoading = document.getElementById('loading');

            // hide loader
            elLoading.setAttribute('data-visible', 'false');
            // show template view
            elTemplateView.setAttribute('data-visible', 'true');
        },

        /**
         * Responsible to all views and show loader
         * @loadingNewView
         */
        loadingNewView: function() {
            var elSplashView = document.getElementById('splashView')
                , elHomeView = document.getElementById('homeView')
                , elLoading = document.getElementById('loading')
                , elTemplateView = document.getElementById('templateWrapper');


            elSplashView.setAttribute('data-visible', 'false');
            elHomeView.setAttribute('data-visible', 'false');
            elTemplateView.setAttribute('data-visible', 'false');
            elLoading.setAttribute('data-visible', 'true');
        },

        /**
         * Responsible to attach event and call
         * get location method
         * @method triggerGetLocation
         */
        triggerGetLocation: function() {
            var is4sqr
                , id
                , elPlaceButton = document.querySelectorAll('.placesView_button')
                , that =  this;

            $(document).off().on('click', '.placesView_button', function(e) {
                e.preventDefault();

                is4sqr = this.getAttribute('data-api-4sqr');

                    if ( is4sqr === 'true' ) {
                        console.log('4sqr');

                        id = this.getAttribute('data-place-id');
                        that.set4sqrId( id );
                    } else {
                        console.log('not 4sqr');
                        that.defaults.locationId = this.getAttribute('data-place-id');

                        console.log('location id', that.defaults.locationId)
                        that.getLocation();
                    }
            });
        },

        /**
         * Responsible to get specific location
         * based on user touch event
         * @method getLocation
         */
        getLocation: function() {
            var locationId = this.defaults.locationId
                , that = this;

            this.loadingNewView();

            $.ajax({
                url: 'https://api.instagram.com/v1/locations/' + locationId + '/media/recent?client_id=e5b069c8c1034004a8e0220a4c60cd00&access_token=&undefined',
                type: 'GET',
                dataType: 'jsonp',
                success: function(data) {
                    that.renderView('location-template', data.data);
                    that.closeLocation();
                    that.showBigThumbnail();
                },
                error: function(error) {
                    console.log('error on requesting places', error)
                }
            });
        },

        /**
         * Responsible to display bigger size of image
         * when clicked on
         * @method showBigThumbnail
         */
        showBigThumbnail: function() {
            var currentBigThumb
                , $elButtonZoomImage = $('.locationView_button')
                , elTempImg = document.getElementById('bigThumbnail');

            $elButtonZoomImage.on('click', function() {
                currentBigThumb = $(this).find('img').attr('data-image-big');
                $(elTempImg).find('img').attr('src', currentBigThumb);
                $(this).closest('.locationView_list').addClass('active');
            });

            $(elTempImg).on('click', function() {
                $('.locationView_list').removeClass('active');
            });

        },

        /**
         * Responsible to close location view
         * @method closeLocation
         */
        closeLocation: function() {
            var buttonCloseLocation = document.getElementById('location_close');
            buttonCloseLocation.addEventListener('click', window.App.ready.getPlaces, false);

        },

        /**
         * Responsible to get the place user
         * wants to search and send to foursquare
         * @method triggerSearch
         */
        triggerSearch: function() {
            var that = this
                , elSearchForm = document.getElementById('searchForm')
                , elSearchField = document.getElementById('searchField')
                , fieldVal;

            $(elSearchForm).submit(function(e) {
                e.preventDefault();

                fieldVal = elSearchField.value;
                console.log('query searched', fieldVal)
                that.getIdFrom4sqr(fieldVal);
                that.loadingNewView();
            });
        },

        /**
         * Responsible to search on Foursquare
         * using the query entered by the user and return the id
         * @method getIdFrom4sqr
         */
        getIdFrom4sqr: function(query) {
            var that = this
                , lat = this.defaults.userPosition.coords.latitude
                , long = this.defaults.userPosition.coords.longitude
                , radiusInMeters = 300
                , limit = 5; // in meters

            $.ajax({
                url: 'https://api.foursquare.com/v2/venues/search?client_id=HYFSBUSGKNYEZCGQQJ4WTKPLGWSSMX4GZYIETS2BS23BH4RV&client_secret=UL0VODXJ0Z3AIM54W5JKNEZFU4SVJQ4GFMQUC4M55J3KC31B&v=20130815&ll=' + lat + ',' + long + '&query=' + query + '&radius=' + radiusInMeters + '&limit=' + limit,
                type: 'GET',
                dataType: 'jsonp',
                success: function(data) {
                    var response = data.response.venues;
                    console.log('onSuccess from 4sqr', data)
                    that.renderView('search-template', response);
                },
                error: function(error) {
                    console.log('error on searching for query', error)
                }
            });

        },

        /**
         * Responsible to use 4sqr id to retrieve Instagram Id
         * and set the new locationId
         * @param  {string} id contain the 4sqr id
         * @method set4sqrId
         */
        set4sqrId: function(id) {
            var that = this;

            console.log('setting new if from 4sqr', id)

            $.ajax({
                url: 'https://api.instagram.com/v1/locations/search?foursquare_v2_id=' + id + '&client_id=e5b069c8c1034004a8e0220a4c60cd00&access_token=&undefined',
                type: 'GET',
                dataType: 'jsonp',
                success: function(data) {
                    var newId = data.data[0].id;

                    console.log('response from instagram-4sqr', data)

                    console.log('new id', newId )
                    that.defaults.locationId = newId;
                    that.getLocation();
                },
                error: function(error) {
                    console.log('error getting Instagram new id using 4sqr id', error)
                }
            });
        },

        /**
         * Responsible to get user Geolocation and return result
         * @return object result
         * @method getGeolocation
         */
        getUserGeolocation: function() {

            function onSuccess(position) {
                window.App.ready.initUserLocation(position);
            }

            function onError(error) {
                navigator.notification.alert(
                    error.message,
                    null,       // callback
                    "ThePhotoMenu", // title
                    'OK'        // buttonName
                );
            }

            // get current user position
            navigator.geolocation.getCurrentPosition(
                onSuccess,
                onError,
                {
                    enableHighAccuracy: true
                }
            );
        }

    }
    // END APP



    // Device ready
    document.addEventListener('deviceready', function () {

        // Enable fastClick on document ready
        FastClick.attach(document.body);

        // Start location actions
        window.App.ready.getUserGeolocation();

        // wait a little bit so the location can be done
        // and initialize the App
        setTimeout(window.App.ready.showHomeScreen, 1500);

    }, false);

})(window);
