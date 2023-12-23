import React from "react";
import MultiSelectAutocomplete from "./MultiSelectAutocomplete.tsx";
import "./App.css";

const App = () => {
  const handleSelect = (characters) => {
    console.log("Selected Characters:", characters);
  };

  return (
    <div className="App">
      <div className="img-cont">
        <img src="./rick.jpg" alt="yes" className="styled-image" />
      </div>

      <MultiSelectAutocomplete onSelect={handleSelect} />
    </div>
  );
};

export default App;
