// Declare required widgets
    require([ 
        "esri/Map",
        "esri/views/MapView",
        "esri/WebMap",
        "esri/layers/FeatureLayer",
        "esri/config",
        "esri/Viewpoint",
        "esri/widgets/Expand",
        "esri/widgets/BasemapGallery",
        "esri/widgets/BasemapToggle",
        "esri/widgets/Search",
        "esri/layers/TileLayer",
        "esri/widgets/LayerList",
        "esri/widgets/LayerList/LayerListViewModel",
        "esri/widgets/Home",
        "esri/widgets/Legend",
        "esri/widgets/Print",
        "esri/widgets/AreaMeasurement2D",
        "esri/widgets/DistanceMeasurement2D",
        "esri/geometry/geometryEngine",
        "esri/widgets/ScaleBar",
        "esri/core/watchUtils",
        "dojo/domReady!"
        ], 
    // Function to Call widgets     
    function(Map, MapView, WebMap, FeatureLayer, esriConfig, Viewpoint,  Expand, BasemapGallery, BasemapToggle, Search, TileLayer, LayerList, LayerListVM, Home, Legend, Print, AreaMeasurement2D, DistanceMeasurement2D, geometryEngine, ScaleBar, watchUtils) {
            
            // create a number with commas
            function numberWithCommas(x) {
                var parts = x.toString().split(".");
                parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                return parts.join(".");
            }
            {
            esriConfig.portalUrl = "https://maps.trpa.org/portal";
            };
            var webmap = new WebMap({
              portalItem: { // autocasts as new PortalItem()
                id: "c08805909ba24bfaa3d83a4c00a81ead"
              }
            });

            var view = new MapView({
              map: webmap,  // The WebMap instance created above
              container: "viewDiv",
              center: [-120.01,38.925],
              zoom: 13,
              popup: {
                    actionsMenuEnabled: false
                    }
            });
        
            // Add a legend instance to the panel of a
            // ListItem in a LayerList instance
                const layerList = new LayerList({
                  view: view,
                  listItemCreatedFunction: function(event) {
                    const item = event.item;
                    if (item.layer.type != "group") {
                      // don't show legend twice
                      item.panel = {
                        content: "legend",
                        open: false
                      };
                    }
                  }
                });
            view.ui.add(layerList, "top-right");
            
            
            // Create collapasable button for Table of Contents
            var layerListExpand = new Expand({
                expandIconClass: "esri-icon-layers",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
                expandTooltip: "Layer List",
                view: view,
                autoCollapse: true,
                content: layerList.domNode
                });
            
            // add layer list button to the top right corner of the view
            view.ui.add(layerListExpand, "top-right");
        
            // function to create print service
            view.when(function() {
                var print = new Print({
                    container: document.createElement("div"),
                    view: view,
                    // specify print service url
                    printServiceUrl:"https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
            });
                // Standard AGOL Print Service            //"https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
                
                // Custom TRPA Print Service
                // "https://maps.trpa.org/server/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
           
            // Create Print Button
            var printExpand = new Expand({
                expandIconClass: "esri-icon-printer",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
                expandTooltip: "Print",
                view: view,
                autoCollapse: true,
                content: print.domNode
                });

            // Add print widget to the top right corner of the view
            view.ui.add(printExpand, "top-right");
            });
            
            var parcels = new FeatureLayer({
                url: "https://maps.trpa.org/server/rest/services/Parcels/MapServer/0",
                popupTemplate: {
                // autocasts as new PopupTemplate()
                    title: "Parcel: {APN}",
                    overwriteActions: false
                }
            });
        
			// Create Search Widget
            var searchWidget = new Search({
              view: view,
              allPlaceholder: "Address or APN",
              locationEnabled: false,
              includeDefaultSources: false,
              popupEnabled: false,
              sources: [
                {
                  layer: parcels,
                  searchFields: ["APO_ADDRESS"],
                  displayField: "APO_ADDRESS",
                  exactMatch: false,
                  outFields: ["APO_ADDRESS"],
                  name: "Address",
                  zoomScale: 24000,
                },
                {
                  layer: parcels,
                  searchFields: ["APN"],
                  displayField: "APN",
                  exactMatch: false,
                  outFields: ["APN"],
                  name: "APN",
                  zoomScale: 24000,
                }
              ]
            });
                        
            // Add the search widget to the top left corner of the view
            view.ui.add(searchWidget, {
                position: "top-left"
            });
            
            // move zoom buttons to top left
            view.ui.move("zoom", "top-left");
                
            // Createa Home Button
            var homeWidget = new Home({
                view: view
            });
            
            // adds the home widget to the top left corner of the MapView
            view.ui.add(homeWidget, "top-left");            

            var basemapToggle = new BasemapToggle({
                container: document.createElement("div"),
                view: view,
                nextBasemap: "hybrid"  // Allows for toggling to the "hybrid" basemap
            });
            
            // Create an Expand instance and set the content
            // property to the DOM node of the basemap gallery widget
            var bgExpand = new Expand({
                expandIconClass: "esri-icon-basemap",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font
                expandTooltip: "Toggle Basemap",
                view: view,
                content: basemapToggle.domNode
            });

            // Add the basemap gallery button
            view.ui.add(bgExpand, "bottom-left"); 
                    
            // add a legend widget instance to the view
            // and set the style to 'card'. This is a
            // responsive style, which is good for mobile devices
            // or 'classic' for PC users
            const legend = new Expand({
                expandIconClass: "esri-icon-layer-list",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font
                expandTooltip: "Legend",
                content: new Legend({
                    view: view,
                    style: "classic" // other styles include 'card'
                    }),
                view: view,
                expanded: false
            });
            view.ui.add(legend, "bottom-left");
        
            // setup active widget var to hold measurement interaction
            var activeWidget = null;

            // add the toolbar for the measurement widgets
            view.ui.add("bottombar", "bottom-right");

            document
              .getElementById("distanceButton")
              .addEventListener("click", function() {
                setActiveWidget(null);
                if (!this.classList.contains("active")) {
                  setActiveWidget("distance");
                } else {
                  setActiveButton(null);
                }
              });

            document
              .getElementById("areaButton")
              .addEventListener("click", function() {
                setActiveWidget(null);
                if (!this.classList.contains("active")) {
                  setActiveWidget("area");
                } else {
                  setActiveButton(null);
                }
              });

            function setActiveWidget(type) {
              switch (type) {
                case "distance":
                  activeWidget = new DistanceMeasurement2D({
                    view: view
                  });

                  // skip the initial 'new measurement' button
                  activeWidget.viewModel.newMeasurement();

                  view.ui.add(activeWidget, "bottom-right");
                  setActiveButton(document.getElementById("distanceButton"));
                  break;
                case "area":
                  activeWidget = new AreaMeasurement2D({
                    view: view
                  });

                  // skip the initial 'new measurement' button
                  activeWidget.viewModel.newMeasurement();

                  view.ui.add(activeWidget, "bottom-right");
                  setActiveButton(document.getElementById("areaButton"));
                  break;
                case null:
                  if (activeWidget) {
                    view.ui.remove(activeWidget);
                    activeWidget.destroy();
                    activeWidget = null;
                  }
                  break;
              }
            }

            function setActiveButton(selectedButton) {
              // focus the view to activate keyboard shortcuts for sketching
              view.focus();
              var elements = document.getElementsByClassName("active");
              for (var i = 0; i < elements.length; i++) {
                elements[i].classList.remove("active");
              }
              if (selectedButton) {
                selectedButton.classList.add("active");
              }
            }
        
            // Create Scale Bar Widget centered on the bottom using the div container scaleposition
            var scaleBar = new ScaleBar({
                view: view,
                container: "scaleposition"
            });
    });