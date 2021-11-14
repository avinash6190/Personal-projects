﻿var CreateMode = "Create";
var EditMode = "Edit";

var linePONum;
var linePORev;
var linePOId;
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
    $("#deleteModal").modal('show');
}