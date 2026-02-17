import React from "react";
import { GeoJSON } from "react-leaflet";

class Countries extends React.Component {
  focusedLayer = null;
  currentPopupLayer = null;
  currentPopupInput = null;
  currentRevealButton = null;
  currentHintButton = null;

  handleGlobalKeyDown = (e) => {
    if (!this.currentPopupLayer) return;

    if (e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (this.currentRevealButton) {
        this.currentRevealButton.click();
      }
    } else if (e.shiftKey && e.key.toLowerCase() === 'h') {
      e.preventDefault();
      if (this.currentHintButton) {
        this.currentHintButton.click();
      }
    }
  };

  onEachFeature = (feature, layer) => {
    this.setupInitialFeatureStyle(feature, layer);
    this.setupClickHandler(feature, layer);

    const wrapperDiv = document.createElement("div");
    wrapperDiv.classList.add("popup-wrapper", "mobile-popup");

    if (!this.props.darkMode) {
      wrapperDiv.classList.add("light");
    }

    const input = this.createInput(feature, layer);
    input.classList.add("country-input", "mobile-input");
    input.setAttribute("autocomplete", "off"); // disable 1password
    input.setAttribute("placeholder", "your guess");

    if (!this.props.darkMode) {
      input.classList.add("light");
    }

    // Create help button
    const helpButton = document.createElement("button");
    helpButton.innerHTML = "?";
    helpButton.classList.add("help-button");
    if (!this.props.darkMode) {
      helpButton.classList.add("light");
    }
    
    helpButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.showHelpModal();
    });

    // Create hidden reveal and hint buttons for programmatic access
    const revealButton = this.createRevealButton(feature, layer, input);
    const hintButton = this.createHintButton(feature, input);
    
    // Hide the buttons but keep them for keyboard shortcuts
    revealButton.style.display = 'none';
    hintButton.style.display = 'none';

    wrapperDiv.appendChild(input);
    wrapperDiv.appendChild(helpButton);
    wrapperDiv.appendChild(revealButton);
    wrapperDiv.appendChild(hintButton);

    layer.bindPopup(wrapperDiv);

    // if the popup is open, focus the input and add keyboard shortcuts
    layer.on("popupopen", () => {
      input.focus();
      
      // Add global keyboard shortcuts when popup is open
      this.currentPopupLayer = layer;
      this.currentPopupInput = input;
      this.currentRevealButton = wrapperDiv.querySelector('.reveal-button:not(.hint-button)');
      this.currentHintButton = wrapperDiv.querySelector('.hint-button');
      
      document.addEventListener('keydown', this.handleGlobalKeyDown);
    });

    layer.on("popupclose", () => {
      const featureName = feature.properties[this.props.nameProperty];

      // Clean up global keyboard listeners
      document.removeEventListener('keydown', this.handleGlobalKeyDown);
      this.currentPopupLayer = null;
      this.currentPopupInput = null;
      this.currentRevealButton = null;
      this.currentHintButton = null;

      if (this.focusedLayer === layer) {
        if (
          !this.props.correctItems.includes(featureName) &&
          !this.props.revealedItems.includes(featureName)
        ) {
          // Check if it's the current country before applying default style
          if (this.props.currentCountry === featureName) {
            this.setCurrentCountryStyle(layer);
          } else {
            this.setDefaultFeatureStyle(layer);
          }
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

  setCurrentCountryStyle = (layer) => {
    layer.setStyle({
      color: "#FFD700", // Gold/yellow border
      fillColor: "#FFD700", // Full yellow fill
      fillOpacity: 0.8, // More opaque
      weight: 2
    });
  };

  setupInitialFeatureStyle(feature, layer) {
    const featureName = feature.properties[this.props.nameProperty];

    // need the setTimeout to ensure leaflect has initialized the tile and react has re-rendered
    setTimeout(() => {
      if (this.props.correctItems.includes(featureName)) {
        if (this.props.incorrectItems.includes(featureName)) {
          this.setFeatureLaterCorrectStyle(layer, featureName);
        } else {
          this.setFeatureCorrectStyle(layer, featureName);
        }
      } else if (this.props.incorrectItems.includes(featureName)) {
        this.setFeatureIncorrectStyle(layer, featureName);
      } else if (this.props.currentCountry === featureName) {
        this.setCurrentCountryStyle(layer);
      } else {
        this.setDefaultFeatureStyle(layer);
      }
    }, 0);
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
          // Check if it's the current country before applying default style
          if (this.props.currentCountry === focusedLayerFeatureName) {
            this.setCurrentCountryStyle(this.focusedLayer);
          } else {
            this.setDefaultFeatureStyle(this.focusedLayer);
          }
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

    // need the setTimeout to ensure leaflect has initialized the tile and react has re-rendered
    setTimeout(() => {
      layer.setStyle({
        stroke: true,
        weight: 1,
        color: darkMode ? "#00c61e" : "#015d01",
        fillColor: darkMode ? "#015d01" : "#00e122",
        fillOpacity: 0.7,
        opacity: 1,
      });

      layer.bindTooltip(featureName, {
        permanent: true,
        direction: "center",
        className: "country-label",
      });
    }, 0);
  }

  setFeatureLaterCorrectStyle(layer, featureName) {
    const darkMode = this.props.darkMode;

    // need the setTimeout to ensure leaflect has initialized the tile and react has re-rendered
    setTimeout(() => {
      layer.setStyle({
        stroke: true,
        weight: 1,
        color: darkMode ? "#d48b00" : "#f19100",
        fillColor: darkMode ? "#f19100" : "#ffbd59",
        fillOpacity: 0.7,
        opacity: 1,
      });

      layer.bindTooltip(featureName, {
        permanent: true,
        direction: "center",
        className: "country-label",
      });
    }, 0);
  }

  setFeatureIncorrectStyle(layer, featureName) {
    const darkMode = this.props.darkMode;

    // need the setTimeout to ensure leaflect has initialized the tile and react has re-rendered// need the setTimeout to ensure leaflect has initialized the tile and react has re-rendered
    setTimeout(() => {
      layer.setStyle({
        stroke: true,
        weight: 1,
        color: darkMode ? "#ff0000" : "#931414",
        fillColor: darkMode ? "#931414" : "#ff0000",
        fillOpacity: 0.7,
        opacity: 1,
      });

      // Remove the tooltip binding for incorrect guesses
      if (layer.getTooltip()) {
        layer.unbindTooltip();
      }
    }, 0);
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
      // return unless enter is pressed (s and h are now handled globally)
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
        // Auto-close popup immediately for correct guesses
        layer.closePopup();
      } else if (this.isCorrectLaterGuess(e, featureName)) {
        // they got it wrong at first, but got it right later
        // add the feature to "later guess" state and turn it orange
        this.props.addLaterCorrectItem(featureName);
        this.setFeatureLaterCorrectStyle(layer, featureName);
        // Auto-close popup immediately for correct guesses
        layer.closePopup();
      } else {
        // they got it wrong
        // add the feature to state and turn it red
        this.props.addIncorrectItem(featureName);
        this.setFeatureIncorrectStyle(layer, featureName);
        // Keep popup open for incorrect guesses
        layer.closePopup();
      }
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

      // set the input value to the feature name and close popup
      input.value = featureName;
      layer.closePopup();
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

  showHelpModal = () => {
    // Create help modal
    const modal = document.createElement('div');
    modal.classList.add('help-modal');
    if (!this.props.darkMode) {
      modal.classList.add('light');
    }
    
    modal.innerHTML = `
      <div class="help-modal-content ${!this.props.darkMode ? 'light' : ''}">
        <h3>Keyboard Shortcuts</h3>
        <div class="shortcut-item">
          <strong>Enter</strong> - Submit your guess
        </div>
        <div class="shortcut-item">
          <strong>Shift + S</strong> - Skip/reveal answer
        </div>
        <div class="shortcut-item">
          <strong>Shift + H</strong> - Get first letter hint
        </div>
        <button class="close-help" ${!this.props.darkMode ? 'style="background: white; color: black;"' : ''}>Close</button>
      </div>
    `;
    
    // Add click handler to close
    modal.querySelector('.close-help').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
    
    document.body.appendChild(modal);
  };

  componentWillUnmount() {
    // Clean up any remaining event listeners
    document.removeEventListener('keydown', this.handleGlobalKeyDown);
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

