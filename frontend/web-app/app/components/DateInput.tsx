'use client'

import React from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import { Label } from 'flowbite-react';
import DatePicker, { DatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { baseInputClasses } from '../utils/formStyles';

type Props = {
  label: string;
  type?: string;
  showLabel?: boolean;
} & UseControllerProps & DatePickerProps;

export default function DateInput(props: Props) {
  const { fieldState, field } = useController({ ...props, defaultValue: '' });

  return (
    <div className="mb-4">
      {props.showLabel && (
        <Label
          htmlFor={field.name}
          value={props.label}
          className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
        />
      )}
      <DatePicker
        {...field}
        {...props}
        placeholderText={props.label}
        selected={field.value}
        // Reuse your base input styles:
        className={baseInputClasses}
        wrapperClassName="w-full"
      />
      {fieldState.error && (
        <div className="text-red-500 text-sm">{fieldState.error.message}</div>
      )}
    </div>
  );
}
