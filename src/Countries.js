import React from "react";
import { GeoJSON } from "react-leaflet";

import data from "./country_data.json";

class Countries extends React.Component {
  onEachCountry = (country, layer) => {
    this.setupInitialCountryStyle(country, layer);
    this.setupClickHandler(country, layer);

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("popup-wrapper");

    if (!this.props.darkMode) {
      wrapperDiv.classList.add("light");
    }

    const input = this.createInput(country, layer);
    input.classList.add("country-input");
    input.setAttribute("autocomplete", "off"); // disable 1password

    if (!this.props.darkMode) {
      input.classList.add("light");
    }

    const revealButton = this.createRevealButton(country, layer, input);
    const hintButton = this.createHintButton(country, input);

    wrapperDiv.appendChild(input);
    wrapperDiv.appendChild(hintButton);
    wrapperDiv.appendChild(revealButton);

    layer.bindPopup(wrapperDiv);

    // if the popup is open, focus the input
    layer.on("popupopen", () => {
      input.focus();
    });
  };

  setupInitialCountryStyle(country, layer) {
    const darkMode = this.props.darkMode;
    const countryName = country.properties.COUNTRY;

    // set all the layers to blue if the state is empty
    // this happens when we clear the map
    if (this.props.correctCountries.length === 0) {
      layer.setStyle({
        color: darkMode ? "rgba(0, 0, 255, 0.7)" : "#2aa1ff",
        weight: 2,
      });
    } else if (this.props.correctCountries.includes(countryName)) {
      if (this.props.incorrectCountries.includes(countryName)) {
        // country is in later correct list
        this.setCountryLaterCorrectStyle(layer, countryName);
      } else {
        // country is in the correct list
        this.setCountryCorrectStyle(layer, countryName);
      }
    } else if (this.props.incorrectCountries.includes(countryName)) {
      // country is in incorrect list
      this.setCountryIncorrectStyle(layer, countryName);
    } else {
      // country hasnt been attempted yet
      layer.setStyle({
        color: darkMode ? "rgba(0, 0, 255, 0.7)" : "#2aa1ff",
        weight: 2,
      });
    }
  }

  setupClickHandler = (country, layer) => {
    // set layer to purple when it is clicked
    layer.on("click", () => {
      // if the country is not already in the correct or revealed list, set the
      // color to purple
      if (
        !this.props.correctCountries.includes(country.properties.COUNTRY) &&
        !this.props.revealedCountries.includes(country.properties.COUNTRY)
      ) {
        layer.setStyle({
          color: "#450970",
          fillColor: "#513b82",
          fillOpacity: 1,
        });
      }
    });
  };

  isCorrectFirstGuess(e, countryName) {
    // check if country is already in the correct list
    if (!this.props.incorrectCountries.includes(countryName)) {
      return this.isCorrectCountry(e, countryName);
    }

    // isnt their first guess
    return false;
  }

  setCountryCorrectStyle(layer, countryName) {
    // set the layers to green if the country is in the correct list
    layer.setStyle({
      color: "#00c61e",
      fillColor: "#015d01",
      fillOpacity: 1,
    });

    layer.bindTooltip(countryName, {
      permanent: true,
      direction: "center",
      className: "country-label",
    });
  }

  setCountryLaterCorrectStyle(layer, countryName) {
    layer.setStyle({
      color: "orange",
      fillColor: "#d48b00",
      fillOpacity: 1,
    });

    layer.bindTooltip(countryName, {
      permanent: true,
      direction: "center",
      className: "country-label",
    });
  }

  setCountryIncorrectStyle(layer, countryName) {
    layer.setStyle({
      color: "red",
      fillColor: "#931414",
      fillOpacity: 1,
    });

    layer.bindTooltip(countryName, {
      permanent: true,
      direction: "center",
      className: "country-label",
    });
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

  createInput(country, layer) {
    // create a text input form html
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "your guess";
    input.autofocus = true;

    // check whether the country id correct or not when enter is pressed
    input.addEventListener("keyup", (e) => {
      // return unless enter is pressed
      if (e.keyCode !== 13) return;

      const countryName = country.properties.COUNTRY;

      // if the country is already in the correct or revealed list, just
      // close the popup
      if (
        this.props.correctCountries.includes(countryName) ||
        this.props.revealedCountries.includes(countryName)
      ) {
        layer.closePopup();
        return;
      }

      if (this.isCorrectFirstGuess(e, countryName)) {
        // got it right on the first try
        // add the country to state and turn it green
        this.props.addCorrectCountry(countryName);
        this.setCountryCorrectStyle(layer, countryName);
      } else if (this.isCorrectLaterGuess(e, countryName)) {
        // they got it wrong at first, but got it right later
        // add the country to "later guess" state and turn it orange
        this.props.addLaterCorrectCountry(countryName);
        this.setCountryLaterCorrectStyle(layer, countryName);
      } else {
        // they got it wrong
        // add the country to state and turn it red
        this.props.addIncorrectCountry(countryName);
        layer.setStyle({ color: "red", fillColor: "#931414", fillOpacity: 1 });
      }

      layer.closePopup();
    });

    return input;
  }

  createRevealButton(country, layer, input) {
    // create a button to reveal the country name
    const revealButton = document.createElement("button");
    revealButton.innerHTML = "Reveal";

    revealButton.classList.add("reveal-button");

    if (!this.props.darkMode) {
      revealButton.classList.add("light");
    }

    revealButton.addEventListener("click", () => {
      const countryName = country.properties.COUNTRY;

      // if the country wasnt already guessed, add it to the incorrect and revealed list
      if (!this.props.correctCountries.includes(countryName)) {
        // if the country was already correct, leave it
        this.props.addIncorrectCountry(countryName);
        this.setCountryIncorrectStyle(layer, countryName);
      }
      this.props.addRevealedCountry(countryName);

      // set the input value to the country name
      input.value = countryName;
      input.focus();
    });

    return revealButton;
  }

  createHintButton(country, input) {
    // Create a hint button
    const hintButton = document.createElement("button");
    hintButton.textContent = "Hint";

    if (!this.props.darkMode) {
      hintButton.classList.add("light");
    }

    hintButton.classList.add("reveal-button", "hint-button"); // Use same class for styling

    // When the hint button is clicked, set the input value to the first letter of the country name
    hintButton.addEventListener("click", () => {
      const countryName = country.properties.COUNTRY;
      input.value = countryName[0]; // Set input to the first letter of the country name
      input.focus();
    });

    return hintButton;
  }

  render() {
    return (
      <GeoJSON
        key={this.props.mapKey} // this is needed to force a re-render
        data={data.features}
        onEachFeature={this.onEachCountry}
      />
    );
  }
}

export default Countries;

