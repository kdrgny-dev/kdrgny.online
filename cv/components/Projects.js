import React from 'react'
import Heading from './Heading'

export default function Projects({ data }) {
  return (
    <section className="pb-4 border-b border-gray-500">
      <Heading level={4}>PROJECTS</Heading>
      <ul>
        {data?.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex gap-1 items-center text-gray-400 hover:text-gray-600">
              <span className="text-gray-700 font-semibold text-sm">
                {item.label}:
              </span>
              <span className="text-xs">
                {item.url}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
