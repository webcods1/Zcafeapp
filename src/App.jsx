import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import ZCafeApp from "./pages/Index.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<ZCafeApp />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
