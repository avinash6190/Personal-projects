var CreateMode = "Create";
var EditMode = "Edit";

var linePONum;
var linePORev;
var linePOId;
var poLineItemMode;
$(document).ready(function () {
    if ($("#POLINEMODE").val() == EditMode) {
        $("#btnCreatePoLine").val('Update');
    }
    
    if ($("#LINETYPE").val() == "Item") {
        $('#ITEMNUM').attr('readOnly', false);
        $('#imgItem').show();
    }
    else {
        $('#ITEMNUM').attr('readOnly', true);
        $('#imgItem').hide();
    }

    $("#btnCreatePoLine").click(function () {
        var form = $('#AddPOLine');
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

        if (!$('#AddPOLine').isValid()) {
            clearErrorDiv();
            $("#divPOLineRequiredFieldError").attr('style', 'display: block');
            $(window).scrollTop(0);
        }

    });


    $(document).on('click', '#deletePOLinebtn', function () {
        delPOLine(linePONum, linePORev, linePOId);
    });

    $(document).on('click', '#btnPOLineClose', function () {
        $("#divPOLineRequiredFieldError").attr('style', 'display: none');
    });

    if ($("#TAXED").is(":checked") == true) {
        disableTaxFields();
    }
    $('#ORDERQTY').change(function () {
        getLineCostCalculation();
        getUnitCostCalculation();
        
// If Quantity is updated, and Unit Cost is defined, update LINECOST as Unit Cost x Quantity

// If Quantity is updated, and Unit Cost is null or empty or zero, and LINECOST is defined-> update Unit Cost = Line Cost/Quantity

//If Unit Cost is updated, and Quantity is defined, update LINECOST = Unit Cost x Quantity

//If Unit Cost is updated, and Quantity is null or empty or zero, and LINE COST is defined -> update Quantity as Line Cost / Unit Cost

//If LINECOST is updated, and Quantity is defined -> update Unit Cost as Line cost / Quantity

//If LINECOST is updated, and Quantity is null or empty or zero, and UNIT COST is defined -> update Quantity as Line Cost / Unit Cost
    });

    $('#UNITCOST').change(function () {
        getLineCostCalculation();
        if (($("#ORDERQTY").val().toString() == null || $("#ORDERQTY").val() <= 0)) {
            getQuantityCalculation();
        }
        
    });

    $('#LINECOST').change(function () {
        getUnitCostCalculation();
        if (($("#ORDERQTY").val().toString() == null || $("#ORDERQTY").val() <= 0)) {
            getQuantityCalculation();
        }
    });

    $('#AddPOLine').on('keyup keypress', function (e) {
       var keyCode = e.keyCode || e.which;
        if (keyCode === 13) {
            e.preventDefault();
            return false;
        }
    });
 
});

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
        },
        close: function () {
            $(this).empty();
            $(this).dialog("close");
        }
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
}

function getPOLineResult(data) {
    if (data.result = "success") {
        $("#po_PRETAXTOTAL").val(data.poUpdatedCost.PRETAXTOTAL + ".00");
        $("#po_TOTALTAX").val(data.poUpdatedCost.TOTALTAX + ".00");
        $("#po_TOTALCOST").val(data.poUpdatedCost.TOTALCOST + ".00");
        $("#POLineTotalCost").val(data.poUpdatedCost.TOTALCOST + ".00");

        if ($("#POLINEMODE").val() == CreateMode) {
            $("#CreatePOLine").empty();
            $("#CreatePOLine").dialog('close');
            renderSuccessMsgDiv('PO Line Item Added Successfully');
        }
        else {
            $("#editPOLine").empty();
            $("#editPOLine").dialog('close');
            renderSuccessMsgDiv('PO Line Item Updated Successfully');
        }
        //Refresh the PoLine Item Web Grid
        $("#POLineItemWebGridDiv").load(location.href + " #POLineItemWebGridDiv");
    }
}

