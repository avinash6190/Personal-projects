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
    
    public partial class a_conso_sup_map_tbl
    {
        public int csm_audit_id { get; set; }
        public string csm_audit_by { get; set; }
        public Nullable<System.DateTime> csm_audit_timestamp { get; set; }
        public string csm_audit_action { get; set; }
        public Nullable<int> csm_acct_code { get; set; }
        public Nullable<short> csm_org_code { get; set; }
        public Nullable<int> csm_org_acct_code { get; set; }
        public Nullable<byte> csm_status { get; set; }
    }
}
