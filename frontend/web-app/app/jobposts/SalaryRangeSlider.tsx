import React from 'react';
import { Slider } from '@mui/material';
import { useParamsStore } from '../hooks/useParamsStore';

const SalaryRangeSlider = () => {
  const minSalary = useParamsStore((state) => state.minSalary) ?? 0; // Default to 0 if undefined
  const maxSalary = useParamsStore((state) => state.maxSalary) ?? 10000; // Default to 10000 if undefined
  const setParams = useParamsStore((state) => state.setParams);

  const handleChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setParams({ minSalary: min, maxSalary: max }); // Update store in real-time
  };

  return (
    <div className="p-4">
      <h3 className="mb-2 text-gray-700 font-medium">Salary Range</h3>
      <Slider
        value={[minSalary, maxSalary]}
        onChange={handleChange} // Update on drag
        valueLabelDisplay="auto"
        min={0}
        max={5000}
        step={100}
        marks={[
          { value: 0, label: '$0' },
          { value: 2500, label: '$2500' },
          { value: 5000, label: '$5000' },
        ]}
        sx={{
          '& .MuiSlider-thumb': {
            color: '#4B5563',
          },
          '& .MuiSlider-track': {
            color: '#4B5563',
          },
          '& .MuiSlider-rail': {
            color: '#9CA3AF',
          },
        }}
            />
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>Min: ${minSalary}</span>
        <span>Max: ${maxSalary}</span>
      </div>
    </div>
  );
};

export default SalaryRangeSlider;
