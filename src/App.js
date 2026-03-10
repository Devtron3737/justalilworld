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
      currentCountryIndex: 0,
      isNavigating: false,
    }, () => {
      // Reinitialize and auto-select first country after clearing
      this.initializeCountrySequence();
      setTimeout(() => {
        this.autoSelectFirstCountry();
      }, 500);
    });
  };

  addCorrectState = (state) => {
    this.setState({
      correctStates: this.state.correctStates.concat([state]),
    }, () => {
      // Reinitialize sequence to exclude the guessed state
      this.initializeCountrySequence();
      
      // Trigger smooth navigation to next state after a short delay
      setTimeout(() => {
        this.smoothNavigateToNextCountry();
      }, 500);
    });
  };

  addIncorrectState = (state) => {
    this.setState({
      incorrectStates: this.state.incorrectStates.concat([state]),
    });
  };

  addLaterCorrectState = (state) => {
    this.setState({
      laterCorrectStates: this.state.laterCorrectStates.concat([state]),
    }, () => {
      // Reinitialize sequence to exclude the guessed state
      this.initializeCountrySequence();
      
      // Also trigger navigation for later correct guesses
      setTimeout(() => {
        this.smoothNavigateToNextCountry();
      }, 500);
    });
  };

  addRevealedState = (state) => {
    this.setState({
      revealedStates: this.state.revealedStates.concat([state]),
    }, () => {
      // Reinitialize sequence to exclude the revealed state
      this.initializeCountrySequence();
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
    }, () => {
      // Reinitialize sequence to exclude the guessed country
      this.initializeCountrySequence();
      
      // Trigger smooth navigation to next country after a short delay
      setTimeout(() => {
        this.smoothNavigateToNextCountry();
      }, 500);
    });
  };

  addIncorrectCountry = (country) => {
    this.setState({
      incorrectCountries: this.state.incorrectCountries.concat([country]),
    });
  };

  addLaterCorrectCountry = (country) => {
    this.setState({
      laterCorrectCountries: this.state.laterCorrectCountries.concat([country]),
    }, () => {
      // Reinitialize sequence to exclude the guessed country
      this.initializeCountrySequence();
      
      // Also trigger navigation for later correct guesses
      setTimeout(() => {
        this.smoothNavigateToNextCountry();
      }, 500);
    });
  };

  addRevealedCountry = (country) => {
    this.setState({
      revealedCountries: this.state.revealedCountries.concat([country]),
    }, () => {
      // Reinitialize sequence to exclude the revealed country
      this.initializeCountrySequence();
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
    
    // Auto-select first country after a short delay
    setTimeout(() => {
      this.autoSelectFirstCountry();
    }, 1500);
  }

  autoSelectFirstCountry = () => {
    if (this.state.countrySequence.length > 0 && this.mapInstance && this.state.currentCountryIndex === 0) {
      // For the very first country, we don't increment - we go to index 0
      const firstCountry = this.state.countrySequence[0];
      if (!firstCountry || this.state.isNavigating) return;

      this.setState({ isNavigating: true });

      const map = this.mapInstance;
      const bounds = L.latLngBounds(firstCountry.bounds);
      
      // Just zoom to the first country (no need for zoom out/in sequence)
      map.flyToBounds(bounds, {
        duration: 0.8,
        padding: [20, 20],
        maxZoom: this.state.currentMapView === "world" ? 4 : 6,
        easeLinearity: 0.25
      });

      // Auto-open popup after navigation
      setTimeout(() => {
        this.setState({ 
          isNavigating: false,
          currentCountryIndex: 0 
        });
        
        // Auto-open popup for the first country
        this.openCurrentCountryPopup();
      }, 850);
    }
  };

  onMapReady = (mapInstance) => {
    this.mapInstance = mapInstance;
  };

  openCurrentCountryPopup = () => {
    // Find and open the popup for the current country
    const currentCountry = this.state.countrySequence[this.state.currentCountryIndex];
    if (!currentCountry) return;

    // Use a timeout to ensure the map has finished animating
    setTimeout(() => {
      this.mapInstance.eachLayer((layer) => {
        if (layer.feature && 
            layer.feature.properties[this.state.currentMapView === "world" ? "COUNTRY" : "name"] === currentCountry.name) {
          if (layer.openPopup) {
            layer.openPopup();
          }
        }
      });
    }, 200);
  };

  initializeCountrySequence = () => {
    const features = this.state.currentMapView === "world" 
      ? this.state.worldGeoJsonData.features 
      : this.state.usGeoJsonData.features;
    
    // Create a randomized sequence of all countries/states
    // Filter out countries that have already been guessed correctly or revealed
    const correctItems = this.state.currentMapView === "world" 
      ? this.state.correctCountries 
      : this.state.correctStates;
    const laterCorrectItems = this.state.currentMapView === "world"
      ? this.state.laterCorrectCountries
      : this.state.laterCorrectStates;
    const revealedItems = this.state.currentMapView === "world"
      ? this.state.revealedCountries
      : this.state.revealedStates;
    
    const allGuessedItems = [...correctItems, ...laterCorrectItems, ...revealedItems];
    
    const sequence = features
      .filter(feature => {
        const name = feature.properties[this.state.currentMapView === "world" ? "COUNTRY" : "name"];
        return !allGuessedItems.includes(name);
      })
      .map(feature => ({
        name: feature.properties[this.state.currentMapView === "world" ? "COUNTRY" : "name"],
        geometry: feature.geometry,
        bounds: this.getFeatureBounds(feature.geometry)
      }))
      .sort(() => Math.random() - 0.5); // Shuffle the array
    
    console.log('Initialized country sequence:', sequence.length, 'remaining countries');
    this.setState({ countrySequence: sequence, currentCountryIndex: 0 });
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
    
    // Step 1: Smooth zoom out (30% faster)
    const zoomOutLevel = this.state.currentMapView === "world" ? 2 : 3;
    
    map.flyTo(map.getCenter(), zoomOutLevel, {
      duration: 0.5,
      easeLinearity: 0.5
    });

    // Step 2: After zoom out, pan to next country (30% faster)
    setTimeout(() => {
      const bounds = L.latLngBounds(nextCountry.bounds);
      const center = bounds.getCenter();
      
      map.flyTo(center, zoomOutLevel, {
        duration: 0.6,
        easeLinearity: 0.3
      });

      // Step 3: After pan, zoom in on the country (30% faster)
      setTimeout(() => {
        const zoomInLevel = this.state.currentMapView === "world" ? 4 : 6;
        map.flyToBounds(bounds, {
          duration: 0.6,
          padding: [20, 20],
          maxZoom: zoomInLevel,
          easeLinearity: 0.25
        });

        // Navigation complete - auto-open popup
        setTimeout(() => {
          this.setState({ 
            isNavigating: false,
            currentCountryIndex: nextIndex 
          });
          
          // Auto-open popup for the new country
          this.openCurrentCountryPopup();
        }, 620);
      }, 640);
    }, 520);
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
              currentCountry={
                this.state.countrySequence[this.state.currentCountryIndex]?.name
              }
            />
          </MapContainer>
        </div>
      </>
    );
  }
}

export default App;
