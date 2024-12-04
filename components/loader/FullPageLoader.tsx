'use client'

import { Loader } from "lucide-react"

interface FullPageLoaderProps {
    title: string;
    text: string;
}

const FullPageLoader = ({ title, text }: FullPageLoaderProps) => {
    return (
        <section className='absolute h-screen bg-[#00000054] text-white inset-0 flex flex-col items-center justify-center'>
            <Loader className='animate-spin text-3xl size-12' />
            <h2 className='text-3xl'>{title}</h2>
            <h2 className="drop-shadow-sm text-lg" style={{textShadow: '0 0 3px black',}}>{text}</h2>
        </section>
    )
}

export default FullPageLoader
