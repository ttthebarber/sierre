import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

const Page = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Sierre</h1>
          <p className="text-gray-600 mb-8">Track KPIs across your Shopify store</p>
        </div>
        
        <SignedOut>
          <div className="space-y-4">
            <SignInButton mode="modal">
              <button className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="w-full border border-gray-300 hover:bg-gray-50 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors">
                Sign Up
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
        
        <SignedIn>
          {redirect('/dashboard')}
        </SignedIn>
      </div>
    </div>
  )
}

export default Page