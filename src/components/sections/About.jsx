import React from 'react'
import { FcBriefcase, FcLibrary } from 'react-icons/fc';
import AOS from '../AnimationOnScroll';

const About = () => {
    const frontendSkills = [
        "HTML",
        "CSS",
        "React",
        "JavaScript",
        "Bootstrap",
        "TailwindCSS"
    ];
    const backendSkills = [
        "Node.js",
        "MongoDB",
    ];
    return (
        <section id='about' className='min-h-screen flex items-center justify-center py-20'>
            <AOS animation='' delay={0} duration={1000}>

                <div className='max-w-3xl mx-auto px-4'>
                    <h2 className='text-3xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent text-center'>
                        {" "}
                        About Me
                    </h2>

                    <div className='rounded-xl p-8 border-white/10 border hover:-translate-y-1 transition-all'>
                        <p className='text-gray-300 mb-6'>
                            Passionate UI Developer focused on building responsive and user-friendly interfaces.
                            Dedicated to crafting clean, scalable, and seamless web experiences.
                        </p>

                        {/* Skills */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='rounded-xl p-6 hover:-translate-y-1 transition-all'>
                                <h3 className='text-xl font-bold mb-4'>Frontend</h3>
                                <div className='flex flex-wrap gap-2'>
                                    {frontendSkills.map((tech, key) => (
                                        <span
                                            key={key}
                                            className='bg-blue-500/10 text-blue-500 py-1 px-3 rounded-full text-sm hover:bg-blue-500/20 
                                    hover:shadow-[0_2px_8px_rgba(59,130,246,0.2)] transition
                                    '>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className='rounded-xl p-6 hover:-translate-y-1 transition-all'>
                                <h3 className='text-xl font-bold mb-4'>Backend</h3>
                                <div className='flex flex-wrap gap-2'>
                                    {backendSkills.map((tech, key) => (
                                        <span
                                            key={key}
                                            className='bg-blue-500/10 text-blue-500 py-1 px-3 rounded-full text-sm hover:bg-blue-500/20 
                                    hover:shadow-[0_2px_8px_rgba(59,130,2246,0.1)] transition
                                    '>
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Education */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
                        <div className='p-6 rounded-xl border-white/10 border hover:-translate-y-1 transition-all'>
                            <h3 className='text-xl font-bold mb-4 flex items-center gap-1'> <FcLibrary /> Education</h3>
                            <ul className='list-disc list-inside text-gray-300 space-y-3'>
                                <li>
                                    <strong>Master's in Computer Science</strong> - Hindustan College Of Arts And Science,
                                    (2019-2021)
                                </li>
                                <li>
                                    <strong>Bachelor of Computer Science </strong> - Valluavar College Of Science And Management,
                                    (2016-2019)
                                </li>
                                <li>
                                    <strong>Relevant Course</strong>: The Complete Front-End Development, React JS, Every Thing About Database...
                                </li>
                            </ul>
                        </div>

                        {/* Experience */}
                        <div className='p-6 rounded-xl border-white/10 border hover:-translate-y-1 transition-all'>
                            <h3 className='text-xl font-bold mb-4 flex items-center gap-1'> <FcBriefcase />Experience</h3>
                            <div className='space-y-4 text-gray-300'>
                                <div>
                                    <h4 className='font-semibold'>
                                        {" "}
                                        Software Developer Intern at Tripalive.me (Oct 2023 - Mar 2024) {" "}
                                    </h4>
                                    <p>
                                        Assisted in company projects, focusing on UI development
                                        with React.js, Bootstrap 5, Material UI,
                                        and minor REST API integration.
                                    </p>
                                </div>
                                <div>
                                    <h4 className='font-semibold'>
                                        {" "}
                                        Engineering Intern at Skill Lync (Nov 2022 - Feb 2023) {" "}
                                    </h4>
                                    <p>
                                        Built sample projects like an E-commerce website, Netflix clone,
                                        To-Do List, and Weather App, focusing on UI components.
                                        Reported progress daily and improved my React.js skills.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AOS>
        </section >
    )
}

export default About