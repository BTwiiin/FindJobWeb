'use client'

import { Button, Label, TextInput } from 'flowbite-react'
import React, { useEffect } from 'react'
import { Controller, Field, FieldValues, set, useForm } from 'react-hook-form'
import Input from '../components/Input'
import DateInput from '../components/DateInput'
import { createJobPost } from '../actions/jobPostActions'
import { useRouter } from 'next/navigation'
import Select from 'react-select'
import toast from 'react-hot-toast'

const options = [
    { value: 'it', label: 'IT' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'manuallabor', label: 'Manual Labor' },
    { value: 'other', label: 'Other' }
]

export default function JobPostForm() {
    const router = useRouter()
    const {control, handleSubmit, setFocus, 
        formState: {isSubmitting, isValid, isDirty, errors}} = useForm({
            mode: 'onTouched'
        });

    useEffect(() => {
        setFocus('title')
    }, [setFocus])
    
    async function onSubmit(data: FieldValues) {
        try{
            const res = await createJobPost(data)
            console.log(res)
            console.log(res.error)
            if (res.error) {
                throw res.error;
            }
            router.push(`/jobposts/details/${res.id}`)
        }
        catch(error: any) {
            toast.error(error.status + ' ' + error.message)
        }
    }
    async function onSubmit_(data: FieldValues) {
        console.log(data)
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
            <div className="mb-4">
                <Controller
                    control={control}
                    name="category"
                    rules={{ required: 'Category is required' }}
                    render={({ field: {onChange, value, name, ref }}) => (
                        <Select
                            ref={ref}
                            classNamePrefix="addl-class"
                            options={options}
                            value={options.find(c => c.value === value)}
                            onChange={(val) => {
                                // Handle null value
                                if (val) {
                                  onChange(val.value);
                                } else {
                                  onChange(null); // Handle case where selection is cleared
                                }
                              }}
                              placeholder="Select a category"
                        />
                    )}
                />
            </div>

            <div className="flex justify-between gap-4">
                <Button outline color='gray'>Cancel</Button>
                <Button 
                    isProcessing={isSubmitting}
                    disabled={!isValid} 
                    type='submit'
                    outline color='success'>Create</Button>
            </div>
        </form>
  )
}
