import React from 'react'
import Heading from './Heading'

export default function Summary({ data }) {

  const htmlRender = (text) => {
    return { __html: text }
  }

  return (
    <section className="pb-4 border-b border-gray-500">
      <Heading level={4}>SUMMARY</Heading>
      <div dangerouslySetInnerHTML={htmlRender(data)} className="text-sm" />
    </section>
  )
}
