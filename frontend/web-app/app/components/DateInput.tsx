import { useController, UseControllerProps } from "react-hook-form";
import { Label } from "flowbite-react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker, { DatePickerProps } from "react-datepicker";

type Props = {
  label: string;
  type?: string;
  showLabel?: boolean;
} & UseControllerProps & DatePickerProps;

export default function DateInput(props: Props) {
  const { fieldState, field } = useController({ ...props, defaultValue: "" });

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
        {...props}
        {...field}
        placeholderText={props.label}
        selected={field.value}
        className={`
          rounded-md
          w-full
          pl-5 py-2
          border
          border-gray-300
          bg-white
          text-lg
          text-gray-700
          shadow-sm
          focus:border-gray-500
          focus:ring focus:ring-gray-300
          focus:outline-none
          hover:border-gray-400
          hover:shadow-md
          transition
          ease-in-out
          duration-150
        `}
        wrapperClassName="w-full"
      />
      {fieldState.error && (
        <div className="text-red-500 text-sm">{fieldState.error.message}</div>
      )}
    </div>
  );
}
