import React from 'react'

async function CoverLetter() {
    console.log(params);
    const id = await params.id;
    
  return (
    <div>CoverLetter: {id}</div>
  )
}

export default CoverLetter