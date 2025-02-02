"use client"

import { Button } from 'flowbite-react';
import React from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import Input from '../components/Input';
import toast from 'react-hot-toast';
import { applyToJobPost, saveJobPost } from '../actions/jobPostActions';
import InputArea from '../components/InputArea';

interface ApplyFormProps {
  jobPostId: string;
  isSaved?: boolean;
}

export default function ApplyForm({ jobPostId, isSaved }: ApplyFormProps) {
  const [loading, setLoading] = React.useState(false);

  async function handleSaveJob() {
    try {
      setLoading(true);
  
      const response = await saveJobPost(jobPostId);
  
      if (response.status === 200) {
        toast.success(isSaved ? "Job removed from saved list!" : "Job saved successfully!");
      } else {
        toast.error(response.error?.message || "An error occurred");
        console.log(`Response code is ${response.status}`);
      }
  
      setLoading(false);
    } catch {
      toast.error("An error occurred while saving the job.");
      setLoading(false);
    }
  }
  

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    mode: 'onTouched',
  });

  async function onSubmit(data: FieldValues) {
    try {
      setLoading(true);

      const responce = await applyToJobPost(jobPostId, data);

      if (responce.status === 200) {
        toast.success('Application submitted successfully!');
      }
      else {
        toast.error(responce.error?.message || 'An error occurred');
      }
      
      setLoading(false);

    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
      setLoading(false);
    }
  }

  return (
    <form className="flex flex-col mt-3" onSubmit={handleSubmit(onSubmit)}>
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <Input
            label="Phone Number"
            name="Phone"
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
          {errors.Phone?.message && (
            <p className="text-red-500 text-sm">{String(errors.Phone.message)}</p>
          )}
          <Input
            label="Email"
            name="Email"
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
          {errors.Email && (
            <p className="text-red-500 text-sm">{String(errors.Email.message)}</p>
          )}
          <InputArea
            label="Message to the Employer (optional)"
            name="Message"
            control={control}
          />
          <div className="flex justify-between gap-4 mt-6">
            <Button
              isProcessing={isSubmitting}
              disabled={!isValid}
              type="submit"
              color="success"
              className={`w-full ${!isValid ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'}`}
            >
              Submit
            </Button>
            <Button
              disabled={isSaved}
              type='button'
              onClick={handleSaveJob}
              className={`w-full ${isSaved ? 'bg-gray-400' : 'bg-gray-500 hover:bg-gray-600'}`}
            >
              {isSaved ? 'Saved✓' : 'Save for Later'}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
