const InvoicePDF = ({ invoice }) => (
  <div id="invoice-pdf" className="bg-white text-black p-8 w-[800px]">
    <h1 className="text-2xl font-bold">{invoice.shopName}</h1>
    <p>Invoice: {invoice.invoiceNumber}</p>

    <hr className="my-4" />

    <p><strong>Client:</strong> {invoice.clientName}</p>

    {invoice.items.map((item, i) => (
      <div key={i} className="flex justify-between">
        <span>{item.description}</span>
        <span>₦{item.total}</span>
      </div>
    ))}

    <hr className="my-4" />
    <p>Total: ₦{invoice.totalAmount}</p>

    <p className="text-xs mt-6">
      Powered by Tapsure • tapsure.app
    </p>
  </div>
);
