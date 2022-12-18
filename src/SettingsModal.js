import React from "react";

// react component that renders the settings modal
// the modal has a close button in the top right corner
// and also includes 2 checkboxes:
//  - "Show country names" (default: checked)
//  - "Show country gdp" (default: unchecked)
class SettingsModal extends React.Component {
  render() {
    return (
      <div className="modal">
        <div className="modal-content">
          <div className="modal-header">
            <span className="close" onClick={this.props.toggleSettingsModal}>
              &times;
            </span>
            <h2>Settings</h2>
          </div>
          <div>What's not shown, must be guessed.</div>
          <div className="modal-body">
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.showCountryNames}
                  onChange={this.props.toggleShowCountryNames}
                />
                Show Name
              </label>
            </div>
            <div className="checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={this.props.showCountryGdp}
                  onChange={this.props.toggleShowCountryGdp}
                />
                Show GDP
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
