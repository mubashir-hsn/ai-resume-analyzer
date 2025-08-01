import Navbar from "~/components/Navbar";
import type { Route } from "./+types/home";
import ResumeCart from "~/components/ResumeCart";
import { usePuterStore } from "~/lib/puter";
import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {

    const {auth,kv} = usePuterStore();
    const navigate = useNavigate();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loadingResume, setLoadingResume] = useState(false);

    useEffect(()=>{
      const loadResume = async()=>{
          setLoadingResume(true);

          const resumes = (await kv.list('resume:*',true)) as KVItem[] ;

          const parsedResume = resumes?.map((resume)=>(
            JSON.parse(resume.value) as Resume
          ));

          setResumes(parsedResume || []);
          setLoadingResume(false)
      };
      loadResume();
    },[])


    useEffect(()=>{
        if (!auth.isAuthenticated) {
            navigate('/auth?next=/');
        }
    },[auth.isAuthenticated])

  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />

    <section className="main-section">

      <div className="page-heading">
        <h1>Track your Application & Resume Ratings</h1>
        {
          !loadingResume && resumes.length ===0 ? (
            <h2>No resume found. Upload your first resume to get feedback.</h2>
          ):(
            <h2>Reviews your submission and check AI-Powered feedback.</h2>
          )
        }
      </div>

      {
        loadingResume && (
          <div className="flex flex-col justify-center items-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" alt="" />
          </div>
        )
      }
      
      {
         !loadingResume && resumes.length > 0 && (
          <div className="resumes-section max-w-full">
            {
              resumes.map((resume: Resume) => (
                <ResumeCart key={resume.id} resume={resume} />
              ))
            }

          </div>
        )
      }

      {
        !loadingResume && resumes.length === 0 && (
          <div className=" flex flex-col items-center justify-center gap-4 mt-8">
            <Link to={'/upload'} className="primary-button text-xl w-fit font-semibold">Upload Resume</Link>
          </div>
        )
      }
    </section>

   



  </main>;
}
