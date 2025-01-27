"use client"

import { Button } from 'flowbite-react';
import React from 'react';
import { set, useForm } from 'react-hook-form';
import Input from '../components/Input';
import toast from 'react-hot-toast';
import { applyToJobPost } from '../actions/jobPostActions';
import InputArea from '../components/InputArea';
import { useRouter } from 'next/navigation';

interface ApplyFormProps {
  jobPostId: string;
}

export default function ApplyForm({ jobPostId }: ApplyFormProps) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { isSubmitting, isValid, errors },
  } = useForm({
    mode: 'onTouched',
  });

  async function onSubmit(data: any) {
    try {
      setLoading(true);

      var responce = await applyToJobPost(jobPostId, data);

      if (responce.status === 200) {
        toast.success('Application submitted successfully!');
      }
      else {
        toast.error(responce.error?.message || 'An error occurred');
      }
      
      setLoading(false);

    } catch (error: any) {
      toast.error(error.status + ' ' + error.message);
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
              disabled={isSubmitting}
              type='button'
              className="w-full bg-gray-500 hover:bg-gray-600"
              >
                Save for Later
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
