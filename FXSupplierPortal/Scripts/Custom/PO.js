
var CreateMode = "Create";
var EditMode = "Edit";
var POEventMode = "PO";
var changeStatusMode = "ChangeStatus";
var SearchEventMode = "SEARCHPO";

var title;

var validationFieldsforAPPRandWAPPR =
    ['REQUIREDATE', 'SHIPTOADDR', 'PAYMENTTERMS', 'SHIPTOATTN1NAME', 'SHIPTOATTN1POS', 'SHIPTOATTN1MOB',
        'VENDORNAME', 'VENDORATTN1NAME', 'VENDORATTN1POS','VENDORATTN1MOB'];

var poSignatureMode;
var poSignatureOrderNo;
$(document).ready(function () {
    //Hide the Webgrid Column
    //$('.webgrid-table td:nth-child(2),th:nth-child(2)').hide();
    if (($("#po_POMODE").val()) == CreateMode) {
        
        return new string(charArray);
        $("#po_POREVISION").val(0);
        $("#po_STATUS").val('Draft');
        var statusDate = new Date(Date.now());
        $("#po_STATUSDATE").val(statusDate.toLocaleString());
       
        $("#po_PRETAXTOTAL").val("0.0");
        $("#po_TOTALTAX").val("0.0");
        $("#po_TOTALCOST").val("0.0");
        $('.nav-tabs a[href="#POLine"]').addClass('hidden');
        $('.nav-tabs a[href="#POSignature"]').addClass('hidden');
        $('.nav-tabs a[href="#POAttachments"]').addClass('hidden');
        
    }
     else if (($("#po_POMODE").val()) == EditMode) {
       $("#POTitle").text('Edit Purchase Order');
       var poNum = Math.trunc($("#po_PONUM").val());
       $("input[name='po.PONUM']").val(poNum);
       $("#AuditInfo").show();
       $("#btnCreate").val('Update');
         $("#POLineTotalCost").val($("#po_TOTALCOST").val());
         $("#POSignatureTotalCost").val($("#po_TOTALCOST").val());
         if ($("#EventMode").val() == POEventMode) {
             clearErrorDiv();
             $("#divSuccess").show();
             $("#EventMode").val("");
             window.history.pushState("", "", "GetPurchaseOrder?poNum=" + poNum + "&poRev=" + $("#po_POREVISION").val());
         }
         else if ($("#EventMode").val() == changeStatusMode) {
             clearErrorDiv();
             renderSuccessMsgDiv("'PO Status has been Updated Successfully'");
             $("#EventMode").val("");
             window.history.pushState("", "", "GetPurchaseOrder?poNum=" + poNum + "&poRev=" + $("#po_POREVISION").val());
         }
    }
    if ($("#pOSignatureMode").val() == EditMode) {
        $("#btnCreatePoSignature").val('Update');
    }
    
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
       clearErrorDiv();
    });

    $(".datePickerBase").datepicker({
        changeMonth: true,
        changeYear: true,
        maxDate: "+10Y",
        minDate: "-100Y",
        yearRange: "-100:+10"
    });

    $('#imgDivision').click(function () {
        createDialog("GetOrganization", "Division List", 500);
        loadPartialView("GetOrganization", "/PO/GetOrganization");
    });

   
    $('#imgProject').click(function () {
        if ($("#po_ORGNAME").val().trim() != "") {
            createDialog("GetProjects", "Project List", 500);
            loadPartialView("GetProjects", "/PO/GetProjects?orgCode=" + $("#po_ORGCODE").val());
        }
        else {
            var errorMessage = 'Please select the organization. Projects are populated according to the select organization.';
            renderError(errorMessage);
        }
    });

    $('#imgUsers').click(function () {
        title = "User List"
        getUsers(title);
    });

    $('#imgPoType').click(function () {
        createDialog("GetPOType", "PoType List", 430);
        loadPartialView("GetPOType", "/PO/GetPOType");
    });

    $('#imgSupplier').click(function () {
        createDialog("GetSuppliers", "Supplier List", 700);
        loadPartialView("GetSuppliers", "/PO/GetSuppliers");
    });

    $('#imgContractRef').click(function () {
        if ($("#po_VENDORID").val().trim() != "") {
            createDialog("GetContractRef", "Contract List", 1050);
            loadPartialView("GetContractRef", "/PO/GetContractRef?vendorId=" + parseInt($("#po_VENDORID").val()));
        }
        else {
            var errorMessage = 'Please select the vendor to populate the contracts accordingly';
            renderError(errorMessage);
        }
    });

    $('#imgCurrency').click(function () {
        createDialog("GetCurrency", "Currency List", 430);
        loadPartialView("GetCurrency", "/PO/GetCurrency");
    });

    $("#imgCostCode").click(function () {
        createDialog("getCostCode", "Cost Code's List", 500);
        loadPartialView("getCostCode", "/PO/GetCostCode?orgCode=" + $("#po_ORGCODE").val().toString());
    });

    $('#imgRequestedBy').click(function () {
        title = "PO Line User List";
        getUsers(title);
    });

    $('#imgTaxCode').click(function () {
        createDialog("getTaxCode", "Tax Code List", 500);
        loadPartialView("getTaxCode", "/PO/GetTaxCodes");
        
    });

    $('#imgItem').click(function () {
        createDialog("getItems", "Item List", 600);
        loadPartialView("getItems", "/PO/GetItems?orgCode=" + $("#po_ORGCODE").val().toString());
    });


    $(document).on('click', '#btnClose', function () {
        clearErrorDiv();
    });  

    $(document).on('click', '#btnPOChangeStatusClose', function () {
        $("#divPOChangeStatusRequiredFieldError").attr('style', 'display: none');
    });

    $("#btnCreate").click(function () {
        var form = $('#CreatePO');
        form
            .removeData('validator')
            .removeData('nobtrusiveValidation');
        $.validator.unobtrusive.parse(form); // }

        $.fn.extend({
            isValid: function () {
                var self = $(this);
                $.validator.unobtrusive.parse(self);
                return self.data('unobtrusiveValidation').validate();
            }
        });

        if (!$('#CreatePO').isValid()) {
            clearErrorDiv();
            $("#divRequiredFieldError").show();
            $(window).scrollTop(0);
        }
   });

    $("#btnCreatePoSignature").click(function () {
        var form = $('#AddPOSignature');
        form
            .removeData('validator')
            .removeData('nobtrusiveValidation');
        $.validator.unobtrusive.parse(form); // }

        $.fn.extend({
            isValid: function () {
                var self = $(this);
                $.validator.unobtrusive.parse(self);
                return self.data('unobtrusiveValidation').validate();
            }
        });

        if (!$('#AddPOSignature').isValid()) {
            $("#divPOSignatureRequiredFieldError").attr('style', 'display: none');
            $("#divPOSignatureRequiredFieldError").show();
            $(window).scrollTop(0);
        }
    });

    $("#btnChangePOStatus").click(function () {
        
        var form = $('#lnkChangeStatus');
        form
            .removeData('validator')
            .removeData('nobtrusiveValidation');
        $.validator.unobtrusive.parse(form); // }

        $.fn.extend({
            isValid: function () {
                var self = $(this);
                $.validator.unobtrusive.parse(self);
                return self.data('unobtrusiveValidation').validate();
            }
        });

        if (!$('#lnkChangeStatus').isValid()) {
            $("#divPOChangeStatusRequiredFieldError").attr('style', 'display: none');
            $("#divPOChangeStatusRequiredFieldError").show();
            $(window).scrollTop(0);
        }
        else {

            //Custom Validation 
            var errorMessage = '';

            //Cannot update status. Receiving has been done on this purchase order.
            if ($("#poStatusTypes").val() == "CANC") {
               checkPOReceiving(errorMessage);
            }

            //Delivery Information and Contact Information is required.
            if ($("#poStatusTypes").val() == "APRV" || $("#poStatusTypes").val() == "WAPPR") {
                if ($.trim($("#po_REQUIREDATE").val()) == "" || $.trim($("#po_SHIPTOADDR").val()) == "" || $.trim($("#po_PAYMENTTERMS").val()) == ""
                    || $.trim($("#po_SHIPTOATTN1NAME").val()) == "" || $.trim($("#po_SHIPTOATTN1POS").val()) == "" || $.trim($("#po_SHIPTOATTN1MOB").val()) == ""
                    || $.trim($("#po_VENDORATTN1NAME").val()) == "" || $.trim($("#po_VENDORATTN1POS").val()) == "" || $.trim($("#po_VENDORATTN1MOB").val()) == ""  ||
                    $.trim($("#po_VENDORNAME").val()) == "")
                {
                    $("#ChangeStatus").dialog('close');
                    $.each(validationFieldsforAPPRandWAPPR, function (key, value) {
                        removeShippingandDeliveryInfoErrors(value);
                        if ($.trim($("#po_" + value).val()) == '')
                        {
                            setShippingandDeliveryInfoErrors(value);
                        }
                    });
                    errorMessage = "Could not change PO # " + $("#po_PONUM").val() + " status to " + $("#poStatusTypes").val() + ". Required Date,Supplier Info, Delivery Info and Contact Information is required."
                    renderError(errorMessage);
                    return false;
                }

                //Required Date should be greater than or equal to Order Date
                $("#po_REQUIREDATE").removeClass('validationerror');
                if ($('#po_REQUIREDATE').val() < $('#po_ORDERDATE').val()) {
                    $("#ChangeStatus").dialog('close');
                    errorMessage = "Required Date should be greater than or equal to Order Date";
                    renderError(errorMessage);
                    $("#po_REQUIREDATE").addClass('validationerror');
                    return false;
                }

                //Could not change PO #{0} status to {1}. Purchase Order should contain at least one PO Line.
                var poLineCount = $('#pOLineId tr:gt(0)').length;
                if (poLineCount <= 0) {
                    $("#ChangeStatus").dialog('close');
                    errorMessage = "Could not change PO #" + $("#po_PONUM").val() + "status to " + $("#poStatusTypes").val() + ". Purchase Order should contain at least one PO Line.";
                    renderError(errorMessage);
                    $("#po_REQUIREDATE").addClass('validationerror');
                    return false;
                }

                //Error against POLINE { 0 }: Total cost cannot be equal to 0.0 when submitting / approving a PO.
                var poLineTotalCost = 0;
                $('#pOLineId tr:gt(0)').each(function (i) {
                    if ($(this).find("td").eq(7).html() > 0) {
                        poLineTotalCost += $(this).find("td").eq(7).html();
                    }
                });
                if (poLineTotalCost == 0) {
                    $("#ChangeStatus").dialog('close');
                    errorMessage = "Error against POLINE " + $("#po_PONUM").val() + " : Total cost cannot be equal to 0.0 when submitting / approving a PO";
                    renderError(errorMessage);
                    return false;
                }
                // PO Signature Membercode and MemberId should not be null
                $('#webGridSignature tr:gt(0)').each(function (i) {
                   if ($(this).find("td").eq(3).html() == '' || $(this).find("td").eq(4).html() == '') {
                        $("#ChangeStatus").dialog('close');
                       errorMessage = "Could not change PO " + $("#po_PONUM").val() + " status to " + $("#poStatusTypes").val() + ". PO Signatures information cannot be null."
                       renderError(errorMessage);
                       return false;
                    }
                });

                //Pending - Permission denied. Reopening an approved purchase order requires a permission, which is not granted to your account profile.
                //File Upload validation pending when status is Approved - 1141
                //Only PDF allowed -Invalid File Type. Only Pdf files are allowed. - 1144
                //The specified file is too long. The fully qualified file name must be less then 240 letters. - 1145
                

           }
            
       
        }
    });

    $('#CreatePO').on('keyup keypress', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            return false;
        }
    });
    $("#Designation").on('change', function () {
        $.ajax({
            type: "GET",
            url: "/PO/GetEmployeesforDesig?designationCode=" + $("#Designation").val(),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            cache: false,
            success: function (employees) {
                if (employees) {
                     $("#TeamMemberCode").empty();
                    $.each(employees, function (i, emp) {
                     var optionshtml = '<option value="' + emp.emp_code + '">' + emp.emp_name + '</option>';
                        $("#TeamMemberCode").append(optionshtml);
                    });

                    $("#TeamMemberName").val($("#TeamMemberCode option:selected").text());
                }
            },
            error: function (ex) {
                alert('Failed to retrieve Employees.' + ex);
            }
        });
        return false;
    });
    $(document).on('click', '#btnPOSignatureClose', function () {
        $("#divPOSignatureRequiredFieldError").attr('style', 'display: none');
    });
 });

