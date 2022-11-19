import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <div className='w-full p-2 text-xs text-gray-700 dark:text-gray-400 text-center'>
      made with
      <Link href="https://nextjs.org/">
        <a target="_blank">
          <span className='mx-1 font-semibold'>NextJS</span>
        </a>
      </Link> hosted on
      <Link href="https://vercel.com/">
        <a target="_blank">
          <span className='mx-1 font-semibold'>Vercel</span>
        </a>
      </Link>
      headless cms from
      <Link href="https://justfields.com/">
        <a target="_blank">
          <span className='mx-1 font-semibold'>justfields</span>
        </a>
      </Link>
    </div>
  )
}
