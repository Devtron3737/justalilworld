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
      if (
        this.props.correctCountries.includes(countryName) ||
        this.props.incorrectCountries.includes(countryName)
      ) {
        layer.closePopup();
        return;
      }

      if (this.isCorrectCountry(e, countryName)) {
        // add the country to state and turn it green
        this.props.addCorrectCountry(countryName);
        layer.setStyle({ color: "green" });
      } else {
        // add the country to state and turn it red
        this.props.addIncorrectCountry(countryName);
        layer.setStyle({ color: "red" });
      }
      layer.closePopup();
    });

    // add code here if you want to do something while the user is typing
    input.addEventListener("input", (e) => {
      // console.log("e.target!!");
      // console.log(e.target.value);
      // console.log("country.properties.COUNTRY.slice(0, 3)");
      // console.log(country.properties.COUNTRY.slice(0, 3));
      // const countryName = country.properties.COUNTRY;
      // // if target value contains the first 3 letters of country name
      // // then change the country border to green
      // console.log("this.props.correctCountries!!");
      // console.log(this.props.correctCountries);
      // if (
      //   this.isCorrectCountry(e, countryName) &&
      //   !this.props.correctCountries.includes(countryName)
      // ) {
      //   layer.setStyle({ color: "green" });
      //   this.props.addCorrectCountry(countryName);
      // }
    });

    layer.bindPopup(input);

    // if the popup is open, focus the input
    layer.on("popupopen", () => {
      input.focus();
    });
  };

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

