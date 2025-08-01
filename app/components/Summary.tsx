import React from 'react'
import ScoreGuage from './ScoreGuage'
import ScoreBadge from './ScoreBadge';

const Category = ({ title, score }: { title: string, score: number }) => {

    const textColor = score > 70 ? 'text-green-600' : score > 49 ? 'text-yellow-600' : 'text-red-600';

    return (
        <div className='resume-summary'>
            <div className='category'>
                <div className=' flex flex-row gap-2 justify-center items-center'>
                    <p className=' text-2xl'>{title}</p>
                    <ScoreBadge score={score}/>
                </div>
                <p className='text-2xl'>
                    <span className={textColor}>{score}</span>/100
                </p>
            </div>
        </div>
    )
}

const Summary = ({ feedback }: { feedback: Feedback }) => {
    return (
        <div className='bg-white w-full rounded-2xl shadow-md'>
            <div className='flex flex-row items-center gap-6 p-4'>
                <ScoreGuage score={feedback.overallScore} />
                <div className='flex flex-col gap-2'>
                    <h2 className='text-2xl font-bold text-black'>Your Resume Score</h2>
                    <p className=' text-sm text-gray-700'>This score is calculated based on the variables listed below</p>
                </div>
            </div>

            <Category title='Ton & Style' score={feedback.toneAndStyle.score} />
            <Category title='Content' score={feedback.content.score} />
            <Category title='Structure' score={feedback.structure.score} />
            <Category title='Skills' score={feedback.skills.score} />
        </div>
    )
}

export default Summary