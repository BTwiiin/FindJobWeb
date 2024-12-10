'use client'

import { Button, TextInput } from 'flowbite-react'
import React, { useEffect } from 'react'
import { Field, FieldValues, set, useForm } from 'react-hook-form'
import Input from '../components/Input'
import DateInput from '../components/DateInput'

export default function JobPostForm() {
    const {control, handleSubmit, setFocus, 
        formState: {isSubmitting, isValid, isDirty, errors}} = useForm({
            mode: 'onTouched'
        });

    useEffect(() => {
        setFocus('title')
    }, [setFocus])
    
    function onSubmit(data: FieldValues) {
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