function getQuantityCalculation() {
    if ($("#LINECOST").val().toString() != null & $("#LINECOST").val() > 0 &
        $("#UNITCOST").val().toString() != null & $("#UNITCOST").val() > 0)
    {
        $("#ORDERQTY").val($("#LINECOST").val() / $("#UNITCOST").val());
    }
}

function getLineCostCalculation() {
    if ($("#UNITCOST").val().toString() != null & $("#UNITCOST").val() > 0
        & $("#ORDERQTY").val().toString() != null & $("#ORDERQTY").val() > 0)
    {
        var totalCost = $("#ORDERQTY").val() * $("#UNITCOST").val();
        $("#LINECOST").val(totalCost);
        getTaxCalculation();
    }
}

function getUnitCostCalculation() {
    if ($("#LINECOST").val().toString() != null & $("#LINECOST").val() > 0 &
        $("#ORDERQTY").val().toString() != null & $("#ORDERQTY").val() > 0)
    {
        $("#UNITCOST").val($("#LINECOST").val() / $("#ORDERQTY").val());
        getTaxCalculation();
    }
}

function getTaxCalculation() {
    if ($("#LINECOST").val().toString() != null & $("#LINECOST").val() > 0 & $("#TAXED").is(":checked") == false) {
        if ($("#TAXCODE").val() == "VAT") {
            $("#TAXTOTAL").val($("#LINECOST").val() * (5 / 100));
        }
        else if ($("#TAXCODE").val() == "VATLB") {
            $("#TAXTOTAL").val($("#LINECOST").val() * (6 / 100));
        }
    }
}

function changeTaxed() {
    if ($("#TAXED").is(":checked") == true) {
        disableTaxFields();
    }
    else {
        enableTaxFields();
    }
}

function enableTaxFields() {
    $('#TAXCODE').attr('readOnly', false);
    $('#TAXTOTAL').attr('readOnly', false);
    $('#TAXCODE').val('VAT');
    $('#imgTaxCode').show();
    getTaxCalculation();
}

function disableTaxFields() {
    if ($("#TAXED").is(":checked") == true) {
        $('#TAXCODE').attr('readOnly', true);
        $('#TAXTOTAL').attr('readOnly', true);
        $('#TAXCODE').val('');
        $('#TAXTOTAL').val(0);
        $('#imgTaxCode').hide();
    }
}

function delPOLine() {
    var actionUrl = "/PO/DelPoLine?poNum=" + linePONum + "&poRev=" + linePORev + "&poLineNum=" + linePOId;
    $.ajax({
        type: "GET",
        url: actionUrl,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (data.result == "success") {
                $("#deleteModal").modal('hide');
                $("#po_PRETAXTOTAL").val(data.poUpdatedCost.PRETAXTOTAL + ".00");
                $("#po_TOTALTAX").val(data.poUpdatedCost.TOTALTAX + ".00");
                $("#po_TOTALCOST").val(data.poUpdatedCost.TOTALCOST + ".00");
                $("#POLineTotalCost").val(data.poUpdatedCost.TOTALCOST + ".00");
                renderSuccessMsgDiv('PO Line Item has been Deleted Successfully');
                $("#POLineItemWebGridDiv").load(location.href + " #POLineItemWebGridDiv");
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

function deletePOLine(poNum, poRev, poLineId) {
    linePONum = poNum;
    linePORev = poRev;
    linePOId = poLineId;
    $("#deleteModal").find('.modal-body').text('Are you sure want to delete the PO Line Item?');
    $("#deleteModal").modal('show');
}

function changeItem() {
    if ($("#LINETYPE").val() == "Item") {
        $('#ITEMNUM').attr('readOnly', false);
        $('#DESCreaRIPTION').val(String.empty);
        $('#imgItem').show();
    }
    else {
        $('#ITEMNUM').attr('readOnly', true);
        $('#ITEMNUM').val(String.empty);
        $('#DESCRIPTION').val(String.empty);
        $('#imgItem').hide();
    }
}