import React, { useState, useEffect } from 'react';
import InvoiceDashboard from './components/InvoiceDashboard';
import CreateInvoice from './components/CreateInvoice';
import './App.css'; // Optional: Add global styles if needed

const INVOICES_STORAGE_KEY = 'invoiceApp_allInvoices'; // Use a consistent key

function App() {
  const [invoices, setInvoices] = useState(() => {
    try {
      const savedInvoices = localStorage.getItem(INVOICES_STORAGE_KEY);
      return savedInvoices ? JSON.parse(savedInvoices) : [];
    } catch (error) {
      console.error("Error loading invoices from localStorage:", error);
      return [];
    }
  });

  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'create'
  const [editingInvoice, setEditingInvoice] = useState(null); // Store invoice data for editing/duplicating

  // Save invoices to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(invoices));
      console.log('[App Effect] Invoices saved to localStorage.');
    } catch (error) {
      console.error("Error saving invoices to localStorage:", error);
    }
  }, [invoices]);

  // --- Handler Functions for InvoiceDashboard Actions ---

  const handleDeleteInvoice = (invoiceIdToDelete) => {
    console.log(`[App handleDelete] Attempting to delete invoice ID: ${invoiceIdToDelete}`);
    console.log('[App handleDelete] Invoices BEFORE delete:', invoices);
    setInvoices(prevInvoices => {
      const updatedInvoices = prevInvoices.filter(inv => inv.id !== invoiceIdToDelete);
      console.log('[App handleDelete] Invoices AFTER filter (inside setter):', updatedInvoices);
      return updatedInvoices;
    });
    // Note: Logging 'invoices' immediately after setInvoices might show the old state 
    // due to asynchronous nature. The useEffect log is more reliable for final state.
  };

  const handleUpdateInvoiceStatus = (invoiceId, newStatus) => {
    console.log('[App] Updating status for invoice:', invoiceId, 'to', newStatus);
    setInvoices(prevInvoices =>
      prevInvoices.map(inv =>
        inv.id === invoiceId ? { ...inv, status: newStatus } : inv
      )
    );
  };

  const handleEditInvoice = (invoiceToEdit) => {
    console.log('[App] Setting invoice to edit:', invoiceToEdit);
    setEditingInvoice(invoiceToEdit); 
    setActiveView('create');
  };

  const handleDuplicateInvoice = (invoiceToDuplicate) => {
    console.log('[App] Preparing to duplicate invoice:', invoiceToDuplicate.id);
    const newInvoiceData = {
      ...invoiceToDuplicate,
      id: null, // Remove ID to generate a new one on save
      date: '', 
      number: '', 
      prefix: '', // Assuming prefix exists, clear it too
      status: 'Unpaid', // Reset status
      // Clear any other fields that shouldn't be copied (e.g., payment details)
    };
    console.log('[App] Setting duplicated data for create form:', newInvoiceData);
    setEditingInvoice(newInvoiceData); 
    setActiveView('create');
  };

  // --- Handler Functions for CreateInvoice View ---

  const handleShowCreateInvoice = () => {
    console.log('[App] Showing create invoice screen (new).');
    setEditingInvoice(null); // Ensure no initial data for new invoice
    setActiveView('create');
  };

  const handleSaveInvoice = (invoiceDataFromForm) => {
    console.log('[App] Attempting to save invoice:', invoiceDataFromForm);
    setInvoices(prevInvoices => {
      if (invoiceDataFromForm.id) {
        // Editing existing invoice
        console.log('[App] Updating existing invoice:', invoiceDataFromForm.id);
        return prevInvoices.map(inv =>
          inv.id === invoiceDataFromForm.id ? { ...inv, ...invoiceDataFromForm } : inv // Merge updates
        );
      } else {
        // Adding new invoice
        const newInvoiceWithDefaults = {
          ...invoiceDataFromForm,
          id: Date.now(), // Generate unique ID
          status: 'Unpaid' // Set default status
        };
        console.log('[App] Adding new invoice:', newInvoiceWithDefaults);
        return [...prevInvoices, newInvoiceWithDefaults];
      }
    });
    setActiveView('dashboard'); // Go back to dashboard
    setEditingInvoice(null); // Clear editing state
  };

  const handleCloseCreateInvoice = () => {
    console.log('[App] Closing create invoice screen.');
    setActiveView('dashboard');
    setEditingInvoice(null); // Clear editing state
  };

  // --- Render Logic ---

  console.log(`[App Render] Active view: ${activeView}, Editing Invoice ID: ${editingInvoice?.id}`);

  // Log the type of handleDeleteInvoice right before rendering the dashboard
  if (activeView === 'dashboard') {
    console.log('[App Render] About to render Dashboard. Type of handleDeleteInvoice:', typeof handleDeleteInvoice);
  }

  return (
    <div className="App">
      {activeView === 'dashboard' && (
        <InvoiceDashboard
          invoices={invoices}
          onCreateInvoice={handleShowCreateInvoice}
          // Pass down the action handlers
          onEditInvoice={handleEditInvoice}
          onDeleteInvoice={handleDeleteInvoice}
          onDuplicateInvoice={handleDuplicateInvoice}
          onUpdateStatus={handleUpdateInvoiceStatus}
          // Add dummy props for now if needed by InvoiceDashboard
          activeTab={'all'} 
          onTabChange={(tabId) => console.log('[App] Tab changed:', tabId)}
          onFilterClick={() => console.log('[App] Filter clicked')} 
        />
      )}
      {activeView === 'create' && (
        <CreateInvoice
          onClose={handleCloseCreateInvoice}
          onSave={handleSaveInvoice}
          // Pass initial data for editing/duplicating
          // Note: CreateInvoice needs to handle this prop correctly
          initialInvoiceData={editingInvoice} 
        />
      )}
    </div>
  );
}

export default App; 