import React from "react";
import { MapContainer } from "react-leaflet";

import Countries from "./Countries";
import SettingsModal from "./SettingsModal";
import "./App.css";

class App extends React.Component {
  state = {
    mapKey: Math.random(),
    correctCountries: [],
    incorrectCountries: [],
    laterCorrectCountries: [],
    revealedCountries: [],
    showSettingsModal: false,
    showCountryName: true,
    showCountryGdp: false,
    darkMode: true,
  };

  clearAll = () => {
    this.setState({
      mapKey: Math.random(),
      correctCountries: [],
      incorrectCountries: [],
      laterCorrectCountries: [],
      revealedCountries: [],
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
          <img
            src={darkMode ? "toggle_dark.png" : "toggle_light.png"}
            alt="Light Mode Toggle"
            width="50"
            height="40"
            onClick={this.toggleDarkMode}
          />
        </div>
        <div id="root">
          <MapContainer
            key={darkMode ? "dark" : "light"} // force a re-render when dark mode is toggled
            center={[0, 0]}
            zoom={1}
            style={{
              height: "85vh",
              width: "90vw",
              backgroundColor: darkMode ? "black" : "white",
            }}
          >
            <div className={darkMode ? "country-count" : "country-count light"}>
              {" "}
              {this.state.correctCountries.length}/195{" "}
            </div>
            <div
              className={darkMode ? "clear-button" : "clear-button light"}
              onClick={this.clearAll}
            >
              clear all
            </div>
            <Countries
              mapKey={this.state.mapKey}
              correctCountries={this.state.correctCountries}
              addCorrectCountry={this.addCorrectCountry}
              incorrectCountries={this.state.incorrectCountries}
              darkMode={darkMode}
              addIncorrectCountry={this.addIncorrectCountry}
              revealedCountries={this.state.revealedCountries}
              addRevealedCountry={this.addRevealedCountry}
              addLaterCorrectCountry={this.addLaterCorrectCountry}
            />
          </MapContainer>
        </div>
      </>
    );
  }
}

export default App;
