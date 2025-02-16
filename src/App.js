import "./App.css";
import Main from "../src/components/pages/main";
import Footer from "../src/components/footer/footer";
function App() {
    return (
        <div className="h-screen flex flex-col justify-between">
            <div className="flex-grow">
                <Main />
            </div>
            <Footer />
        </div>
    );
}

export default App;