function checkPOReceiving(errorMessage) {
    var actionUrl = "/PO/CheckPOReceivedQuantity?poNum=" + $("#po_PONUM").val() + "&poRev=" + $("#po_POREVISION").val();
    $.ajax({
        type: "GET",
        url: actionUrl,
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
          if (data.result == "success" && data.poReceiving != null) {
                    $("#ChangeStatus").dialog('close');
                    errorMessage = "Cannot update status. Receiving has been done on this purchase order."
                    renderError(errorMessage);
                    return false;
            }
        },
        failure: function (response) {
            alert(response.responseText);
        },
        error: function (response) {
            alert(response.responseText);
        }
    });
}

function removeShippingandDeliveryInfoErrors(elementId) {
    $("#po_" + elementId).removeClass('validationerror');
}

function setShippingandDeliveryInfoErrors(elementId) {
    $("#po_" + elementId).addClass('validationerror');
}

function setEmployeeName() {
    $("#TeamMemberName").val($("#TeamMemberCode option:selected").text());
}

function loadPartialView(dialogName, actionurl) {
    $.ajax({
        type: "GET",
        url: actionurl,
        contentType: "application/json; charset=utf-8",
        dataType: "html",
        cache: false,
        success: function (response) {
            $('#' + dialogName).html(response);
            $('#' + dialogName).dialog('open');
        },
        failure: function (response) {
            alert(response.responseText);
        },
        error: function (response) {
            alert(response.responseText);
        }
    });
}

