'use client'
import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button';
import { ChevronDown, FileTextIcon, GraduationCapIcon, LayoutDashboard, PenBox, StarsIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut, useSession, signIn } from 'next-auth/react'

function Header() {
  const { data: session } = useSession();
  const isSignedIn = !!session;
  
  return (
    <header className='fixed top-0 w-full border-b bg-background/80 backdrop-blur-md z-50 supports-[backdrop-filter]:bg-background/60'>
      <nav className='container mx-auto px-4 h-16 flex items-center justify-between'>
        <Link href='/'>
          <h2 className='font-bold text-2xl'>Futur<span className='text-red-500'>E</span>dge</h2>
        </Link>
        <div>
          {isSignedIn &&
            (
              <div className='flex items-center space-x-2 md:space-x-4'>
                <Link href={"/dashboard"}>
                  <Button variant={'outline'}>
                    <LayoutDashboard className='h-4 w-4' />
                    <span className='hidden md:block'>Industry Insights</span>
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <StarsIcon className='h-4 w-4' />
                      <span className='hidden md:block'>Growth Tools</span>
                      <ChevronDown className='h-4 w-4' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Link href={'/resume'} className='flex items-center gap-2'>
                        <FileTextIcon className='h-4 w-4' />
                        <span className='hidden md:block'>Build Resume</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={'/ai-cover-letter'} className='flex items-center gap-2'>
                        <PenBox className='h-4 w-4' />
                        <span className='hidden md:block'>Cover Letter</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href={'/interview'} className='flex items-center gap-2'>
                        <GraduationCapIcon className='h-4 w-4' />
                        <span className='hidden md:block'>Interview Prep</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    
                      <span className='hidden md:block'>(\=/)</span>
                    
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem>
                      <Link href={'/sign-in'} className='flex items-center gap-2'>
                        <span onClick={() => signOut()}>Sign Out</span>
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
            
              </div>
              
            )}

            {!isSignedIn &&
            (
              <Button onClick={() => signIn()}>Sign In</Button>
            )}
        </div>
      </nav>
    </header>
  )
}

export default Header