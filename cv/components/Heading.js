import React from 'react'

export default function Heading({ level, className, children }) {
  const levels = {
    1: `xl:text-4xl text-2xl font-semibold dark:text-gray-300 mb-2 ${className ? className : ''}`,
    2: `xl:text-2xl text-xl font-semibold dark:text-gray-300 mb-2 ${className ? className : ''}`,
    3: `xl:text-xl text-lg font-semibold dark:text-gray-300 mb-2 ${className ? className : ''}`,
    4: `text-lg font-semibold dark:text-gray-300 mb-2 ${className ? className : ''}`,
    5: `text-base font-semibold dark:text-gray-300 mb-2 ${className ? className : ''}`,
    6: `text-sm font-semibold dark:text-gray-300 mb-2 ${className ? className : ''}`,
  }

  const generateHeading = () => {
    switch (level) {
      case 1:
        return <h1 className={`${levels[level]}`}>{children}</h1>
      case 2:
        return <h2 className={`${levels[level]}`}>{children}</h2>
      case 3:
        return <h3 className={`${levels[level]}`}>{children}</h3>
      case 4:
        return <h4 className={`${levels[level]}`}>{children}</h4>
      case 5:
        return <h5 className={`${levels[level]}`}>{children}</h5>
      case 6:
        return <h6 className={`${levels[level]}`}>{children}</h6>
      default:
        return <h1 className={`${levels[1]}`}>{children}</h1>
    }
  }
  return generateHeading();
}
