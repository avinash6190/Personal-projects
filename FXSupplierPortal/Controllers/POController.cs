using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;
using System.Web.Mvc.Ajax;
using FXSupplierPortal.Models;
using FXSupplierPortal.Enum_Helper;
using System.Data.SqlClient;
using System.Text.RegularExpressions;

namespace FXSupplierPortal.Controllers
{
    public class POController : Controller
    {
        FSPPOEntities obj = new FSPPOEntities();
        FXSupplierPortalDataAccessDataContext FBDataContext = new FXSupplierPortalDataAccessDataContext();
        FibConsoEntities tmpFibConso = new FibConsoEntities();

        public ActionResult Index()
        {
            
            return View(obj.POes);
        }
        
        //Display PO List
        public ActionResult GetPOList()
        {
            
            return View(obj.POes);
        }

        // Get Purchase Order Information from PO LIST
        public ActionResult GetPurchaseOrder(decimal poNum, short poRev,string eventMode)
        {
            //string s = "C&/users@/vinoth/";
            string your_String = "Hello@Hello&Hello(Hello)";
            string my_String = Regex.Replace(your_String, @"[^0-9a-zA-Z]+", ",");

            PO ObjgetPo = obj.POes.SingleOrDefault(x => x.PONUM == poNum && x.POREVISION == poRev);
            ObjgetPo.POTYPETEXT= GetPurchaseType(ObjgetPo.POTYPE);
            ObjgetPo.ORIGINALCONTRACTNUM = ObjgetPo.CONTRACTREFNUM != null ? GetContractRefFromCode(ObjgetPo.CONTRACTREFNUM): ObjgetPo.ORIGINALCONTRACTNUM;
            //ObjgetPo.STATUS = ObjgetPo.STATUS == "DRFT" ? "Draft": ObjgetPo.STATUS;
            ObjgetPo.STATUS = Enum_Helpers<POStatusTypes>.GetDisplayValue((POStatusTypes)Enum.Parse(typeof(POStatusTypes), ObjgetPo.STATUS));
            POViewModel poViewModel = new POViewModel();
            List<POLINE> poLine = new List<POLINE>();
            List<POSignature> poSignatures = new List<POSignature>();
            poViewModel.po = ObjgetPo;
            ViewBag.poMode = "Edit";
            ViewBag.eventMode = eventMode;
            poLine = obj.POLINEs.Where(poLines => poLines.PONUM == ObjgetPo.PONUM && poLines.POREVISION == ObjgetPo.POREVISION).ToList();
            poViewModel.poLine = GetPOLineTypeValue(poLine);

            poSignatures=obj.POSignatures.Where(poSign => poSign.PONum == ObjgetPo.PONUM && poSign.PoRevision == ObjgetPo.POREVISION).ToList();
            poViewModel.poSignatures = poSignatures;

            //ObjgetPo.po_POMODE= "Edit";
            return View("CreatePO", poViewModel);

        }

        public List<POLINE> GetPOLineTypeValue(List<POLINE> poLines)
        {
            foreach (var poLine in poLines)
            {
                //poLine.UNITCOST= Math.Round(poLine.UNITCOST, 2);
                poLine.LINETYPE = Enum_Helpers<LineType>.GetValueFromName(poLine.LINETYPE).ToString();
            }

            return poLines;
        }
        [HttpGet]
        //Display New Purchase Order Screen
        public ActionResult CreatePO()
        {
            ViewBag.poMode = "Create";
            List<POLINE> poLine = new List<POLINE>();
            List<POSignature> poSignatures = new List<POSignature>();
            PO po = new PO();
            POViewModel poViewModel = new POViewModel();
            //po.SENDNOTETOACCTS = false;
            poViewModel.poLine = poLine.ToList();
            poViewModel.poSignatures = poSignatures.ToList();
            return View(poViewModel);
        }

        [HttpGet]
        public ActionResult GetOrganization()
        {
          var orgModel = obj.FIRMS_GetAllOrgs();
          return PartialView(orgModel);
        }

