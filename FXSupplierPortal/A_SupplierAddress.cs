//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace FXSupplierPortal
{
    using System;
    using System.Collections.Generic;
    
    public partial class A_SupplierAddress
    {
        public int AuditAddressID { get; set; }
        public string AuditAction { get; set; }
        public string AuditBy { get; set; }
        public Nullable<System.DateTime> AuditTimeStamp { get; set; }
        public Nullable<int> SupplierAddressID { get; set; }
        public Nullable<int> SupplierID { get; set; }
        public string AddressName { get; set; }
        public string Country { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string PhoneNum { get; set; }
        public string FaxNum { get; set; }
    
        public virtual SupplierAddress SupplierAddress { get; set; }
    }
}
