import React from 'react'

export default function Heading({ level, className, children }) {
  const levels = {
    1: 'text-4xl font-bold text-gray-700 mb-2',
    2: 'text-2xl font-semibold text-gray-700 mb-2',
    3: 'text-xl font-semibold text-gray-700 mb-2',
    4: 'text-lg font-semibold text-gray-700 mb-2',
    5: 'text-base font-semibold text-gray-700 mb-2',
    6: 'text-sm font-semibold text-gray-700 mb-2',
  }

  const generateHeading = () => {
    switch (level) {
      case 1:
        return <h1 className={`${levels[level]} ${className}`}>{children}</h1>
      case 2:
        return <h2 className={`${levels[level]} ${className}`}>{children}</h2>
      case 3:
        return <h3 className={`${levels[level]} ${className}`}>{children}</h3>
      case 4:
        return <h4 className={`${levels[level]} ${className}`}>{children}</h4>
      case 5:
        return <h5 className={`${levels[level]} ${className}`}>{children}</h5>
      case 6:
        return <h6 className={`${levels[level]} ${className}`}>{children}</h6>
      default:
        return <h1 className={`${levels[1]} ${className}`}>{children}</h1>
    }
  }
  return generateHeading();
}
