import Footer from "./components/footer";
import Navbar from "./components/navbar";
import Playground from "./components/simulation";

const App = () => {
  return (
    <main className="flex h-screen flex-col">
      <div className="flex-none">
        <Navbar />
      </div>
      <div className="flex-grow">
        <Playground />
      </div>
      <div className="flex-none">
        <Footer />
      </div>
    </main>
  );
};

export default App;
