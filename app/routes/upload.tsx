import { prepareInstructions } from 'constants/index';
import React, { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
import { convertPdfToImage } from '~/lib/PdfToImg';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';

const upload = () => {
    const{ auth, isLoading, kv, fs, ai }= usePuterStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file , setFile] = useState<File|null>(null);
    const navigate = useNavigate();

    const handleFileSelect = (file:File | null)=>{
        setFile(file);
    }

    const handleAnalyze = async({companyName,jobTitle,jobDescription,file} : {companyName:string, jobTitle:string , jobDescription:string, file:File})=>{
       setIsProcessing(true);
       setStatusText('Uploading the file...');

       const uploadedFile = await fs.upload([file]);
       if (!uploadedFile) {
         return setStatusText("Error: Failed to upload the file.")
       }

       setStatusText("Converting to image...");

       const imageFile = await convertPdfToImage(file);

       if (!imageFile.file) {
         return setStatusText("Failed to convert PDF to image");
       }

       setStatusText("Uploading the image");

       const uploadedImage = await fs.upload([imageFile.file]);
       if (!uploadedImage) {
        return setStatusText("Error: Failed to upload the file.")
      }

      setStatusText('Preparing Data...');

      const uuid = generateUUID();

      const data = {
        id : uuid,
        resumePath : uploadedFile.path,
        imagePath: uploadedImage.path,
        companyName,jobTitle,jobDescription,
        feedback: ""
      }
     
      await kv.set(`resume:${uuid}`,JSON.stringify(data));

      setStatusText("Analyzing...");

      const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({jobTitle,jobDescription})
      );

      if (!feedback) {
        return setStatusText('Error: Failed to analyze resume.')
      }

      const feedbackText = typeof feedback.message.content === 'string' ? feedback.message.content : feedback.message.content[0].text;
      try {
        data.feedback = JSON.parse(feedbackText);
      } catch (e) {
        console.error('Failed to parse feedback text:', feedbackText);
        return setStatusText("Failed to parse feedback.");
      }
      await kv.set(`resume:${uuid}`,JSON.stringify(data));
      const test = await kv.get(`resume:${uuid}`);
      console.log("Resume from KV after saving:", test);
      setStatusText('Analyzing complete, redirecting.')

      console.log("Data"+data);
    
      console.log("Navigating to resume:", uuid);
      navigate(`/resume/${uuid}`);

    }

    const handleSubmit = (e : FormEvent<HTMLFormElement> )=>{

        e.preventDefault();

        const form = e.currentTarget.closest('form');
        if (!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) return;
        
        handleAnalyze({companyName,jobTitle,jobDescription,file});
    }
    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-11">
                    <h1>Smart feedback for your dream job</h1>

                    {
                        isProcessing ? (
                            <div>
                                <h2>{statusText}</h2>
                                <img src="/images/resume-scan.gif" className='w-full -mt-28' alt="" />
                            </div>
                        ) : (
                            <h2>Drop your resume for an ATS score and improvement tips.</h2>
                        )
                    }

                    {
                        !isProcessing && (
                            <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-3 mt-6'>
                               <div className='form-div'>
                                 <label htmlFor="company-name" className='pl-1'>Company</label>
                                 <input type="text" name='company-name' id='company-name' placeholder='Company Name' />
                               </div>
                               <div className='form-div'>
                                 <label htmlFor="job-title" className='pl-1'>Job Title</label>
                                 <input type="text" name='job-title' id='job-title' placeholder='Job title' />
                               </div>
                               <div className='form-div'>
                                 <label htmlFor="job-description" className='pl-1'>Job Description</label>
                                 <textarea rows={5} name='job-description' id='job-description' placeholder='Job description' />
                               </div>
                               <div className='form-div'>
                                 <label htmlFor="uploader" className='pl-1'>Upload Resume</label>
                                 <FileUploader onFileSelect={handleFileSelect}/>
                               </div>

                               <button type='submit' className=' primary-button '>Analyze Resume</button>
                            </form>
                        )
                    }
                </div>


            </section>
        </main>
    )
}

export default upload