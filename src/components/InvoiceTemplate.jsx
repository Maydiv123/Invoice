import React, { forwardRef, useEffect } from 'react';
import './InvoiceTemplate.css';
import { numberToWords } from '../utils/numberToWords';
import { FiUser } from 'react-icons/fi';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).split('/').join('-');
};

const InvoiceTemplate = forwardRef(({ data = {}, bankData = null, forPDF = false }, ref) => {
  const {
    invoiceNumber = '',
    number = '',
    date = new Date(),
    products = [],
    supplierData = {},
    buyerData = {},
    selectedBuyer = {},
    transportData = {},
    otherDetails = {}
  } = data || {};

  // Use selectedBuyer if buyerData is not available
  const buyerInfo = buyerData && Object.keys(buyerData).length > 0 ? buyerData : selectedBuyer;

  // Debug logs
  console.log('InvoiceTemplate rendered with data:', data);
  console.log('InvoiceTemplate bank data:', bankData);
  
  // Add effect to log when component is fully mounted
  useEffect(() => {
    console.log('InvoiceTemplate mounted and ready');
    console.log('Products in template:', data?.products?.length || 0);
    console.log('Supplier data:', data?.supplierData);
    console.log('Buyer data:', data?.buyerData);
    console.log('Selected buyer:', data?.selectedBuyer);
    console.log('Buyer info (final):', buyerInfo);
    
    // Validate that crucial data exists
    if (!data?.products || data.products.length === 0) {
      console.warn('WARNING: No products in invoice data');
    }
    if (!data?.supplierData?.companyName) {
      console.warn('WARNING: No supplier company name');
    }
    if (!buyerInfo?.companyName) {
      console.warn('WARNING: No buyer company name');
    }
  }, [data, bankData, buyerInfo]);

  // Safe calculation helper
  const safeCalculate = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Calculate totals with safe values
  const totalQuantity = products.reduce((sum, product) => sum + safeCalculate(product?.quantity), 0);
  const subTotal = products.reduce((sum, product) => sum + (safeCalculate(product?.quantity) * safeCalculate(product?.salePrice)), 0);
  const totalGST = products.reduce((sum, product) => {
    const amount = safeCalculate(product?.quantity) * safeCalculate(product?.salePrice);
    const gstRate = safeCalculate(product?.gst);
    return sum + (amount * (gstRate / 100));
  }, 0);
  const grandTotal = subTotal + totalGST;

  // Additional styles for PDF rendering
  const pdfStyles = forPDF ? {
    wrapper: {
      width: '180mm',
      padding: '5mm',
      backgroundColor: 'white',
      color: 'black',
      fontFamily: 'Arial, sans-serif',
      fontSize: '9pt'
    },
    table: {
      width: '100%',
      tableLayout: 'fixed',
      fontSize: '7pt'
    },
    tableCell: {
      padding: '2px',
      whiteSpace: 'normal',
      wordWrap: 'break-word',
      overflow: 'visible'
    },
    pageBreakAvoid: {
      pageBreakInside: 'avoid'
    }
  } : {};

  return (
    <div className="invoice-template" ref={ref} style={pdfStyles.wrapper}>
      {/* Company Header */}
      <div className="company-header">
        <div className="company-logo">
          {supplierData?.logo && <img src={supplierData.logo} alt="Company Logo" />}
        </div>
        <div className="company-info">
          <h1>{supplierData?.name || supplierData?.companyName}</h1>
          <p>{supplierData?.address}</p>
          <p>{supplierData?.city}, {supplierData?.state} {supplierData?.pincode}</p>
          <p>Phone: {supplierData?.phone}</p>
          <p>Email: {supplierData?.email}</p>
          <p>GSTIN: {supplierData?.gstin} (State Code: {supplierData?.stateCode || '06'})</p>
        </div>
        <div className="greeting">
          <p>Thank you for doing business with us</p>
        </div>
      </div>

      {/* Invoice Title */}
      <div className="invoice-title">
        <h2>TAX INVOICE</h2>
        <div className="invoice-type-checkboxes">
          <div className="checkbox-item">
            <input type="checkbox" checked readOnly />
            <label>Original For Recipient</label>
          </div>
        </div>
      </div>

      {/* Invoice Details Box */}
      <div className="invoice-details-box">
        <div className="detail-right">
          <div className="detail-item">
            <span className="detail-label">Invoice Number:</span>
            <span className="detail-value">{invoiceNumber || number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Invoice Date:</span>
            <span className="detail-value">{formatDate(date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">State:</span>
            <span className="detail-value">{supplierData?.state}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Reverse Charge:</span>
            <span className="detail-value">{otherDetails?.reverseCharge ? 'YES' : 'NO'}</span>
          </div>
        </div>
      </div>

      {/* Party Details */}
      <div className="party-details">
        <div className="billed-to">
          <h3>Details of Receiver | Billed to</h3>
          <div className="party-info">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value buyer-name-container">
                <FiUser className="buyer-icon" />
                <span>{buyerInfo?.companyName}</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{buyerInfo?.address} {buyerInfo?.city}, {buyerInfo?.state}, {buyerInfo?.pincode}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">GSTIN:</span>
              <span className="detail-value gstin-container">
                <span>{buyerInfo?.gstin}</span>
                <span className="state-code-box">State Code: {buyerInfo?.stateCode || '09'}</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">State:</span>
              <span className="detail-value">{buyerInfo?.state}</span>
            </div>
          </div>
        </div>
        <div className="shipped-to">
          <h3>Details of Consignee | Shipped to</h3>
          <div className="party-info">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value buyer-name-container">
                <FiUser className="buyer-icon" />
                <span>{buyerInfo?.companyName}</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{buyerInfo?.address} {buyerInfo?.city}, {buyerInfo?.state}, {buyerInfo?.pincode}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">GSTIN:</span>
              <span className="detail-value gstin-container">
                <span>{buyerInfo?.gstin}</span>
                <span className="state-code-box">State Code: {buyerInfo?.stateCode || '09'}</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">State:</span>
              <span className="detail-value">{buyerInfo?.state}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <table className="product-table" style={pdfStyles.pageBreakAvoid}>
        <thead>
          <tr className="header-row">
            <th style={forPDF ? pdfStyles.tableCell : {}}>Sr. No.</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>Name of Product</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>HSN/SAC</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>QTY</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>Unit</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>Rate</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>Taxable Value</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>IGST Rate</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>IGST Amount</th>
            <th style={forPDF ? pdfStyles.tableCell : {}}>Total</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const quantity = safeCalculate(product?.quantity);
            const rate = safeCalculate(product?.salePrice);
            const amount = quantity * rate;
            const gstRate = safeCalculate(product?.gst);
            const gstAmount = (amount * gstRate) / 100;
            
            return (
              <tr key={index} className={index % 2 === 0 ? 'even-row' : ''}>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{index + 1}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{product?.name}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{product?.hsn}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{quantity}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{product?.unit}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{rate.toFixed(1)}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{amount.toFixed(2)}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{gstRate.toFixed(2)}%</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{gstAmount.toFixed(2)}</td>
                <td style={forPDF ? pdfStyles.tableCell : {}}>{(amount + gstAmount).toFixed(2)}</td>
              </tr>
            );
          })}
          <tr className="total-row">
            <td style={forPDF ? pdfStyles.tableCell : {}} colSpan="3">Total</td>
            <td style={forPDF ? pdfStyles.tableCell : {}}>{totalQuantity}</td>
            <td style={forPDF ? pdfStyles.tableCell : {}} colSpan="2"></td>
            <td style={forPDF ? pdfStyles.tableCell : {}}>₹{subTotal.toFixed(2)}</td>
            <td style={forPDF ? pdfStyles.tableCell : {}} colSpan="2"></td>
            <td style={forPDF ? pdfStyles.tableCell : {}}>₹{totalGST.toFixed(2)}</td>
            <td style={forPDF ? pdfStyles.tableCell : {}}>₹{grandTotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Amount Section */}
      <div className="amount-section" style={pdfStyles.pageBreakAvoid}>
        <div className="amount-in-words">
          <p>Total Invoice Amount in words: {numberToWords(grandTotal)} /-</p>
        </div>
        <div className="amount-breakdown">
          <div className="amount-item">
            <span>Total Amount Before Tax:</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>
          <div className="amount-item">
            <span>Add: IGST:</span>
            <span>₹{totalGST.toFixed(2)}</span>
          </div>
          <div className="amount-item">
            <span>Total Tax Amount:</span>
            <span>₹{totalGST.toFixed(2)}</span>
          </div>
          <div className="amount-item total">
            <span>Final Invoice Amount:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
          <div className="amount-item total">
            <span>Balance Due:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Bank Details and Terms */}
      <div className="footer-section" style={pdfStyles.pageBreakAvoid}>
        <div className="bank-details">
          {bankData && (
            <>
              <h4>Bank Details:</h4>
              <p>Account Name: {supplierData?.name || supplierData?.companyName}</p>
              <p>Account No.: {bankData.accountNumber}</p>
              <p>IFSC Code: {bankData.ifscCode}</p>
              <p>Bank Name: {bankData.bankName}</p>
              <p>Branch Name: {bankData.branchName || 'N/A'}</p>
            </>
          )}
        </div>
        <div className="terms">
          <p>1. This is an electronically generated document. 2. All disputes are subject to Faridabad jurisdiction.</p>
          <p>Certified that the particular given above are true and correct</p>
          <p>For, {supplierData?.name || supplierData?.companyName}</p>
          <div className="signature-line">
            <p className="signatory">Authorised Signatory</p>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="invoice-footer">
        <p>Thankyou for your business</p>
      </div>
    </div>
  );
});

export default InvoiceTemplate; 

