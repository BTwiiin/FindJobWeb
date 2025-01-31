'use client'

import React from 'react';
import { useController, UseControllerProps } from 'react-hook-form';
import { Label } from 'flowbite-react';
import { baseTextareaClasses } from '../utils/formStyles';

type Props = {
  label: string;
  showLabel?: boolean;
} & UseControllerProps;

export default function InputArea(props: Props) {
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
      <textarea
        {...field}
        placeholder={props.label}
        rows={4}
        className={baseTextareaClasses}
      />
      {fieldState.error && (
        <div className="text-red-500 text-sm">{fieldState.error.message}</div>
      )}
    </div>
  );
}