function getUsers(title) {
    createDialog("GetUsers", title, 500);
    loadPartialView("GetUsers", "/PO/GetUsers");
}


function CreatePOSignature() {
    clearPOSignatureMessages();
    poSignatureMode = CreateMode;
    createDialog("CreatePOSignature", "Create PO Signature", 550);
    loadPartialView("CreatePOSignature", "/PO/POSignature?poNum=" + $("#po_PONUM").val() + "&poRev=" + $("#po_POREVISION").val() + "&orderNo=" + 0 + "&poSignatureMode=" + CreateMode);
    // For Hiding the horizontal scroll in page
    $("#CreatePOSignature").css('overflow', 'hidden');
    
}

function EditPOSignature(orderNo) {
    clearPOSignatureMessages();
    poSignatureMode = EditMode;
    createDialog("EditPOSignature", "Edit PO Signature", 550);
    loadPartialView("EditPOSignature", "/PO/POSignature?poNum=" + $("#po_PONUM").val() + "&poRev=" + $("#po_POREVISION").val() + "&orderNo=" + orderNo + "&poSignatureMode=" + EditMode);
    $("#EditPOSignature").css('overflow', 'hidden');
  }

function createDialog(dialogName, titleName, dialogWidth) {
    $("#" + dialogName).dialog({
        autoOpen: false,
        position: { my: "top", at: "top+150", of: window },
        width: dialogWidth,
        resizable: false,
        title: titleName,
        modal: true,
        close: function () {
            $(this).empty();
            $(this).dialog("close");
        }
    });
}
 
