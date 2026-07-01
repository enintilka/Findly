import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import RequestBrowse from "@/components/requests/RequestBrowse";

export default function BrowsePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-white">
        <RequestBrowse />
      </main>
      <Footer />
    </>
  );
}
