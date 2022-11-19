import React from 'react'
import Heading from './Heading'
import Image from 'next/image'
import Link from 'next/link'

export default function Certificates({ data }) {
  return (
    <section>
      <Heading level={4}>CERTIFICATES</Heading>
      <div className="grid xl:grid-cols-4 md:grid-cols-4 grid-cols-2 gap-2">
        {data?.map((item, index) => (
          <Link key={index} href={item.url}>
            <a target="_blank" className='flex flex-col items-center group hover:shadow-lg dark:hover:shadow-gray-500 transition duration-200 ease-linear rounded'>
              <div className='relative w-32 h-20 xl:w-36 xl:h-24 overflow-hidden rounded'>
                <Image src={item?.image} alt={item.title} layout="fill" className='group-hover:scale-105 transition duration-200 ease-linear' />
              </div>
              <div className="p-2 text-xs text-gray-700 font-semibold text-center dark:text-gray-400 dark:group-hover:text-gray-100 transition duration-200 ease-linear">
                {item.title}
              </div>
            </a>
          </Link>
        ))}

      </div>
    </section>
  )
}
