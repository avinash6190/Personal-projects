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
    
    public partial class ChangeRequestDetail
    {
        public int ChangeRequestDetailID { get; set; }
        public Nullable<int> ChangeRequestID { get; set; }
        public string TableName { get; set; }
        public Nullable<int> RecordID { get; set; }
        public string FieldName { get; set; }
        public string ActionTaken { get; set; }
        public string CurrentValue { get; set; }
        public string ProposedValue { get; set; }
        public string AdjustedValue { get; set; }
        public string CreatedBy { get; set; }
        public Nullable<System.DateTime> CreationDateTime { get; set; }
    
        public virtual ChangeRequest ChangeRequest { get; set; }
    }
}
