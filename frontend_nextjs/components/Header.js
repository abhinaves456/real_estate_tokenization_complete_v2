export default function Header(){ 
  return (
    <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:16,borderBottom:"1px solid #eee"}}>
      <h2 style={{margin:0}}>Initialize — Real Estate Tokenization</h2>
      <nav>
        <a href="/" style={{marginRight:12}}>Home</a>
        <a href="/kyc">KYC</a>
      </nav>
    </header>
  );
}