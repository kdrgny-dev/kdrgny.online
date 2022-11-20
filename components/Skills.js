import React from 'react'
import Heading from './Heading'
import { motion } from "framer-motion"

export default function Skills({ data }) {
  return (
    <section>
      <Heading level={4} className="text-gray-600">SKILLS</Heading>
      <ul className="flex items-center gap-2 flex-wrap">
        {data?.map((item, index) => (
          <motion.li
            key={index}
            whileHover={{ rotate: [0, 5, -5, 0] }}
            transition={{ type: "spring", duration: 0.75 }}
          >
            <span
              className="text-white cursor-crosshair dark:text-gray-900 text-xs px-2 py-1 bg-gray-600 dark:bg-gray-300 rounded bg-opacity-80 hover:bg-opacity-100 transition duration-300 ease-linear dark:bg-opacity-100 dark:hover:bg-gray-100"
            >
              {item.skill}
            </span>
          </motion.li>
        ))}
      </ul>
    </section>
  )
}
