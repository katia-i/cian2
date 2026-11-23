import { Routes, Route } from 'react-router-dom';
import { AuctionPage } from './pages/AuctionPage';
import { ScenarioMapPage } from './pages/ScenarioMapPage';
import { UIKitPage } from './pages/UIKitPage';
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AuctionPage />} />
      <Route path="/map" element={<ScenarioMapPage />} />
      <Route path="/ui-kit" element={<UIKitPage prototype />} />
      <Route path="*" element={<AuctionPage />} />
    </Routes>
  );
}
