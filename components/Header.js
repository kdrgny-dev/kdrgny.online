import React from 'react'
import Image from 'next/image'
import Heading from './Heading'

export default function Header({ data }) {
  return (
    <div className="flex items-center justify-between pb-5 border-b-2 border-gray-500">
      <div className="flex flex-col">
        <Heading level={1} className="text-gray-700">{data?.name}</Heading>
        <Heading level={2} className="text-gray-500">{data?.title}</Heading>
        <Heading level={6} className="text-gray-400">{data?.location}</Heading>
      </div>
      <div className="shadow-md shrink-0 border-4 border-gray-400 dark:border-gray-100 xl:w-36 xl:h-36 w-24 h-24 relative rounded-full">
        <Image src={data?.photo} alt={data?.name} layout="fill" className="rounded-full" />
      </div>
    </div>
  )
}
