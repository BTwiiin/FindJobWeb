'use client';

import React, { useCallback } from 'react';
import Select from 'react-select';
import { useLocationStore } from '../hooks/useLocationStore';
import debounce from 'lodash.debounce';

const LocationInput = () => {
  
  const { suggestions, fetchSuggestions, setSelectedLocation } = useLocationStore();

  // Use useCallback to ensure the debounced function is stable across renders
  const debouncedFetch = useCallback(
    debounce((inputValue: string) => {
      fetchSuggestions(inputValue);
    }, 400), // 400ms delay
    [fetchSuggestions]
  );

  const handleInputChange = (inputValue: string) => {
    debouncedFetch(inputValue);
  };

  const handleSelect = (selectedOption: any) => {
    if (selectedOption) {
      setSelectedLocation(selectedOption.value);
    }
  };

  return (
    <div className="location-search mb-2">
      <Select
        options={suggestions}
        onInputChange={handleInputChange}
        onChange={handleSelect}
        placeholder="Type a city, street, or address..."
        noOptionsMessage={() => 'No results found'}
      />
    </div>
  );
};

export default LocationInput;
