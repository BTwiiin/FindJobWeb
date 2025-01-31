'use client'

import React from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import { Label } from 'flowbite-react';
import { baseInputClasses } from '../utils/formStyles';

type Props = {
  label: string;
  type?: string;
  showLabel?: boolean;
} & UseControllerProps;

export default function Input(props: Props) {
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
      <input
        {...field}
        type={props.type || 'text'}
        placeholder={props.label}
        // <-- reuse the base classes
        className={baseInputClasses}
      />
      {fieldState.error && (
        <div className="text-red-500 text-sm">{fieldState.error.message}</div>
      )}
    </div>
  );
}
