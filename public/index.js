//const express = require("express");
let title = document.getElementById("name")
let status = document.getElementById("status")
let dueDate = document.getElementById("duedate")
let amountReq = document.getElementById("amountreq")
let amountRec = document.getElementById("amountrec")
let duration = document.getElementById("duration")
let finalRep = document.getElementById("final")
let intDate = document.getElementById("intdate")
let grantid = null;

document.addEventListener('DOMContentLoaded', function() {

  const selectBoxes = document.querySelectorAll('select');
  const instances = M.FormSelect.init(selectBoxes);
  const datePicker = document.querySelectorAll('.datepicker');
  const dateInstances = M.Datepicker.init(datePicker, {minDate: new Date(), format: 'mm/dd/yyyy'});
  M.updateTextFields();
  document.getElementById("btn").addEventListener("click", btnClickAct);

  getOptions()
  async function getOptions() {
    console.log("Fetching Options")
    const response = await fetch('/options');
    const data = await response.json();
    console.log(data);

    const status = document.getElementById("status");
    console.log(status);
    for (ele of data) {
      const option = document.createElement("option");
      option.textContent = ele.status;
      option.value = ele.status;
      option.id = ele.status;
      console.log(option.id);
      status.appendChild(option);
    M.FormSelect.init(selectBoxes);
    };
  };

    
  const urlQuery = window.location.search;
  const urlParams = new URLSearchParams(urlQuery);
  if (urlParams.has('grantid')) {

    grantid = urlParams.get('grantid');
    getGrant()

    async function getGrant() {
      const response = await fetch(`/grant/${grantid}`, {
        method: 'get'
      });
      const data = await response.json();
      console.log(data);
      document.getElementById('granttype').innerText = 'Edit Grant'
      title.value = data.grant;
      setSelection(status, data.status)
      console.log(status)

      function setSelection (s, valsearch) {
        for (i = 0; i < s.options.length; i++) {
          console.log(s.options[i])
          if (s.options[i].value === valsearch){
            s.options[i].selected = true;
            if (status.value === 'Recieved'){
              displayCheck(document.getElementById('intcheck'), 'interim');
                displayOption(document.getElementById('status'));
                document.getElementById('intcheckbox').setAttribute('checked', 'checked');
            };  
            console.log(s)
            break;
          };
        };
      };

      dueDate.value = data.due_date;
      amountReq.value = data.amount_requested;
      amountRec.value = data.amount_received;
      duration.value = data.duration;
      finalRep.value = data.final_report;
      intDate.value = data.interim_report;
      M.updateTextFields();
      M.FormSelect.init(selectBoxes);
      };
  };

  
  function btnClickAct(){
    const toValidate = {
      name: "Grant name required",
      status: "Status required",
      amountreq: "Must be a dollar amount",
      amountrec: "Must be a dollar amount",
    };
    let idKeys = Object.keys(toValidate)
    let allValid = true;
    idKeys.forEach(function(id){
      let isValid = checkIfValid(id, toValidate[id]);
      if(!isValid){
        allValid = false;
      };
      return true
      });
    if(allValid){
       addRecord();
    };
  };
  function checkIfValid(elId, message){
    let isValid = document.getElementById(elId).checkValidity()
    if(!isValid){
      //warn user
      M.toast({html: message});
      return false;
    };
    return true;
  
  };
  async function addRecord(){
    const data = [title.value, status.value, dueDate.value, amountReq.value, amountRec.value, duration.value, finalRep.value, intDate.value];
    console.log(data);
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    };
    const response = await fetch(`/api/${grantid}`, options);
    console.log(response.status);
    
    title.value = "";
    status.value = "";
    dueDate.value = "";
    amountReq.value = "";
    amountRec.value = "";
    duration.value = "";
    finalRep.value = null;
    intDate.value = null;
    M.updateTextFields();
  };
});

function displayOption(that) {
  let rec = document.getElementById("rec")
  let finalRep = document.getElementById("finalrep")
  let repDue = document.getElementById("repdue")
  let interim =  document.getElementById("interim")
  let intCheck = document.getElementById("intcheck")

  if (that.value == "Recieved") {
    rec.style.display = "block";
    finalRep.style.display = "block";
    intCheck.style.display = "block";
    
    if (intCheck.getAttribute("checked") === "true") {
      interim.style.display = "block";
      intcheck.className = "input-field col s6 l3 push-l3"
    };
    repDue.style.display = "none";

  } else {
    finalRep.style.display = "none";
    intCheck.style.display = "none";
    repDue.style.display = "block";
    rec.style.display = "none"

    if (interim.style.display = "block") {
      interim.style.display = "none"
      intCheck.className = "input-field col s6 l3"
    };
    
  };
}
function displayCheck(that, id) {

    let el = document.getElementById(id)
    let intcheck = document.getElementById("intcheck")

    if (el.style.display == "none") {
      el.style.display = "block";
      el.className = "input-field col s6 l3 pull-l3"
      intcheck.className = "input-field col s6 l3 push-l3"
      intcheck.setAttribute("checked", "true")

    } else {
      el.style.display = "none";
      intcheck.className = "input-field col s6 l3"
      intcheck.setAttribute("checked", "false")
      
    };
};