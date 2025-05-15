import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiPlus, FiFilter, FiMoreVertical } from 'react-icons/fi';
import { BsCashStack } from 'react-icons/bs';
import DottedArrow from './DottedArrow';
import InvoiceTemplate from './InvoiceTemplate';
import ReactDOM from 'react-dom/client';
// Import as a fallback
import html2pdfLib from 'html2pdf.js';
import './InvoiceDashboard.css';

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount).replace('₹', '₹ ');
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');
};

const InvoiceDashboard = (props) => {
  // Destructure necessary props *after* logging or receiving
  // Keep onDeleteInvoice accessed via props for now
  const {
    onFilterClick, 
    onTabChange, 
    activeTab, 
    onCreateInvoice, 
    invoices, 
    onEditInvoice, 
    // onDeleteInvoice, // Access via props.onDeleteInvoice
    onDuplicateInvoice, 
    onUpdateStatus,
    onSendEmail,
    onSendReminder,
    onCancelInvoice
  } = props;

  // Log the received invoices prop on every render
  console.log('[InvoiceDashboard Render] Received invoices prop:', invoices);
  console.log('[InvoiceDashboard Render] Full props received:', props); // Log all props

  const [searchQuery, setSearchQuery] = useState('');
  const invoiceTemplateRef = useRef(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'e-invoices', label: 'E-Invoices' },
    { id: 'bill-of-supply', label: 'Bill Of Supply' },
  ];

  const handleTabClick = (tabId) => {
    // Use props.onTabChange if not destructured
    if (props.onTabChange) {
      props.onTabChange(tabId);
    }
  };

  const handleInvoiceClick = async (invoice) => {
    // Only handle click if we're in the "all" tab
    if (activeTab !== 'all') return;

    let tempDiv = null;
    try {
      // Create a temporary div to render the invoice
      tempDiv = document.createElement('div');
      document.body.appendChild(tempDiv);

      // Create a promise to wait for the content to be rendered
      const renderPromise = new Promise(resolve => {
        const root = ReactDOM.createRoot(tempDiv);
        root.render(
          <React.StrictMode>
            <InvoiceTemplate 
              data={invoice} 
              bankData={invoice.bankData}
              ref={invoiceTemplateRef}
            />
          </React.StrictMode>
        );
        
        // Give time for the content to render
        setTimeout(resolve, 100);
      });

      await renderPromise;

      // Generate PDF
      const element = tempDiv.firstChild;
      const opt = {
        margin: 10,
        filename: `Invoice-${invoice.number || '1'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Use window.html2pdf if available, otherwise use imported library
      const html2pdf = window.html2pdf || html2pdfLib;
      const worker = html2pdf();
      // First set options, then pass element
      await worker.set(opt).from(element).save();
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF generation failed: ' + error.message);
    } finally {
      // Clean up
      if (tempDiv && document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    }
  };

  const handleEdit = (invoice) => {
    console.log(`Action: Edit Invoice ${invoice.id}`);
    // Use props.onEditInvoice if not destructured
    if (props.onEditInvoice) {
        props.onEditInvoice(invoice);
    }
    setOpenMenuId(null);
  };

  const handleSendEmail = (invoiceId) => {
    console.log(`Action: Send Email ${invoiceId}`);
    // Call the prop passed from App.js
    if (props.onSendEmail) {
      props.onSendEmail(invoiceId);
    }
    setOpenMenuId(null);
  };

  const handleSendReminder = (invoiceId) => {
    console.log(`Action: Send Reminder ${invoiceId}`);
    // Call the prop passed from App.js
    if (props.onSendReminder) {
      props.onSendReminder(invoiceId);
    }
    setOpenMenuId(null);
  };

  const handleDuplicatePdf = (invoiceId) => {
    console.log(`Action: Duplicate PDF ${invoiceId}`);
    setOpenMenuId(null);
  };

  const handleTriplicatePdf = (invoiceId) => {
    console.log(`Action: Triplicate PDF ${invoiceId}`);
    setOpenMenuId(null);
  };

  const handleCancel = (invoiceId) => {
    console.log(`Action: Cancel Invoice ${invoiceId}`);
    if (window.confirm('Are you sure you want to cancel this invoice? This cannot be undone.')) {
        // Use props.onCancelInvoice
        if (props.onCancelInvoice) {
            props.onCancelInvoice(invoiceId);
        }
    }
    setOpenMenuId(null);
  };

  const handleDelete = (invoiceId) => {
    console.log(`[InvoiceDashboard handleDelete] Action triggered for ID: ${invoiceId}`);
    if (window.confirm('Are you sure you want to permanently delete this invoice? This cannot be undone.')) {
      console.log(`[InvoiceDashboard handleDelete] Confirmed for ID: ${invoiceId}. Checking prop...`);
      // Log the specific prop from the props object
      console.log(`[InvoiceDashboard handleDelete] typeof props.onDeleteInvoice: ${typeof props.onDeleteInvoice}`); 

      // Access via props.onDeleteInvoice
      if (props.onDeleteInvoice && typeof props.onDeleteInvoice === 'function') {
        console.log('[InvoiceDashboard handleDelete] Calling props.onDeleteInvoice...');
        try {
          props.onDeleteInvoice(invoiceId);
          console.log('[InvoiceDashboard handleDelete] props.onDeleteInvoice called successfully.');
        } catch (error) {
          console.error('[InvoiceDashboard handleDelete] Error calling props.onDeleteInvoice:', error);
        }
      } else {
        console.error(`[InvoiceDashboard handleDelete] props.onDeleteInvoice is MISSING or not a function! Type: ${typeof props.onDeleteInvoice}`);
      }
    } else {
      console.log(`[InvoiceDashboard handleDelete] Deletion cancelled by user for ID: ${invoiceId}`);
    }
    setOpenMenuId(null);
  };

  const handleDuplicate = (invoice) => {
    console.log(`Action: Duplicate Invoice ${invoice.id}`);
    // Use props.onDuplicateInvoice
    if (props.onDuplicateInvoice) {
      props.onDuplicateInvoice(invoice);
    }
    setOpenMenuId(null);
  };
  
  const handleViewHistory = (invoiceId) => {
    console.log(`Action: View History ${invoiceId}`);
    setOpenMenuId(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && menuRef.current && !menuRef.current.contains(event.target) && !event.target.closest('.more-options-button')) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openMenuId]);

  const filteredInvoices = invoices.filter(invoice => {
    if (activeTab === 'all') {
      return true;
    } else if (activeTab === 'bill-of-supply') {
      return invoice.type === 'bill-of-supply';
    } else if (activeTab === 'e-invoices') {
      return invoice.type === 'e-invoice';
    }
    return false;
  });

  const getInvoiceTitle = (invoice) => {
    if (invoice.selectedBuyer?.companyName) {
      return invoice.selectedBuyer.companyName;
    }
    return invoice.type === 'bill-of-supply' ? 'Bill of Supply' : 'Cash Sale';
  };

  return (
    <div className="invoice-dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <button className="back-button">←</button>
          <h1>Invoices</h1>
        </div>
        <button className="create-new-button" onClick={props.onCreateInvoice}>
          <FiPlus /> Create New
        </button>
      </header>

      <div className="search-bar">
        <div className="search-input">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-button" onClick={props.onFilterClick}>
          <FiFilter />
        </button>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${props.activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredInvoices.length === 0 ? (
        <div className="empty-state">
          <div className="empty-illustration">
            {/* Empty state illustration */}
          </div>
          <h2>Create your first Invoice</h2>
          <DottedArrow />
          <button className="create-invoice-button" onClick={props.onCreateInvoice}>
            <FiPlus /> Create Invoice
          </button>
        </div>
      ) : (
        <div className="invoice-list">
          {filteredInvoices.map((invoice) => (
            <div 
              key={invoice.id} 
              className="invoice-card"
            >
              <div className="invoice-main" onClick={() => handleInvoiceClick(invoice)} style={{ cursor: activeTab === 'all' ? 'pointer' : 'default' }}>
                <div className="invoice-title">
                  <h3>{getInvoiceTitle(invoice)}</h3>
                  <span className="amount">{formatAmount(invoice.amount)}</span>
                </div>
                <div className="invoice-details">
                  <div className="invoice-number">{invoice.number || invoice.id}</div>
                  <div className="invoice-date">{formatDate(invoice.date)}</div>
                </div>
                <div className="invoice-status">
                  <span className={`status ${(invoice.status || 'Unpaid').toLowerCase()}`}>
                    {invoice.status || 'Unpaid'}
                  </span>
                </div>
              </div>

              <div className="invoice-actions">
                <button className="record-payment">
                  <BsCashStack /> Record Payment
                </button>
                <div className="more-options-container">
                  <button
                    className="more-options-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === invoice.id ? null : invoice.id);
                    }}
                  >
                    <FiMoreVertical />
                  </button>
                  {openMenuId === invoice.id && (
                    <div className="invoice-action-menu" ref={menuRef}>
                      <ul>
                        <li onClick={(e) => { e.stopPropagation(); handleEdit(invoice); }}>Edit Invoice</li>
                        <li onClick={(e) => { e.stopPropagation(); handleSendEmail(invoice.id); }}>Send Email</li>
                        <li onClick={(e) => { e.stopPropagation(); handleSendReminder(invoice.id); }}>Send Reminder</li>
                        <li onClick={(e) => { e.stopPropagation(); handleDuplicatePdf(invoice.id); }}>Duplicate PDF</li>
                        <li onClick={(e) => { e.stopPropagation(); handleTriplicatePdf(invoice.id); }}>Triplicate PDF</li>
                        <li onClick={(e) => { e.stopPropagation(); handleCancel(invoice.id); }} className="action-cancel">Cancel Invoice</li>
                        <li onClick={(e) => { e.stopPropagation(); handleDelete(invoice.id); }} className="action-delete">Delete Invoice</li>
                        <li onClick={(e) => { e.stopPropagation(); handleDuplicate(invoice); }}>Duplicate Invoice</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvoiceDashboard; 
