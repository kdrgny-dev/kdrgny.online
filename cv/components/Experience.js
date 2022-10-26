import React from 'react'
import Heading from './Heading'

export default function Experience({ data }) {
  const htmlRender = (text) => {
    return { __html: text }
  }
  return (
    <section className="pb-4 border-b border-gray-500">
      <Heading level={4}>EXPERIENCE</Heading>
      <ul>
        {data?.map((item, index) => (
          <li key={index} className="flex gap-2 flex-col">
            <div className="font-semibold text-sm text-gray-700">{item.position}</div>
            <div className="text-xs text-gray-400">{item.date} | {item.title}</div>
            <div dangerouslySetInnerHTML={htmlRender(item.content)} className="list" />
          </li>
        ))}
      </ul>
    </section>
  )
}
