using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace FXSupplierPortal.Models
{
    public class POViewModel
    {
        public PO po { get; set; }
        public List<POLINE> poLine { get; set; }

        public List<POSignature> poSignatures { get; set; }


    }
}