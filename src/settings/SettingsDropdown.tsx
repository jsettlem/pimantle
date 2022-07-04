import { SettingsDropdownProps } from "./settings.model";



function SettingsDropdown({ isOpen, close }: SettingsDropdownProps) {
  return (
    <div className={`archive-overlay ${isOpen ? "archive-open" : ""}`}>
      <div className="archive-background" onClick={() => close()} />
      <div className="archive-container">
        <div className="close-button" onClick={() => close()}>
          ✕
        </div>
        <h1 className="archive-heading">Settings coming soon...</h1>
      </div>
    </div>
  );
}

export default SettingsDropdown;
