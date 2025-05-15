import React, { useState, useEffect } from 'react';
import InvoiceDashboard from './components/InvoiceDashboard';
import InvoiceFilter from './components/InvoiceFilter';
import CreateInvoice from './components/CreateInvoice';
import './App.css';

function App() {
  const [showFilter, setShowFilter] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [invoices, setInvoices] = useState([]);
  const [editingInvoice, setEditingInvoice] = useState(null);

  // Load invoices from localStorage when app starts
  useEffect(() => {
    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      try {
        const parsed = JSON.parse(savedInvoices);
        setInvoices(parsed);
      } catch (error) {
        console.error('Error loading saved invoices:', error);
      }
    }
  }, []);

  const handleFilterApply = (filters) => {
    setShowFilter(false);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowCreateInvoice(true);
  };

  // Add delete invoice handler
  const handleDeleteInvoice = (invoiceId) => {
    console.log(`[App handleDeleteInvoice] Deleting invoice with ID: ${invoiceId}`);
    const updatedInvoices = invoices.filter(invoice => invoice.id !== invoiceId);
    setInvoices(updatedInvoices);
    
    // Update localStorage
    try {
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      console.log('[App handleDeleteInvoice] LocalStorage updated successfully');
    } catch (error) {
      console.error('[App handleDeleteInvoice] Error updating localStorage:', error);
    }
  };

  // Add cancel invoice handler
  const handleCancelInvoice = (invoiceId) => {
    console.log(`[App handleCancelInvoice] Cancelling invoice with ID: ${invoiceId}`);
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === invoiceId ? {...invoice, status: 'cancelled'} : invoice
    );
    setInvoices(updatedInvoices);
    
    // Update localStorage
    try {
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      console.log('[App handleCancelInvoice] LocalStorage updated successfully');
    } catch (error) {
      console.error('[App handleCancelInvoice] Error updating localStorage:', error);
    }
  };

  // Add duplicate invoice handler
  const handleDuplicateInvoice = (invoice) => {
    console.log(`[App handleDuplicateInvoice] Duplicating invoice with ID: ${invoice.id}`);
    
    // Create a new invoice based on the existing one, with a new ID
    const newInvoice = {
      ...invoice,
      id: Date.now(),
      number: `${invoice.number}-copy`,
      date: new Date().toLocaleDateString('en-IN'),
      status: 'unpaid'
    };
    
    const updatedInvoices = [...invoices, newInvoice];
    setInvoices(updatedInvoices);
    
    // Update localStorage
    try {
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      console.log('[App handleDuplicateInvoice] LocalStorage updated successfully');
    } catch (error) {
      console.error('[App handleDuplicateInvoice] Error updating localStorage:', error);
    }
  };
  
  // Add edit invoice handler
  const handleEditInvoice = (invoice) => {
    console.log(`[App handleEditInvoice] Editing invoice with ID: ${invoice.id}`);
    setEditingInvoice(invoice);
    setShowCreateInvoice(true);
  };

  // Add status update handler
  const handleUpdateStatus = (invoiceId, status) => {
    console.log(`[App handleUpdateStatus] Updating status for invoice ID: ${invoiceId} to ${status}`);
    const updatedInvoices = invoices.map(invoice => 
      invoice.id === invoiceId ? {...invoice, status} : invoice
    );
    setInvoices(updatedInvoices);
    
    // Update localStorage
    try {
      localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      console.log('[App handleUpdateStatus] LocalStorage updated successfully');
    } catch (error) {
      console.error('[App handleUpdateStatus] Error updating localStorage:', error);
    }
  };

  // Email and reminder handlers (mock functionality)
  const handleSendEmail = (invoiceId) => {
    console.log(`[App handleSendEmail] Would send email for invoice ID: ${invoiceId}`);
    alert(`Email would be sent for invoice ${invoiceId} in a real application`);
  };
  
  const handleSendReminder = (invoiceId) => {
    console.log(`[App handleSendReminder] Would send reminder for invoice ID: ${invoiceId}`);
    alert(`Payment reminder would be sent for invoice ${invoiceId} in a real application`);
  };

  const handleSaveInvoice = (invoiceData) => {
    if (editingInvoice) {
      // Update existing invoice
      const updatedInvoices = invoices.map(invoice => 
        invoice.id === editingInvoice.id ? 
          {...invoice, ...invoiceData, id: editingInvoice.id} : 
          invoice
      );
      setInvoices(updatedInvoices);
      
      // Update localStorage
      try {
        localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      } catch (error) {
        console.error('Error saving invoices:', error);
      }
    } else {
      // Create new invoice
      const newInvoice = {
        id: Date.now(),
        type: invoiceData.invoiceType || 'tax-invoice',
        amount: invoiceData.amount || 0,
        number: invoiceData.invoiceNo || String(invoices.length + 1),
        date: invoiceData.date || new Date().toLocaleDateString('en-IN'),
        status: 'unpaid',
        buyerData: invoiceData.selectedBuyer || {},
        supplierData: invoiceData.supplierData || {},
        products: invoiceData.products || [],
        transportData: invoiceData.transportData || {},
        otherData: invoiceData.otherData || {},
        bankData: invoiceData.bankData || {}
      };

      const updatedInvoices = [...invoices, newInvoice];
      setInvoices(updatedInvoices);
      
      // Save to localStorage
      try {
        localStorage.setItem('invoices', JSON.stringify(updatedInvoices));
      } catch (error) {
        console.error('Error saving invoices:', error);
      }
    }
    
    setShowCreateInvoice(false);
    setEditingInvoice(null);
  };

  return (
    <div className="app">
      {!showCreateInvoice && (
        <InvoiceDashboard 
          onFilterClick={() => setShowFilter(true)}
          onTabChange={handleTabChange}
          activeTab={activeTab}
          onCreateInvoice={handleCreateInvoice}
          invoices={invoices}
          onDeleteInvoice={handleDeleteInvoice}
          onCancelInvoice={handleCancelInvoice}
          onDuplicateInvoice={handleDuplicateInvoice}
          onEditInvoice={handleEditInvoice}
          onUpdateStatus={handleUpdateStatus}
          onSendEmail={handleSendEmail}
          onSendReminder={handleSendReminder}
        />
      )}
      
      {showFilter && (
        <InvoiceFilter
          onClose={() => setShowFilter(false)}
          onApply={handleFilterApply}
        />
      )}

      {showCreateInvoice && (
        <CreateInvoice
          onClose={() => {
            setShowCreateInvoice(false);
            setEditingInvoice(null);
          }}
          onSave={handleSaveInvoice}
          initialInvoiceData={editingInvoice}
        />
      )}
    </div>
  );
}

export default App;
