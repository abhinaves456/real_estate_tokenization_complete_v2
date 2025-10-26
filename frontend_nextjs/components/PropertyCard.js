import Link from "next/link";
export default function PropertyCard({p, id}){
  const value = p.attributes?.find(a=>a.trait_type==="Property Value (INR)")?.value || "N/A";
  const location = p.attributes?.find(a=>a.trait_type==="Location")?.value || "";
  return (
    <div style={{border:"1px solid #ddd",padding:12,borderRadius:8}}>
      <h3>{p.name}</h3>
      <p>{location}</p>
      <p>Value: ₹{value}</p>
      <Link href={`/property/${id}`}><a>View</a></Link>
    </div>
  );
}