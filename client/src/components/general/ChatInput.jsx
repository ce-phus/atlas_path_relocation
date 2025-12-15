import React from 'react'

const ChatInput = ({ message }) => {
  return (
    <div className='border border-t border-[#f0f0f0] p-6'>
        <form className='relative'>
            <div className='flex items-center space-x-4'>
                <button
                type="button"
                className="p-3 text-[#9CA3AF] hover:text-[#8B5CF6] transition-colors rounded-full hover:bg-[#f9fafb]"
                aria-label="Attach file"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>
                <input
                className="flex-1 px-6 py-4 bg-[#f9fafb] border border-[#e5e7eb] rounded-full focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:border-transparent text-[#374151] font-light placeholder-[#9CA3AF]"/>
                <button
            type="submit"
            // disabled={!message.trim()}
            className={`p-4 rounded-full transition-all duration-200 ${
              message?.trim()
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white hover:shadow-lg transform hover:-translate-y-0.5'
                : 'bg-[#f3f4f6] text-[#d1d5db] cursor-not-allowed'
            }`}
            aria-label="Send message"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
            </div>
            
        </form>
    </div>
  )
}

export default ChatInput