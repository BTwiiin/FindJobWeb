'use client';

import { Button } from 'flowbite-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../components/Input';
import toast from 'react-hot-toast';

export default function ApplyForm() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    mode: 'onTouched',
  });

  async function onSubmit(data: any) {
    try {
      // TODO: Replace with an API call to submit application data
      console.log('Application Submitted:', data);
      toast.success('Application submitted successfully!');
    } catch (error: any) {
      toast.error('Failed to submit application. Please try again.');
    }
  }

  return (
    <form className="flex flex-col mt-3" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Phone Number"
        name="phoneNumber"
        control={control}
        type="tel"
        rules={{
          required: 'Phone number is required',
          pattern: {
            value: /^[0-9]{10,15}$/,
            message: 'Please enter a valid phone number',
          },
        }}
      />
      {/* {errors.phoneNumber && (
        <p className="text-red-500 text-sm">{errors.phoneNumber.message}</p>
      )} */}

      <Input
        label="Email"
        name="email"
        control={control}
        type="email"
        rules={{
          required: 'Email is required',
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address',
          },
        }}
      />
      {/* {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )} */}

      <div className="flex justify-between gap-4 mt-6">
        <Button
          isProcessing={isSubmitting}
          disabled={!isValid}
          type="submit"
          color="success"
          className='w-full bg-gray-500 hover:bg-gray-600'
        >
          Submit
        </Button>
      </div>
    </form>
  );
}
