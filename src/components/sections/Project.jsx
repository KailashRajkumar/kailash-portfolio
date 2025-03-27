import React from 'react'
import { FaLongArrowAltRight } from 'react-icons/fa'
import RevealOnScroll from '../RevealOnScroll'

const Project = () => {
    return (
        <section id='projects' className='min-h-screen flex items-center justify-center py-20'>
            <RevealOnScroll>
                <div className='max-w-5xl mx-auto px-4'>
                    <h2 className='text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent text-center'>
                        {" "}
                        Featured Projects
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {/* Project-1 */}
                        <div className='p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition'>
                            <h3 className='text-xl font-bold mb-2'>Weather App</h3>
                            <p className='text-gray-400 mb-4'>
                                Weather App built with React, fetching real-time data from OpenWeatherMap API. Features city search, dynamic weather-based backgrounds, and temperature conversion.
                            </p>
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {["React", "Bootstrap", "Chart.js", "MongoDB"].map((tech, key) => (
                                    <span
                                        key={key}
                                        className='bg-blue-500/10 text-blue-500 py-1 px-3 rounded-full text-sm hover:bg-blue-500/20 
                                hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition-all
                            '>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            <div className='flex justify-between items-center'>
                                <a href="https://github.com/KailashRajkumar/Weather-App" className='flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors my-4'>
                                    {" "}
                                    View Project <FaLongArrowAltRight />{" "}
                                </a>
                            </div>
                        </div>
                        {/* Project-2 */}
                        <div className='p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition'>
                            <h3 className='text-xl font-bold mb-2'>Netflix-Clone</h3>
                            <p className='text-gray-400 mb-4'>
                                Netflix Clone built with React, Redux Toolkit, Firebase, Styled Components, Axios, and a Node.js + Express + MongoDB backend.
                            </p>
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {["React", "Styled Components", "Node.js", "MongoDB"].map((tech, key) => (
                                    <span
                                        key={key}
                                        className='bg-blue-500/10 text-blue-500 py-1 px-3 rounded-full text-sm hover:bg-blue-500/20 
                                hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition-all
                            '>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            <div className='flex justify-between items-center'>
                                <a href="https://github.com/KailashRajkumar/Netflix-Clone" className='flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors my-4'>
                                    {" "}
                                    View Project <FaLongArrowAltRight />{" "}
                                </a>
                            </div>
                        </div>
                        {/* Project-3 */}
                        <div className='p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition'>
                            <h3 className='text-xl font-bold mb-2'>Dynamic Chart Visualization</h3>
                            <p className='text-gray-400 mb-4'>
                                Developed a Chart Visualization project using React.js, Bootstrap, and Chart.js with user authentication. Features interactive Doughnut and PolarArea charts for school and college data, plus a Dynamic List with search functionality.
                            </p>
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {["React", "Bootstrap", "Chart.js", "MongoDB"].map((tech, key) => (
                                    <span
                                        key={key}
                                        className='bg-blue-500/10 text-blue-500 py-1 px-3 rounded-full text-sm hover:bg-blue-500/20 
                                hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition-all
                            '>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            <div className='flex justify-between items-center'>
                                <a href="https://github.com/KailashRajkumar/Dynamic-Chart-Visualization" className='flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors my-4'>
                                    {" "}
                                    View Project <FaLongArrowAltRight />{" "}
                                </a>
                            </div>
                        </div>
                        {/* Project-4 */}
                        <div className='p-6 rounded-xl border border-white/10 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition'>
                            <h3 className='text-xl font-bold mb-2'>Online Shopping Cart</h3>
                            <p className='text-gray-400 mb-4'>
                                Responsive shopping cart with Redux state management, local storage for user data, and dynamic product listing from FakeStore API.
                            </p>
                            <div className='flex flex-wrap gap-2 mb-4'>
                                {["React", "Redux", "Bootstrap", "Fakestore API"].map((tech, key) => (
                                    <span
                                        key={key}
                                        className='bg-blue-500/10 text-blue-500 py-1 px-3 rounded-full text-sm hover:bg-blue-500/20 
                                hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition-all
                            '>
                                        {tech}
                                    </span>
                                ))}
                            </div>
                            <div className='flex justify-between items-center'>
                                <a href="https://online-shopping-application.netlify.app/" className='flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors my-4'>
                                    {" "}
                                    View Project <FaLongArrowAltRight />{" "}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </RevealOnScroll>
        </section>
    )
}

export default Project