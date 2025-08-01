import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScoreCircle'
import { usePuterStore } from '~/lib/puter';

const ResumeCart = ({ resume: { id, companyName, jobTitle, feedback, imagePath } }: { resume: Resume }) => {

    const { fs } = usePuterStore();
    const [resumeURL, setResumeURL] = useState('');

    useEffect(() => {
        const loadResume = async () => {
            const blob = await fs.read(imagePath);
            if (!blob) return;

            const url = URL.createObjectURL(blob);
            setResumeURL(url)
        }

        loadResume();
    }, [imagePath])

    return (

        <Link to={`resume/${id}`} className='resume-card animate-in fade-in duration-1000'>
            <div className='resume-card-header'>
                <div className='flex flex-col gap-2'>
                    {companyName && <h2 className='!text-black font-bold break-words'>{companyName}</h2>}
                    {jobTitle && <h3 className='text-sm md:text-lg break-words text-gray-500'>{jobTitle}</h3>}
                    {!companyName && !jobTitle && <p className='text-black font-bold'>Resume</p>}
                </div>

                <div className='flex-shrink-0'>
                    <ScoreCircle score={feedback.overallScore} />
                </div>
            </div>

            {
                resumeURL && <div className=' gradient-border animate-in fade-in duration-1000'>
                    <div className='w-full h-full'>
                        <img src={resumeURL} className='w-full h-[350px] max-sm:h-[200px] bg-cover object-top' alt="resume" />
                    </div>
                </div>
            }
        </Link>
    )
}

export default ResumeCart