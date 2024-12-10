import React from 'react'

export default async function Update(props: {params: Promise<{id: string}>}) {
  const params = await props.params;
  return (
    <div>
      Updaye Details of {params.id}
    </div>
  )
}
