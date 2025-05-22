import React from "react";
import { GeoJSON } from "react-leaflet";

class Countries extends React.Component {
  focusedLayer = null;

  onEachFeature = (feature, layer) => {
    this.setupInitialFeatureStyle(feature, layer);
    this.setupClickHandler(feature, layer);

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("popup-wrapper");

    if (!this.props.darkMode) {
      wrapperDiv.classList.add("light");
    }

    const input = this.createInput(feature, layer);
    input.classList.add("country-input");
    input.setAttribute("autocomplete", "off"); // disable 1password

    if (!this.props.darkMode) {
      input.classList.add("light");
    }

    const revealButton = this.createRevealButton(feature, layer, input);
    const hintButton = this.createHintButton(feature, input);

    wrapperDiv.appendChild(input);
    wrapperDiv.appendChild(hintButton);
    wrapperDiv.appendChild(revealButton);

    layer.bindPopup(wrapperDiv);

    // if the popup is open, focus the input
    layer.on("popupopen", () => {
      input.focus();
    });

    layer.on("popupclose", () => {
      const featureName = feature.properties[this.props.nameProperty];

      if (this.focusedLayer === layer) {
        if (
          !this.props.correctItems.includes(featureName) &&
          !this.props.revealedItems.includes(featureName)
        ) {
          this.setDefaultFeatureStyle(layer);
        }
        this.focusedLayer = null;
      }
    });
  };

  setDefaultFeatureStyle = (layer) => {
    const darkMode = this.props.darkMode;
    layer.setStyle({
      color: darkMode ? "rgba(0, 0, 255, 0.7)" : "#2aa1ff",
      weight: 2,
      fillColor: darkMode ? "rgba(0, 0, 255, 0.2)" : "rgba(42, 161, 255, 0.2)",
      fillOpacity: 0.2
    });
  };

  setFocusedFeatureStyle = (layer) => {
    layer.setStyle({
      color: "#450970",
      fillColor: "#513b82",
      fillOpacity: 1,
      weight: 2
    });
  };

  setupInitialFeatureStyle(feature, layer) {
    const featureName = feature.properties[this.props.nameProperty];

    // set all the layers to blue if the state is empty
    // this happens when we clear the map
    if (this.props.correctItems.length === 0) {
      this.setDefaultFeatureStyle(layer);
    } else if (this.props.correctItems.includes(featureName)) {
      if (this.props.incorrectItems.includes(featureName)) {
        // feature is in later correct list
        this.setFeatureLaterCorrectStyle(layer, featureName);
      } else {
        // feature is in the correct list
        this.setFeatureCorrectStyle(layer, featureName);
      }
    } else if (this.props.incorrectItems.includes(featureName)) {
      // feature is in incorrect list
      this.setFeatureIncorrectStyle(layer, featureName);
    } else {
      // feature hasnt been attempted yet
      this.setDefaultFeatureStyle(layer);
    }
  }

  setupClickHandler = (feature, layer) => {
    layer.on("click", () => {
      const currentFeatureName = feature.properties[this.props.nameProperty];

      // Reset previous focused layer's style
      if (this.focusedLayer && this.focusedLayer !== layer) {
        const focusedLayerFeatureName = this.focusedLayer.feature.properties[this.props.nameProperty];
        if (
          !this.props.correctItems.includes(focusedLayerFeatureName) &&
          !this.props.revealedItems.includes(focusedLayerFeatureName)
        ) {
          this.setDefaultFeatureStyle(this.focusedLayer);
        }
      }

      // Update this.focusedLayer
      this.focusedLayer = layer;

      // Apply "focused" (purple) style to the current layer
      if (
        !this.props.correctItems.includes(currentFeatureName) &&
        !this.props.revealedItems.includes(currentFeatureName)
      ) {
        this.setFocusedFeatureStyle(layer);
      }
    });
  };

  isCorrectFirstGuess(e, featureName) {
    // check if feature is already in the correct list
    if (!this.props.incorrectItems.includes(featureName)) {
      return this.isCorrectFeature(e, featureName);
    }

    // isnt their first guess
    return false;
  }

  setFeatureCorrectStyle(layer, featureName) {
    const darkMode = this.props.darkMode;

    // set the layers to green if the feature is in the correct list
    layer.setStyle({
      color: darkMode ? "#00c61e" : "#015d01",
      fillColor: darkMode ? "#015d01" : "#00e122",
      fillOpacity: 1,
    });

    layer.bindTooltip(featureName, {
      permanent: true,
      direction: "center",
      className: "country-label", // Keep class name for now, can be generalized later if needed
    });
  }

