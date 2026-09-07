import './SearchInput.css';

export default function SearchInput({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  shortcut = null,
  autoFocus = false
}) {
  return (
    <div className="search-input-wrapper">
      <span className="material-symbols-outlined search-icon">search</span>
      <input
        type="text"
        className="search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
      />
      {shortcut && (
        <kbd className="search-shortcut">{shortcut}</kbd>
      )}
      {value && (
        <button 
          className="search-clear" 
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}
    </div>
  );
}
