import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import "./MultiSelectAutocomplete.css";

interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

interface MultiSelectAutocompleteProps {
  onSelect: (selected: Character[]) => void;
}

const MultiSelectAutocomplete: React.FC<MultiSelectAutocompleteProps> = ({
  onSelect,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Character[]>([]);
  const [selected, setSelected] = useState<Character[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `https://rickandmortyapi.com/api/character/?name=${query.toLowerCase()}`
        );
        const data = await response.json();
        setResults(data.results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [query]);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    setShowDropdown(true);
  };

  const handleSelect = (character: Character) => {
    const updatedSelected = [...selected, character];
    setSelected(updatedSelected);
    setQuery("");
    setShowDropdown(false);
    onSelect(updatedSelected);
  };

  const handleRemove = (character: Character) => {
    const updatedSelected = selected.filter((c) => c.id !== character.id);
    setSelected(updatedSelected);
    onSelect(updatedSelected);
  };

  const handleResultKeyDown = (e: KeyboardEvent, index: number) => {
    const lastIndex = results.length - 1;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        index > 0 &&
          document.getElementById(`result-item-${index - 1}`)?.focus();
        break;
      case "ArrowDown":
        e.preventDefault();
        index < lastIndex &&
          document.getElementById(`result-item-${index + 1}`)?.focus();
        break;
      case "Enter":
        handleSelect(results[index]);
        break;
      default:
        break;
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent) => {
    const lastIndex = selected.length - 1;

    switch (e.key) {
      case "Backspace":
        if (query === "" && lastIndex >= 0) {
          handleRemove(selected[lastIndex]);
        }
        break;
      default:
        break;
    }
  };

  const handleInputClick = () => {
    setShowDropdown(true);
  };

  const handleDocumentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const container = inputRef.current;

    if (container && !container.contains(target)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const renderSelectedItems = () =>
    selected.map((character) => (
      <div key={character.id} className="selected-item">
        <img
          src={character.image}
          alt={character.name}
          className="selected-image"
        />
        <div className="selected-text">
          <p className="selected-name">{character.name}</p>
          <button
            className="remove-button"
            onClick={() => handleRemove(character)}
          >
            X
          </button>
          <p className="selected-episodes">
            {`Episodes: ${character.episode?.length || 0}`}
          </p>
        </div>
      </div>
    ));

  const renderDropdownItems = () =>
    results.map((character, index) => {
      const lowerCaseQuery = query.toLowerCase();
      const characterNameLower = character.name.toLowerCase();
      const startIndex = characterNameLower.indexOf(lowerCaseQuery);
      const endIndex = startIndex + lowerCaseQuery.length;

      return (
        <div
          key={character.id}
          id={`result-item-${index}`}
          tabIndex={0}
          role="option"
          aria-selected="false"
          onClick={() => handleSelect(character)}
          onKeyDown={(e) => handleResultKeyDown(e, index)}
          className="dropdown-item"
        >
          <img
            src={character.image}
            alt={character.name}
            className="dropdown-image"
          />
          <div className="dropdown-text">
            <p className="dropdown-name">
              {startIndex !== -1 ? (
                <>
                  {character.name.substring(0, startIndex)}
                  <strong>
                    {character.name.substring(startIndex, endIndex)}
                  </strong>
                  {character.name.substring(endIndex)}
                </>
              ) : (
                character.name
              )}
            </p>
            <p className="dropdown-episodes">
              {`Episodes: ${character.episode?.length || 0}`}
            </p>
            <input
              type="checkbox"
              checked={selected.some((c) => c.id === character.id)}
              readOnly
            />
          </div>
        </div>
      );
    });
  return (
    <div className="multiselect-container">
      <div className="selected-container" onClick={handleInputClick}>
        {renderSelectedItems()}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Search characters..."
          ref={inputRef}
        />
      </div>
      {showDropdown && (
        <div className="dropdown-container">
          {loading && <p>Loading...</p>}
          {!loading && results.length === 0 && <p>Character Not Found</p>}
          {!loading && renderDropdownItems()}
        </div>
      )}
    </div>
  );
};

export default MultiSelectAutocomplete;