        [HttpGet]
        public ActionResult GetProjects(int orgCode)
        {
            var projModel = FBDataContext.FIRMS_GetAllProjects(orgCode);
            return PartialView(projModel.ToList());
        }

        [HttpGet]
        public ActionResult GetUsers()
        {
            var empModel = obj.FIRMS_GetAllEmployee();
            return PartialView(empModel);
        }

        [HttpGet]
        public ActionResult GetPOType()
        {
            var poTypeModel = obj.SS_ALNDomain.ToList().Where(poType => poType.DomainName == "POTYPE" && poType.IsActive == true).Select(x => new SS_ALNDomain
            {
                Value = x.Value,
                Description = x.Description
            });
            return PartialView(poTypeModel);
        }

        [HttpGet]
        public ActionResult GetSuppliers()
        {
            var supplierModel = obj.ViewAllSuppliers.ToList().Select(x => new Supplier
            {
                SupplierID = x.SupplierID,
                SupplierName = x.SupplierName,
                SupplierType=x.SupplierType,
                RegDocID=x.RegDocID
            });
            return PartialView(supplierModel);
        }

        [HttpGet]
        public ActionResult GetContractRef(int vendorId)
        {
            var contractsmodel = obj.ViewAllContracts.ToList().Where(contracts => contracts.VENDORID == vendorId && contracts.STATUS == "ACT").Select(x => new CONTRACT
            {
                CONTRACTNUM = x.CONTRACTNUM,
                CONTRACTTYPE = x.ContractDescription,
                ORIGINALCONTRACTNUM=x.ORIGINALCONTRACTNUM,
                ORGNAME=x.ORGNAME,
                PROJECTNAME=x.PROJECTNAME,
                VENDORNAME=x.VENDORNAME,
                STARTDATE=x.STARTDATE
            });

            return PartialView(contractsmodel);
        }

        [HttpGet]
        public ActionResult GetCurrency()
        {
          
            var currencyModel = obj.SS_ALNDomain.ToList().Where(currency => currency.DomainName == "Currency" && currency.IsActive == true).Select(x => new SS_ALNDomain
            {
                Value = x.Value,
                Description = x.Description
            });

            return PartialView(currencyModel);
        }

