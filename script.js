'use strict'
// co
const _aF  = document.getElementById('annuityForm'),
      _aU = document.getElementById('annuityUpdate'),
      tabs = document.getElementById('tabs'),
      nCal = document.getElementById('new'),
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
nCal.addEventListener('click', function(){
    stateTrack = 'new calculator';
    checkState();
});

/* PV - loanAmount,  r - interest rate, n - loanTerm, sd - startDate;
* k - annuty coficient, mp - Monthly payments
*/ 
function calcAnnuity(PV, ir, n, sd, id, fr) { 
    // const [PV, ir, n, sd, id, fr] = arguments;
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
                // new Array(7).fill(0) ie fix
            let x = [[],[],[],[],[],[],[]];
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
        createTab();

    };

    genCSV(shedules.length-1);
    showTable(shedules.length-1);
    _aU.dataset.uid = shedules.length-1
    document.getElementById('from').setAttribute("max", shedules[0].shedule.length-1);
}
function createTab() {
    let li = document.createElement('li');
    let a = document.createElement('a')
    let b = document.createElement('a')
    a.innerHTML = 'shedule nr:' + shedules.length + ' ';
    a.dataset.id = shedules.length-1;
    a.addEventListener('click', function(){
        genCSV(a.dataset.id);
        showTable(a.dataset.id);
    })
    li.appendChild(a);
    b.innerHTML = ' X'
    b.dataset.id = shedules.length-1;
    b.classList.add('red');
    b.addEventListener('click', function(){
        deleteTab(a.dataset.id);
    })
    li.appendChild(b);
    tabs.appendChild(li);
}
function deleteTab(id) {
    shedules.splice(id, 1)
    tabs.removeChild(tabs.children[1*id+1])
    stateTrack = 'shedule removed';
    checkState();

}
function showTable(index){
    let table = shedules[index].shedule
    let htmlTable = document.createElement("table");
    sheduleContainer.innerHTML = '';
    let i=0 
    for (;i<table.length;) {
        let row = document.createElement("tr");
        if(i == 0) {
            let a=0;
            for (;a < table[i].length;) {
                let col = document.createElement("th");
                col.innerHTML = table[i][a];
                row.appendChild(col);
                a++;
            }
            htmlTable.appendChild(row);

        } else {
            let a = 0;
            for (;a<table[i].length;){
                let col = document.createElement("td");
                col.innerHTML = table[i][a];
                row.appendChild(col);
                a++
            }
            htmlTable.appendChild(row);
        }
        i++
    }
    sheduleContainer.appendChild(htmlTable); // Required for FF

}
    // DataUri check
let supportsDataUri = function() { 
    let isOldIE = navigator.appName === "Microsoft Internet Explorer"; 
    let isIE11 = !!navigator.userAgent.match(/Trident\/7\./); 
    return ! (isOldIE || isIE11);  //Return true if not any IE 
};
           // table to csv

function  genCSVie(encodedUri) {
    let csvData = decodeURIComponent(encodedUri);

    let iframe = document.getElementById('csvDownloadFrame');
    let createdAt = Date.now();
    iframe = iframe.contentWindow || iframe.contentDocument;

    csvData = 'sep=,\r\n' + csvData;

    iframe.document.open("text/csv", "replace");
    iframe.document.write(csvData);
    iframe.document.close();
    iframe.focus();
    iframe.document.execCommand('SaveAs', true, "shedule_"+createdAt+".csv")
}
function genCSV(index) {
  
    let table = shedules[index].shedule
    let csvContent = 'data:text/csv;charset=utf-8';
    if ( supportsDataUri() ) {
        csvContent = "data:text/csv;charset=utf-8,";
    }
    let i=0;
    for (;i<table.length;) {
        let row = table[i].join(",");
        csvContent += row + "\r\n";
        i++
    }
    let createdAt = Date.now()
    let encodedUri = encodeURI(csvContent);
    if ( ! supportsDataUri() ) {
       let link = document.createElement("a");
       link.classList.add('btn')
       link.innerHTML= "Click Here to download as CSV";
       linkContainer.insertAdjacentElement('afterbegin', link);
       document.addEventListener('click', function () {
           genCSVie(encodedUri);
       });
     ;
      } else {
        let link = document.createElement("a");
    
        link.setAttribute("href", encodedUri);
        link.classList.add('btn')
        link.setAttribute("download", "shedule_"+createdAt+".csv");
        link.innerHTML= "Click Here to download as CSV";
        linkContainer.innerHTML= '';
        linkContainer.insertAdjacentElement('afterbegin', link);
      }

    stateTrack = "CSV ready"
    checkState(); 
}
function checkState() {
    if (stateTrack === 'CSV ready') {
        _aU.classList.remove('hidden')
        _aU.reset();
        _aF.classList.add('hidden')
        linkContainer.classList.remove('hidden');
    }else if (stateTrack === 'new calculator' || stateTrack === 'shedule removed') {
        _aU.classList.add('hidden');
        sheduleContainer.innerHTML = '';
        linkContainer.classList.add('hidden');
        _aF.classList.remove('hidden');
        _aF.reset();
    }
}
function newCalc() {
    _aF.classList.remove('hidden')
    _aF.reset();
    _aU.classList.add('hidden');
    linkContainer.innerHTML = '';
    sheduleContainer.innerHTML = '';
}   