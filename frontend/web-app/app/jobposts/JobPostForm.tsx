'use client'

import { Button, Label, TextInput } from 'flowbite-react'
import React, { useEffect } from 'react'
import { Controller, Field, FieldValues, set, useForm } from 'react-hook-form'
import Input from '../components/Input'
import DateInput from '../components/DateInput'
import { createJobPost, updateJobPost } from '../actions/jobPostActions'
import { usePathname, useRouter } from 'next/navigation'
import Select from 'react-select'
import toast from 'react-hot-toast'
import { JobPost } from '@/types'

type Props = {
    jobPost?: JobPost
}

const options = [
    { value: 'it', label: 'IT' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'manuallabor', label: 'Manual Labor' },
    { value: 'other', label: 'Other' }
]

export default function JobPostForm({jobPost}: Props) {
    const router = useRouter()
    const pathname = usePathname()
    const {control, handleSubmit, setFocus, reset,
        formState: {isSubmitting, isValid, isDirty, errors}} = useForm({
            mode: 'onTouched'
        });

    useEffect(() => {
        if (jobPost) {
            const { title, description, paymentAmount, deadline, category } = jobPost;
            reset({
            title,
            description,
            paymentAmount,
            deadline: deadline ? new Date(deadline) : null,
            category: options.find(option => option.value === category)?.value || '',
            });
            setFocus('title');
        }
        }, [jobPost, reset, setFocus]);
    
    async function onSubmit(data: FieldValues) {
        try{
            let id = '';
            let res;
            if (pathname === '/jobposts/create') {
                res = await createJobPost(data);
                id = res.id;
            } else {
                if (jobPost) {
                    res = await updateJobPost(data, jobPost.id);
                    id = jobPost.id;
                }
            }
            if (res.error) {
                throw res.error;
            }
            router.push(`/jobposts/details/${id}`)
        }
        catch(error: any) {
            toast.error(error.status + ' ' + error.message)
        }
    }

    return (
        <form className="flex flex-col mt-3"onSubmit={handleSubmit(onSubmit)}>
            <Input label='Title' name='title' control={control} 
                rules={{required: 'Title is required'}}/>
            <Input label='Description' name='description' control={control} 
                rules={{required: 'Description is required'}}/>

            <div className="grid grid-cols-2 gap-4">
                <Input label='Payment Amount' name='paymentAmount' control={control}
                    type='number' rules={{required: 'Payment Amount is required'}}/>
                <DateInput label='Deadline' name='deadline' control={control}
                    dateFormat='dd MMMM YYYY h:mm a' showTimeSelect 
                    rules={{required: 'Deadline date is required'}}/>
            </div>

            {/* Select category dropdown */}
            {pathname === '/jobposts/create' && (
            <>
                <div className="mb-4">
                    <Controller
                        control={control}
                        name="category"
                        rules={{ required: 'Category is required' }}
                        render={({ field: {onChange, value, ref }}) => (
                            <Select
                                ref={ref}
                                classNamePrefix="addl-class"
                                options={options}
                                value={options.find(option => option.value === value) || null} // Ensure value is an object
                                onChange={val => onChange(val?.value || null)} // Pass only the value to t
                                placeholder="Select a category"
                            />
                        )}
                    />
                </div>
            </>)}

            <div className="flex justify-between gap-4">
                <Button outline color='gray' onClick={() => router.back()}>Cancel</Button>
                <Button 
                    isProcessing={isSubmitting}
                    disabled={!isValid} 
                    type='submit'
                    outline color='success'>Submit</Button>
            </div>
        </form>
  )
}