function renderError(message) {
        clearErrorDiv();
        $("#divCustomError").html('<strong>Error!</strong> ' + message);
        $("#divCustomError").append('<button id="btnClose" type="button" class="close" aria-hidden="true">&times;</button>');
        $("#divCustomError").attr('style', 'display: block');
        $(window).scrollTop(0);
    }
function clearErrorDiv() {
        $("#divSuccess").attr('style', 'display: none');
        $("#divRequiredFieldError").attr('style', 'display: none');
        $("#divCustomError").attr('style', 'display: none');
}

function getresult(data) {
    if (data.result = "success" && $("#po_POMODE").val() == "Create") {
        location.href = "GetPurchaseOrder?poNum=" + data.poresult.PONUM + "&poRev=" + data.poresult.POREVISION + "&eventMode=PO";
    }
    else if (data.result = "success" && $("#po_POMODE").val() == "Edit") {
        $("input[name='po.DESCRIPTION']").val(data.poresult.DESCRIPTION);
        var dtLastDateTime = new Date(parseInt(data.poresult.LASTMODIFIEDDATE.replace("/Date(", "").replace(")/", ""), 10));
        $("#LastModifiedDate").html(dtLastDateTime.toLocaleString());
        clearErrorDiv()
        renderSuccessMsgDiv('Purchase Order has been Updated Successfully');
    }
}

