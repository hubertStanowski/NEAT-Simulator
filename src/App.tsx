import Footer from "./components/footer";
import Navbar from "./components/navbar";
import Playground from "./components/simulation";
import { SimulationProvider } from "./contexts/SimulationContext";

const App = () => {
  return (
    <main className="flex h-screen flex-col">
      <div className="flex-none">
        <Navbar />
      </div>
      <div className="flex-grow">
        <SimulationProvider>
          <Playground />
        </SimulationProvider>
      </div>
      <div className="flex-none">
        <Footer />
      </div>
    </main>
  );
};

export default App;
