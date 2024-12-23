import { useController, UseControllerProps } from "react-hook-form";
import { Label } from "flowbite-react";

type Props = {
  label: string;
  showLabel?: boolean;
} & UseControllerProps;

export default function InputArea(props: Props) {
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
      <textarea
        {...field}
        placeholder={props.label}
        className={`
          rounded-md
          w-full
          p-3
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
          resize-y
        `}
        rows={4} // Initial height (adjustable)
      />
      {fieldState.error && (
        <div className="text-red-500 text-sm">{fieldState.error.message}</div>
      )}
    </div>
  );
}
