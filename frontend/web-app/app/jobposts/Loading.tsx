import React from 'react'

export default function loading() {
  return (
    <div className="flex flex-wrap gap-4 p-4 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full h-[20%] bg-gray-200 rounded-md flex flex-col p-4 justify-between">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
          </div>
        ))}
      </div>
  )
}
