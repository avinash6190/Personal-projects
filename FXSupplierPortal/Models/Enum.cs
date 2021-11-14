using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace FXSupplierPortal.Models
{
    public enum LineType
    {
        [Display(Name = "ITEM")]
        Item,
        [Display(Name = "MATL")]
        Material,
        [Display(Name = "SERV")]
        Service
    }

    public enum POStatusTypes
    {
        [Display(Name = "Draft")]
        DRFT,
        [Display(Name = "Pending Revision")]
        PNDREV,
        [Display(Name = "Approved")]
        APRV,
        [Display(Name = "Cancelled")]
        CANC,
        [Display(Name = "Revised")]
        REVISD,
        [Display (Name ="Submitted/Waiting on Approval")]
        WAPPR,
        [Display(Name = "ReOpened/Waiting on Approval")]
        REOPEN

    }
}