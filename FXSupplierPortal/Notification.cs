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
    
    public partial class Notification
    {
        public int NotificationID { get; set; }
        public Nullable<int> NotificationTemplatesID { get; set; }
        public string Subject { get; set; }
        public string Body { get; set; }
        public string Sender { get; set; }
        public string Recepient { get; set; }
        public Nullable<System.DateTime> SendDateTime { get; set; }
        public Nullable<bool> IsRead { get; set; }
        public string UserID { get; set; }
        public Nullable<System.DateTime> ReadDate { get; set; }
        public Nullable<bool> IsMailSend { get; set; }
    }
}
