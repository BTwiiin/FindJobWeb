import React from 'react'

export default async function Details(props: {params: Promise<{id: string}>}) {
  const params = await props.params;
  return (
    <div>
      Details of {params.id}
    </div>
  )
}
