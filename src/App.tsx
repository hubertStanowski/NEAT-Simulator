import Footer from "./components/footer";
import Navbar from "./components/navbar";
import Playground from "./components/playground";

const App = () => {
  return (
    <main className="mx-auto flex h-screen max-w-[95rem] flex-col">
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