  setFeatureLaterCorrectStyle(layer, featureName) {
    const darkMode = this.props.darkMode;

    layer.setStyle({
      color: darkMode ? "#ffbd59" : "#f19100",
      fillColor: darkMode ? "#d48b00" : "#ffbd59",
      fillOpacity: 1,
    });

    layer.bindTooltip(featureName, {
      permanent: true,
      direction: "center",
      className: "country-label", // Keep class name for now
    });
  }

  setFeatureIncorrectStyle(layer, featureName) {
    const darkMode = this.props.darkMode;

    layer.setStyle({
      color: darkMode ? "#ff9292" : "#931414",
      fillColor: darkMode ? "#931414" : "#ff9292",
      fillOpacity: 1,
    });

    layer.bindTooltip(featureName, {
      permanent: true,
      direction: "center",
      className: "country-label", // Keep class name for now
    });
  }

  isCorrectLaterGuess(e, featureName) {
    // check if feature is already in the correct list
    if (this.props.incorrectItems.includes(featureName)) {
      return this.isCorrectFeature(e, featureName);
    }

    return false;
  }

  isCorrectFeature(e, featureName) {
    return e.target.value
      .toLowerCase()
      .includes(featureName.slice(0, 3).toLowerCase());
  }

  createInput(feature, layer) {
    // create a text input form html
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "your guess";
    input.autofocus = true;

    // check whether the feature id correct or not when enter is pressed
    input.addEventListener("keyup", (e) => {
      // return unless enter is pressed
      if (e.keyCode !== 13) return;

      const featureName = feature.properties[this.props.nameProperty];

      // if the feature is already in the correct or revealed list, just
      // close the popup
      if (
        this.props.correctItems.includes(featureName) ||
        this.props.revealedItems.includes(featureName)
      ) {
        layer.closePopup();
        return;
      }

      if (this.isCorrectFirstGuess(e, featureName)) {
        // got it right on the first try
        // add the feature to state and turn it green
        this.props.addCorrectItem(featureName);
        this.setFeatureCorrectStyle(layer, featureName);
      } else if (this.isCorrectLaterGuess(e, featureName)) {
        // they got it wrong at first, but got it right later
        // add the feature to "later guess" state and turn it orange
        this.props.addLaterCorrectItem(featureName);
        this.setFeatureLaterCorrectStyle(layer, featureName);
      } else {
        // they got it wrong
        // add the feature to state and turn it red
        this.props.addIncorrectItem(featureName);
        layer.setStyle({ color: "red", fillColor: "#931414", fillOpacity: 1 });
      }

      layer.closePopup();
    });

    return input;
  }

  createRevealButton(feature, layer, input) {
    // create a button to reveal the feature name
    const revealButton = document.createElement("button");
    revealButton.innerHTML = "Reveal";

    revealButton.classList.add("reveal-button");

    if (!this.props.darkMode) {
      revealButton.classList.add("light");
    }

    revealButton.addEventListener("click", () => {
      const featureName = feature.properties[this.props.nameProperty];

      // if the feature wasnt already guessed, add it to the incorrect and revealed list
      if (!this.props.correctItems.includes(featureName)) {
        // if the feature was already correct, leave it
        this.props.addIncorrectItem(featureName);
        this.setFeatureIncorrectStyle(layer, featureName);
      }
      this.props.addRevealedItem(featureName);

      // set the input value to the feature name
      input.value = featureName;
      input.focus();
    });

    return revealButton;
  }

  createHintButton(feature, input) {
    // Create a hint button
    const hintButton = document.createElement("button");
    hintButton.textContent = "Hint";

    if (!this.props.darkMode) {
      hintButton.classList.add("light");
    }

    hintButton.classList.add("reveal-button", "hint-button"); // Use same class for styling

    // When the hint button is clicked, set the input value to the first letter of the feature name
    hintButton.addEventListener("click", () => {
      const featureName = feature.properties[this.props.nameProperty];
      input.value = featureName[0]; // Set input to the first letter of the feature name
      input.focus();
    });

    return hintButton;
  }

  render() {
    return (
      <GeoJSON
        key={this.props.mapKey} // this is needed to force a re-render
        data={this.props.geoJsonDataFeatures}
        onEachFeature={this.onEachFeature}
      />
    );
  }
}

export default Countries;

