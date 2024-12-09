'use client'

import { usePathname, useRouter } from 'next/navigation';
import { useParamsStore } from '@/app/hooks/useParamsStore';
import { FaHammer } from 'react-icons/fa';

export default function MyComponent() {
  const reset = useParamsStore(state => state.reset);
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    if (pathname !== '/') router.push('/');  
    reset(); 
  };

  return (
    <div onClick={handleClick} className='cursor-pointer flex items-center gap-2 text-3xl font-semibold'>
      <FaHammer size={34} />
      <div>FindJob</div>
    </div>
  );
}

