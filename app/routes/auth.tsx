import type { ifError } from 'assert';
import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router';
import { usePuterStore } from '~/lib/puter'

export const meta = ()=>([
    {title: 'RESUMIND | Auth'},
    {name:"description" , content:"Login to your account"}
])

const auth = () => {
    const {auth , isLoading} = usePuterStore();
    const location = useLocation();
    const next = location.search.split("next=")[1];
    const navigate = useNavigate();

    useEffect(()=>{
        if (auth.isAuthenticated) {
            navigate(next);
        }
    },[auth.isAuthenticated,next])
  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover h-screen flex items-center justify-center">
       <div className='gradient-border shadow-lg'>
         <section className=' flex flex-col gap-6 rounded-2xl p-8 bg-white'>
           <div className='flex flex-col items-center justify-center text-center gap-3'>
              <h1>Welcome</h1>
              <h2>Log In To Continue Your Job Journey</h2>
           </div>

           <div>
            {
                isLoading ? 
                (
                <button type='button' className='auth-button animate-pulse'>
                    <p>Signing you in...</p>
                </button>
                ) : ( 
                        <>
                          {
                            auth.isAuthenticated ? (
                                <button type='button' className='auth-button' onClick={auth.signOut}>
                                    <p>Logout</p>
                                </button>
                            ) : (
                                <button type='button' className='auth-button' onClick={auth.signIn}>
                                    <p>Log In</p>
                                </button>
                            )
                          }
                        </> 
                )
            }
           </div>
         </section>
       </div>
    </main>
  )
}

export default auth