import React from 'react'
import Heading from './Heading'

export default function Experience({ data }) {
  const htmlRender = (text) => {
    return { __html: text }
  }
  return (
    <section>
      <Heading level={4} className="text-gray-600">EXPERIENCE</Heading>
      <ul className='divide-y divide-dashed divide-gray-400'>
        {data?.map((item, index) => (
          <li key={index} className="flex gap-1 flex-col py-4 first:pt-0 last:pb-0 text-gray-700 dark:text-gray-400">
            <div className="font-semibold text-sm dark:text-gray-300">{item.position}</div>
            <div className="text-xs">{item.date} | {item.title}</div>
            <div dangerouslySetInnerHTML={htmlRender(item.content)} className="list" />
          </li>
        ))}
      </ul>
    </section>
  )
}
