/**
 * The base classe to be applied to every text-like input
 */
export const baseInputClasses = `
  rounded-md
  w-full
  pl-5 py-2
  border border-gray-300
  bg-white
  text-lg text-gray-700
  shadow-sm
  focus:border-gray-500 focus:ring focus:ring-gray-300 focus:outline-none
  hover:border-gray-400 hover:shadow-md
  transition ease-in-out duration-150
`;

/**
 * A variation for textareas, to use them as resizeable
 */
export const baseTextareaClasses = `
  ${baseInputClasses}
  resize-y
`;

/**
 * Consistent class prefix for React Select,
 */
export const reactSelectClassPrefix = 'my-select';