        [HttpPost]
        public ActionResult CreatePO(PO po)
        {
            if (!ModelState.IsValid)
            {
                return new JsonResult()
                {
                    JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                    Data = new { result = "error" }
                };
            }

            //po.CREATEDBY pass value as username which needs to change in future

            Nullable<DateTime> dtOrderDate = po.ORDERDATE.ToString() != string.Empty ? po.ORDERDATE : null;
            Nullable<DateTime> dtQuotationDate = po.QDATE.ToString() != string.Empty ? po.QDATE : null;
            Nullable<DateTime> dtVendorDate = po.VENDORDATE.ToString() != string.Empty ? po.VENDORDATE : null;
            Nullable<DateTime> dtRequiredDate = po.REQUIREDATE.ToString() != string.Empty ? po.REQUIREDATE : null;
            Nullable<int> CompanyID = po.VENDORID != 0 ? po.VENDORID : null;
            //Save PO
            if (po.POMODE == "Create")
            {
                decimal? PONum = 0;
                FBDataContext.PO_ResolvePONUM(ref PONum);
                long tempPOSID = long.Parse(DateTime.UtcNow.ToString("yyyyMMddHHmmssff"));
                //long tempPOSID = 123456789123456789;
                obj.PO_ADDPO(PONum, null, tempPOSID, 0, po.DESCRIPTION, po.ORGCODE, po.ORGNAME, po.PROJECTCODE, po.PROJECTNAME, po.MRNUM, po.QNUM, dtQuotationDate, po.PAYMENTTERMS,
                    dtOrderDate, dtRequiredDate, dtVendorDate, po.POTYPE, po.ORIGINALPONUM, po.BUYERCODE, po.BUYERNAME, CompanyID, po.VENDORNAME, po.VENDORADDR,
                    po.VENDORATTN1NAME, po.VENDORATTN1POS, po.VENDORATTN1MOB, po.VENDORATTN1TEL, po.VENDORATTN1FAX, po.VENDORATTN1EMAIL, po.VENDORATTN2NAME,
                    po.VENDORATTN2POS, po.VENDORATTN2MOB, po.VENDORATTN2TEL, po.VENDORATTN2FAX, po.VENDORATTN2EMAIL, po.SHIPTOADDR, po.SHIPTOATTN1NAME,
                    po.SHIPTOATTN1MOB, po.SHIPTOATTN1POS, po.SHIPTOATTN2NAME, po.SHIPTOATTN2MOB, po.SHIPTOATTN2POS, null,
                    po.CREATEDBY, DateTime.Now, po.CONTRACTREFNUM, po.REVCOMMENTS, po.CURRENCYCODE, po.TOTALTAX, po.PRETAXTOTAL, null, null,po.SENDNOTETOACCTS, true);

                po.PONUM = PONum.Value;

                PO ObjgetPo = obj.POes.SingleOrDefault(x => x.PONUM == po.PONUM && x.POREVISION == po.POREVISION);

                po.CREATEDBY = ObjgetPo.CREATEDBY;

                po.CREATIONDATETIME = ObjgetPo.CREATIONDATETIME.Value;
                po.LASTMODIFIEDBY = ObjgetPo.LASTMODIFIEDBY;
                po.LASTMODIFIEDDATE = ObjgetPo.LASTMODIFIEDDATE;
                po.POSID = ObjgetPo.POSID;
                ViewBag.poMode = "Edit";
                // Adding Signatures for the PO
                AddPOSignature(po.PONUM, po.ORGCODE, po.PROJECTCODE);




                //var msg= obj.PO_ADDPOSignature(objPOSignature.Or, i.OrderNo, PONum, 0, i.Authority, i.Designation, ObjEmpInfo.emp_code.ToString(), ObjEmpInfo.emp_name, UserName, true);
            }
            else
            {
                // InNotes, Exnotes, SendtoAccounts related to Attachment Tab
                short PORevision = short.Parse(po.POREVISION.ToString());
                string StatusCode = GetStatusCode(po.STATUS, "POSTATUS");
                var msg = obj.PO_EditPO(po.PONUM, po.POREF, po.POSID, PORevision, po.DESCRIPTION, po.ORGCODE, po.ORGNAME, po.PROJECTCODE, po.PROJECTNAME,
                                   po.MRNUM, po.QNUM, dtQuotationDate, po.PAYMENTTERMS, dtOrderDate, dtRequiredDate, dtVendorDate, po.POTYPE, po.ORIGINALPONUM, po.BUYERCODE, po.BUYERNAME, CompanyID, po.VENDORNAME, po.VENDORADDR,
                                   po.VENDORATTN1NAME, po.VENDORATTN1POS, po.VENDORATTN1MOB, po.VENDORATTN1TEL, po.VENDORATTN1FAX, po.VENDORATTN1EMAIL, po.VENDORATTN2NAME, po.VENDORATTN2POS, po.VENDORATTN2MOB,
                                   po.VENDORATTN2TEL, po.VENDORATTN2FAX, po.VENDORATTN2EMAIL, po.SHIPTOADDR, po.SHIPTOATTN1NAME, po.SHIPTOATTN1MOB, po.SHIPTOATTN1POS, po.SHIPTOATTN2NAME, po.SHIPTOATTN2MOB, po.SHIPTOATTN2POS,
                                   po.TOTALCOST, po.LASTMODIFIEDBY, po.CONTRACTREFNUM, StatusCode, po.STATUSDATE, po.CURRENCYCODE, po.TOTALTAX, po.PRETAXTOTAL, po.INTNOTE, po.EXTNOTE, po.SENDNOTETOACCTS, false);

                PO ObjgetEditPo = obj.POes.SingleOrDefault(x => x.PONUM == po.PONUM && x.POREVISION == po.POREVISION);
                po.LASTMODIFIEDDATE = ObjgetEditPo.LASTMODIFIEDDATE;
            }
            //return RedirectToAction("GetPurchaseOrder", "PO", new { poNum = po.PONUM, poRev = po.POREVISION });
            return new JsonResult()
            {
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                Data = new { result = "success", poresult = po },

            };
            
           
        }

