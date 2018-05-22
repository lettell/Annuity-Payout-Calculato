'use strict'
// co
const _aF  = document.getElementById('annuityForm'),
      _aU = document.getElementById('annuityUpdate'),
      sheduleContainer = document.getElementById('shedule'),
      linkContainer = document.getElementById('info');
let shedules = [],
    stateTrack; 

function paybackShedule(shedule) {
    this.id = shedules.length+1;
    this.shedule = shedule;
} 

_aF.addEventListener('submit',  function(event) {
    // prevent multiply send request
    
    event.preventDefault();
        const  PV = this.loanAmount.value,
          ir = Number(this.interestRate.value),
          n = Number(this.loanTerm.value),
          sd = this.startDate.value;
    // validate 
    
    // calc payback annuity
     calcAnnuity(PV, ir, n, sd);
})
_aU.addEventListener('submit',  function(event) {
    // prevent multiply send request
    
    event.preventDefault();
        const id = Number(this.dataset.uid),
              fr = Number(this.from.value),
              PV = shedules[id].shedule[fr][2],
              ir = Number(this.interestR.value),
              n = Number(shedules[id].shedule.length - fr),
              sd = new Date(shedules[id].shedule[fr][1]);

     calcAnnuity(PV, ir, n, sd, id, fr);
})

/* PV - loanAmount,  r - interest rate, n - loanTerm, sd - startDate;
* k - annuty coficient, mp - Monthly payments
*/ 
function calcAnnuity() {const[PV, ir, n, sd, id, fr] = arguments;
   
    const r = Big(ir).div(100).div(12),
          k = Big((r * (r.plus(1)).pow(n))/(((r.plus(1)).pow(n))-1)),        
          mp = Number(k.times(PV).toFixed(2))

    let arr = [["Payment #", "Payment date", "Remaining amount", "Principal payment", "Interest payment", "Total payment", "Interest rate"]];
     
         let i = 1,
             rm = Number(PV),
             ip = Number(Big(PV).times(r).toFixed(2)),
             update = false;

             if (id != undefined) {
                shedules[id].shedule.splice(fr)
                update = true;
            }

          for (;i<=n;) {
            let pd = new Date(sd);
                pd.setMonth(pd.getMonth()+i)
            let x = new Array(7).fill(0);
             x[6] = ir;
             x[5] = mp;
             x[4] = Number(ip).toFixed(2)*1;
             x[3] = Number(Big(x[5]).minus(x[4]).toFixed(2));
             x[2] = rm;
             x[1] = (pd.getMonth()) + '/' + pd.getDate() + '/' +  pd.getFullYear();
             x[0] = update?i+fr-1:i;
             if (i===n)
             { 
               x[5] = (x[2]+x[4]).toFixed(2)*1;
               x[3] = x[2];
               arr.push(x);
               break; 
             };
            i++
            arr.push(x)
            rm = Number(Big(rm).minus(x[3]));
            ip = Number(Big(rm).times(r));
         };
         
    if (update) {
        shedules[id].shedule = shedules[id].shedule.concat(arr.splice(1));
    } else {
        let shedule = new paybackShedule(arr);
        shedules.push(shedule);
    };

    genCSV(shedules.length-1);
    showTable(shedules.length-1);
    _aU.dataset.uid = shedules.length-1
}

function showTable(index){
    let table = shedules[index].shedule
    let htmlTable = document.createElement("table");
    sheduleContainer.innerHTML = '';
    table.forEach((elm, ind) => {
        let row = document.createElement("tr");
        if(ind == 0) {
            elm.forEach(elm => {
                let col = document.createElement("th");
                col.innerHTML = elm;
                row.appendChild(col);
            })
            htmlTable.appendChild(row);

        }else {
            elm.forEach(elm => {
                let col = document.createElement("td");
                col.innerHTML = elm;
                row.appendChild(col);
            })
            htmlTable.appendChild(row);
        }

    })
    sheduleContainer.appendChild(htmlTable); // Required for FF

}
    // table to csv
function genCSV(index) {

    let table = shedules[index].shedule
    let csvContent = "data:text/csv;charset=utf-8,";

    table.forEach(function(rowArray){

       let row = rowArray.join(",");
       csvContent += row + "\r\n";
    });
    let createdAt = Date.now()
    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");

    link.setAttribute("href", encodedUri);
    link.classList.add('btn')
    link.setAttribute("download", "shedule_"+createdAt+".csv");
    link.innerHTML= "Click Here to download as CSV";
    linkContainer.innerHTML= '';
    linkContainer.insertAdjacentElement('afterbegin', link);
    stateTrack = "CSV ready"
    checkState(); 
}
function checkState() {
    if (stateTrack == "CSV ready") {
        _aU.classList.remove('hidden')
        _aF.classList.add('hidden')
        linkContainer.classList.remove('hidden');
    }
}
function newCalc() {
    _aF.classList.remove('hidden')
    _aF.reset();
    _aU.classList.add('hidden');
    linkContainer.innerHTML = '';
    sheduleContainer.innerHTML = '';
}   