import { useEffect, useState } from "react";
import Header from "../components/Header";
import PropertyCard from "../components/PropertyCard";

export default function Home(){
  const [properties,setProperties] = useState([]);
  useEffect(()=>{
    fetch('/api/properties').then(r=>r.json()).then(setProperties).catch(()=>setProperties([]));
  },[]);
  return (
    <div>
      <Header/>
      <main style={{padding:20}}>
        <h1>Properties</h1>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16}}>
          {properties.map((p,i)=>(<PropertyCard key={i} p={p} id={i+1}/>))}
        </div>
      </main>
    </div>
  );
}