import { Routes, Route } from 'react-router-dom';
import Heder from "./header/header";
import Face from "./face/face";
import Footer from "./footer/footer";
import SignIn from './SignIn/Sign-In';
import SignUp from './SignUp/SignUp';

function App() {
  return (
    <div>
      <Heder />
      <Routes>
        <Route path="/" element={
          <>
            <Face />
            <Footer />
          </>
        } />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  );
}

export default App;