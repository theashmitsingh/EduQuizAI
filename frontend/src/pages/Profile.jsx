import React from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const Profile = () => {
  return (
    <div>
      <Navbar />

        <div className='bg-zinc-200 h-40 w-40 mt-30 ml-30 rounded-lg '></div>
        <h1 className='ml-30 mt-10 font-semibold text-2xl '>User's Name</h1>

      <Footer />
    </div>
  )
}

export default Profile