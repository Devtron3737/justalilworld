import React from "react";
import { MapContainer } from "react-leaflet";

import Countries from "./Countries";
import SettingsModal from "./SettingsModal";
import "./App.css";
import usGeoJsonData from "./us_data.json";
import worldGeoJsonData from "./country_data.json";

class App extends React.Component {
  state = {
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
  };

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
    }));
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
