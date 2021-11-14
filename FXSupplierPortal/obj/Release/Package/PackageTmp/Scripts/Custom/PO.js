
var CreateMode = "Create";
var EditMode = "Edit";
var POEventMode = "PO"
var SearchEventMode="SEARCHPO"

var title;
var poLineItemMode;

$(document).ready(function () {
     if (($("#po_POMODE").val()) == CreateMode) {
        $("#po_POREVISION").val(0);
        $("#po_STATUS").val('DRAFT');
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
       if ($("#EventMode").val() == POEventMode) {
            clearErrorDiv();
            $("#divSuccess").show();
            $("#EventMode").val("");
            window.history.pushState("", "", "GetPurchaseOrder?poNum=" + poNum + "&poRev=" + $("#po_POREVISION").val());
        }
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
            renderError(errorMessage)
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

    $('#CreatePO').on('keyup keypress', function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            return false;
        }
    });


});

function loadPartialView(dialogName, actionurl) {
    $.ajax({
        type: "GET",
        url: actionurl,
        contentType: "application/json; charset=utf-8",
        dataType: "html",
        cache: false,
        success: function (response) {
            //debugger;
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

var pageOffset = window.pageYOffset;
function poLineCreateDialog(dialogName, titleName, dialogWidth) {

    $("#" + dialogName).dialog({
        autoOpen: false,
        //position: { my: "top", at: "top+150", of: window },
        width: dialogWidth,
        resizable: false,

        title: titleName,
        modal: true,
        open: function () {
            $(this).parent().css({ 'top': pageOffset + 50 });
            var self = this;
        },
        buttons: [{
            id: "btn-cancel",
            click: function () {
                $(this).dialog("close");
            }
        }]
    });
}

function CreatePOLine() {
    poLineCreateDialog("CreatePOLine", "Create PO Line", 1000);
    poLineItemMode = "Create";
    $("#POLINEMODE").val('Create');
    loadPartialView("CreatePOLine", "/PO/EditPOLine?poNum=" + $("#po_PONUM").val() + "&poRev=" + $("#po_POREVISION").val() + "&poLineNum=" + 0 + "&poLineItemMode=" + poLineItemMode);
}

function editPOLine(poNum, poRev, poLineNum) {
    poLineCreateDialog("editPOLine", "Edit PO Line", 1000);
    poLineItemMode = "Edit";
    $("#POLINEMODE").val('Edit');
    loadPartialView("editPOLine", "/PO/EditPOLine?poNum=" + poNum + "&poRev=" + poRev + "&poLineNum=" + poLineNum + "&poLineItemMode=" + poLineItemMode);
    //$("#editPOLine").css({top: "59.9943px"});
    //height: "350px", overflow: "auto"
}

function createDialog(dialogName, titleName, dialogWidth) {
    $("#" + dialogName).dialog({
        autoOpen: false,
        position: { my: "top", at: "top+150", of: window },
        width: dialogWidth,
        resizable: false,
        title: titleName,
        modal: true,
        buttons: [{
            id: "btn-cancel",
            click: function () {
                $(this).dialog("close");
            }
        }]
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
        $("input[name='po.DESCRIPTION'").val(data.poresult.DESCRIPTION);
        var dtLastDateTime = new Date(parseInt(data.poresult.LASTMODIFIEDDATE.replace("/Date(", "").replace(")/", ""), 10));
        $("#LastModifiedDate").html(dtLastDateTime.toLocaleString());
        clearErrorDiv()
        renderSuccessMsgDiv('Purchase Order has been Updated Successfully');
    }
}

function getPOLineResult(data) {
   if (data.result = "success") {
        $("#po_PRETAXTOTAL").val(data.poUpdatedCost.PRETAXTOTAL + ".00");
        $("#po_TOTALTAX").val(data.poUpdatedCost.TOTALTAX + ".00");
        $("#po_TOTALCOST").val(data.poUpdatedCost.TOTALCOST+".00");
        $("#POLineTotalCost").val(data.poUpdatedCost.TOTALCOST + ".00");
        
        if ($("#POLINEMODE").val() == CreateMode) {
            $("#CreatePOLine").dialog('close');
            renderSuccessMsgDiv('PO Line Item Added Successfully');
        }
        else {
            $("#editPOLine").dialog('close');
            renderSuccessMsgDiv('PO Line Item Updated Successfully');
       }
        //Refresh the PoLine Item Web Grid
        $("#POLineItemWebGridDiv").load(location.href + " #POLineItemWebGridDiv");
    }    
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

function getUsers(title) {
    createDialog("GetUsers", title, 500);
    loadPartialView("GetUsers", "/PO/GetUsers");
}

function changeItem() {
    if ($("#LINETYPE").val() == "Item") {
        $('#ITEMNUM').attr('readOnly', false);
        $('#DESCRIPTION').val('');
        $('#imgItem').show();
    }
    else {
        $('#ITEMNUM').attr('readOnly', true);
        $('#ITEMNUM').val('');
        $('#DESCRIPTION').val('');
        $('#imgItem').hide();
    }
}


