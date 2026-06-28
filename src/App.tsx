import { useState } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import LeadsPage from './pages/LeadsPage'
import CalcHub from './pages/CalcHub'
import ContractsHub from './pages/ContractsHub'
import YieldCalc from './pages/YieldCalc'
import MortgageCalc from './pages/MortgageCalc'
import EquityCalc from './pages/EquityCalc'
import PropertyValueCalc from './pages/PropertyValueCalc'
import TaxCalc from './pages/TaxCalc'
import RentalContract from './pages/RentalContract'
import SaleContract from './pages/SaleContract'

export type Page =
  | 'home'
  | 'leads'
  | 'calcs-hub'
  | 'contracts-hub'
  | 'yield'
  | 'mortgage'
  | 'equity'
  | 'property-value'
  | 'tax'
  | 'rental-contract'
  | 'sale-contract'

export default function App() {
  const [page, setPage] = useState<Page>('home')

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home onNavigate={setPage} />
      case 'leads': return <LeadsPage />
      case 'calcs-hub': return <CalcHub onNavigate={setPage} />
      case 'contracts-hub': return <ContractsHub onNavigate={setPage} />
      case 'yield': return <YieldCalc />
      case 'mortgage': return <MortgageCalc />
      case 'equity': return <EquityCalc />
      case 'property-value': return <PropertyValueCalc />
      case 'tax': return <TaxCalc />
      case 'rental-contract': return <RentalContract />
      case 'sale-contract': return <SaleContract />
      default: return <Home onNavigate={setPage} />
    }
  }

  return (
    <Layout currentPage={page} onNavigate={setPage}>
      {renderPage()}
    </Layout>
  )
}
