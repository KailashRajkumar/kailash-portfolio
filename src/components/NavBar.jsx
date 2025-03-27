import React, { useEffect } from 'react';

const NavBar = ({ menuOpen, setMenuOpen }) => {
    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
    }, [menuOpen]);

    return (
        <nav className='fixed top-0 w-full z-40 bg-[rgba(10, 10, 10, 0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg'>
            <div className='max-w-5xl mx-auto p-4'>
                <div className='flex justify-between items-center h-16'>
                    <a href='#home'
                        className='font-mono text-xl font-bold text-white'
                    >
                        Kailash<span
                            className='bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent leading-right'
                        >
                            .UI DEV
                        </span>
                    </a>
                    {/* Hamburger Menu */}
                    <div
                        className={`w-7 h-5 relative cursor-pointer z-40 md:hidden transition-all duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`}
                        onClick={() => setMenuOpen(true)}
                    >
                        &#9776;
                    </div>

                    {/* Desktop Menu */}
                    <div className='hidden md:flex items-center space-x-8'>
                        <a href='#home' className='text-gray-300 hover:text-white transition-colors'>Home</a>
                        <a href='#about' className='text-gray-300 hover:text-white transition-colors'>About</a>
                        <a href='#projects' className='text-gray-300 hover:text-white transition-colors'>Projects</a>
                        <a href='#contact' className='text-gray-300 hover:text-white transition-colors'>Contact</a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
