import React from 'react'
import Heading from './Heading'

export default function Summary({ data }) {

  const htmlRender = (text) => {
    return { __html: text }
  }

  return (
    <section>
      <Heading level={4} className="text-gray-600">SUMMARY</Heading>
      <div dangerouslySetInnerHTML={htmlRender(data)} className="text-sm text-gray-900 dark:text-gray-400" />
    </section>
  )
}