        [HttpPost]
        public ActionResult CreateNewPOSignature(POSignature poSignature)
        {

            if (poSignature.pOSignatureMode == "Create")
            {
                var masg = obj.PO_ADDPOSignature(poSignature.OrgCode, poSignature.OrderNo, poSignature.PONum, poSignature.PoRevision, poSignature.Authority, poSignature.Designation,
                poSignature.TeamMemberCode, poSignature.TeamMemberName, null, false);
            }
            else
            {
                POSignature ObjSign = obj.POSignatures.FirstOrDefault(x => x.OrgCode == poSignature.OrgCode && x.PONum == poSignature.PONum && x.PoRevision == poSignature.PoRevision && x.OrderNo== poSignature.OrderNo);
                var masg = obj.PO_EDITPOSignature(poSignature.OrgCode, ObjSign.POSignID, poSignature.OrderNo, poSignature.PONum, poSignature.PoRevision, poSignature.Authority, poSignature.Designation,
                poSignature.TeamMemberCode, poSignature.TeamMemberName, null, false);
            }
            return new JsonResult()
            {
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                Data = new { result = "success" },

            };
       }

        
        private void GetDesignation()
        {
            var designationModel = obj.FIRMS_GetAllDesignation().ToList();
            ViewData["DesignationList"] = new SelectList(designationModel, "dgt_desig_code", "dgt_desig_name");
        }

        private void GetEmployeesforDesignation(int? designationCode)
        {
            var empModel = obj.FIRMS_GetAllEmployee().Where(x => x.emp_desig_code == short.Parse(designationCode.ToString()));
            ViewData["EmployeeList"] = designationCode == null ? new SelectList(string.Empty, "emp_code", "emp_name").ToList() 
                : new SelectList(empModel, "emp_code", "emp_name").ToList();
        }

        [HttpGet]
        public ActionResult GetEmployeesforDesig(int? designationCode)
        {
            var empModel = obj.FIRMS_GetAllEmployee().Where(x => designationCode != null && x.emp_desig_code == short.Parse(designationCode.ToString())).ToList();
            ViewData["EmployeeList"] = new SelectList(empModel, "emp_code", "emp_name");
            return new JsonResult()
            {
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                Data = empModel
            };
        }

