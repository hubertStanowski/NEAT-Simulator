import Footer from './components/Footer';
import { Navbar } from './components/navbar';
import { Playground } from './components/simulation';
import { SimulationProvider } from './contexts';

const App = () => {
  return (
    <SimulationProvider>
      <div className="bg-black-100 flex min-h-screen w-full items-center justify-center">
        <main className="flex h-screen max-h-[1500px] w-full max-w-[2000px] flex-col">
          <div className="flex-none">
            <Navbar />
          </div>
          <div className="grow overflow-hidden">
            <Playground />
          </div>
          <div className="flex-none">
            <Footer />
          </div>
        </main>
      </div>
    </SimulationProvider>
  );
};

export default App;
