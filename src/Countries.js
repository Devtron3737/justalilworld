import React from "react";
import { GeoJSON } from "react-leaflet";

import data from "./country_data.json";

class Countries extends React.Component {
  onEachCountry = (country, layer) => {
    // create a text input form html
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Country Name";
    input.autofocus = true;
    input.style.width = "100px";
    input.style.height = "20px";
    input.style.fontSize = "12px";
    input.style.padding = "5px";
    input.style.margin = "5px";
    input.style.border = "0px solid #ccc";
    input.style.borderRadius = "3px";

    // check whether the country id correct or not when enter is pressed
    input.addEventListener("keyup", (e) => {
      // return unless enter is pressed
      if (e.keyCode !== 13) return;

      const countryName = country.properties.COUNTRY;

      // if the country is already in the correct or incorrect list, just
      // close the popup
      if (this.props.correctCountries.includes(countryName)) {
        layer.closePopup();
        return;
      }

      if (this.isCorrectFirstGuess(e, countryName)) {
        // got it right on the first try
        // add the country to state and turn it green
        this.props.addCorrectCountry(countryName);
        layer.setStyle({ color: "green" });
      } else if (this.isCorrectLaterGuess(e, countryName)) {
        // they got it wrong at first, but got it right later
        // add the country to "later guess" state and turn it orange
        this.props.addLaterCorrectCountry(countryName);
        layer.setStyle({ color: "orange" });
      } else {
        // they got it wrong
        // add the country to state and turn it red
        this.props.addIncorrectCountry(countryName);
        layer.setStyle({ color: "red" });
      }

      layer.closePopup();
    });

    // add code here if you want to do something while the user is typing
    // input.addEventListener("input", (e) => {});

    layer.bindPopup(input);

    // if the popup is open, focus the input
    layer.on("popupopen", () => {
      input.focus();
    });
  };;

  isCorrectFirstGuess(e, countryName) {
    // check if country is already in the correct list
    if (!this.props.incorrectCountries.includes(countryName)) {
      return this.isCorrectCountry(e, countryName);
    }

    // isnt their first guess
    return false;
  }

  isCorrectLaterGuess(e, countryName) {
    // check if country is already in the correct list
    if (this.props.incorrectCountries.includes(countryName)) {
      return this.isCorrectCountry(e, countryName);
    }

    return false;
  }

  isCorrectCountry(e, countryName) {
    return e.target.value
      .toLowerCase()
      .includes(countryName.slice(0, 3).toLowerCase());
  }

  render() {
    return <GeoJSON data={data.features} onEachFeature={this.onEachCountry} />;
  }
}

export default Countries;