        private void AddPOSignature(decimal? poNum, string orgCode, string projectCode)
        {
            IList<POSignatureTemplate> lstPOSignatureTemplate = obj.POSignatureTemplates.Where(x => x.OrgCode == orgCode).ToList();
            foreach (var i in lstPOSignatureTemplate)
            {
                try
                {
                    var checkcount = obj.FIRMS_GetAllEmployee().Where(x => x.emp_desig_code == i.Designation).Count();
                    if (checkcount >= 2)
                    {
                        var getEmployeeName = obj.FIRMS_GetAllEmployee().Where(x => x.emp_desig_code == i.Designation && (x.emp_visa_org == int.Parse(orgCode))).Count();
                        if (getEmployeeName >= 2)
                        {
                            var ObjEmpCount = obj.FIRMS_GetAllEmployee().Where(x => x.emp_desig_code == i.Designation && (x.emp_visa_org == int.Parse(orgCode)) && x.emp_cost_code == projectCode).Count();
                            if (ObjEmpCount == 1)
                            {
                                var ObjEmpInfo = obj.FIRMS_GetAllEmployee().FirstOrDefault(x => x.emp_desig_code == i.Designation && (x.emp_visa_org == int.Parse(orgCode)) && x.emp_cost_code == projectCode);
                                if (ObjEmpInfo != null)
                                {
                                    var masg = obj.PO_ADDPOSignature(i.OrgCode, i.OrderNo, poNum, 0, i.Authority, i.Designation, ObjEmpInfo.emp_code.ToString(), ObjEmpInfo.emp_name, null, true);
                                }
                                else
                                {
                                    var masg = obj.PO_ADDPOSignature(i.OrgCode, i.OrderNo, poNum, 0, i.Authority, i.Designation, null, null, null, true);
                                }

                            }
                            else
                            {

                                var masg = obj.PO_ADDPOSignature(i.OrgCode, i.OrderNo, poNum, 0, i.Authority, i.Designation, null, null, null, true);
                            }
                        }
                        else if (getEmployeeName == 1)
                        {
                            var getEmployeeInfo = obj.FIRMS_GetAllEmployee().FirstOrDefault(x => x.emp_desig_code == i.Designation && (x.emp_visa_org == int.Parse(orgCode)));
                            if (getEmployeeInfo != null)
                            {
                                var masg = obj.PO_ADDPOSignature(i.OrgCode, i.OrderNo, poNum, 0, i.Authority, i.Designation, getEmployeeInfo.emp_code.ToString(), getEmployeeInfo.emp_name, null, true);

                            }
                        }

                        else
                        {

                            var masg = obj.PO_ADDPOSignature(i.OrgCode, i.OrderNo, poNum, 0, i.Authority, i.Designation, null, null, null, true);

                        }
                    }
                    else if (checkcount == 1)
                    {
                        var ObjEmpCount = obj.FIRMS_GetAllEmployee().FirstOrDefault(x => x.emp_desig_code == i.Designation);
                        if (ObjEmpCount != null)
                        {
                            var masg = obj.PO_ADDPOSignature(i.OrgCode, i.OrderNo, poNum, 0, i.Authority, i.Designation, ObjEmpCount.emp_code.ToString(), ObjEmpCount.emp_name, null, true);

                        }
                    }
                    else
                    {

                        var masg = obj.PO_ADDPOSignature(i.OrgCode, i.OrderNo, poNum, 0, i.Authority, i.Designation, null, null, null, true);

                    }

                }
                catch (SqlException ex)
                {

                }
            }
        }

        // Display the PO Line Create and Edit Screen. 
        [HttpGet]
        public ActionResult EditPoLine(decimal poNum, short poRev, short poLineNum,string poLineItemMode)
        {
            POLINE poLineModel =new POLINE();
            //poLineModel.POLINEMODE = poLineItemMode;
            ViewBag.POLINEMODE = poLineItemMode.ToString();
            if (poLineItemMode == "Create")
            {
                short maxPOLineNum = obj.POLINEs.ToList().Where(poLine => poLine.PONUM == poNum && poLine.POREVISION == poRev).OrderByDescending(x => x.POLINENUM).Select(x => x.POLINENUM).FirstOrDefault();
                poLineModel.PONUM = poNum;
                poLineModel.POREVISION = poRev;
                
                ViewBag.POLINENUM = maxPOLineNum + 1;
               
            }
            else
            {
                 poLineModel = obj.POLINEs.ToList().Where(poLine => poLine.PONUM == poNum && poLine.POREVISION == poRev && poLine.POLINENUM == poLineNum).Select(x => new POLINE
                {
                     POLINEID=x.POLINEID,
                     PONUM = x.PONUM,
                    POREVISION = x.POREVISION,
                    POLINENUM = x.POLINENUM,
                    ITEMNUM = x.ITEMNUM,
                    LINETYPE=x.LINETYPE,
                    DESCRIPTION = x.DESCRIPTION,
                    SPECIFICATION = x.SPECIFICATION,
                    REMARK = x.REMARK,
                    COSTCODE = x.COSTCODE,
                    MODELNUM = x.MODELNUM,
                    MANUFACUTRER = x.MANUFACUTRER,
                    CATALOGCODE = x.CATALOGCODE,
                    REQUESTEDBYNAME = x.REQUESTEDBYNAME,
                    ORDERQTY = x.ORDERQTY,
                    ORDERUNIT = x.ORDERUNIT,
                    UNITCOST = x.UNITCOST,
                    LINECOST = x.LINECOST,
                    TAXCODE = x.TAXCODE,
                    TAXRATE = x.TAXRATE,
                    TAXTOTAL=x.TAXTOTAL,
                    TAXED = x.TAXED,
                    RECEIPTCOMPLETED = x.RECEIPTCOMPLETED,
                    RECEIVEDQTY = x.RECEIVEDQTY,
                    RECEIVEDCOST = x.RECEIVEDCOST,
                    RECEIPTTOLERANCE = x.RECEIPTTOLERANCE,
                    CREATEDBY = x.CREATEDBY,
                    CREATIONDATE = x.CREATIONDATE,
                    LASTMODIFIEDBY = x.LASTMODIFIEDBY,
                    LASTMODIFIEDDATE = x.LASTMODIFIEDDATE,
                    
            }).FirstOrDefault();
            
            ViewBag.POLINENUM = poLineModel.POLINENUM;
            }
            poLineModel.LINETYPE = poLineModel.LINETYPE != null ? 
                Enum_Helpers<LineType>.GetValueFromName(poLineModel.LINETYPE).ToString() : null;
            return PartialView("CreatePOLine",poLineModel);
            
        }

