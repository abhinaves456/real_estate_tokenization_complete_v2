import fs from "fs";
import path from "path";
import Header from "../../components/Header";
import MintWidget from "../../components/MintWidget";
import { readFileSync } from "fs";

export default function Property({property, id}){
  const contractAddr = process.env.NEXT_PUBLIC_FRACTIONAL_TOKEN || null;
  const contractAbi = null; // in demo, ABI not shipped to frontend
  return (
    <div>
      <Header/>
      <main style={{padding:20}}>
        <h1>{property.name}</h1>
        <p>{property.description}</p>
        <MintWidget propertyId={id} contractAddress={contractAddr} contractAbi={contractAbi} />
      </main>
    </div>
  );
}

export async function getServerSideProps(ctx){
  const id = ctx.params.id;
  const file = path.join(process.cwd(), "../metadata/indian_properties.json");
  let data = [];
  if (fs.existsSync(file)) data = JSON.parse(fs.readFileSync(file,'utf8'));
  const prop = data[parseInt(id)-1] || null;
  return { props: { property: prop, id } };
}