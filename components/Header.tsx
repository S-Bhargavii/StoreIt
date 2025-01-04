import React from 'react'
import FileUploader from './FileUploader'
import Search from './Search';
import { Button } from './ui/button';
import Image from 'next/image';

const Header = () => {
  console.log("Rendering the header component");
  return (
    <header className='header'>
        <Search/>
        <div className='header-wrapper'>
            <FileUploader/>
            <form>
              <Button type="submit" className='sign-out-button'>
                <Image 
                  src="/assets/icons/logout.svg"
                  alt="logo"
                  width={24}
                  height={24}
                  className="w-6"
                />
              </Button>
            </form>
        </div>
    </header>
  )
}

export default Header