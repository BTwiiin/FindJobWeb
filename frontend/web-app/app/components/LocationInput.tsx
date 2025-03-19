'use client'

import React, { useCallback } from 'react';
import Select from 'react-select';
import debounce from 'lodash.debounce';
import { useLocationStore } from '../hooks/useLocationStore';
import '../globals.css';

const LocationInput = () => {
  const { suggestions, fetchSuggestions, setSelectedLocation } = useLocationStore();

  const debouncedFetch = useCallback(
    debounce((inputValue: string) => {
      fetchSuggestions(inputValue);
    }, 400),
    [fetchSuggestions]
  );

  // ...
  return (
    <Select
      // This applies a prefix to all the internal elements 
      // (control, menu, option, etc.).
      classNamePrefix='custom-select'

      options={suggestions}
      onInputChange={debouncedFetch}
      onChange={(option) => option && setSelectedLocation(option.value)}
      placeholder="Type a city, street, or address..."
      noOptionsMessage={() => 'No results found'}
    />
  );
};

export default LocationInput;
