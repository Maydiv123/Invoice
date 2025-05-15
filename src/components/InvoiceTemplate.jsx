import React, { forwardRef } from 'react';
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

const InvoiceTemplate = forwardRef(({ data = {}, bankData = null }, ref) => {
  console.log('InvoiceTemplate received data:', data); // Debug log
  const {
    invoiceNumber = '',
    number = '',
    date = new Date(),
    products = [],
    supplierData = {},
    buyerData = {},
    transportData = {},
    otherDetails = {}
  } = data || {};

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

  return (
    <div className="invoice-template" ref={ref}>
      {/* Company Header */}
      <div className="company-header">
        <div className="company-logo">
          {supplierData?.logo && <img src={supplierData.logo} alt="Company Logo" />}
        </div>
        <div className="company-info">
          <h1>{supplierData?.companyName}</h1>
          <p>{supplierData?.address}</p>
          <p>{supplierData?.city}, {supplierData?.state}, {supplierData?.pincode}</p>
          <p>{supplierData?.phone}</p>
          <p>{supplierData?.email}</p>
          <p>GSTIN: {supplierData?.gstin}</p>
        </div>
      </div>

      {/* Invoice Title */}
      <div className="invoice-title">
        <h2>TAX INVOICE</h2>
        <div className="invoice-type-checkboxes">
          <div className="checkbox-item">
            <input type="checkbox" checked readOnly />
            <label>Original for Recipient</label>
          </div>
          <div className="checkbox-item">
            <input type="checkbox" checked readOnly />
            <label>Duplicate for Transporter</label>
          </div>
          <div className="checkbox-item">
            <input type="checkbox" checked readOnly />
            <label>Triplicate for Supplier</label>
          </div>
        </div>
      </div>

      {/* Invoice Details Box */}
      <div className="invoice-details-box">
        <div className="detail-left">
          <div className="detail-item">
            <span className="detail-label">Reverse Charge:</span>
            <span className="detail-value">{otherDetails?.reverseCharge ? 'Yes' : 'No'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Invoice No.:</span>
            <span className="detail-value">{invoiceNumber || number}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Invoice Date:</span>
            <span className="detail-value">{formatDate(date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">State:</span>
            <span className="detail-value">{supplierData?.state}</span>
            <span className="state-code">: {supplierData?.stateCode || '06'}</span>
          </div>
        </div>
        <div className="detail-right">
          <div className="detail-item">
            <span className="detail-label">Transportation Mode:</span>
            <span className="detail-value">{transportData?.transportMode || ''}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Vehicle No.:</span>
            <span className="detail-value">{transportData?.vehicleNumber || ''}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Date of Supply:</span>
            <span className="detail-value">{formatDate(date)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Place of Supply:</span>
            <span className="detail-value">{buyerData?.state || ''}</span>
          </div>
        </div>
      </div>

      {/* Party Details */}
      <div className="party-details">
        <div className="billed-to">
          <h3>Details of Receiver ( Billed to: )</h3>
          <div className="party-info">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value buyer-name-container">
                <FiUser className="buyer-icon" />
                <span>{buyerData?.companyName}</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{buyerData?.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-value">{buyerData?.city}, {buyerData?.state}, {buyerData?.pincode}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">GSTIN:</span>
              <span className="detail-value">{buyerData?.gstin}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">State:</span>
              <span className="detail-value">{buyerData?.state}</span>
              <span className="state-code">: {buyerData?.stateCode || '06'}</span>
            </div>
          </div>
        </div>
        <div className="shipped-to">
          <h3>Details of Consignee ( Shipped to: )</h3>
          <div className="party-info">
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value buyer-name-container">
                <FiUser className="buyer-icon" />
                <span>{buyerData?.companyName}</span>
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Address:</span>
              <span className="detail-value">{buyerData?.address}</span>
            </div>
            <div className="detail-item">
              <span className="detail-value">{buyerData?.city}, {buyerData?.state}, {buyerData?.pincode}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">GSTIN:</span>
              <span className="detail-value">{buyerData?.gstin}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">State:</span>
              <span className="detail-value">{buyerData?.state}</span>
              <span className="state-code">: {buyerData?.stateCode || '06'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <table className="product-table">
        <thead>
          <tr className="header-row">
            <th>Sr. No.</th>
            <th>Name of Product</th>
            <th>HSN/SAC</th>
            <th>QTY</th>
            <th>Unit</th>
            <th>Rate</th>
            <th>Taxable Value</th>
            <th colSpan="2">CGST</th>
            <th colSpan="2">SGST</th>
            <th>Total</th>
          </tr>
          <tr className="sub-header-row">
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th>Rate</th>
            <th>Amount</th>
            <th>Rate</th>
            <th>Amount</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => {
            const quantity = safeCalculate(product?.quantity);
            const rate = safeCalculate(product?.salePrice);
            const amount = quantity * rate;
            const gstRate = safeCalculate(product?.gst);
            const gstAmount = (amount * gstRate) / 100;
            const cgstAmount = gstAmount / 2;
            const sgstAmount = gstAmount / 2;
            
            return (
              <tr key={index} className={index % 2 === 0 ? 'even-row' : ''}>
                <td>{index + 1}</td>
                <td>{product?.name}</td>
                <td>{product?.hsn}</td>
                <td>{quantity}</td>
                <td>{product?.unit}</td>
                <td>{rate.toFixed(2)}</td>
                <td>{amount.toFixed(2)}</td>
                <td>{(gstRate / 2).toFixed(1)}%</td>
                <td>{cgstAmount.toFixed(2)}</td>
                <td>{(gstRate / 2).toFixed(1)}%</td>
                <td>{sgstAmount.toFixed(2)}</td>
                <td>{(amount + gstAmount).toFixed(2)}</td>
              </tr>
            );
          })}
          <tr className="total-row">
            <td colSpan="3">Total Quantity</td>
            <td>{totalQuantity}</td>
            <td colSpan="8"></td>
          </tr>
        </tbody>
      </table>

      {/* Amount Section */}
      <div className="amount-section">
        <div className="amount-in-words">
          <p>Total Invoice Amount in Words:</p>
          <p>{numberToWords(grandTotal)}</p>
        </div>
        <div className="amount-breakdown">
          <div className="amount-item">
            <span>Total Amount Before Tax:</span>
            <span>₹{subTotal.toFixed(2)}</span>
          </div>
          <div className="amount-item">
            <span>Add: CGST:</span>
            <span>₹{(totalGST / 2).toFixed(2)}</span>
          </div>
          <div className="amount-item">
            <span>Add: SGST:</span>
            <span>₹{(totalGST / 2).toFixed(2)}</span>
          </div>
          <div className="amount-item">
            <span>Tax Amount: GST:</span>
            <span>₹{totalGST.toFixed(2)}</span>
          </div>
          <div className="amount-item total">
            <span>Amount With Tax:</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms and Signature */}
      <div className="footer-section">
        <div className="terms">
          <h4>Terms and Conditions</h4>
          <ol>
            <li>This is an electronically generated document.</li>
            <li>All disputes are subject to {supplierData?.city} jurisdiction.</li>
          </ol>
          {bankData && (
            <div className="bank-details">
              <br />
              <h4>Bank Details:</h4>
             
              <p>Bank Name:{bankData.bankName}</p>
              <p>Account Number:{bankData.accountNumber}</p>
              <p>IFSC Code: {bankData.ifscCode}</p>
            </div>
          )}
        </div>
        <div className="signature-section">
        
          <div className="signature-line">
            <p>For, {supplierData?.companyName}</p>
            <p className="signatory">Authorised Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default InvoiceTemplate; 
