import React from 'react'
import Heading from './Heading'

export default function Urls({ data }) {

  function checkUrl(url) {
    if (url.includes('mailto:')) {
      return url.replace('mailto:', '')
    }
    return url
  }
  return (
    <section>
      <Heading level={4} className="text-gray-600">URLs</Heading>
      <ul>
        {data?.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex gap-1 items-center text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition duration-500 ease-in">
              <span className="font-semibold text-sm">
                {item.label}:
              </span>
              <span className="text-sm">
                {checkUrl(item.url)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