        public ActionResult POSignature(decimal poNum, short poRev,int orderNo, string poSignatureMode) {
            POSignature poSignature = new POSignature();
            GetDesignation();
            if (poSignatureMode == "Create")
            {
                PO ObjgetPo = obj.POes.SingleOrDefault(x => x.PONUM == poNum && x.POREVISION == poRev);
                poSignature.PONum = poNum;
                poSignature.PoRevision = poRev;
                poSignature.OrgCode = ObjgetPo.ORGCODE;
                GetEmployeesforDesignation(poSignature.Designation);
                poSignature.pOSignatureMode = "Create";
                int maxPOSigntureOrderNo = obj.POSignatures.Where(x => x.PONum == poNum && x.PoRevision == poRev).OrderByDescending(x=>x.OrderNo).Select(x=>x.OrderNo).FirstOrDefault();
                ViewBag.OrderNo = maxPOSigntureOrderNo +  1;
            }
           else
            {
                poSignature = obj.POSignatures.Where(posign => posign.PONum == poNum &&
                       posign.PoRevision == poRev && posign.OrderNo == orderNo).FirstOrDefault();
                GetEmployeesforDesignation(poSignature.Designation);
                poSignature.pOSignatureMode = "Edit";
                ViewBag.OrderNo = poSignature.OrderNo;
            }
            
                return PartialView("POSignature", poSignature);
        }

        // Add the New PO Line Entry
        [HttpPost]
        public ActionResult AddPOLine(POLINE poLine)
        {
            int Msg;
            string StatusCode = GetStatusCode(poLine.STATUS, "POSTATUS");
            if (poLine.POLINEMODE == "Create") {
                
                Msg = obj.PO_AddPOLine(poLine.PONUM, poLine.POREVISION, short.Parse(poLine.POLINENUM.ToString()), GetItemCode(poLine.LINETYPE),
                poLine.CATALOGCODE, poLine.COSTCODE, poLine.DESCRIPTION, poLine.ORDERQTY, poLine.ORDERUNIT, poLine.UNITCOST, poLine.LINECOST,
                poLine.ITEMNUM, poLine.MODELNUM, poLine.REQUESTEDBYCODE, poLine.REQUESTEDBYNAME, poLine.MANUFACUTRER, poLine.REMARK, poLine.TAXCODE,
                 poLine.TAXRATE, poLine.TAXTOTAL, poLine.TAXED, null, poLine.CREATEDBY, DateTime.Now, false, StatusCode, poLine.RECEIPTTOLERANCE,
               poLine.SPECIFICATION);
           }

            else
            {
                Msg = obj.PO_EditPOLine(poLine.POLINEID,poLine.PONUM, poLine.POREVISION, short.Parse(poLine.POLINENUM.ToString()), GetItemCode(poLine.LINETYPE),
                    poLine.CATALOGCODE, poLine.COSTCODE, poLine.DESCRIPTION,poLine.ORDERQTY, poLine.ORDERUNIT, poLine.UNITCOST, poLine.LINECOST,
                    poLine.ITEMNUM, poLine.MODELNUM, poLine.REQUESTEDBYCODE, poLine.REQUESTEDBYNAME, poLine.MANUFACUTRER, poLine.REMARK, poLine.TAXCODE,
                    poLine.TAXRATE, poLine.TAXTOTAL, poLine.TAXED, null, poLine.CREATEDBY, DateTime.Now, false, StatusCode, poLine.RECEIPTTOLERANCE,
                    poLine.SPECIFICATION);

            }

          var poCost =  GetPOUpdatedCost(poLine.PONUM, poLine.POREVISION);

            return new JsonResult()
            {
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                Data = new { result = "success", poUpdatedCost = poCost },

            };
        }

