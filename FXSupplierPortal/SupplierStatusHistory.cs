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
    
    public partial class SupplierStatusHistory
    {
        public int SupplierStatusID { get; set; }
        public Nullable<int> SupplierID { get; set; }
        public string OldStatus { get; set; }
        public string NewStatus { get; set; }
        public string Memo { get; set; }
        public string ModifiedBy { get; set; }
        public Nullable<System.DateTime> ModificationDateTime { get; set; }
    
        public virtual Supplier Supplier { get; set; }
    }
}
