import React from 'react'

const BlurCircle = ({top = "auto", left = "auto", right = "auto"}) => {
  return (
    <div
        className='absolute -z-50 h-58 w-58 aspect-square rounded-full bg-primary/30 blur-3xl'
        style={{top: top, left: left, right: right}}
    >
    </div>
  )
}

export default BlurCircle
