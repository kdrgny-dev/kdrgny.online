import React from 'react'
import Image from 'next/image'
import Heading from './Heading'
import { motion } from "framer-motion"

export default function Header({ data }) {
  return (
    <div className="flex items-center justify-between pb-5 border-b-2 border-gray-400">
      <motion.div
        className="flex flex-col"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.75, type: "spring" }}
      >
        <Heading level={1} className="text-gray-700">{data?.name}</Heading>
        <div className='text-gray-600 xl:text-2xl text-xl font-semibold dark:text-gray-300 mb-2'>{data?.title}</div>
        <div className='text-sm font-semibold dark:text-gray-300 mb-2 text-gray-500'>{data?.location}</div>
      </motion.div>
      <motion.div
        className="shadow-md shrink-0 border-4 border-gray-400 dark:border-gray-300 xl:w-36 xl:h-36 w-24 h-24 relative rounded-full"
        initial={{
          scale: 0,
          opacity: 0,
          x: 100,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: 0.75,
          type: "spring",
        }}
      >
        <Image src={data?.photo} alt={data?.name} layout="fill" className="rounded-full" />
      </motion.div>
    </div>
  )
}
