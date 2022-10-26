import React from 'react'
import Image from 'next/image'

export default function Header({ data }) {
  return (
    <div className="flex items-center justify-between pb-5 border-b-4 border-gray-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold">{data?.name}</h1>
        <h2 className="text-2xl font-semibold">{data?.title}</h2>
        <h3 className="text-sm font-semibold text-gray-400">{data?.location}</h3>
      </div>
      <div className="shadow-md border-4 border-gray-400 w-36 h-36 relative rounded-full">
        <Image src={data?.photo} alt={data?.name} layout="fill" className="rounded-full" />
      </div>
    </div>
  )
}
