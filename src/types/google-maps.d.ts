declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: google.maps.places.AutocompleteOptions
          ) => google.maps.places.Autocomplete;
        };
        event: {
          clearInstanceListeners: (instance: any) => void;
        };
      };
    };
  }
}

export {}; 