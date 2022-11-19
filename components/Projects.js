import React from 'react'
import Heading from './Heading'

export default function Projects({ data }) {

  const htmlRender = (text) => {
    return { __html: text }
  }

  return (
    <section>
      <Heading level={4} className="text-gray-600">PROJECTS</Heading>
      <ul className='divide-y divide-dashed divide-gray-400'>
        {data?.map((item, index) => (
          <li key={index} className="flex items-center gap-2 py-4 first:pt-0 last:pb-0">
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-1 text-gray-700 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition duration-300 ease-linear">
              <div className='flex flex-col gap-1'>
                <span className="font-semibold text-sm">
                  {item.title} - {item.date}
                </span>
                <span className="text-xs">
                  {item.url}
                  <span className="font-semibold text-xs">
                    &#8599;
                  </span>
                </span>

              </div>
              <div>
                <span className="text-xs">
                  {item.technologies}
                </span>
              </div>
              <div dangerouslySetInnerHTML={htmlRender(item.content)} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