function getPOSignatureResult() {
    if (poSignatureMode == CreateMode) {
        $("#CreatePOSignature").dialog('close');
        renderSuccessMsgDiv('PO Signature Added Successfully');
    }
    else {
        $("#EditPOSignature").dialog('close');
        renderSuccessMsgDiv('PO Signature Updated Successfully');
    }
   
    //Refresh the PO Signature Web Grid
    $("#SignatureItemWebGridDiv").load(location.href + " #SignatureItemWebGridDiv");
}

function deletePOSig(orderNo) {
    clearPOSignatureMessages();
    poSignatureOrderNo = orderNo;
    $("#deleteModal").find('.modal-body').text('Are you sure want to delete the Signature?');
    $("#deleteModal").modal('show');
}

function delItem() {
    if ($("ul#myTab li.active").text() == "PO Line") {
        delPOLine();
    }
    else if ($("ul#myTab li.active").text() == "Signatures") {
        delPOSignature();
    }
}

function delPOSignature() {
    var actionUrl = "/PO/DelPoSignature?orgCode=" + $("#po_ORGCODE").val() + "&poNum=" + $("#po_PONUM").val() + "&poRev=" + $("#po_POREVISION").val() + "&orderNo=" + poSignatureOrderNo;
    $.ajax({
        type: "GET",
        url: actionUrl,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.result == "success") {
                $("#deleteModal").modal('hide');
                renderSuccessMsgDiv('PO Signature has been Deleted Successfully');
                $("#SignatureItemWebGridDiv").load(location.href + " #SignatureItemWebGridDiv");
            }
       },
        failure: function (response) {
            alert(response.responseText);
        },
        error: function (response) {
            alert(response.responseText);
        }
    });
}

function renderSuccessMsgDiv(message) {
    $("#divSuccess").html('<strong>Success!</strong>' + message);
    $("#divSuccess").append('<button id="btnClose" type="button" class="close" aria-hidden="true">&times;</button>');
    $("#divSuccess").attr('style', 'display: block');
    $(window).scrollTop(0);
}

function clearErrorDiv() {
    $("#divSuccess").attr('style', 'display: none');
    $("#divRequiredFieldError").attr('style', 'display: none');
    $("#divCustomError").attr('style', 'display: none');
    $(window).scrollTop(0);
}

function clearPOSignatureMessages() {
    $("#divPOSignatureRequiredFieldError").attr('style', 'display: none');
    $("#divSuccess").attr('style', 'display: none');
}

function changePOStatus() {
    createDialog("ChangeStatus", "Change Status", 500);
    loadPartialView("ChangeStatus", "/PO/ViewChangePOStatus?poNum=" + $("#po_PONUM").val() + "&poRev=" + $("#po_POREVISION").val() + "&poStatus=" + $("#po_STATUS").val());
    $("#ChangeStatus").css('overflow', 'hidden');
}

function getPOChangeStatus(data) {
    if (data.result == "success") {
        $("#ChangeStatus").dialog('close');
        location.href = "GetPurchaseOrder?poNum=" + data.poResult.PONUM + "&poRev=" + data.poResult.POREVISION + "&eventMode=" + changeStatusMode;
        //renderSuccessMsgDiv('PO Status has been Updated Successfully');
    }
}