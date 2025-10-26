import Header from "../components/Header";
import KYCStatus from "../components/KYCStatus";
export default function KYCPage(){
  return (
    <div>
      <Header/>
      <main style={{padding:20}}>
        <h1>KYC & Investor Dashboard (Demo)</h1>
        <KYCStatus/>
      </main>
    </div>
  );
}