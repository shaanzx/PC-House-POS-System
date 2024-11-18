getAllCustomers();


$(document).ready(function () {
    let nextCustomerID = generateNextCustomerID();
    $("#c_inputCustId").val(nextCustomerID);
  });


//save btn action
$("#c_btnSave").click(function () {
    saveCustomer();
    $("#o_inputCustId").empty();
    loadCustIds();
    getAllCustomers();
    clearTxtFields();
})

//update btn action
$("#c_btnUpdate").click(function () {
    let id = $("#c_inputCustId").val();
    updateCustomer(id.trim());
    getAllCustomers();
    clearTxtFields();
})

//delete btn action
$("#c_btnDelete").click(function () {
    let id = $("#c_inputCustId").val();
    deleteCustomer(id.trim());
    getAllCustomers();
    clearTxtFields();
})

//clear btn action
$("#c_btnClear").click(function () {
    clearTxtFields();
})

//search btn action
$("#c_btnSearch").click(function () {
    let custId = $("#c_inpSearch").val();

    let customer = findCustomer(custId.trim());

    if(customer == undefined){
        alert(`no customer found with the ID: ${custId} . Please try again.`);
        $("#c_inpSearch").val("");
    }else{
        setDataToTxtFields(customer.id,customer.name,customer.address,customer.contact);
        $("#c_collapseOne").collapse("show");
        $("#c_inpSearch").val("");
    }
})

function saveCustomer() {
    let custId = $("#c_inputCustId").val();

    if(findCustomer(custId.trim()) == undefined ){
        let custName = $("#c_inputCustName").val();
        let custAddress = $("#c_inputCustAddress").val();
        let custContact = $("#c_inputCustContact").val();

        let newCustomer = Object.assign({}, customer);

        newCustomer.id = custId;
        newCustomer.name = custName;
        newCustomer.address = custAddress;
        newCustomer.contact = custContact;

        customerDB.push(newCustomer);
    }else{
        alert(`customer with the ID: ${custId} already exists.`)
    }
}

function updateCustomer(id) {
    let customer = findCustomer(id);

    if(customer==undefined){
        alert(`No customer with the ID: ${id} . Please check the ID again.`);
    }else{
        let result = confirm("Confirm customer details updating process?");
        if(result){
            let custName = $("#c_inputCustName").val();
            let custAddress = $("#c_inputCustAddress").val();
            let custContact = $("#c_inputCustContact").val();

            customer.name = custName;
            customer.address = custAddress;
            customer.contact = custContact;
        }
    }
}

function deleteCustomer(id) {
    let customer = findCustomer(id);

    if(customer==undefined){
        alert(`No customer with the ID: ${id} . Please check the ID again.`);
    }else{
        let result = confirm("Are you sure you want to remove this customer?");
        if(result){
            let status = "pending"
            for (let i = 0; i < customerDB.length; i++) {
                if (customerDB[i].id == id) {
                    customerDB.splice(i, 1);
                    status = "done"
                    alert("customer deleted successfully")
                }
            }
            if(status == "pending"){
                alert("customer not removed")
            }
        }
    }
}

function findCustomer(id){
    return customerDB.find(function (customer) {
        return customer.id == id;
    });
}

function getAllCustomers() {
    $("#c_tBody").empty();

    for (let i = 0; i < customerDB.length; i++) {
        let id = customerDB[i].id;
        let name = customerDB[i].name;
        let address = customerDB[i].address;
        let salary = customerDB[i].contact;

        let row = `<tr>
                   <td>${id}</td>
                   <td>${name}</td>
                   <td>${address}</td>
                   <td>${salary}</td>
                   </tr>`;

        $("#c_tBody").append(row);
    }
    onTblRowClick()
}

function onTblRowClick() {
    let singleClickTimer;

    $("#c_tBody>tr").on("mousedown", function (event) {
        if (event.which === 1) { // Left mouse button (1) clicked
            let row = $(this);
            if (singleClickTimer) {
                clearTimeout(singleClickTimer);
                singleClickTimer = null;
                // Handle double click
                deleteCustomer(row.children().eq(0).text());
                getAllCustomers();
            } else {
                singleClickTimer = setTimeout(function () {
                    singleClickTimer = null;
                    // Handle single click
                    let id = row.children().eq(0).text();
                    let name = row.children().eq(1).text();
                    let address = row.children().eq(2).text();
                    let contact = row.children().eq(3).text();
                    setDataToTxtFields(id, name, address, contact);
                    $("#c_collapseOne").collapse("show");
                    $("#c_collapseOne")[0].scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300); // Adjust the delay (300 milliseconds) as needed
            }
        }
    });
}

function setDataToTxtFields(id,name,address,contact){
    $("#c_inputCustId").val(id);
    $("#c_inputCustName").val(name);
    $("#c_inputCustAddress").val(address);
    $("#c_inputCustContact").val(contact);

    $("#c_inputCustId,#c_inputCustName,#c_inputCustAddress,#c_inputCustContact").addClass("border-secondary-subtle");
    setBtn();
}

function clearTxtFields(){
    $("#c_inputCustId,#c_inputCustName,#c_inputCustAddress,#c_inputCustContact").val("");
    $("#c_inputCustId,#c_inputCustName,#c_inputCustAddress,#c_inputCustContact").addClass("border-secondary-subtle");
    setBtn();
    $(".err-label").css("display", "none");
}

function generateNextCustomerID() {
    const highestCustomerID = customerDB.reduce((max, customer) => {
      const customerID = parseInt(customer.id.split("-")[1]);
      return customerID > max ? customerID : max;
    }, 0);
  
    const nextCustomerNumber = highestCustomerID + 1;
    return `C00-${String(nextCustomerNumber).padStart(3, "0")}`;
  }
  