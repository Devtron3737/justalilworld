import React from "react";
import { MapContainer } from "react-leaflet";

import Countries from "./Countries";
import "./App.css";

class App extends React.Component {
  state = {
    correctCountries: [],
  };

  addCorrectCountry = (country) => {
    this.setState({
      correctCountries: this.state.correctCountries.concat([country]),
    });
  };

  render() {
    return (
      <MapContainer
        style={{ height: "85vh", width: "90vh" }}
        center={[0, 0]}
        zoom={1}
      >
        <div id="country-count"> {this.state.correctCountries.length}/195 </div>
        <Countries
          correctCountries={this.state.correctCountries}
          addCorrectCountry={this.addCorrectCountry}
        />
      </MapContainer>
    );
  }
}

export default App;
