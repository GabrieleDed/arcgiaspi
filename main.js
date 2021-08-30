require([
  "esri/config",
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/widgets/Legend"

], function (esriConfig, Map, MapView, FeatureLayer, Legend) {

  esriConfig.apiKey = "AAPK643820ce05444aa3816a01a495b5e6d24lrjXxOcGOh97ggMBK_nrlJupUAuhSykdkOIXE90aWcI4OpulplbnqNwV-oJJKeR";

  const map = new Map({
    basemap: "arcgis-topographic"
  });

  // Map koordinatės
  const view = new MapView({
    container: "viewDiv",
    map: map,
    center: [23.8813, 55.1694],
    zoom: 8
  });

  // Senunijos pop-up
  const popupDeathInMunicipality = {
    "title": "{SAV_PAV}",
    "content": "<b>Savivaldybe:</b> {SAV_PAV}  <br><b>Bendras mirciu skaicius:</b> {Is_viso}<br><b>Miestuose:</b> {X70_city}<br><b>Kaimuose:</b> {X70_village}<br>"
  }

  // Atvaizduojamas senunijos pavadinimas
  const labelClass = {
    symbol: {
      type: "text",
      color: "black",
      font: {
        family: "Arial",
        size: 12,
        weight: "bold"
      }
    },
    labelPlacement: "above-center",
    labelExpressionInfo: {
      expression: "$feature.SAV_PAV"
    }
  };

  // Legenda pagrindinio FeatureLayer
  const legend = new Legend({
    view: view
  });
  view.ui.add(legend, "top-right");

  

  // SQL query array
  const parcelLayerSQL = ["Choose a SQL where clause...", "Is_viso >= 18", "Is_viso < 18", "Nuimti"];
  let whereClause = parcelLayerSQL[0];

  // UI
  const select = document.createElement("select", "");
  select.setAttribute("class", "esri-widget esri-select");
  select.setAttribute("style", "width: 200px; font-family: 'Avenir Next'; font-size: 1em");
  parcelLayerSQL.forEach(function (query) {
    let option = document.createElement("option");
    option.innerHTML = query;
    option.value = query;
    select.appendChild(option);
  });

  view.ui.add(select, "top-left");

  // Lisiner
  select.addEventListener('change', (event) => {

    if (event.target.value != "Nuimti")
      whereClause = event.target.value;
    else
      whereClause = "Is_viso = null"
    queryFeatureLayer(view.extent);
  });

  // Išfiltruotas FeatureLayer
  const parcelLayer = new FeatureLayer({
    url: "https://services.arcgis.com/XdDVrnFqA9CT3JgB/arcgis/rest/services/X70_bendras/FeatureServer/0",
  });

  // Išfiltruojami duomenys
  function queryFeatureLayer(extent) {
    const parcelQuery = {
      where: whereClause,
      spatialRelationship: "intersects",
      geometry: extent,
      outFields: ["SAV_PAV", "Is_viso", "X70_city", "X70_village"],
      returnGeometry: true
    };

    parcelLayer.queryFeatures(parcelQuery).then((results) => {
      displayResults(results);
    }).catch((error) => {
      console.log(error.error);
    });

  }

  // Atvaizduojami rezultatai sukuriant naujus plotus
  function displayResults(results) {
    const symbol = {
      type: "simple-fill",
      color: [20, 130, 200, 0.5],
      outline: {
        color: "white",
        width: .5
      },
    };

    results.features.map((feature) => {
      feature.symbol = symbol;
      return feature;
    });

    view.popup.close();
    view.graphics.removeAll();
    view.graphics.addMany(results.features);

  }

  // Pagrindinis FeatureLayer apie savižudybęs
  const deathsLayer = new FeatureLayer({
    url: "https://services.arcgis.com/XdDVrnFqA9CT3JgB/arcgis/rest/services/X70_bendras/FeatureServer/0",
    outFields: ["SAV_PAV", "Is_viso", "X70_city", "X70_village"],
    popupTemplate: popupDeathInMunicipality,
    labelingInfo: [labelClass]
  });

  // Pridedamas prie Map pagrindinis FeatureLayer
  map.add(deathsLayer);

});
