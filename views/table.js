document.addEventListener('DOMContentLoaded', function() {
    console.log("I did it!")
    getTable()
    async function getTable() {
      const response = await fetch('/grants/data');
      const data = await response.json();
    
      const tbod = document.getElementById("tbod");
      idNum = 0;
      for (ele of data) {
        const row = document.createElement("tr");
        row.classList.add("row");
        row.id = "row-" + idNum;
        

        function makeRows(data) {
          let col = document.createElement("td");
          col.textContent = data;
          row.appendChild(col);
        
        };

        Object.values(ele).forEach(makeRows);  
        tbod.appendChild(row);

        const curId = ele.rowid;

        const today = new Date()
        let date = new Date(ele.due_date)
        const daysLeft = Math.round(Math.abs(date - today)/(1000 * 3600 *24))
        if (daysLeft <= 4) {
           const notify =  document.getElementById("notifications");
           const notification = document.createElement("a");
           notification.setAttribute("href", `http://localhost:3000/?grantid=${curId}`);
           notification.classList.add("collection-item");
           if (daysLeft === 0) {
                notification.textContent = `${ele.grant} is due today!`
           } else {
                notification.textContent = `${ele.grant} is due in ${daysLeft} days!`;
           };
           notify.appendChild(notification);
        };
        

        row.addEventListener("click", function(){
            window.location.href = `http://localhost:3000/?grantid=${curId}`
        
        
       
        //for (ele.due_date)
        });
        idNum++;
      };

    };

    // TODO: Delete arrow when sort other column, set th.asc to false
    //Sorting code
    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;
    const sortNumOrString = (v1, v2) => v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
    function comparer (idx, asc) {
      return (a, b) => (sortNumOrString(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx)));
    };

    // do the work...
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        columns = document.querySelectorAll('th');
        columns.forEach(otherHeader => {

          if (otherHeader.classList.contains('headerSortDown') ||
           otherHeader.classList.contains('headerSortUp') && otherHeader !== th){

            otherHeader.asc = false;
            otherHeader.className = "";

          };
        });


        if (th.classList.contains('headerSortDown') || th.classList.length === 0) {
          th.classList.add('headerSortUp');
          th.classList.remove('headerSortDown');
          th.asc = false;

        } else {
          th.classList.add('headerSortDown');
          th.classList.remove('headerSortUp');

        };
        

        const table = th.closest('table');
        const tableRowIndex = Array.from(th.parentNode.children).indexOf(th)
        Array.from(table.querySelectorAll('tr:nth-child(n+2)'))
            .sort(comparer(tableRowIndex, th.asc = !th.asc))
            .forEach(tr => table.appendChild(tr));

        
        
    })));
});
