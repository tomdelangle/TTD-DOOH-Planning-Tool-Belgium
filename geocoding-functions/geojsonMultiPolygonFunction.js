async function geojsonMultiPolygonFunction(fileContent){

    try {
  
        let MultiPolygon = JSON.parse(fileContent);

        var totalUniqueScreens = new Set();
  
        userGeojsonLayer.addData(MultiPolygon);
  
        userGeojsonLayer.eachLayer(multipolygon => {

          let screensPerMultipolygon = new Set();

          let multiPolygonID = multipolygon._leaflet_id
  
          var turfMultipolygon = turf.multiPolygon(multipolygon.feature.geometry.coordinates);
    
          ttdScreensLayer.eachLayer(function (layer) {
  
              var pointTurf = turf.point([
                  layer.feature.geometry.coordinates[0],
                  layer.feature.geometry.coordinates[1],
              ]);
      
              var inside = turf.inside(pointTurf, turfMultipolygon);
          
              if (inside && !totalUniqueScreens.has(layer)) {
                  clusterMarkers.addLayer(layer);
                  totalUniqueScreens.add(layer);
              };
              if (inside) {
                screensPerMultipolygon.add(layer);
            };
          });

          selectedCPM = []

          screensPerMultipolygon.forEach(layer => {
    
            selectedCPM.push(layer.feature.properties[`FloorCPM($)`]);
    
          });
    
          var cpmAverage = (selectedCPM.reduce((acc, val) => acc + val, 0) / selectedCPM.length).toFixed(2)

          let popupUserContent =
    
          `
          <div class="first-row-popup"><span class="popup-title">Layer ${userGeojsonLayer.getLayers().findIndex(layer => layer._leaflet_id == multiPolygonID) + 1}</span><div class="popup-badge popup-multipolygon-tag">Multipolygon</div></div><br>
          <div class="forecast-popup">
          <div class="screens-section forecast-section">
              <img src="./img/screens.svg" alt="" class="screens-img-popup">
              <span class="span-img-popup">${screensPerMultipolygon.size}</span>
          </div>
          <div class="cpm-section forecast-section">
              <img src="./img/cpm.svg" alt="" class="cpm-img-popup">
              <span class="span-img-popup">${cpmAverage == "NaN" ? "- " : cpmAverage}$</span>
          </div>
          <div class="contacts-section forecast-section">
              <img src="./img/contacts.svg" alt="" class="contacts-img-popup">
              <span class="span-img-popup">--</span>
          </div>
          </div>
          `;

          multipolygon.bindPopup(popupUserContent,{closeButton: false});

        });
  
      return {fileType:"geojson multipolygon file",status:"processing: OK",totalScreens:totalUniqueScreens.size,userLayer:userGeojsonLayer.getLayers().length};
  
    } catch (error) {
  
      console.error(error);
      return {fileType:"geojson multipolygon file",status:"processing: NOT OK",errorMessage:error.message};
  
    };
  
      
  };