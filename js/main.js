      require([
        "esri/config",
        "esri/WebMap",
        "esri/Map",
        "esri/views/MapView",
        "esri/views/SceneView",
        "esri/layers/TileLayer",
        "esri/layers/FeatureLayer",
        "esri/layers/GraphicsLayer",
        "esri/widgets/Sketch",
        "esri/widgets/Measurement",
        "esri/widgets/Expand",
        "esri/widgets/BasemapGallery",
        "esri/widgets/BasemapToggle",
        "esri/widgets/Search",
        "esri/widgets/LayerList",
        "esri/widgets/LayerList/LayerListViewModel",
        "esri/widgets/Home",
        "esri/widgets/Legend",
        "esri/widgets/Print",
        "esri/Graphic",
        "esri/layers/support/LabelClass",
        "esri/geometry/SpatialReference",
        "dgrid/OnDemandGrid",
        "dgrid/extensions/ColumnHider",
        "dojo/store/Memory",
        "dstore/legacy/StoreAdapter",
        "dgrid/Selection",
        "esri/widgets/Locate",
      ], function(
        esriConfig,
        WebMap,
        Map,
        MapView,
        SceneView,
        TileLayer,
        FeatureLayer,
        GraphicsLayer,
        Sketch,
        Measurement,
        Expand,
        BasemapGallery,
        BasemapToggle,
        Search,
        LayerList,
        LayerListVM,
        Home,
        Legend,
        Print,
        Graphic,
        LabelClass,
        SpatialReference,
        OnDemandGrid, 
        ColumnHider, 
        Memory, 
        StoreAdapter, 
        Selection,
        Locate
      ) {
          {
        esriConfig.portalUrl = "https://maps.trpa.org/portal/";
            };
        // Initialize variables
        let highlight, features, parcelLayerView, grid;
        
        const gridDiv = document.getElementById("grid");
        const infoDiv = document.getElementById("info");

        // create new map, view and csvlayer
        const gridFields = [
            'OBJECTID', 'APN', 'PPNO', 'HSE_NUMBR', 'UNIT_NUMBR', 'STR_DIR','STR_NAME', 'STR_SUFFIX', 'APO_ADDRESS', 'PSTL_TOWN', 'PSTL_STATE', 'PSTL_ZIP5', 'OWN_FIRST', 'OWN_LAST', 'OWN_FULL', 'MAIL_ADD1', 'MAIL_ADD2', 'MAIL_CITY','MAIL_STATE', 'MAIL_ZIP5', 'JURISDICTION', 'COUNTY', 'OWNERSHIP_TYPE', 'COUNTY_LANDUSE_CODE', 'COUNTY_LANDUSE_DESCRIPTION', 'TRPA_LANDUSE_DESCRIPTION', 'REGIONAL_LANDUSE', 'UNITS', 'BEDROOMS', 'BATHROOMS', 'ALLOWABLE_COVERAGE_BAILEY_SQFT', 'IMPERVIOUS_SURFACE_SQFT', 'SOIL_1974', 'SOIL_2003', 'HRA_NAME', 'WATERSHED_NUMBER', 'WATERSHED_NAME', 'PRIORITY_WATERSHED', 'FIREPD', 'WITHIN_TRPA_BNDY', 'LITTORAL', 'AS_LANDVALUE', 'AS_IMPROVALUE', 'AS_SUM', 'TAX_LANDVALUE', 'TAX_IMPROVALUE', 'TAX_SUM', 'TAX_YEAR', 'PLAN_ID', 'PLAN_NAME', 'ZONING_ID', 'ZONING_DESCRIPTION', 'TOWN_CENTER', 'LOCATION_TO_TOWNCENTER', 'INDEX_1987', 'PARCEL_ACRES', 'PARCEL_SQFT','LOCAL_PLAN_HYPERLINK', 'DESIGN_GUIDELINES_HYPERLINK', 'INDEX_1987_HYPERLINK', 'LTINFO_HYPERLINK'
        ];  

        var webmap = new WebMap({
              portalItem: { // autocasts as new PortalItem()
                id: "050cb95e85f941b8891eb538fe23328a"
              }
            });
        // Create a popupTemplate for the land use layer and pass in a function to set its content and specify an action to handle editing the selected feature
        const template = {
          title: "Parcel: {APN}",
          content:[
              {
          type: "fields",
          fieldInfos: [
                {
                  fieldName: "APO_ADDRESS",
                  label: "Address"
                },
                {
                  fieldName: "TRPA_LANDUSE_DESCRIPTION",
                  label: "Existing Land Use"
                },
                {
                  fieldName: "OWN_FULL",
                  label: "Owner Name"
                },
                {
                  fieldName: "OWNERSHIP_TYPE",
                  label: "Ownership Type",
                  },
                {
                  fieldName: "ZONING_DESCRIPTION",
                  label: "Zoning",
                  },
                {
                  fieldName: "PARCEL_ACRES",
                  label: "Acres",
                  format: {
                    digitSeparator: true,
                    places: 2
                  },
                },
                {
                  fieldName: "LOCAL_PLAN_HYPERLINK",
                  label: "Plan Document"
                },
                {
                  fieldName: "DESIGN_GUIDELINES_HYPERLINK",
                  label: "Design Guidelines"
                },
                {
                  fieldName: "LTINFO_HYPERLINK",
                  label: "Parcel Details"
                }
                ]
              }
              ]           
        };
        
        // construct parcel land use layer from portal item
        const parcels = new FeatureLayer({
          portalItem: {
            id: "d3a8d3aaf5c3421bb4653bb96ee6c49c"
          },
          title: "Parcels",
          outFields: ["*"],
          popupTemplate: template
        });
          
        // add land use layer to the map
        webmap.add(parcels);
          
        const parcelLabelClass = new LabelClass({
            labelExpressionInfo: { expression: "$feature.APN" },
            symbol: {
                type: "text",  // autocasts as new TextSymbol()
                color: "black",
                haloSize: 1,
                haloColor: "white",
            font: {  // autocast as new Font()
               family: "Ubuntu Light",
               size: 10,
               style: "italic"
             }
              },
            labelPlacement: "center-center",
            maxScale: 0,
            minScale: 3600
            });

            parcels.labelingInfo = [ parcelLabelClass ];
          
        // setup the map view
        var view = new MapView({
              map: webmap,  // The WebMap instance created above
              popup: {
                dockEnabled: true,
                dockOptions: {
                  // sets docking spot to top left
                  position: "top-left"
                }
              },
              container: "viewDiv",
              center: [-120.01,39.05],
              zoom: 10
            });
  
        // create graphics layer to use in sketch widget
        const sketchLayer = new GraphicsLayer({
            title: "Sketch Layer"
        });
        
        // add sketch layer to the web map
        webmap.add(sketchLayer);
        
        // initialize sketch widget
        const sketch = new Sketch({
          layer: sketchLayer,
          view: view,
          // graphic will be selected as soon as it is created
          creationMode: "update"
        });
        
        // add sketch widget to the ui
        view.ui.add(sketch);
        
        // create expand to hide sketch toolbar
        var sketchExpand = new Expand({
            expandIconClass: "esri-icon-edit",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
            expandTooltip: "Sketch Tool",
            view: view,
            autoCollapse: false,
            content: sketch.domNode,
            group: "top-right"
            });
            
        // add sketch button to the top right corner of the view
        view.ui.add(sketchExpand, "top-right");
          
        // add the toolbar for the measurement widgets
        view.ui.add("toolbarDiv", "bottom-left");
        
        // Create new instance of the Measurement widget
        const measurement = new Measurement();

        const distanceButton = document.getElementById("distance");
        const areaButton = document.getElementById("area");
        const clearButton = document.getElementById("clear");
                  
        distanceButton.addEventListener("click", function() {
          distanceMeasurement();
        });
        areaButton.addEventListener("click", function() {
          areaMeasurement();
        });
        clearButton.addEventListener("click", function() {
          clearMeasurements();
        });

        // Call the loadView() function for the initial view
        loadView();

        // The loadView() function to define the view for the widgets and div
        function loadView() {
          view.set({
            container: "viewDiv"
          });
          // Add the appropriate measurement UI to the bottom-right when activated
          view.ui.add(measurement, "bottom-left");
          // Set the views for the widgets
          measurement.view = view;
        }

        // Call the appropriate DistanceMeasurement2D
        function distanceMeasurement() {
          const type = view.type;
          measurement.activeTool =
            type.toUpperCase() === "2D" ? "distance" : "direct-line";
          distanceButton.classList.add("active");
          areaButton.classList.remove("active");
        }

        // Call the appropriate AreaMeasurement2D
        function areaMeasurement() {
          measurement.activeTool = "area";
          distanceButton.classList.remove("active");
          areaButton.classList.add("active");
        }

        // Clears all measurements
        function clearMeasurements() {
          distanceButton.classList.remove("active");
          areaButton.classList.remove("active");
          measurement.clear();
        }
          
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
                    open: true
                  };
                }
              }
        });

        // add layer list
        view.ui.add(layerList, "top-right");
        
        // Create collapasable button for Table of Contents
        var layerListExpand = new Expand({
            expandIconClass: "esri-icon-layers",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
            expandTooltip: "Layer List",
            view: view,
            autoCollapse: true,
            content: layerList.domNode,
            group: "top-right"
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

        // Create Print Button
        var printExpand = new Expand({
            expandIconClass: "esri-icon-printer",  // see https://developers.arcgis.com/javascript/latest/guide/esri-icon-font/
            expandTooltip: "Print",
            view: view,
            autoCollapse: true,
            content: print.domNode,
            group: "top-right"
            });

        // Add print widget to the top right corner of the view
        view.ui.add(printExpand, "top-right");
        });
                  
        // create a new datastore for the on demandgrid
        // will be used to display attributes of selected features
        const dataStore = new StoreAdapter({
          objectStore: new Memory({
            idProperty: "OBJECTID"
          })
        });
        /****************************************************
         * Selects features from the layer that intersect
         * a polygon that user drew using sketch view model
         ****************************************************/
        function popGrid() {
          view.graphics.removeAll();
          if (parcelLayerView) {
            const query = {
              where: "1=1",
              outFields: ["*"]
            };

            // query graphics from the layer view. Geometry set for the query
            // can be polygon for point features and only intersecting geometries are returned
            parcelLayerView.queryFeatures(query).then(function(results) {
                const graphics = results.features;
                // if the grid div is displayed while query results does not
                // return graphics then hide the grid div and show the instructions div
                if (graphics.length > 0) {
                  gridDiv.style.zIndex = 90;
                  infoDiv.style.zIndex = 80;
                  document.getElementById("featureCount").innerHTML =
                    "<b>Showing attributes for " +
                    graphics.length.toString() + " features </b>"
                } else {
                  gridDiv.style.zIndex = 80;
                  infoDiv.style.zIndex = 90;
                }

                // get the attributes to display in the grid
                const data = graphics.map(function(feature, i) {
                  return Object.keys(feature.attributes)
                    .filter(function(key) {
                      // get fields that exist in the grid
                      return (gridFields.indexOf(key) !== -1);
                    })
                    // need to create key value pairs from the feature
                    // attributes so that info can be displayed in the grid
                    .reduce(function(obj, key) {
                      obj[key] = feature.attributes[key];
                      return obj;
                    }, {});
                });

                // set the datastore for the grid using the
                // attributes we got for the query results
                dataStore.objectStore.data = data;
                grid.set("collection", dataStore);
              })
              .catch(errorCallback);
          }
        }
        /************************************************
         * fires when user clicks a row in the grid
         * get the corresponding graphic and select it
         *************************************************/
        function selectFeatureFromGrid(event) {
          // close view popup if it is open
          view.popup.close();
          // get the ObjectID value from the clicked row
          const row = event.rows[0]
          const id = row.data.OBJECTID;

          // setup a query by specifying objectIds
          const query = {
            objectIds: [parseInt(id)],
            outFields: ["*"],
            returnGeometry: true,
            outSpatialReference: view.SpatialReference
          };

          // query the LayerView using the query set above
          parcelLayerView.queryFeatures(query).then(function(results) {
              const graphics = results.features;
              // remove all graphics to make sure no selected graphics
              view.graphics.removeAll();
              view.goTo(graphics[0].geometry);

              // create a new selected graphic
              const selectedGraphic = new Graphic({
                geometry: graphics[0].geometry,
                symbol: {
                  type: "simple-fill",
                  color: [130, 194, 232, 0.4],
                  style: "solid",
                  outline: {  // autocasts as new SimpleLineSymbol()
                    color:[130, 194, 232, 0.4],
                    width: 3
                  }
                }
              });

              // add the selected graphic to the view
              // this graphic corresponds to the row that was clicked
              view.graphics.add(selectedGraphic);
            })
            .catch(errorCallback);
        }

        /************************************************
         * Creates a new grid. Loops through layer 
         * fields and creates grid columns
         * Grid with selection and columnhider extensions
         *************************************************/
        function createGrid(fields) {
          var columns = fields.filter(function(field, i) {
            if (gridFields.indexOf(field.name) !== -1) {
              return field;
            }
              
          }).map(function(field) {
            if (field.name === "APN" || field.name === "JURISDICTION" || field.name === "OWNERSHIP_TYPE"|| field.name === "TRPA_LANDUSE_DESCRIPTION") {
              return {
                field: field.name,
                label: field.alias,
                sortable: true,
                hidden: false
              };
            } else {
              return {
                field: field.name,
                label: field.alias,
                sortable: true,
                hidden: true
              };
            }
          });

          // create a new onDemandGrid with its selection and columnhider
          // extensions. Set the columns of the grid to display attributes
          grid = new(OnDemandGrid.createSubclass([Selection, ColumnHider]))({
            columns: columns
          }, "grid");

          // add a row-click listener on the grid. This will be used
          // to highlight the corresponding feature on the view
          grid.on("dgrid-select", selectFeatureFromGrid);
        }
        
        function errorCallback(error) {
          console.log("error:", error)
        }
        
        // create a grid with given columns once the layer is loaded
        parcels.when(function () {
            // create a grid with columns specified in gridFields variable
            createGrid(parcels.fields);

            // get a reference the parcellayerview when it is ready.
            view.whenLayerView(parcels).then(function (layerView) {
              parcelLayerView = layerView;
                //wait for the layerview to be done updating
              parcelLayerView.watch("updating", function(bool){
                if(!bool){
                  popGrid();
                }
              })
            });
          })
          .catch(errorCallback);

        // create grid expand
        const gridExpand = new Expand({
          expandTooltip: "Parcel Attributes",
          expanded: false,
          view: view,
          content: document.getElementById("gridDiv"),
          expandIconClass: "esri-icon-table",
          group: "bottom-left"
        });  

        // Add grid expand to the view
        view.ui.add(gridExpand, "bottom-right");  
          
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

          
        var locate = new Locate({
        view: view,
        useHeadingEnabled: false,
        goToOverride: function(view, options) {
          options.target.scale = 1500;  // Override the default map scale
          return view.goTo(options.target);
        }
        });

        view.ui.add(locate, "top-left"); 
          
        // setup new basemap toggle
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
            content: basemapToggle.domNode,
            group: "top-left"
        });

        // Add the basemap gallery button
        view.ui.add(bgExpand, "top-left"); 

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
            expanded: false,
            group: "top-right"
        });
          
        // add leged exapnd to ui
        view.ui.add(legend, "top-right");
      
      });