        [HttpGet]
        public ActionResult DelPoLine(decimal poNum, short poRev, short poLineNum)
        {

            var deletePOLine = obj.PO_DeletePOLine(poNum, poRev, poLineNum, string.Empty, DateTime.Now, false);
            var poCost = GetPOUpdatedCost(poNum, poRev);
            return new JsonResult()
            {
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                Data = new { result = "success", poUpdatedCost = poCost },

            };
        }

        [HttpGet]
        public ActionResult DelPoSignature(string orgCode, decimal poNum, short poRev, int orderNo)
        {
            POSignature ObjSign = obj.POSignatures.FirstOrDefault(x => x.OrgCode == orgCode && x.PONum == poNum && x.PoRevision == poRev && x.OrderNo== orderNo);
            var deletePOLine = obj.PO_DeletePOSignature(orgCode, ObjSign.POSignID, orderNo, poNum, poRev, null, false);
            
            return new JsonResult()
            {
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                Data = new { result = "success" },

            };
        }

        [HttpGet]
        public ActionResult  ViewChangePOStatus(decimal poNum,short poRev, string poStatus)
        {
            PO po = new PO();
            po.PONUM = poNum;
            po.POREVISION = poRev;
            po.STATUS = poStatus;
            po.prevPOStatus = poStatus;
            ViewData["POStatusTypesList"] = new SelectList(GetpoStatusTypeListforStatus(poStatus), "Key", "Value");
            return PartialView("ChangePOStatus", po);
        }

        private string getPOStatusTypeDisplayName(POStatusTypes poStatusType)
        {
            return Enum_Helpers<POStatusTypes>.GetDisplayValue((POStatusTypes)Enum.Parse(typeof(POStatusTypes), poStatusType.ToString()));
        }

        private Dictionary<string, string> GetpoStatusTypeListforStatus(string poStatus)
        {
            var poStatusTypeList = from POStatusTypes d in Enum.GetValues(typeof(POStatusTypes))
                                   select new
                                   {
                                       key = d.ToString(),
                                       Value = Enum_Helpers<POStatusTypes>.GetDisplayValue((POStatusTypes)Enum.Parse(typeof(POStatusTypes), d.ToString()))
                                   };
            if (poStatus.ToUpper() == getPOStatusTypeDisplayName(POStatusTypes.DRFT).ToUpper())
            {
                poStatusTypeList = poStatusTypeList.Where(x => x.key == POStatusTypes.CANC.ToString() || x.key == POStatusTypes.WAPPR.ToString());
            }
            else if (poStatus.ToUpper() == getPOStatusTypeDisplayName(POStatusTypes.WAPPR).ToUpper())
            {
                poStatusTypeList = poStatusTypeList.Where(x => x.key == POStatusTypes.CANC.ToString() || x.key == POStatusTypes.APRV.ToString());
            }
            else if (poStatus.ToUpper() == getPOStatusTypeDisplayName(POStatusTypes.APRV).ToUpper())
            {
                poStatusTypeList = poStatusTypeList.Where(x => x.key == POStatusTypes.CANC.ToString() || x.key == POStatusTypes.REOPEN.ToString());
            }
            else if (poStatus.ToUpper() == getPOStatusTypeDisplayName(POStatusTypes.REOPEN).ToUpper())
            {
                poStatusTypeList = poStatusTypeList.Where(x => x.key == POStatusTypes.CANC.ToString() || x.key == POStatusTypes.APRV.ToString());

            }
            return poStatusTypeList.ToDictionary(g => g.key, g => g.Value);
        }

