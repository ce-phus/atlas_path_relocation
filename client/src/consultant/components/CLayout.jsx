import React from 'react'
import Header from './Header'

const CLayout = ({ children }) => {
  return (
    <div>
        <Header />
        <div>
            {children}
        </div>
    </div>
  )
}

export default CLayout