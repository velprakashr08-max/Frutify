import{useEffect,useState} from 'react';
import {useLocation} from 'react-router-dom';
export default function PageTransition({children}) {
  const location=useLocation();
  const [show,setShow]=useState(false);
  useEffect(()=>{
    setShow(false);
    const t =requestAnimationFrame(()=>setShow(true));
    return ()=>cancelAnimationFrame(t);
  },[location.pathname]);
  return (
    <div
      className={`transition-all duration-400 ease-out ${
        show ?'opacity-100 translate-y-0':'opacity-0 translate-y-3'
      }`}>
      {children}
    </div>
  );
}