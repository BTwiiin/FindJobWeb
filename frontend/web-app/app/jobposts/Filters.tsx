import { useParamsStore } from '../hooks/useParamsStore';
import { Button } from 'flowbite-react';
import SalaryRangeSlider from './SalaryRangeSlider';

const filterButtons = [
  {
    label: 'IT',
    value: 'IT',
  },
  {
    label: 'Marketing',
    value: 'Marketing',
  },
  {
    label: 'Manual Labor',
    value: 'ManualLabor',
  },
  {
    label: 'Event Planning',
    value: 'Eventplanning',
  },
  {
    label: 'Tutoring',
    value: 'Tutoring',
  },
  {
    label: 'Entertainment',
    value: 'Entertainment',
  },
  {
    label: 'Other',
    value: 'Other',
  }
];

const Modal = () => {
  const setParams = useParamsStore((state) => state.setParams);
  const filterBy = useParamsStore((state) => state.filterBy);
  const reset = useParamsStore((state) => state.reset);
  
  return (
      <div>
        {/* Salary Range Slider */}
        <SalaryRangeSlider />
        {/*Categories*/}
        <div className="flex flex-col ">
          <h3 className="mb-2 text-gray-700 font-medium">Category</h3>
          {filterButtons.map(({ label, value }) => (
            <label key={value} className="flex items-center w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300 space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filterBy === value}
                onChange={() => setParams({ filterBy: value })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
              />
              <span className={`text-gray-700 ${filterBy === value ? 'font-semibold' : ''}`}>{label}</span>
            </label>
          ))}
        </div>
        <footer className='flex flex-row justify-center sticky bottom-0 bg-white p-4 border-t'>
          <Button
            className="bg-gray-500 text-white mb-2 rounded"
            onClick={reset}
          >
            Reset filters
          </Button>
        </footer>
      </div>
  );
};
  
  export default Modal;