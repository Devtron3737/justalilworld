import React from "react";
import { MapContainer, useMap } from "react-leaflet";
import L from "leaflet";

import Countries from "./Countries";
import SettingsModal from "./SettingsModal";
import "./App.css";
import usGeoJsonData from "./us_data.json";
import worldGeoJsonData from "./country_data.json";

// Helper component to access the map instance
function MapController({ onMapReady }) {
  const map = useMap();
  
  React.useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  
  return null;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.mapInstance = null;
    this.state = {
      mapKey: Math.random(),
      correctCountries: [],
      incorrectCountries: [],
      laterCorrectCountries: [],
      revealedCountries: [],
      correctStates: [],
      incorrectStates: [],
      laterCorrectStates: [],
      revealedStates: [],
      showSettingsModal: false,
      showCountryName: true,
      showCountryGdp: false,
      darkMode: true,
      currentMapView: "world",
      usGeoJsonData,
      worldGeoJsonData,
      isNavigating: false,
      currentCountryIndex: 0,
      countrySequence: [],
    };
  }

  clearAll = () => {
    this.setState({
      mapKey: Math.random(),
      correctCountries: [],
      incorrectCountries: [],
      laterCorrectCountries: [],
      revealedCountries: [],
      correctStates: [],
      incorrectStates: [],
      laterCorrectStates: [],
      revealedStates: [],
    });
  };

  addCorrectState = (state) => {
    this.setState({
      correctStates: this.state.correctStates.concat([state]),
    });
    
    // Trigger smooth navigation to next state after a short delay
    setTimeout(() => {
      this.smoothNavigateToNextCountry();
    }, 1000);
  };

  addIncorrectState = (state) => {
    this.setState({
      incorrectStates: this.state.incorrectStates.concat([state]),
    });
  };

  addLaterCorrectState = (state) => {
    this.setState({
      laterCorrectStates: this.state.laterCorrectStates.concat([state]),
    });
    
    // Also trigger navigation for later correct guesses
    setTimeout(() => {
      this.smoothNavigateToNextCountry();
    }, 1000);
  };

  addRevealedState = (state) => {
    this.setState({
      revealedStates: this.state.revealedStates.concat([state]),
    });
  };

  toggleDarkMode = () => {
    this.setState((prevState) => {
      const darkMode = !prevState.darkMode;
      document.body.style.backgroundColor = darkMode ? "black" : "white";
      document.body.style.color = darkMode ? "white" : "black";

      document.documentElement.style.setProperty(
        "--leaflet-popup-bg-color",
        darkMode ? "rgba(0, 0, 0, 0.85)" : "rgba(255, 255, 255, 0.92)"
      );

      document.documentElement.style.setProperty(
        "--leaflet-popup-border",
        darkMode ? "white" : "black"
      );

      document.documentElement.style.setProperty(
        "--font-color",
        darkMode ? "white" : "black"
      );

      return { darkMode };
    });
  };

  toggleSettingsModal = () => {
    this.setState({
      showSettingsModal: !this.state.showSettingsModal,
    });
  };

  toggleCountryName = () => {
    this.setState({
      showCountryName: !this.state.showCountryName,
    });
  };

  toggleCountryGdp = () => {
    this.setState({
      showCountryGdp: !this.state.showCountryGdp,
    });
  };

  addCorrectCountry = (country) => {
    this.setState({
      correctCountries: this.state.correctCountries.concat([country]),
    });
    
    // Trigger smooth navigation to next country after a short delay
    setTimeout(() => {
      this.smoothNavigateToNextCountry();
    }, 1000);
  };

  addIncorrectCountry = (country) => {
    this.setState({
      incorrectCountries: this.state.incorrectCountries.concat([country]),
    });
  };

  addLaterCorrectCountry = (country) => {
    this.setState({
      laterCorrectCountries: this.state.laterCorrectCountries.concat([country]),
    });
    
    // Also trigger navigation for later correct guesses
    setTimeout(() => {
      this.smoothNavigateToNextCountry();
    }, 1000);
  };

  addRevealedCountry = (country) => {
    this.setState({
      revealedCountries: this.state.revealedCountries.concat([country]),
    });
  };

  toggleMapView = () => {
    this.setState((prevState) => ({
      currentMapView: prevState.currentMapView === "world" ? "US" : "world",
      mapKey: Math.random(),
      correctCountries: [],
      incorrectCountries: [],
      laterCorrectCountries: [],
      revealedCountries: [],
      correctStates: [],
      incorrectStates: [],
      laterCorrectStates: [],
      revealedStates: [],
      currentCountryIndex: 0,
      countrySequence: [],
    }), () => {
      // Reinitialize sequence after state update
      this.initializeCountrySequence();
    });
  };

  componentDidMount() {
    this.initializeCountrySequence();
  }

  onMapReady = (mapInstance) => {
    this.mapInstance = mapInstance;
  };

  initializeCountrySequence = () => {
    const features = this.state.currentMapView === "world" 
      ? this.state.worldGeoJsonData.features 
      : this.state.usGeoJsonData.features;
    
    // Create a randomized sequence of all countries/states
    const sequence = features
      .map(feature => ({
        name: feature.properties[this.state.currentMapView === "world" ? "COUNTRY" : "name"],
        geometry: feature.geometry,
        bounds: this.getFeatureBounds(feature.geometry)
      }))
      .sort(() => Math.random() - 0.5); // Shuffle the array
    
    this.setState({ countrySequence: sequence });
  };

  getFeatureBounds = (geometry) => {
    if (geometry.type === "Polygon") {
      const coords = geometry.coordinates[0];
      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;
      
      coords.forEach(([lng, lat]) => {
        minLat = Math.min(minLat, lat);
        maxLat = Math.max(maxLat, lat);
        minLng = Math.min(minLng, lng);
        maxLng = Math.max(maxLng, lng);
      });
      
      return [[minLat, minLng], [maxLat, maxLng]];
    } else if (geometry.type === "MultiPolygon") {
      let minLat = Infinity, maxLat = -Infinity;
      let minLng = Infinity, maxLng = -Infinity;
      
      geometry.coordinates.forEach(polygon => {
        polygon[0].forEach(([lng, lat]) => {
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        });
      });
      
      return [[minLat, minLng], [maxLat, maxLng]];
    }
    return null;
  };

  smoothNavigateToNextCountry = () => {
    if (this.state.isNavigating) return;
    
    const nextIndex = this.state.currentCountryIndex + 1;
    if (nextIndex >= this.state.countrySequence.length) {
      // All countries completed
      return;
    }

    const nextCountry = this.state.countrySequence[nextIndex];
    if (!nextCountry || !this.mapInstance) return;

    this.setState({ isNavigating: true });

    const map = this.mapInstance;
    
    // Step 1: Smooth zoom out
    const zoomOutLevel = this.state.currentMapView === "world" ? 2 : 3;
    
    map.flyTo(map.getCenter(), zoomOutLevel, {
      duration: 1.2,
      easeLinearity: 0.5
    });

    // Step 2: After zoom out, pan to next country
    setTimeout(() => {
      const bounds = L.latLngBounds(nextCountry.bounds);
      const center = bounds.getCenter();
      
      map.flyTo(center, zoomOutLevel, {
        duration: 1.5,
        easeLinearity: 0.3
      });

      // Step 3: After pan, zoom in on the country
      setTimeout(() => {
        const zoomInLevel = this.state.currentMapView === "world" ? 4 : 6;
        map.flyToBounds(bounds, {
          duration: 1.3,
          padding: [20, 20],
          maxZoom: zoomInLevel,
          easeLinearity: 0.25
        });

        // Navigation complete
        setTimeout(() => {
          this.setState({ 
            isNavigating: false,
            currentCountryIndex: nextIndex 
          });
        }, 1400);
      }, 1600);
    }, 1300);
  };

  render() {
    const darkMode = this.state.darkMode;

    return (
      <>
        <div id="site-header-container">
          <div id="site-title-container">
            <img
              src={darkMode ? "dev_face.jpg" : "taly_face.png"}
              alt="Taly"
              width="20"
              height="20"
            />
            <div id="site-title"> It's just a lil world. </div>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <button
              onClick={this.toggleMapView}
              className={`map-toggle-button ${darkMode ? "" : "light"}`}
            >
              {this.state.currentMapView === "world"
                ? "Switch to US"
                : "Switch to World"}
            </button>
            <img
              src={darkMode ? "toggle_dark.png" : "toggle_light.png"}
              alt="Light Mode Toggle"
              width="50"
              height="40"
              onClick={this.toggleDarkMode}
            />
          </div>
        </div>
        <div id="root">
          <MapContainer
            key={this.state.currentMapView + (darkMode ? "-dark" : "-light")}
            center={
              this.state.currentMapView === "world"
                ? [0, 0]
                : [39.8283, -98.5795]
            }
            zoom={this.state.currentMapView === "world" ? 1 : 4}
            style={{
              height: "85vh",
              width: "90vw",
              backgroundColor: darkMode ? "black" : "white",
            }}
          >
            <MapController onMapReady={this.onMapReady} />
            <div className={darkMode ? "country-count" : "country-count light"}>
              {" "}
              {this.state.currentMapView === "world"
                ? this.state.correctCountries.length
                : this.state.correctStates.length}
              /{this.state.currentMapView === "world" ? 195 : 50}{" "}
            </div>
            <div
              className={darkMode ? "clear-button" : "clear-button light"}
              onClick={this.clearAll}
            >
              clear all
            </div>
            <Countries
              mapKey={this.state.mapKey}
              darkMode={darkMode}
              geoJsonDataFeatures={
                this.state.currentMapView === "world"
                  ? this.state.worldGeoJsonData.features
                  : this.state.usGeoJsonData.features
              }
              correctItems={
                this.state.currentMapView === "world"
                  ? this.state.correctCountries
                  : this.state.correctStates
              }
              incorrectItems={
                this.state.currentMapView === "world"
                  ? this.state.incorrectCountries
                  : this.state.incorrectStates
              }
              laterCorrectItems={
                this.state.currentMapView === "world"
                  ? this.state.laterCorrectCountries
                  : this.state.laterCorrectStates
              }
              revealedItems={
                this.state.currentMapView === "world"
                  ? this.state.revealedCountries
                  : this.state.revealedStates
              }
              addCorrectItem={
                this.state.currentMapView === "world"
                  ? this.addCorrectCountry
                  : this.addCorrectState
              }
              addIncorrectItem={
                this.state.currentMapView === "world"
                  ? this.addIncorrectCountry
                  : this.addIncorrectState
              }
              addLaterCorrectItem={
                this.state.currentMapView === "world"
                  ? this.addLaterCorrectCountry
                  : this.addLaterCorrectState
              }
              addRevealedItem={
                this.state.currentMapView === "world"
                  ? this.addRevealedCountry
                  : this.addRevealedState
              }
              nameProperty={
                this.state.currentMapView === "world" ? "COUNTRY" : "name"
              }
              totalItems={this.state.currentMapView === "world" ? 195 : 50}
            />
          </MapContainer>
        </div>
      </>
    );
  }
}

export default App;
