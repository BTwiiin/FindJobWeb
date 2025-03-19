'use client'

import React from 'react';
import { useController, UseControllerProps, FieldValues } from 'react-hook-form';
import { Label } from 'flowbite-react';
import { baseInputClasses } from '../utils/formStyles';

interface InputProps extends UseControllerProps<FieldValues> {
  label: string;
  type?: string;
  showLabel?: boolean;
  showErrors?: boolean;
}

export default function Input(props: InputProps) {
  const { fieldState, field } = useController({ ...props, defaultValue: '' });
  const { showErrors = false } = props;

  return (
    <div className="mb-4">
      {props.showLabel && (
        <Label
          htmlFor={field.name}
          value={props.label}
          className="absolute -top-3 left-3 bg-white px-1 text-sm text-gray-600"
        />
      )}
      <input
        {...field}
        type={props.type || 'text'}
        placeholder={props.label}
        className={`${baseInputClasses} ${
          fieldState.invalid ? 'border-red-500' : ''
        }`}
      />
      {showErrors && fieldState.error && (
        <div className="text-red-500 text-sm">{fieldState.error.message}</div>
      )}
    </div>
  );
}