        public ActionResult CheckPOReceivedQuantity(decimal poNum, short poRev)
        {
            var getPoReceiving = tmpFibConso.VW_MATRECTRANS.FirstOrDefault(x => x.mrvm_po_no == poNum && x.mrvm_po_rev == poRev);
            return new JsonResult()
            {
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                Data = new { result = "success", poReceiving = getPoReceiving },
            };
        }

        [HttpPost]
        public ActionResult ChangePOStatus(PO po)
        {
            string poStatus = Enum_Helpers<POStatusTypes>.GetValueFromName(po.prevPOStatus.ToString()).ToString();
            var Masg = obj.PO_ChangePOStatus(po.PONUM, po.POREVISION, po.poStatusTypes.ToString(), poStatus, po.REVCOMMENTS, string.Empty, true);
            return new JsonResult()
            {
                JsonRequestBehavior = JsonRequestBehavior.AllowGet,
                Data = new { result = "success", poResult = po },
            };
        }

        public PO GetPOUpdatedCost(decimal poNum, short poRev)
        {
            var poUpdatedCost = obj.POes.ToList().Where(pos => pos.PONUM == poNum && pos.POREVISION == poRev).Select(cost=> new PO
                {
                    PRETAXTOTAL = cost.PRETAXTOTAL,
                    TOTALTAX = cost.TOTALTAX,
                    TOTALCOST = cost.TOTALCOST
                }).FirstOrDefault();

            return poUpdatedCost;
        }

        // Get the Line Type Display Name from Value
        public string GetItemCode(string lineType)
        {
            return Enum_Helpers<LineType>.GetDisplayValue((LineType)Enum.Parse(typeof(LineType), lineType));
        }

        [HttpGet]
        public ActionResult GetCostCode(string orgCode)
        {
            var costModel = tmpFibConso.VW_COST_CODE_MASTER.ToList().Where(costcode => costcode.orgCode == orgCode);
            return PartialView(costModel);
        }

        [HttpGet]
        public ActionResult GetTaxCodes()
        {
            var taxCodesModel = obj.TAXCODES.ToList();
            return PartialView(taxCodesModel);
        }

        [HttpGet]
        public ActionResult GetItems(string orgCode)
        {
            var itemModel = tmpFibConso.VW_PRODUCT_MASTER.ToList().Where(items => items.orgCode == orgCode);
            return PartialView(itemModel);
        }

        public string GetPurchaseType(string Value)
        {
            string UserID = string.Empty;
            try
            {
                string value = string.Empty;
                var masg = from Sec in obj.SS_ALNDomain
                           where Sec.DomainName == "POTYPE" && Sec.Value == Value
                           select new { Sec. Value, Sec.Description };

                foreach (var m in masg)
                {
                    UserID = m.Description.ToString();
                }
                return UserID;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        // Get the Status Code of the Purchase Order
        public string GetStatusCode(string Status, string DomainName)
        {
            try
            {
                string SupID = string.Empty;
                SS_ALNDomain Sup = obj.SS_ALNDomain.SingleOrDefault(x => x.Description == Status && x.DomainName == DomainName);
                if (Sup == null)
                {
                    SupID = "Status Code not found";
                }
                else
                {
                    SupID = Sup.Value;
                }
                return SupID;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public string GetContractRefFromCode(int? ContractRefNum)
        {
            string originalContractRefNum=string.Empty;
            
                CONTRACT ObjCon = obj.CONTRACTs.SingleOrDefault(x => x.CONTRACTNUM == ContractRefNum);
                if (ObjCon != null)
                {
                    originalContractRefNum = ObjCon.ORIGINALCONTRACTNUM.ToString();
                }
                //txtContractRef.Text 
          

            return originalContractRefNum;
        }

        

        //public ActionResult About()
        //{
        //    ViewBag.Message = "Your application description page.";

        //    return View();
        //}

        //public ActionResult Contact()
        //{
        //    ViewBag.Message = "Your contact page.";

        //    return View();
        //}
    }
}